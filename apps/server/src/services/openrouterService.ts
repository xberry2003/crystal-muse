import OpenAI from "openai";

type Mode = "inspire" | "emotion" | "review";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "Crystal Muse",
  },
});

const MODEL_NAME = process.env.OPENROUTER_MODEL || "openrouter/free";

function buildSystemInstruction(mode: Mode): string {
  if (mode === "inspire") {
    return [
      "你是 Crystal Muse，一位温柔、克制、有启发感的 AI 陪伴助手。",
      "当前模式是：今日灵感。",
      "你的任务是帮助用户从混乱里抓住一个新的切入口。",
      "回复要短，最好控制在 2 到 3 句话内。",
      "整体要有启发感，但不能像教程，也不能像条目清单。",
      "可以轻轻指出用户的卡点，再给一个新的视角，告诉你现在适合做什么，最后补一个今天就能开始的具体小动作。",
      "不要输出编号，不要输出“第一句/第二句/第三句”，不要解释你在遵循什么格式。",
      "不要说“以下是符合你要求的回复”“按照你的要求”等元话术。",
      "直接输出给用户看的最终内容，像一个自然的人在说话。"
    ].join("\n");
  }

  if (mode === "emotion") {
    return [
      "你是 Crystal Muse，一位温柔、稳定、善于共情的 AI 陪伴助手。",
      "当前模式是：情绪梳理。",
      "你的任务是先接住用户情绪，再帮助用户把感受说清楚。",
      "回复可以比今日灵感稍长一些，但不要变成分析报告。",
      "先让用户感到被理解，再帮用户更清楚地看见自己可能正在经历什么。",
      "最后可以给一句很轻的陪伴式提醒，但不要变成解决方案清单。",
      "不要输出编号，不要分点，不要解释格式，不要写“以下是回复”。",
      "直接自然地说话，像一个温柔、有边界感的陪伴者。"
    ].join("\n");
  }

  return [
    "你是 Crystal Muse，一位温柔、安静、具有夜晚陪伴感的 AI 助手。",
    "当前模式：夜间复盘。",
    "你必须始终使用简体中文回复。",
    "禁止输出英文单词、英文句子、拼音、夹杂式中英混写。",
    "正文必须是自然、温柔、安静的中文夜间复盘回复。",
    "然后在最后单独输出一段 JSON，必须用下面这个格式包裹：",
    "<<<CRYSTAL_JSON_START>>>",
    '{"summary":"...","crystal":"...","reason":"...","suggestion":"..."}',
    "<<<CRYSTAL_JSON_END>>>",
    "要求：",
    "1. summary 必须是中文，用一句话概括用户今天的状态。",
    "2. crystal 只能从以下中文名称中选择一个：月光石、紫水晶、粉晶、黄水晶、海蓝宝、白水晶、绿东陵。",
    "3. reason 必须是中文，解释为什么是这枚水晶。",
    "4. suggestion 必须是中文，给一句温和建议。",
    "5. JSON 内四个字段都必须使用简体中文，不允许英文。",
    "6. JSON 必须是合法 JSON，不要加注释。",
    "7. 在 JSON 外，不要解释格式，不要说“以下是 JSON”。",
    "8. 正文回复和 JSON 都要输出。",
    "9. 无论用户输入什么语言，你都必须用简体中文输出。"
  ].join('\n');
}

export async function createOpenRouterStream(params: {
  mode: Mode;
  message: string;
}) {
  const { mode, message } = params;

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("缺少 OPENROUTER_API_KEY，请先在 apps/server/.env 中配置");
  }

  const temperatureMap: Record<Mode, number> = {
    inspire: 0.9,
    emotion: 0.7,
    review: 0.6,
  };

  const stream = await client.chat.completions.create({
    model: MODEL_NAME,
    stream: true,
    temperature: temperatureMap[mode],
    messages: [
      { role: "system", content: buildSystemInstruction(mode) },
      { role: "user", content: message },
    ],
  });

  return stream;
}

export async function testOpenRouterOnce() {
  const response = await client.chat.completions.create({
    model: MODEL_NAME,
    stream: false,
    messages: [
      { role: "user", content: "请用中文回复：你好，我是测试消息。" },
    ],
  });

  return response.choices[0]?.message?.content || "";
}

export function extractCrystalResult(rawText: string) {
  const startTag = "<<<CRYSTAL_JSON_START>>>";
  const endTag = "<<<CRYSTAL_JSON_END>>>";

  const startIndex = rawText.indexOf(startTag);
  const endIndex = rawText.indexOf(endTag);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return {
      cleanText: rawText.trim(),
      crystalResult: undefined,
    };
  }

  const jsonText = rawText
    .slice(startIndex + startTag.length, endIndex)
    .trim();

  const cleanText = (
    rawText.slice(0, startIndex) + rawText.slice(endIndex + endTag.length)
  ).trim();

  try {
    const parsed = JSON.parse(jsonText);

    if (
      typeof parsed.summary === "string" &&
      typeof parsed.crystal === "string" &&
      typeof parsed.reason === "string" &&
      typeof parsed.suggestion === "string"
    ) {
      return {
        cleanText,
        crystalResult: {
          summary: parsed.summary,
          crystal: parsed.crystal,
          reason: parsed.reason,
          suggestion: parsed.suggestion,
        },
      };
    }

    return {
      cleanText,
      crystalResult: undefined,
    };
  } catch (error) {
    console.error("解析 crystal JSON 失败：", error);

    return {
      cleanText,
      crystalResult: undefined,
    };
  }
}

export async function testOpenRouterReviewOnce() {
  const response = await client.chat.completions.create({
    model: MODEL_NAME,
    stream: false,
    messages: [
      {
        role: "system",
        content: buildSystemInstruction("review"),
      },
      {
        role: "user",
        content: "今天做了很多事，但心里还是有点乱。",
      },
    ],
  });

  const rawText = response.choices[0]?.message?.content || "";
  return extractCrystalResult(rawText);
}