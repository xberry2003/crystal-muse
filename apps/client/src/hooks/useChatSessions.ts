import { useEffect, useRef, useState } from "react";
import type { ChatSession, Message, Mode } from "@crystal-muse/shared";
import {
  extractCrystalResultFromText,
  stripCrystalJsonWhileStreaming,
} from "../utils/crystal";

const SESSIONS_STORAGE_KEY = "crystal-muse-sessions";
const CURRENT_SESSION_STORAGE_KEY = "crystal-muse-current-session-id";

type UseChatSessionsReturn = {
  sessions: ChatSession[];
  currentSessionId: string;
  currentSession: ChatSession | undefined;
  inputValue: string;
  isStreaming: boolean;
  streamingMessageId: string | null;
  errorMessage: string;
  lastFailedInput: string;
  lastFailedMode: Mode | null;
  setInputValue: (value: string) => void;
  setCurrentSessionId: (sessionId: string) => void;
  setErrorMessage: (message: string) => void;
  handleSend: (mode: Mode, overrideInput?: string) => Promise<void>;
  handleCreateSession: (mode: Mode) => void;
  handleKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    mode: Mode
  ) => void;
  handleStop: () => void;
  handleRetry: () => Promise<void>;
  handleDeleteSession: (sessionId: string) => void;
  handleRenameSession: (sessionId: string, nextTitle: string) => void;
};

