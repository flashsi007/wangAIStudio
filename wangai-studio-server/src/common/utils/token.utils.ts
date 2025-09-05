/**
 * Token和字数转换工具函数
 */

/**
 * 字数转换为token数
 * 根据经验值，中文字符约1.5个token，英文单词约1个token
 * @param wordCount 字数
 * @returns token数
 */
export function wordsToTokens(wordCount: number): number {
  return Math.ceil(wordCount * 1.5);
}

/**
 * token数转换为字数
 * @param tokenCount token数
 * @returns 字数
 */
export function tokensToWords(tokenCount: number): number {
  return Math.floor(tokenCount / 1.5);
}

/**
 * 根据消息内容估算token消耗
 * @param message 消息内容
 * @returns 估算的token数
 */
export function estimateTokensFromMessage(message: string): number {
  const wordCount = message.length;
  return wordsToTokens(wordCount);
}

/**
 * 根据消息内容计算字数
 * @param message 消息内容
 * @returns 字数
 */
export function getWordCountFromMessage(message: string): number {
  return message.length;
}

/**
 * 计算消息数组的总字符数
 * @param messages 消息数组
 * @returns 总字符数
 */
export function calculateTotalChars(messages: Array<{content: string}>): number {
  return messages.reduce((total, msg) => total + msg.content.length, 0);
}

/**
 * 检查输入长度是否超过限制
 * @param totalLength 总长度
 * @param maxLength 最大长度限制
 * @returns 是否超过限制
 */
export function isInputTooLong(totalLength: number, maxLength: number): boolean {
  return totalLength > maxLength;
}

/**
 * 计算安全的历史消息长度限制
 * @param maxTotalLength 最大总长度
 * @param currentMessageLength 当前消息长度
 * @param systemPromptLength 系统提示词长度
 * @param safetyBuffer 安全缓冲区
 * @returns 历史消息可用的最大长度
 */
export function calculateSafeHistoryLength(
  maxTotalLength: number,
  currentMessageLength: number,
  systemPromptLength: number,
  safetyBuffer: number
): number {
  return Math.max(0, maxTotalLength - currentMessageLength - systemPromptLength - safetyBuffer);
}