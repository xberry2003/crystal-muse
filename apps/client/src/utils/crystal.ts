import type { CrystalResult } from "@crystal-muse/shared";

const START_TAG = "<<<CRYSTAL_JSON_START>>>";

/**
 * 流式过程中：
 * 只要开始标记一出现，就只保留开始标记前面的正文。
 * 这样 JSON 不会继续被渲染到聊天区。
 */
export function stripCrystalJsonWhileStreaming(rawText: string): string {
  const startIndex = rawText.indexOf(START_TAG);

  if (startIndex === -1) {
    return rawText;
  }

  return rawText.slice(0, startIndex).trimEnd();
}

/**
 * 最终完成时：
 * 提取 JSON，并彻底从正文中移除。
 */
export function extractCrystalResultFromText(rawText: string): {
  cleanText: string;
  crystalResult?: CrystalResult;
} {
  const pattern =
    /<<<CRYSTAL_JSON_START>>>\s*([\s\S]*?)\s*<<<CRYSTAL_JSON_END>>>/;

  const match = rawText.match(pattern);

  if (!match) {
    return {
      cleanText: rawText.trim(),
      crystalResult: undefined,
    };
  }

  const jsonText = match[1].trim();

  const cleanText = rawText.replace(pattern, "").trim();

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
  } catch (error) {
    console.error("前端解析 crystal JSON 失败：", error);
  }

  return {
    cleanText,
    crystalResult: undefined,
  };
}