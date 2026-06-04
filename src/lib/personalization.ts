import { getChapter, type Chapter, type LearningTrackTag } from "@/lib/chapters";

export type LearningGoal = "coding-test" | "course" | "foundation" | "portfolio";
export type LearningLevel = "beginner" | "high-school-ok" | "some-discrete";
export type LearningStyle = "short" | "examples" | "code" | "practice";

export type LearningProfile = {
  goal: LearningGoal;
  level: LearningLevel;
  style: LearningStyle;
};

export type QuizResult = {
  slug: string;
  title: string;
  score: number;
  total: number;
  concepts: string[];
  missedConcepts?: string[];
  missedQuestionTypes?: string[];
  updatedAt: string;
};

export type UnderstandingStatus = "understood" | "confused";

export type UnderstandingCheckResult = {
  slug: string;
  concept: string;
  status: UnderstandingStatus;
  updatedAt: string;
};

export type LearningInsights = {
  completedCount: number;
  attemptedQuizCount: number;
  confusedConceptCount: number;
  weakConcepts: string[];
  weakQuestionTypes: string[];
  reviewChapters: Chapter[];
  nextChapter: Chapter | null;
  coachMessage: string;
};

export const learningProfileStorageKey = "cs-math-lab:learning-profile";
export const completedChaptersStorageKey = "cs-math-lab:completed-chapters";
export const quizResultsStorageKey = "cs-math-lab:quiz-results";
export const understandingChecksStorageKey = "cs-math-lab:understanding-checks";

const goalPaths: Record<LearningGoal, string[]> = {
  "coding-test": ["conditionals", "logic", "counting", "graphs", "proof-techniques", "induction"],
  course: ["logic", "conditionals", "sets", "functions", "relations", "induction", "proof-techniques"],
  foundation: ["logic", "conditionals", "sets", "functions", "relations", "induction"],
  portfolio: ["sets", "functions", "graphs", "counting", "proof-techniques"],
};

const levelPrefixes: Record<LearningLevel, string[]> = {
  beginner: ["logic", "conditionals"],
  "high-school-ok": ["conditionals"],
  "some-discrete": [],
};

const styleBoosts: Record<LearningStyle, string[]> = {
  short: [],
  examples: ["sets", "functions"],
  code: ["conditionals", "functions", "proof-techniques"],
  practice: ["counting", "proof-techniques", "induction"],
};

const goalTrackTags: Record<LearningGoal, LearningTrackTag[]> = {
  "coding-test": ["coding-test", "practice"],
  course: ["cs-foundation"],
  foundation: ["cs-foundation", "code"],
  portfolio: ["code", "ai-ml", "data-analysis", "graphics"],
};

const styleTrackTags: Record<LearningStyle, LearningTrackTag[]> = {
  short: [],
  examples: ["cs-foundation"],
  code: ["code"],
  practice: ["practice"],
};

const conceptTagsByChapter: Record<string, string[]> = {
  logic: ["명제", "논리 연산", "조건식"],
  conditionals: ["조건문", "대우", "진리표"],
  sets: ["집합", "부분집합", "집합 연산"],
  functions: ["함수", "정의역", "대응"],
  relations: ["관계", "반사성", "대칭성", "추이성"],
  induction: ["귀납법", "기저 사례", "재귀"],
  counting: ["경우의 수", "순열", "조합"],
  graphs: ["그래프", "DFS", "BFS"],
  "proof-techniques": ["증명", "대우", "반례", "모순"],
};

