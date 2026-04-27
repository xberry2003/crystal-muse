import { useEffect, useState } from "react";
import "./index.css";
import Sidebar from "./components/Sidebar";
import MessageList from "./components/MessageList";
import ChatBox from "./components/ChatBox";
import RightPanel from "./components/RightPanel";
import { useChatSessions } from "./hooks/useChatSessions";
import type { DailyCrystalRecord, Mode, Message } from "@crystal-muse/shared";

const modeConfig = {
  inspire: {
    label: "今日灵感",
    placeholder: "输入一个困惑，获得今日灵感回应",
  },
  emotion: {
    label: "情绪梳理",
    placeholder: "说说你现在的感受……",
  },
  review: {
    label: "夜间复盘",
    placeholder: "用几句话回顾一下今天的状态",
  },
};

const DAILY_CRYSTALS_STORAGE_KEY = "crystal-muse-daily-crystals";

function isSameCrystalRecord(
  a: DailyCrystalRecord,
  b: DailyCrystalRecord
): boolean {
  return (
    a.date === b.date &&
    a.mode === b.mode &&
    a.summary === b.summary &&
    a.crystal === b.crystal &&
    a.reason === b.reason &&
    a.suggestion === b.suggestion
  );
}

function App() {
  const [mode, setMode] = useState<Mode>("inspire");

  const [dailyCrystalRecords, setDailyCrystalRecords] = useState<
    DailyCrystalRecord[]
  >(() => {
    try {
      const raw = localStorage.getItem(DAILY_CRYSTALS_STORAGE_KEY);

      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed;
    } catch (error) {
      console.error("读取 dailyCrystalRecords 失败：", error);
      return [];
    }
  });

  const {
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
  } = useChatSessions();

  useEffect(() => {
    try {
      localStorage.setItem(
        DAILY_CRYSTALS_STORAGE_KEY,
        JSON.stringify(dailyCrystalRecords)
      );
    } catch (error) {
      console.error("保存 dailyCrystalRecords 失败：", error);
    }
  }, [dailyCrystalRecords]);

  useEffect(() => {
    if (mode !== "review") {
      return;
    }

    if (!currentSession || currentSession.messages.length === 0) {
      return;
    }

    const latestCrystalMessage = [...currentSession.messages]
      .reverse()
      .find(
        (message: Message) =>
          message.role === "assistant" && message.crystalResult
      );

    if (!latestCrystalMessage?.crystalResult) {
      return;
    }

    const result = latestCrystalMessage.crystalResult;

    const nextRecord: DailyCrystalRecord = {
      date: new Date().toLocaleDateString(),
      mode: "review",
      summary: result.summary,
      crystal: result.crystal,
      reason: result.reason,
      suggestion: result.suggestion,
    };

    setDailyCrystalRecords((prev) => {
      const alreadyExists = prev.some((record) =>
        isSameCrystalRecord(record, nextRecord)
      );

      if (alreadyExists) {
        return prev;
      }

      return [nextRecord, ...prev].slice(0, 7);
    });
  }, [currentSession, mode]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="topbar-logo">Crystal Muse</div>
          <div className="topbar-subtitle">
            让情绪被温柔看见，让灵感被轻轻点亮。
          </div>
        </div>

        <div className="topbar-right" />
      </header>

      <main className="workspace-layout">
        <Sidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={setCurrentSessionId}
          onCreateSession={() => handleCreateSession(mode)}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
        />

        <section className="chat-panel">
          <div className="chat-panel-header">
            <div className="chat-panel-title-block">
              <h2>陪伴对话</h2>
              <p>当前模式：{modeConfig[mode].label}</p>
            </div>
          </div>

          <MessageList
            messages={currentSession ? currentSession.messages : []}
            isStreaming={isStreaming}
            streamingMessageId={streamingMessageId}
          />

          {errorMessage ? (
            <div className="chat-error-banner">
              <span>{errorMessage}</span>

              <div className="chat-error-actions">
                {lastFailedInput && lastFailedMode ? (
                  <button type="button" onClick={handleRetry}>
                    重试
                  </button>
                ) : null}

                <button type="button" onClick={() => setErrorMessage("")}>
                  知道了
                </button>
              </div>
            </div>
          ) : null}

          <ChatBox
            mode={mode}
            value={inputValue}
            placeholder={
              isStreaming ? "Crystal Muse 正在回应你..." : modeConfig[mode].placeholder
            }
            disabled={false}
            isStreaming={isStreaming}
            onModeChange={setMode}
            onChange={setInputValue}
            onSend={() => handleSend(mode)}
            onStop={handleStop}
            onKeyDown={(e) => handleKeyDown(e, mode)}
          />
        </section>

        <RightPanel dailyCrystalRecords={dailyCrystalRecords} />
      </main>
    </div>
  );
}

export default App;