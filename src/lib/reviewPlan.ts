import type { SetReviewTemplate } from "@/lib/generatedReview";
import { containsUnsafeAiText } from "@/lib/aiSafety";
import type { ConceptMastery, QuestionAttempt, QuizResult, UnderstandingCheckResult } from "@/lib/personalization";

export type ReviewPlanResponse = {
  items: {
    templateId: string;
    reason: string;
  }[];
};

export type ReviewWeaknessProfile = {
  chapterSlug: string;
  conceptTags: string[];
  questionTypes: string[];
  reasonTags: string[];
  recentMisses: Array<{
    questionType?: string;
    conceptTags: string[];
    reasonTags: string[];
  }>;
};

export type PlannedReviewTemplate = {
  template: SetReviewTemplate;
  reason: string;
  score: number;
};

const maxReasonLength = 60;

const legacyTagMap: Record<string, string[]> = {
  합집합: ["union-basic"],
  교집합: ["intersection-basic"],
  차집합: ["difference-direction"],
  여집합: ["complement-universe"],
  부분집합: ["subset-confusion"],
  "집합 연산": ["set-operation"],
  "순서 무시": ["notation-reading"],
  "합집합과 교집합 혼동": ["included-excluded-confusion"],
  "공통 원소만 남기는 조건 혼동": ["included-excluded-confusion"],
  "차집합 방향 혼동": ["difference-direction-confusion"],
  "전체집합 기준 누락": ["universe-complement-confusion"],
  "부분집합 조건 오해": ["subset-symbol-confusion"],
  "집합에서 순서가 중요하다고 오해": ["element-symbol-confusion"],
  "Python set 연산자 의미 혼동": ["notation-reading"],
  union: ["union-basic"],
  intersection: ["intersection-basic"],
  difference: ["difference-direction"],
  complement: ["complement-universe"],
  subset: ["subset-confusion"],
};

const tagLabels: Record<string, string> = {
  "union-basic": "합집합 기본",
  "intersection-basic": "교집합 기본",
  "difference-direction": "차집합 방향",
  "complement-universe": "여집합의 전체집합 기준",
  "subset-confusion": "부분집합 판단",
  "element-vs-set": "원소와 집합 구분",
  "notation-reading": "기호 읽기",
  "included-excluded-confusion": "포함/제외 조건 혼동",
  "difference-direction-confusion": "차집합 방향 혼동",
  "universe-complement-confusion": "전체집합 기준 혼동",
  "subset-symbol-confusion": "부분집합 기호 혼동",
  "element-symbol-confusion": "원소 기호 혼동",
};

function normalizedTags(tags: string[] = []) {
  return Array.from(new Set(tags.flatMap((tag) => [tag, ...(legacyTagMap[tag] ?? [])])));
}

function addWeightedTags(scores: Map<string, number>, tags: string[] = [], weight: number) {
  normalizedTags(tags).forEach((tag) => {
    scores.set(tag, (scores.get(tag) ?? 0) + weight);
  });
}

function topTags(scores: Map<string, number>, limit = 8) {
  return [...scores.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([tag]) => tag);
}

function normalizeReason(value: unknown) {
  if (typeof value !== "string") return "";

  return value.replace(/\s+/g, " ").trim().slice(0, maxReasonLength);
}

function fallbackReason(template: SetReviewTemplate, profile: ReviewWeaknessProfile, score: number) {
  const matchedReason = template.reasonTags.find((tag) => profile.reasonTags.includes(tag));
  const matchedConcept = template.conceptTags.find((tag) => profile.conceptTags.includes(tag));
  const matchedQuestionType = profile.questionTypes.includes(template.questionType) ? template.questionType : null;

  if (matchedReason) return `최근 오답: ${tagLabels[matchedReason] ?? matchedReason} 때문에 먼저 냅니다.`;
  if (matchedConcept) return `약한 개념: ${tagLabels[matchedConcept] ?? matchedConcept} 복습 문제입니다.`;
  if (matchedQuestionType) return `자주 틀린 유형: ${tagLabels[matchedQuestionType] ?? matchedQuestionType} 확인 문제입니다.`;
  if (score > 0) return "최근 학습 기록과 겹치는 복습 문제입니다.";

  return "기본 종합 점검 순서입니다.";
}

export function buildReviewWeaknessProfile({
  chapterSlug,
  quizResults = [],
  questionAttempts = [],
  conceptMastery = [],
  understandingChecks = [],
}: {
  chapterSlug: string;
  quizResults?: QuizResult[];
  questionAttempts?: QuestionAttempt[];
  conceptMastery?: ConceptMastery[];
  understandingChecks?: UnderstandingCheckResult[];
}): ReviewWeaknessProfile {
  const conceptScores = new Map<string, number>();
  const questionTypeScores = new Map<string, number>();
  const reasonScores = new Map<string, number>();

  quizResults
    .filter((result) => result.slug === chapterSlug)
    .forEach((result) => {
      const ratio = result.total > 0 ? result.score / result.total : 1;
      const weight = ratio < 0.7 ? 4 : 1;
      addWeightedTags(conceptScores, result.missedConcepts, weight);
      addWeightedTags(questionTypeScores, result.missedQuestionTypes, weight);
      addWeightedTags(reasonScores, result.missedReasonTags, weight + 1);
    });

  const recentMisses = questionAttempts
    .filter((attempt) => attempt.slug === chapterSlug && !attempt.isCorrect)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 8);

  recentMisses.forEach((attempt, index) => {
    const weight = Math.max(2, 6 - index);
    addWeightedTags(conceptScores, attempt.concepts, weight);
    if (attempt.questionType) addWeightedTags(questionTypeScores, [attempt.questionType], weight);
    addWeightedTags(reasonScores, attempt.reasonTags, weight + 1);
  });

  conceptMastery
    .filter((mastery) => mastery.conceptId === `chapter:${chapterSlug}` && mastery.masteryScore < 0.7)
    .forEach((mastery) => {
      addWeightedTags(conceptScores, [mastery.concept], Math.max(1, 4 * (1 - mastery.masteryScore)));
    });

  understandingChecks
    .filter((check) => check.slug === chapterSlug && check.status === "confused")
    .forEach((check) => {
      addWeightedTags(conceptScores, [check.concept], 3);
    });

  return {
    chapterSlug,
    conceptTags: topTags(conceptScores),
    questionTypes: topTags(questionTypeScores),
    reasonTags: topTags(reasonScores),
    recentMisses: recentMisses.map((attempt) => ({
      questionType: attempt.questionType,
      conceptTags: normalizedTags(attempt.concepts),
      reasonTags: normalizedTags(attempt.reasonTags),
    })),
  };
}