export function getRecommendedChapters(profile: LearningProfile, readyChapters: Chapter[]) {
  const readyBySlug = new Map(readyChapters.map((chapter) => [chapter.slug, chapter]));
  const preferredSlugs = [...levelPrefixes[profile.level], ...goalPaths[profile.goal], ...styleBoosts[profile.style]];
  const seen = new Set<string>();

  const recommended = preferredSlugs
    .filter((slug) => {
      if (seen.has(slug) || !readyBySlug.has(slug)) return false;
      seen.add(slug);
      return true;
    })
    .map((slug) => readyBySlug.get(slug))
    .filter((chapter): chapter is Chapter => Boolean(chapter));

  const scoredChapters = readyChapters
    .filter((chapter) => !seen.has(chapter.slug))
    .map((chapter) => ({
      chapter,
      score: getProfileScore(profile, chapter),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.chapter.level - right.chapter.level || left.chapter.order - right.chapter.order)
    .map((item) => item.chapter);

  if (recommended.length > 0 || scoredChapters.length > 0) {
    return [...recommended, ...scoredChapters];
  }

  return readyChapters;
}

export function getConceptTagsForChapter(slug: string) {
  return getChapter(slug)?.conceptTags ?? conceptTagsByChapter[slug] ?? [];
}

function getProfileScore(profile: LearningProfile, chapter: Chapter) {
  const targetTags = new Set([...goalTrackTags[profile.goal], ...styleTrackTags[profile.style]]);
  const trackScore = chapter.trackTags?.filter((tag) => targetTags.has(tag)).length ?? 0;
  const levelScore = profile.level === "beginner" && chapter.level === 1 ? 1 : 0;
  const advancedScore = profile.level === "some-discrete" && chapter.level > 1 ? 1 : 0;

  return trackScore * 2 + levelScore + advancedScore;
}

export function getAdaptiveRecommendedChapters(
  profile: LearningProfile,
  readyChapters: Chapter[],
  completedSlugs: string[],
  quizResults: QuizResult[],
) {
  const baseRecommendations = getRecommendedChapters(profile, readyChapters);
  const weakSlugs = new Set(
    quizResults
      .filter((result) => result.total > 0 && result.score / result.total < 0.7)
      .map((result) => result.slug),
  );
  const completedSet = new Set(completedSlugs);
  const seen = new Set<string>();
  const ordered = [
    ...readyChapters.filter((chapter) => weakSlugs.has(chapter.slug)),
    ...baseRecommendations.filter((chapter) => prerequisitesSatisfied(chapter, completedSet)),
    ...baseRecommendations.filter((chapter) => !completedSlugs.includes(chapter.slug)),
    ...baseRecommendations,
  ];

  return ordered.filter((chapter) => {
    if (seen.has(chapter.slug)) return false;
    seen.add(chapter.slug);
    return true;
  });
}

function prerequisitesSatisfied(chapter: Chapter, completedSlugs: Set<string>) {
  const prerequisites = chapter.prerequisites ?? [];

  return prerequisites.length === 0 || prerequisites.every((slug) => completedSlugs.has(slug));
}

export function getLearningInsights(
  profile: LearningProfile | null,
  readyChapters: Chapter[],
  completedSlugs: string[],
  quizResults: QuizResult[],
  understandingChecks: UnderstandingCheckResult[] = [],
): LearningInsights {
  const weakResults = quizResults.filter((result) => result.total > 0 && result.score / result.total < 0.7);
  const confusedChecks = understandingChecks.filter((check) => check.status === "confused");
  const weakConcepts = Array.from(
    new Set([
      ...weakResults.flatMap((result) => (result.missedConcepts?.length ? result.missedConcepts : result.concepts)),
      ...confusedChecks.map((check) => check.concept),
    ]),
  ).slice(0, 4);
  const weakQuestionTypes = Array.from(new Set(weakResults.flatMap((result) => result.missedQuestionTypes ?? []))).slice(0, 4);
  const weakSlugs = new Set([...weakResults.map((result) => result.slug), ...confusedChecks.map((check) => check.slug)]);
  const reviewChapters = readyChapters.filter((chapter) => weakSlugs.has(chapter.slug));
  const recommended = profile
    ? getAdaptiveRecommendedChapters(profile, readyChapters, completedSlugs, quizResults)
    : readyChapters;
  const nextChapter = recommended.find((chapter) => !completedSlugs.includes(chapter.slug)) ?? recommended[0] ?? null;

  let coachMessage = "목표와 선호를 설정하면 현재 공개 챕터 안에서 추천 순서를 조정합니다.";

  if (profile && weakConcepts.length > 0) {
    coachMessage = `${weakConcepts.slice(0, 2).join(", ")} 쪽에서 흔들린 기록이 있습니다. 다음 학습 전에 관련 챕터를 짧게 복습하는 편이 좋습니다.`;
  } else if (profile && nextChapter) {
    coachMessage = `${nextChapter.title}부터 이어가면 현재 목표와 선호에 가장 잘 맞습니다.`;
  } else if (completedSlugs.length > 0) {
    coachMessage = "완료한 챕터가 저장되어 있습니다. 남은 ready 챕터를 순서대로 이어가면 됩니다.";
  }

  return {
    completedCount: completedSlugs.length,
    attemptedQuizCount: quizResults.length,
    confusedConceptCount: confusedChecks.length,
    weakConcepts,
    weakQuestionTypes,
    reviewChapters,
    nextChapter,
    coachMessage,
  };
}

export function getProfileSummary(profile: LearningProfile) {
  const goals: Record<LearningGoal, string> = {
    "coding-test": "코테",
    course: "전공 수업",
    foundation: "기초 보강",
    portfolio: "포트폴리오",
  };
  const levels: Record<LearningLevel, string> = {
    beginner: "수학 거의 모름",
    "high-school-ok": "고등수학은 됨",
    "some-discrete": "이산수학 일부 앎",
  };
  const styles: Record<LearningStyle, string> = {
    short: "짧은 설명",
    examples: "예제 중심",
    code: "코드 연결",
    practice: "문제 풀이",
  };

  return `${goals[profile.goal]} · ${levels[profile.level]} · ${styles[profile.style]}`;
}
