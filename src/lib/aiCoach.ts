import type { AiLearningContext } from "@/lib/aiLearningContext";

export const aiCoachFallbackMemo =
  "지금은 저장된 학습 기록을 기준으로 약한 개념을 짧게 복습하고, 추천 경로의 다음 챕터를 이어가는 것이 좋습니다.";

export const aiCoachCacheStorageKey = "cs-math-lab:ai-coach-cache";

export type AiCoachRequestPayload = {
  context: AiLearningContext;
};

export type AiCoachResponsePayload = {
  memo: string;
  source: "ai" | "fallback";
};

const maxPayloadLength = 12000;
const maxTextLength = 120;
const maxArrayLength = 20;
const maxCatalogLength = 80;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown, maxLength = maxArrayLength) {
  return Array.isArray(value) && value.length <= maxLength && value.every((item) => typeof item === "string" && item.length <= maxTextLength);
}

function isRecentAttempt(value: unknown) {
  if (!isRecord(value)) return false;

  return (
    typeof value.slug === "string" &&
    value.slug.length <= maxTextLength &&
    typeof value.title === "string" &&
    value.title.length <= maxTextLength &&
    typeof value.scoreRatio === "number" &&
    value.scoreRatio >= 0 &&
    value.scoreRatio <= 1 &&
    isStringArray(value.missedConcepts) &&
    isStringArray(value.missedQuestionTypes)
  );
}

function isCatalogChapter(value: unknown) {
  if (!isRecord(value)) return false;

  return (
    typeof value.slug === "string" &&
    value.slug.length <= maxTextLength &&
    typeof value.title === "string" &&
    value.title.length <= maxTextLength &&
    (typeof value.subjectId === "string" || value.subjectId === null) &&
    typeof value.level === "number" &&
    value.level >= 1 &&
    value.level <= 3 &&
    isStringArray(value.prerequisites) &&
    isStringArray(value.conceptTags) &&
    isStringArray(value.trackTags)
  );
}

export function validateAiCoachPayload(value: unknown): value is AiCoachRequestPayload {
  if (!isRecord(value) || !isRecord(value.context)) return false;

  const serialized = JSON.stringify(value);

  if (serialized.length > maxPayloadLength) return false;

  const { context } = value;

  return (
    (typeof context.profile === "string" || context.profile === null) &&
    (context.profile === null || context.profile.length <= maxTextLength) &&
    isStringArray(context.completedSlugs) &&
    (typeof context.nextChapterSlug === "string" || context.nextChapterSlug === null) &&
    (context.nextChapterSlug === null || context.nextChapterSlug.length <= maxTextLength) &&
    isStringArray(context.reviewChapterSlugs) &&
    isStringArray(context.weakConcepts) &&
    isStringArray(context.weakQuestionTypes) &&
    Array.isArray(context.recentAttempts) &&
    context.recentAttempts.length <= 8 &&
    context.recentAttempts.every(isRecentAttempt) &&
    Array.isArray(context.chapterCatalog) &&
    context.chapterCatalog.length <= maxCatalogLength &&
    context.chapterCatalog.every(isCatalogChapter)
  );
}

export function normalizeCoachMemo(value: unknown) {
  if (typeof value !== "string") return aiCoachFallbackMemo;

  const singleParagraph = value.replace(/\s+/g, " ").trim();

  if (!singleParagraph) return aiCoachFallbackMemo;

  return singleParagraph.length > 280 ? `${singleParagraph.slice(0, 277)}...` : singleParagraph;
}
