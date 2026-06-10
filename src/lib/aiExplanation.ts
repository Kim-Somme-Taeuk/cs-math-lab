import { containsUnsafeAiText } from "@/lib/aiSafety";

export const aiExplanationFallback =
  "선택한 답과 정답을 비교해 보면, 문제에서 요구한 조건을 어느 원소나 경우에 적용해야 하는지가 핵심입니다.";

export type AiExplanationRequestPayload = {
  slug: string;
  title: string;
  prompt: string;
  choices: string[];
  selectedIndex: number;
  correctIndex: number;
  explanation: string;
  conceptTags?: string[];
  questionType?: string;
  reasonTags?: string[];
};

export type AiExplanationResponsePayload = {
  explanation: string;
  source: "ai" | "fallback";
};

const maxTextLength = 700;
const maxArrayLength = 8;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown, maxLength = maxArrayLength): value is string[] {
  return Array.isArray(value) && value.length <= maxLength && value.every((item) => typeof item === "string" && item.length <= maxTextLength);
}

export function validateAiExplanationPayload(value: unknown): value is AiExplanationRequestPayload {
  if (!isRecord(value)) return false;
  if (containsUnsafeAiText(value)) return false;
  const choices = value.choices;
  const conceptTags = value.conceptTags;
  const reasonTags = value.reasonTags;

  return (
    typeof value.slug === "string" &&
    value.slug.length <= 120 &&
    typeof value.title === "string" &&
    value.title.length <= 120 &&
    typeof value.prompt === "string" &&
    value.prompt.length <= maxTextLength &&
    isStringArray(choices, 4) &&
    choices.length >= 2 &&
    typeof value.selectedIndex === "number" &&
    Number.isInteger(value.selectedIndex) &&
    value.selectedIndex >= 0 &&
    value.selectedIndex < choices.length &&
    typeof value.correctIndex === "number" &&
    Number.isInteger(value.correctIndex) &&
    value.correctIndex >= 0 &&
    value.correctIndex < choices.length &&
    typeof value.explanation === "string" &&
    value.explanation.length <= maxTextLength &&
    (conceptTags === undefined || isStringArray(conceptTags)) &&
    (value.questionType === undefined || (typeof value.questionType === "string" && value.questionType.length <= 120)) &&
    (reasonTags === undefined || isStringArray(reasonTags))
  );
}

export function normalizeAiExplanation(value: unknown) {
  if (typeof value !== "string") return aiExplanationFallback;

  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return aiExplanationFallback;

  return text.length > 420 ? `${text.slice(0, 417)}...` : text;
}

export function buildFallbackExplanation(payload: AiExplanationRequestPayload) {
  const selectedChoice = payload.choices[payload.selectedIndex];
  const correctChoice = payload.choices[payload.correctIndex];
  const base = payload.explanation || aiExplanationFallback;

  if (payload.selectedIndex === payload.correctIndex) return base;

  return `선택한 답 ${selectedChoice}은 정답 ${correctChoice}와 다른 조건을 보고 있습니다. ${base}`;
}
