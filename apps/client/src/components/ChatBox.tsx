import { lazy, Suspense } from "react";
import type { Mode } from "@crystal-muse/shared";

const VoiceRecorder = lazy(() => import("./VoiceRecorder"));

type ChatBoxProps = {
  mode: Mode;
  value: string;
  placeholder: string;
  disabled?: boolean;
  isStreaming: boolean;
  onModeChange: (mode: Mode) => void;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

function ChatBox(props: ChatBoxProps) {
  const {
    mode,
    value,
    placeholder,
    disabled = false,
    isStreaming,
    onModeChange,
    onChange,
    onSend,
    onStop,
    onKeyDown,
  } = props;

  return (
    <div className="chatbox-shell">
      <div className="chatbox-inner integrated">
        <div className="chatbox-mode-area">
          <select
            className="chatbox-mode-select"
            value={mode}
            disabled={isStreaming}
            onChange={(e) => onModeChange(e.target.value as Mode)}
          >
            <option value="inspire">今日灵感</option>
            <option value="emotion">情绪梳理</option>
            <option value="review">夜间复盘</option>
          </select>
        </div>

        <input
          className="chatbox-input"
          type="text"
          value={value}
          placeholder={placeholder}
          disabled={disabled || isStreaming}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
        />

        {!isStreaming ? (
          <Suspense fallback={<span className="voice-status">语音加载中...</span>}>
            <VoiceRecorder
              onResult={(text) => {
                if (!text) return;

                const merged = value.trim()
                  ? `${value}${value.endsWith(" ") ? "" : " "}${text}`
                  : text;

                onChange(merged);
              }}
            />
          </Suspense>
        ) : null}

        {isStreaming ? (
          <button className="chatbox-stop-btn" type="button" onClick={onStop}>
            停止
          </button>
        ) : (
          <button
            className="chatbox-send-btn"
            type="button"
            onClick={onSend}
            disabled={disabled}
          >
            发送
          </button>
        )}
      </div>
    </div>
  );
}

export default ChatBox;