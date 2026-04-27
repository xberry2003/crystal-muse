import { useEffect, useRef } from "react";
import type { Message } from "@crystal-muse/shared";
import CrystalCard from "./CrystalCard";

type MessageListProps = {
  messages: Message[];
  isStreaming: boolean;
  streamingMessageId: string | null;
};

function MessageList(props: MessageListProps) {
  const { messages, isStreaming, streamingMessageId } = props;

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  return (
    <div className="message-list-wrapper">
      <div className="message-list">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-title">开始一段新的陪伴对话</div>
            <div className="chat-empty-desc">
              选择模式后，输入一句话，Crystal Muse 会以对应方式回应你。
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`message-row ${message.role}`}>
              <div className="message-sender">
                {message.role === "user" ? "你" : "Crystal Muse"}
              </div>

              <div className={`message-bubble ${message.role}`}>
                {message.content ||
                  (message.role === "assistant" &&
                  isStreaming &&
                  message.id === streamingMessageId
                    ? "正在回应你..."
                    : "")}
              </div>

              {message.role === "assistant" && message.crystalResult && (
                <CrystalCard result={message.crystalResult} />
              )}
            </div>
          ))
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default MessageList;