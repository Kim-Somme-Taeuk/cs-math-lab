import type { Chapter } from "@/lib/chapters";
import {
  getConceptTagsForChapter,
  getLearningInsights,
  getProfileSummary,
  type LearningProfile,
  type ConceptMastery,
  type QuizResult,
  type UnderstandingCheckResult,
} from "@/lib/personalization";

export type AiLearningContext = {
  profile: string | null;
  completedSlugs: string[];
  nextChapterSlug: string | null;
  reviewChapterSlugs: string[];
  weakConcepts: string[];
  weakQuestionTypes: string[];
  weakReasonTags: string[];
  conceptMastery: Array<{
    conceptId: string;
    concept: string;
    masteryScore: number;
    attempts: number;
  }>;
  reviewReasons: string[];
  nextChapterReason: string | null;
  recentAttempts: Array<{
    slug: string;
    conceptId: string;
    title: string;
    scoreRatio: number;
    missedConcepts: string[];
    missedQuestionTypes: string[];
    missedReasonTags: string[];
  }>;
  chapterCatalog: Array<{
    slug: string;
    conceptId: string;
    title: string;
    subjectId: string | null;
    level: number;
    prerequisites: string[];
    conceptTags: string[];
    trackTags: string[];
  }>;
};

export function buildAiLearningContext({
  profile,
  readyChapters,
  completedSlugs,
  quizResults,
  understandingChecks = [],
  conceptMastery = [],
}: {
  profile: LearningProfile | null;
  readyChapters: Chapter[];
  completedSlugs: string[];
  quizResults: QuizResult[];
  understandingChecks?: UnderstandingCheckResult[];
  conceptMastery?: ConceptMastery[];
}): AiLearningContext {
  const insights = getLearningInsights(profile, readyChapters, completedSlugs, quizResults, understandingChecks);

  return {
    profile: profile ? getProfileSummary(profile) : null,
    completedSlugs,
    nextChapterSlug: insights.nextChapter?.slug ?? null,
    reviewChapterSlugs: insights.reviewChapters.map((chapter) => chapter.slug),
    weakConcepts: insights.weakConcepts,
    weakQuestionTypes: insights.weakQuestionTypes,
    weakReasonTags: insights.weakReasonTags,
    conceptMastery: conceptMastery
      .slice()
      .sort((left, right) => left.masteryScore - right.masteryScore || right.attempts - left.attempts)
      .slice(0, 8)
      .map((mastery) => ({
        conceptId: mastery.conceptId,
        concept: mastery.concept,
        masteryScore: mastery.masteryScore,
        attempts: mastery.attempts,
      })),
    reviewReasons: insights.reviewReasons,
    nextChapterReason: insights.nextChapterReason,
    recentAttempts: quizResults.slice(-5).map((result) => ({
      slug: result.slug,
      conceptId: result.conceptId,
      title: result.title,
      scoreRatio: result.total > 0 ? result.score / result.total : 0,
      missedConcepts: result.missedConcepts?.length ? result.missedConcepts : result.concepts,
      missedQuestionTypes: result.missedQuestionTypes ?? [],
      missedReasonTags: result.missedReasonTags ?? [],
    })),
    chapterCatalog: readyChapters.map((chapter) => ({
      slug: chapter.slug,
      conceptId: chapter.conceptId ?? `chapter:${chapter.slug}`,
      title: chapter.title,
      subjectId: chapter.subjectId ?? null,
      level: chapter.level,
      prerequisites: chapter.prerequisites ?? [],
      conceptTags: chapter.conceptTags ?? getConceptTagsForChapter(chapter.slug),
      trackTags: chapter.trackTags ?? [],
    })),
  };
}