export function useChatSessions(): UseChatSessionsReturn {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);

      if (!raw) {
        return [
          {
            id: "session-1",
            title: "新的灵感对话",
            messages: [],
          },
        ];
      }

      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        return [
          {
            id: "session-1",
            title: "新的灵感对话",
            messages: [],
          },
        ];
      }

      return parsed;
    } catch (error) {
      console.error("读取 sessions 失败：", error);
      return [
        {
          id: "session-1",
          title: "新的灵感对话",
          messages: [],
        },
      ];
    }
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    try {
      const savedId = localStorage.getItem(CURRENT_SESSION_STORAGE_KEY);
      return savedId || "session-1";
    } catch (error) {
      console.error("读取当前会话 id 失败：", error);
      return "session-1";
    }
  });

  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [lastFailedInput, setLastFailedInput] = useState("");
  const [lastFailedMode, setLastFailedMode] = useState<Mode | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const currentSession = sessions.find(
    (session) => session.id === currentSessionId
  );

  async function handleSend(mode: Mode, overrideInput?: string) {
    const trimmedValue = (overrideInput ?? inputValue).trim();

    if (!trimmedValue) {
      setErrorMessage("先输入一点内容，再让 Crystal Muse 回应你。");
      return;
    }

    if (isStreaming) {
      return;
    }

    setErrorMessage("");
    setLastFailedInput("");
    setLastFailedMode(null);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedValue,
    };

    const assistantMessageId = `assistant-${Date.now()}`;

    const assistantPlaceholder = {
      id: assistantMessageId,
      role: "assistant" as const,
      content: "",
      rawContent: "",
    };

    setSessions((prevSessions) =>
      prevSessions.map((session) => {
        if (session.id !== currentSessionId) {
          return session;
        }

        const shouldAutoRename =
          session.title === "新的灵感对话" ||
          session.title === "新的情绪对话" ||
          session.title === "新的复盘对话";

        let nextTitle = session.title;

        if (shouldAutoRename) {
          nextTitle =
            trimmedValue.length > 12
              ? `${trimmedValue.slice(0, 12)}...`
              : trimmedValue;
        }

        return {
          ...session,
          title: nextTitle,
          messages: [...session.messages, userMessage, assistantPlaceholder],
        };
      })
    );

    if (!overrideInput) {
      setInputValue("");
    }

    setIsStreaming(true);
    setStreamingMessageId(assistantMessageId);

    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const res = await fetch("http://localhost:3001/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          mode,
          message: trimmedValue,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("当前请求没有成功返回，请稍后再试。");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const event of events) {
          const line = event
            .split("\n")
            .find((item) => item.startsWith("data: "));

          if (!line) {
            continue;
          }

          const jsonText = line.replace("data: ", "");

          try {
            const parsed = JSON.parse(jsonText);

            if (parsed.type === "chunk") {
              setSessions((prevSessions) =>
                prevSessions.map((session) => {
                  if (session.id !== currentSessionId) {
                    return session;
                  }

                  return {
                    ...session,
                    messages: session.messages.map((message: any) => {
                      if (message.id !== assistantMessageId) {
                        return message;
                      }

                      const nextRawContent =
                        (message.rawContent || "") + parsed.content;

                      const visibleContent =
                        mode === "review"
                          ? stripCrystalJsonWhileStreaming(nextRawContent)
                          : nextRawContent;

                      return {
                        ...message,
                        rawContent: nextRawContent,
                        content: visibleContent,
                      };
                    }),
                  };
                })
              );
            }

            if (parsed.type === "done") {
              setSessions((prevSessions) =>
                prevSessions.map((session) => {
                  if (session.id !== currentSessionId) {
                    return session;
                  }

                  return {
                    ...session,
                    messages: session.messages.map((message: any) => {
                      if (message.id !== assistantMessageId) {
                        return message;
                      }

                      if (mode === "review") {
                        const parsedResult = extractCrystalResultFromText(
                          message.rawContent || message.content || ""
                        );

                        return {
                          ...message,
                          content: parsedResult.cleanText,
                          crystalResult: parsedResult.crystalResult,
                          rawContent: undefined,
                        };
                      }

                      return {
                        ...message,
                        rawContent: undefined,
                      };
                    }),
                  };
                })
              );

              setIsStreaming(false);
              setStreamingMessageId(null);
            }
          } catch (error) {
            console.error("解析 SSE 数据失败：", error);
          }
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("用户主动停止了本次生成");
      } else {
        console.error("流式聊天失败：", error);

        setErrorMessage("这次回应没有顺利完成，你可以重新试一次。");
        setLastFailedInput(trimmedValue);
        setLastFailedMode(mode);

        setSessions((prevSessions) =>
          prevSessions.map((session) => {
            if (session.id !== currentSessionId) {
              return session;
            }

            return {
              ...session,
              messages: session.messages.map((message) => {
                if (message.id !== assistantMessageId) {
                  return message;
                }

                return {
                  ...message,
                  content: "抱歉，我刚刚有一点走神了，请再试一次。",
                };
              }),
            };
          })
        );
      }
    } finally {
      abortControllerRef.current = null;
      setIsStreaming(false);
      setStreamingMessageId(null);
    }
  }

  function handleStop() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setSessions((prevSessions) =>
      prevSessions.map((session) => {
        if (session.id !== currentSessionId) {
          return session;
        }

        return {
          ...session,
          messages: session.messages.filter((message: any) => {
            if (
              message.id === streamingMessageId &&
              message.role === "assistant" &&
              !message.content?.trim()
            ) {
              return false;
            }

            return true;
          }),
        };
      })
    );

    setIsStreaming(false);
    setStreamingMessageId(null);
  }

  async function handleRetry() {
    if (!lastFailedInput || !lastFailedMode || isStreaming) {
      return;
    }

    setErrorMessage("");
    await handleSend(lastFailedMode, lastFailedInput);
  }

  function handleCreateSession(mode: Mode) {
    const newSessionId = `session-${Date.now()}`;

    let defaultTitle = "新的灵感对话";

    if (mode === "emotion") {
      defaultTitle = "新的情绪对话";
    } else if (mode === "review") {
      defaultTitle = "新的复盘对话";
    }

    const newSession: ChatSession = {
      id: newSessionId,
      title: defaultTitle,
      messages: [],
    };

    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
    setInputValue("");
    setErrorMessage("");
  }


    /**
   * 删除指定会话。
   * 处理要点：
   * 1. 至少保留一个会话，避免删空后页面失去承载对象
   * 2. 如果删掉的是当前会话，需要自动切到别的会话
   */
  function handleDeleteSession(sessionId: string) {
    setSessions((prevSessions) => {
      /**
       * 如果当前只剩 1 个会话，不允许真的删空。
       * 这里选择“重置最后一个会话”的内容，而不是完全阻止，
       * 这样用户体验更自然。
       */
      if (prevSessions.length === 1) {
        return prevSessions.map((session) => {
          if (session.id !== sessionId) {
            return session;
          }

          return {
            ...session,
            title: "新的灵感对话",
            messages: [],
          };
        });
      }

      const filtered = prevSessions.filter((session) => session.id !== sessionId);

      /**
       * 如果删除的是当前会话，就自动切到剩下列表里的第一项。
       */
      if (sessionId === currentSessionId && filtered.length > 0) {
        setCurrentSessionId(filtered[0].id);
      }

      return filtered;
    });

    setErrorMessage("");
  }

  /**
   * 重命名会话标题。
   * 处理要点：
   * 1. 自动 trim 两侧空格
   * 2. 空标题不允许写入
   * 3. 限制长度，避免 UI 被特别长的标题撑坏
   */
  function handleRenameSession(sessionId: string, nextTitle: string) {
    const trimmedTitle = nextTitle.trim();

    if (!trimmedTitle) {
      return;
    }

    const safeTitle =
      trimmedTitle.length > 20
        ? `${trimmedTitle.slice(0, 20)}...`
        : trimmedTitle;

    setSessions((prevSessions) =>
      prevSessions.map((session) => {
        if (session.id !== sessionId) {
          return session;
        }

        return {
          ...session,
          title: safeTitle,
        };
      })
    );
  }


  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    mode: Mode
  ) {
    if (e.key === "Enter") {
      handleSend(mode);
    }
  }

  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error("保存 sessions 失败：", error);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_SESSION_STORAGE_KEY, currentSessionId);
    } catch (error) {
      console.error("保存当前会话 id 失败：", error);
    }
  }, [currentSessionId]);

  useEffect(() => {
    if (sessions.length === 0) {
      return;
    }

    const exists = sessions.some((session) => session.id === currentSessionId);

    if (!exists) {
      setCurrentSessionId(sessions[0].id);
    }
  }, [sessions, currentSessionId]);

  return {
    sessions,
    currentSessionId,
    currentSession,
    inputValue,
    isStreaming,
    streamingMessageId,
    errorMessage,
    lastFailedInput,
    lastFailedMode,
    setInputValue,
    setCurrentSessionId,
    setErrorMessage,
    handleSend,
    handleCreateSession,
    handleKeyDown,
    handleStop,
    handleRetry,
    handleDeleteSession,
    handleRenameSession,
  };
}