export function rankReviewTemplates(templates: SetReviewTemplate[], profile: ReviewWeaknessProfile): PlannedReviewTemplate[] {
  const conceptScores = new Map(profile.conceptTags.map((tag, index) => [tag, profile.conceptTags.length - index]));
  const questionTypeScores = new Map(profile.questionTypes.map((tag, index) => [tag, profile.questionTypes.length - index]));
  const reasonScores = new Map(profile.reasonTags.map((tag, index) => [tag, profile.reasonTags.length - index]));

  return templates
    .map((template, index) => {
      const conceptScore = template.conceptTags.reduce((total, tag) => total + (conceptScores.get(tag) ?? 0), 0);
      const questionTypeScore = questionTypeScores.get(template.questionType) ?? 0;
      const reasonScore = template.reasonTags.reduce((total, tag) => total + (reasonScores.get(tag) ?? 0) * 2, 0);
      const score = conceptScore + questionTypeScore + reasonScore;

      return {
        template,
        reason: fallbackReason(template, profile, score),
        score,
        index,
      };
    })
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map((item) => ({
      template: item.template,
      reason: item.reason,
      score: item.score,
    }));
}

export function compactTemplatesForAi(templates: SetReviewTemplate[]) {
  return templates.map((template) => ({
    id: template.id,
    conceptTags: template.conceptTags,
    questionType: template.questionType,
    reasonTags: template.reasonTags,
    difficulty: template.difficulty,
  }));
}

export function sanitizeReviewPlanResponse(value: unknown, templates: SetReviewTemplate[]): ReviewPlanResponse {
  if (typeof value !== "object" || value === null || !("items" in value) || !Array.isArray(value.items)) {
    return { items: [] };
  }

  const allowedIds = new Set(templates.map((template) => template.id));
  const usedIds = new Set<string>();
  const items: ReviewPlanResponse["items"] = [];

  for (const item of value.items) {
    if (typeof item !== "object" || item === null || !("templateId" in item)) continue;
    const templateId = item.templateId;

    if (typeof templateId !== "string" || !allowedIds.has(templateId) || usedIds.has(templateId)) continue;

    usedIds.add(templateId);
    items.push({
      templateId,
      reason: normalizeReason("reason" in item ? item.reason : ""),
    });
  }

  return { items };
}

export function mergeAiReviewPlan(
  rankedPlan: PlannedReviewTemplate[],
  aiPlan: ReviewPlanResponse,
  minimumCount = rankedPlan.length,
): PlannedReviewTemplate[] {
  const byId = new Map(rankedPlan.map((item) => [item.template.id, item]));
  const usedIds = new Set<string>();
  const planned: PlannedReviewTemplate[] = [];

  aiPlan.items.forEach((item) => {
    const plannedItem = byId.get(item.templateId);
    if (!plannedItem || usedIds.has(item.templateId)) return;

    usedIds.add(item.templateId);
    planned.push({
      ...plannedItem,
      reason: item.reason || plannedItem.reason,
    });
  });

  rankedPlan.forEach((item) => {
    if (planned.length >= minimumCount || usedIds.has(item.template.id)) return;
    usedIds.add(item.template.id);
    planned.push(item);
  });

  return planned;
}

export function validateReviewPlanPayload(value: unknown): value is {
  chapterSlug: string;
  weakness: ReviewWeaknessProfile;
  templates: ReturnType<typeof compactTemplatesForAi>;
} {
  if (typeof value !== "object" || value === null) return false;
  if (!("chapterSlug" in value) || value.chapterSlug !== "sets") return false;
  if (!("templates" in value) || !Array.isArray(value.templates) || value.templates.length > 12) return false;
  if (!("weakness" in value) || typeof value.weakness !== "object" || value.weakness === null) return false;

  const serialized = JSON.stringify(value);
  if (serialized.length > 6000) return false;
  if (containsUnsafeAiText(value)) return false;

  const weakness = value.weakness as Record<string, unknown>;
  const isTagArray = (items: unknown) =>
    Array.isArray(items) && items.length <= 12 && items.every((item) => typeof item === "string" && item.length <= 80);

  return (
    weakness.chapterSlug === "sets" &&
    isTagArray(weakness.conceptTags) &&
    isTagArray(weakness.questionTypes) &&
    isTagArray(weakness.reasonTags) &&
    value.templates.every((template) => {
      if (typeof template !== "object" || template === null) return false;
      const item = template as Record<string, unknown>;
      return (
        typeof item.id === "string" &&
        item.id.length <= 80 &&
        isTagArray(item.conceptTags) &&
        typeof item.questionType === "string" &&
        item.questionType.length <= 80 &&
        isTagArray(item.reasonTags) &&
        typeof item.difficulty === "number" &&
        item.difficulty >= 1 &&
        item.difficulty <= 3
      );
    })
  );
}
