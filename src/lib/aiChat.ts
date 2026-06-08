export const aiChatFallbackAnswer =
  "현재 챕터 자료 안에서 바로 확인되는 내용만 답할 수 있습니다. 질문을 챕터의 개념, 예시, 종합 점검과 연결해 다시 물어보세요.";

export const aiChatClientUsageStorageKey = "cs-math-lab:ai-chat-usage";
export const aiChatClientBlockedUntilStorageKey = "cs-math-lab:ai-chat-blocked-until";
export const aiChatWindowMs = 60_000;
export const aiChatBlockMs = 120_000;
export const aiChatMaxRequestsPerWindow = 5;

export type AiChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AiChatRequestPayload = {
  slug: string;
  messages: AiChatMessage[];
};

export type AiChatResponsePayload = {
  answer: string;
  source: "ai" | "fallback";
};

const maxSlugLength = 120;
const maxMessages = 8;
const maxMessageLength = 700;
const maxSerializedLength = 7000;
const maxAnswerLength = 900;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAiChatMessage(value: unknown): value is AiChatMessage {
  if (!isRecord(value)) return false;

  return (
    (value.role === "user" || value.role === "assistant") &&
    typeof value.content === "string" &&
    value.content.trim().length > 0 &&
    value.content.length <= maxMessageLength
  );
}

export function validateAiChatPayload(value: unknown): value is AiChatRequestPayload {
  if (!isRecord(value)) return false;

  const serialized = JSON.stringify(value);

  return (
    serialized.length <= maxSerializedLength &&
    typeof value.slug === "string" &&
    value.slug.length > 0 &&
    value.slug.length <= maxSlugLength &&
    /^[a-z0-9-]+$/.test(value.slug) &&
    Array.isArray(value.messages) &&
    value.messages.length > 0 &&
    value.messages.length <= maxMessages &&
    value.messages.every(isAiChatMessage) &&
    value.messages[value.messages.length - 1]?.role === "user"
  );
}

export function normalizeAiChatAnswer(value: unknown) {
  if (typeof value !== "string") return aiChatFallbackAnswer;

  const text = value.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  if (!text) return aiChatFallbackAnswer;

  return text.length > maxAnswerLength ? `${text.slice(0, maxAnswerLength - 3)}...` : text;
}
