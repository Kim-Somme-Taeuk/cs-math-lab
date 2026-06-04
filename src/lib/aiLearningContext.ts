import type { Chapter } from "@/lib/chapters";
import {
  getConceptTagsForChapter,
  getLearningInsights,
  getProfileSummary,
  type LearningProfile,
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
  recentAttempts: Array<{
    slug: string;
    title: string;
    scoreRatio: number;
    missedConcepts: string[];
    missedQuestionTypes: string[];
  }>;
  chapterCatalog: Array<{
    slug: string;
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
}: {
  profile: LearningProfile | null;
  readyChapters: Chapter[];
  completedSlugs: string[];
  quizResults: QuizResult[];
  understandingChecks?: UnderstandingCheckResult[];
}): AiLearningContext {
  const insights = getLearningInsights(profile, readyChapters, completedSlugs, quizResults, understandingChecks);

  return {
    profile: profile ? getProfileSummary(profile) : null,
    completedSlugs,
    nextChapterSlug: insights.nextChapter?.slug ?? null,
    reviewChapterSlugs: insights.reviewChapters.map((chapter) => chapter.slug),
    weakConcepts: insights.weakConcepts,
    weakQuestionTypes: insights.weakQuestionTypes,
    recentAttempts: quizResults.slice(-5).map((result) => ({
      slug: result.slug,
      title: result.title,
      scoreRatio: result.total > 0 ? result.score / result.total : 0,
      missedConcepts: result.missedConcepts?.length ? result.missedConcepts : result.concepts,
      missedQuestionTypes: result.missedQuestionTypes ?? [],
    })),
    chapterCatalog: readyChapters.map((chapter) => ({
      slug: chapter.slug,
      title: chapter.title,
      subjectId: chapter.subjectId ?? null,
      level: chapter.level,
      prerequisites: chapter.prerequisites ?? [],
      conceptTags: chapter.conceptTags ?? getConceptTagsForChapter(chapter.slug),
      trackTags: chapter.trackTags ?? [],
    })),
  };
}
