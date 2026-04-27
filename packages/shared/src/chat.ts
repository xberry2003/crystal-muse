export type Mode = "inspire" | "emotion" | "review";

export type HealthData = {
  ok: boolean;
  message: string;
};

export type CrystalResult = {
  summary: string;
  crystal: string;
  reason: string;
  suggestion: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  crystalResult?: CrystalResult;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
};

export type DailyCrystalRecord = {
  date: string;
  mode: Mode;
  summary: string;
  crystal: string;
  reason: string;
  suggestion: string;
};