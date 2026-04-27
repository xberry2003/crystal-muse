type Mode = "inspire" | "emotion" | "review";

/**
 * 根据不同模式，生成一段“假回复”
 * 这里先不用真模型，只是模拟后端已经根据业务模式给出不同语气
 */
export function buildMockReply(mode: Mode, message: string): string {
  if (mode === "inspire") {
    return `我听见了你的困惑：“${message}”。也许你现在不需要立刻找到标准答案，而是先抓住最想靠近的一点点方向。今天给你的灵感是：先做最小的一步，让行动带来新的想法。`;
  }

  if (mode === "emotion") {
    return `谢谢你愿意说出“${message}”。你的感受值得被认真对待，不必急着评判自己。我们可以先把情绪放慢一点看：你现在也许并不是做得不够好，而是已经消耗了很多，只是还没来得及被自己看见。`;
  }

  return `回看你刚才说的“${message}”，我感觉你今天经历了一些需要内在整理的时刻。今晚给你的提醒是：允许自己收一收，不必把所有问题都在今天解决，先把状态安顿好。`;
}

/**
 * 把整段文本拆成多个小片段，模拟模型流式生成
 * 这里简单按固定长度切分，后面接真模型时就不需要这个函数了
 */
export function splitTextIntoChunks(text: string, chunkSize = 12): string[] {
  const chunks: string[] = [];

  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  return chunks;
}