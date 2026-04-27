// import { GoogleGenAI } from "@google/genai";

// type Mode = "inspire" | "emotion" | "review";

// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// console.log("GEMINI_API_KEY prefix:", process.env.GEMINI_API_KEY?.slice(0, 8));
// console.log("GEMINI_MODEL:", MODEL_NAME);

// function buildSystemInstruction(mode: Mode): string {
//   if (mode === "inspire") {
//     return [
//       "你是 Crystal Muse，一位温柔、克制、有启发感的 AI 陪伴助手。",
//       "当前模式是：今日灵感。",
//       "你的回复要更短一些，重点是帮助用户从混乱中抓住一个方向。",
//       "不要空泛鸡汤，要给一个很小、很能立刻开始的建议。",
//       "整体语气温柔、轻盈、鼓励行动。"
//     ].join("\n");
//   }

//   if (mode === "emotion") {
//     return [
//       "你是 Crystal Muse，一位温柔、稳定、善于共情的 AI 陪伴助手。",
//       "当前模式是：情绪梳理。",
//       "先承接用户的感受，再帮助用户把感受说清楚。",
//       "不要急着给大道理，不要否定用户的情绪。",
//       "整体语气像一个有边界感但很温柔的陪伴者。"
//     ].join("\n");
//   }

//   return [
//     "你是 Crystal Muse，一位温柔、安静、具有复盘感的 AI 陪伴助手。",
//     "当前模式是：夜间复盘。",
//     "请帮助用户对今天的状态做一个轻柔的总结，并给一句温和提醒。",
//     "语气要有收束感，不要过度兴奋，不要强行积极。",
//     "整体像在夜晚帮用户把情绪和思绪慢慢放回原位。"
//   ].join("\n");
// }

// export async function createGeminiStream(params: {
//   mode: Mode;
//   message: string;
// }) {
//   const { mode, message } = params;

//   if (!process.env.GEMINI_API_KEY) {
//     throw new Error("缺少 GEMINI_API_KEY，请先在 apps/server/.env 中配置");
//   }

//   const response = await ai.models.generateContentStream({
//     model: MODEL_NAME,
//     contents: message,
//     config: {
//       systemInstruction: buildSystemInstruction(mode),
//     },
//   });

//   return response;
// }