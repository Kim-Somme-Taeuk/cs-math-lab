import type { AiLearningContext } from "@/lib/aiLearningContext";
import { containsUnsafeAiText } from "@/lib/aiSafety";

export const aiCoachFallbackMemo =
  "약한 개념을 복습한 뒤 다음 챕터로 이어가세요.";

export const aiCoachCacheStorageKey = "cs-math-lab:ai-coach-cache";
export const aiCoachUsageStorageKey = "cs-math-lab:ai-coach-usage";
export const aiCoachDailyLimit = 5;

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
    typeof value.conceptId === "string" &&
    value.conceptId.length <= maxTextLength &&
    typeof value.title === "string" &&
    value.title.length <= maxTextLength &&
    typeof value.scoreRatio === "number" &&
    value.scoreRatio >= 0 &&
    value.scoreRatio <= 1 &&
    isStringArray(value.missedConcepts) &&
    isStringArray(value.missedQuestionTypes) &&
    isStringArray(value.missedReasonTags)
  );
}

function isCatalogChapter(value: unknown) {
  if (!isRecord(value)) return false;

  return (
    typeof value.slug === "string" &&
    value.slug.length <= maxTextLength &&
    typeof value.conceptId === "string" &&
    value.conceptId.length <= maxTextLength &&
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

function isConceptMastery(value: unknown) {
  if (!isRecord(value)) return false;

  return (
    typeof value.concept === "string" &&
    value.concept.length <= maxTextLength &&
    typeof value.conceptId === "string" &&
    value.conceptId.length <= maxTextLength &&
    typeof value.masteryScore === "number" &&
    value.masteryScore >= 0 &&
    value.masteryScore <= 1 &&
    typeof value.attempts === "number" &&
    value.attempts >= 0 &&
    value.attempts <= 1000
  );
}

export function validateAiCoachPayload(value: unknown): value is AiCoachRequestPayload {
  if (!isRecord(value) || !isRecord(value.context)) return false;

  const serialized = JSON.stringify(value);

  if (serialized.length > maxPayloadLength) return false;
  if (containsUnsafeAiText(value)) return false;

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
    isStringArray(context.weakReasonTags) &&
    Array.isArray(context.conceptMastery) &&
    context.conceptMastery.length <= 8 &&
    context.conceptMastery.every(isConceptMastery) &&
    isStringArray(context.reviewReasons) &&
    (typeof context.nextChapterReason === "string" || context.nextChapterReason === null) &&
    (context.nextChapterReason === null || context.nextChapterReason.length <= maxTextLength * 2) &&
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
