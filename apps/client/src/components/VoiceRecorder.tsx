import { useMemo, useRef, useState } from "react";

type VoiceRecorderProps = {
  onResult: (text: string) => void;
};

type SpeechRecognitionType = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: null | (() => void);
  onend: null | (() => void);
  onerror: null | ((event: { error?: string }) => void);
  onresult: null | ((event: any) => void);
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionType;
    webkitSpeechRecognition?: new () => SpeechRecognitionType;
  }
}

function VoiceRecorder(props: VoiceRecorderProps) {
  const { onResult } = props;
  const [isListening, setIsListening] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);

  const SpeechRecognitionCtor = useMemo(() => {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }, []);

  function handleStartListening() {
    if (!SpeechRecognitionCtor) {
      setUnsupported(true);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognitionRef.current = recognition;

    recognition.lang = "zh-CN";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setUnsupported(false);
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let finalText = "";

      for (let i = 0; i < event.results.length; i += 1) {
        finalText += event.results[i][0].transcript;
      }

      onResult(finalText.trim());
    };

    recognition.start();
  }

  return (
    <div className="voice-recorder">
      <button
        type="button"
        className={isListening ? "voice-btn listening" : "voice-btn"}
        onClick={handleStartListening}
        title={isListening ? "点击停止录音" : "点击开始语音输入"}
      >
        {isListening ? "●" : "🎤"}
      </button>

      {isListening ? (
        <span className="voice-status">正在聆听...</span>
      ) : unsupported ? (
        <span className="voice-status unsupported">当前浏览器暂不支持语音输入</span>
      ) : null}
    </div>
  );
}

export default VoiceRecorder;