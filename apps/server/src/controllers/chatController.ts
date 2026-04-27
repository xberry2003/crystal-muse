import { Request, Response } from "express";
import {
  createOpenRouterStream,
  testOpenRouterOnce,
  testOpenRouterReviewOnce,
} from "../services/openrouterService";

type Mode = "inspire" | "emotion" | "review";

type ChatRequestBody = {
  mode: Mode;
  message: string;
  history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
};

export async function testGemini(req: Request, res: Response) {
  try {
    const text = await testOpenRouterOnce();
    res.json({ ok: true, text });
  } catch (error) {
    console.error("OpenRouter 普通测试失败：", error);

    res.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : "未知错误",
    });
  }
}
export async function testReviewCrystal(req: Request, res: Response) {
  try {
    const result = await testOpenRouterReviewOnce();

    res.json({
      ok: true,
      text: result.cleanText,
      crystalResult: result.crystalResult || null,
    });
  } catch (error) {
    console.error("夜间复盘 crystal 测试失败：", error);

    res.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : "未知错误",
    });
  }
}

export async function streamChat(req: Request, res: Response) {
  const body = req.body as ChatRequestBody;
  const { mode, message } = body;

  if (!mode || !message?.trim()) {
    return res.status(400).json({
      ok: false,
      message: "mode 和 message 不能为空",
    });
  }

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  try {
    const stream = await createOpenRouterStream({
      mode,
      message: message.trim(),
    });

    for await (const chunk of stream) {
      const text = chunk.choices?.[0]?.delta?.content || "";
      if (!text) continue;

      res.write(
        `data: ${JSON.stringify({
          type: "chunk",
          content: text,
        })}\n\n`
      );
    }

    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (error) {
    console.error("OpenRouter 流式生成失败：", error);

    res.write(
      `data: ${JSON.stringify({
        type: "chunk",
        content: "抱歉，我刚刚没有顺利接住你的这句话，请稍后再试一次。",
      })}\n\n`
    );
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  }
}