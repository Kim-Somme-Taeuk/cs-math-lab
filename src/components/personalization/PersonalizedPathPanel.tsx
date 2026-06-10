"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildAiLearningContext } from "@/lib/aiLearningContext";
import {
  aiCoachCacheStorageKey,
  aiCoachDailyLimit,
  aiCoachFallbackMemo,
  aiCoachUsageStorageKey,
  type AiCoachRequestPayload,
  type AiCoachResponsePayload,
} from "@/lib/aiCoach";
import type { Chapter } from "@/lib/chapters";
import {
  completedChaptersStorageKey,
  conceptMasteryStorageKey,
  getAdaptiveRecommendedChapters,
  getConceptIdForChapter,
  getConceptTagsForChapter,
  getLearningInsights,
  getProfileSummary,
  learningProfileStorageKey,
  quizResultsStorageKey,
  understandingChecksStorageKey,
  type LearningGoal,
  type LearningLevel,
  type LearningProfile,
  type LearningStyle,
  type ConceptMastery,
  type QuizResult,
  type UnderstandingCheckResult,
} from "@/lib/personalization";

type PersonalizedPathPanelProps = {
  readyChapters: Chapter[];
};

type CachedCoachMemo = {
  contextHash: string;
  memo: string;
  updatedAt: string;
};

type CoachUsage = {
  date: string;
  count: number;
};

const defaultProfile: LearningProfile = {
  goal: "foundation",
  level: "beginner",
  style: "code",
};

const goalOptions: Array<{ value: LearningGoal; label: string }> = [
  { value: "foundation", label: "기초 보강" },
  { value: "course", label: "전공 수업" },
  { value: "coding-test", label: "코테" },
  { value: "portfolio", label: "포트폴리오" },
];

const levelOptions: Array<{ value: LearningLevel; label: string }> = [
  { value: "beginner", label: "수학 거의 모름" },
  { value: "high-school-ok", label: "고등수학은 됨" },
  { value: "some-discrete", label: "이산수학 일부 앎" },
];

const styleOptions: Array<{ value: LearningStyle; label: string }> = [
  { value: "code", label: "코드 연결" },
  { value: "examples", label: "예제 중심" },
  { value: "practice", label: "문제 풀이" },
  { value: "short", label: "짧은 설명" },
];

const pathPageSize = 3;

const goalReasonLabels: Record<LearningGoal, string> = {
  foundation: "기초 보강",
  course: "전공 수업",
  "coding-test": "코테 대비",
  portfolio: "포트폴리오",
};

const styleReasonLabels: Record<LearningStyle, string> = {
  code: "코드 연결",
  examples: "예제 중심",
  practice: "문제 풀이",
  short: "짧게 학습",
};

function readProfile() {
  try {
    const stored = window.localStorage.getItem(learningProfileStorageKey);
    return stored ? (JSON.parse(stored) as LearningProfile) : null;
  } catch {
    return null;
  }
}

function readCompletedChapters() {
  try {
    return JSON.parse(window.localStorage.getItem(completedChaptersStorageKey) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function readQuizResults() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(quizResultsStorageKey) ?? "{}") as Record<string, QuizResult>;
    return Object.values(stored).map((result) => ({
      ...result,
      conceptId: result.conceptId ?? getConceptIdForChapter(result.slug),
      concepts: result.concepts?.length ? result.concepts : getConceptTagsForChapter(result.slug),
      conceptIds: result.conceptIds?.length ? result.conceptIds : [result.conceptId ?? getConceptIdForChapter(result.slug)],
      missedConcepts: result.missedConcepts ?? [],
      missedQuestionTypes: result.missedQuestionTypes ?? [],
      missedReasonTags: result.missedReasonTags ?? [],
    }));
  } catch {
    return [];
  }
}

function readUnderstandingChecks() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(understandingChecksStorageKey) ?? "{}") as Record<
      string,
      UnderstandingCheckResult
    >;
    return Object.values(stored).map((check) => ({
      ...check,
      conceptId: check.conceptId ?? getConceptIdForChapter(check.slug),
    }));
  } catch {
    return [];
  }
}

function readConceptMastery() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(conceptMasteryStorageKey) ?? "{}") as Record<string, ConceptMastery>;
    return Object.values(stored).map((mastery) => ({
      ...mastery,
      conceptId: mastery.conceptId ?? "legacy",
    }));
  } catch {
    return [];
  }
}

function hashText(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(16);
}

function readCachedCoachMemo(contextHash: string) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(aiCoachCacheStorageKey) ?? "null") as CachedCoachMemo | null;

    return stored?.contextHash === contextHash ? stored.memo : null;
  } catch {
    return null;
  }
}

function writeCachedCoachMemo(contextHash: string, memo: string) {
  try {
    window.localStorage.setItem(
      aiCoachCacheStorageKey,
      JSON.stringify({
        contextHash,
        memo,
        updatedAt: new Date().toISOString(),
      } satisfies CachedCoachMemo),
    );
  } catch {
    // 캐시 저장 실패는 AI 메모 표시를 막지 않습니다.
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function readCoachUsage() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(aiCoachUsageStorageKey) ?? "null") as CoachUsage | null;

    return stored?.date === todayKey() ? stored : { date: todayKey(), count: 0 };
  } catch {
    return { date: todayKey(), count: 0 };
  }
}

function incrementCoachUsage() {
  const usage = readCoachUsage();
  const nextUsage = {
    date: usage.date,
    count: usage.count + 1,
  };

  try {
    window.localStorage.setItem(aiCoachUsageStorageKey, JSON.stringify(nextUsage));
  } catch {
    // 호출 제한 저장 실패는 요청 자체를 막지 않습니다.
  }

  return nextUsage;
}

function recommendationReasons(
  chapter: Chapter,
  profile: LearningProfile | null,
  completedChapters: string[],
  quizResults: QuizResult[],
  chapterTitleBySlug: Map<string, string>,
) {
  const reasons: string[] = [];

  if (profile) {
    reasons.push(goalReasonLabels[profile.goal], styleReasonLabels[profile.style]);
  } else {
    reasons.push("기본 순서");
  }

  const missingPrerequisites = chapter.prerequisites?.filter((slug) => !completedChapters.includes(slug)) ?? [];
  if (missingPrerequisites.length === 0 && chapter.prerequisites && chapter.prerequisites.length > 0) {
    reasons.push("선행 완료");
  } else if (missingPrerequisites.length > 0) {
    const missingTitles = missingPrerequisites
      .slice(0, 2)
      .map((slug) => chapterTitleBySlug.get(slug) ?? slug)
      .join(", ");
    reasons.push(`선행: ${missingTitles}`);
  } else {
    reasons.push("입문 가능");
  }

  const missedConcepts = new Set(quizResults.flatMap((result) => result.missedConcepts ?? []));
  const matchedWeakConcept = chapter.conceptTags?.find((tag) => missedConcepts.has(tag));
  if (matchedWeakConcept) {
    reasons.push(`복습: ${matchedWeakConcept}`);
  }

  return Array.from(new Set(reasons)).slice(0, 3);
}

export default function PersonalizedPathPanel({ readyChapters }: PersonalizedPathPanelProps) {
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [draftProfile, setDraftProfile] = useState<LearningProfile>(defaultProfile);
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [understandingChecks, setUnderstandingChecks] = useState<UnderstandingCheckResult[]>([]);
  const [conceptMastery, setConceptMastery] = useState<ConceptMastery[]>([]);
  const [editing, setEditing] = useState(false);
  const [aiCoachMemo, setAiCoachMemo] = useState<string | null>(null);
  const [aiCoachSource, setAiCoachSource] = useState<"ai" | "fallback" | "cache" | null>(null);
  const [aiCoachLoading, setAiCoachLoading] = useState(false);
  const [aiCoachUsageCount, setAiCoachUsageCount] = useState(0);
  const [pathPageIndex, setPathPageIndex] = useState(0);
  const [pathMotionDirection, setPathMotionDirection] = useState<"next" | "previous">("next");
  const [pathMotionEnabled, setPathMotionEnabled] = useState(false);

  useEffect(() => {
    const storedProfile = readProfile();
    setProfile(storedProfile);
    setDraftProfile(storedProfile ?? defaultProfile);
    setCompletedChapters(readCompletedChapters());
    setQuizResults(readQuizResults());
    setUnderstandingChecks(readUnderstandingChecks());
    setConceptMastery(readConceptMastery());
    setAiCoachUsageCount(readCoachUsage().count);
    setEditing(!storedProfile);
  }, []);

  const recommendedChapters = useMemo(() => {
    return profile
      ? getAdaptiveRecommendedChapters(profile, readyChapters, completedChapters, quizResults)
      : readyChapters;
  }, [completedChapters, profile, quizResults, readyChapters]);

  const insights = useMemo(() => {
    return getLearningInsights(profile, readyChapters, completedChapters, quizResults, understandingChecks);
  }, [completedChapters, profile, quizResults, readyChapters, understandingChecks]);

  const pathPageCount = Math.max(1, recommendedChapters.length - pathPageSize + 1);
  useEffect(() => {
    setPathPageIndex((current) => Math.min(current, pathPageCount - 1));
  }, [pathPageCount]);

  const aiLearningContext = useMemo(() => {
    return buildAiLearningContext({
      profile,
      readyChapters,
      completedSlugs: completedChapters,
      quizResults,
      understandingChecks,
      conceptMastery,
    });
  }, [completedChapters, conceptMastery, profile, quizResults, readyChapters, understandingChecks]);

  const aiContextHash = useMemo(() => hashText(JSON.stringify(aiLearningContext)), [aiLearningContext]);
  const chapterTitleBySlug = useMemo(
    () => new Map(readyChapters.map((chapter) => [chapter.slug, chapter.shortTitle || chapter.title])),
    [readyChapters],
  );
  const visibleRecommendedChapters = recommendedChapters.slice(pathPageIndex, pathPageIndex + pathPageSize);

  if (readyChapters.length === 0) {
    return null;
  }

  function saveProfile() {
    window.localStorage.setItem(learningProfileStorageKey, JSON.stringify(draftProfile));
    setProfile(draftProfile);
    setEditing(false);
    setPathMotionEnabled(false);
    setPathPageIndex(0);
  }

  function toggleCompleted(slug: string) {
    const nextCompleted = completedChapters.includes(slug)
      ? completedChapters.filter((item) => item !== slug)
      : [...completedChapters, slug];

    window.localStorage.setItem(completedChaptersStorageKey, JSON.stringify(nextCompleted));
    setCompletedChapters(nextCompleted);
  }

  function movePathPage(direction: "next" | "previous") {
    setPathMotionDirection(direction);
    setPathMotionEnabled(true);
    setPathPageIndex((current) => {
      if (direction === "previous") return Math.max(0, current - 1);
      return Math.min(pathPageCount - 1, current + 1);
    });
  }

  async function generateAiCoachMemo() {
    const cachedMemo = readCachedCoachMemo(aiContextHash);

    if (cachedMemo) {
      setAiCoachMemo(cachedMemo);
      setAiCoachSource("cache");
      return;
    }

    const usage = readCoachUsage();

    if (usage.count >= aiCoachDailyLimit) {
      setAiCoachMemo("오늘 한도에 도달했습니다.");
      setAiCoachSource("fallback");
      setAiCoachUsageCount(usage.count);
      return;
    }

    setAiCoachLoading(true);
    setAiCoachSource(null);

    try {
      const payload: AiCoachRequestPayload = {
        context: aiLearningContext,
      };
      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("AI coach request failed.");
      }

      const result = (await response.json()) as AiCoachResponsePayload;
      const memo = result.memo || aiCoachFallbackMemo;
      setAiCoachMemo(memo);
      setAiCoachSource(result.source);
      if (result.source === "ai") {
        const nextUsage = incrementCoachUsage();
        setAiCoachUsageCount(nextUsage.count);
        writeCachedCoachMemo(aiContextHash, memo);
      }
    } catch {
      setAiCoachMemo(aiCoachFallbackMemo);
      setAiCoachSource("fallback");
    } finally {
      setAiCoachLoading(false);
    }
  }

  return (
    <section className="mt-4 rounded-lg border border-teal-200 bg-teal-50/50 p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-teal-700">개인화 추천</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">내 학습 경로</h2>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
            목표, 수준, 퀴즈와 이해도 기록을 이 브라우저에 저장해 추천에 사용합니다.
          </p>
        </div>
        {profile && !editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-800 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
          >
            다시 설정
          </button>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <OptionGroup
            label="목표"
            options={goalOptions}
            value={draftProfile.goal}
            onChange={(goal) => setDraftProfile((current) => ({ ...current, goal }))}
          />
          <OptionGroup
            label="수준"
            options={levelOptions}
            value={draftProfile.level}
            onChange={(level) => setDraftProfile((current) => ({ ...current, level }))}
          />
          <OptionGroup
            label="선호"
            options={styleOptions}
            value={draftProfile.style}
            onChange={(style) => setDraftProfile((current) => ({ ...current, style }))}
          />
          <div className="lg:col-span-3">
            <button
              type="button"
              onClick={saveProfile}
              className="w-full rounded-md bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 sm:w-auto"
            >
              추천 경로 만들기
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          {profile ? (
            <p className="rounded-md bg-white px-3 py-2 text-sm font-bold text-slate-700">{getProfileSummary(profile)}</p>
          ) : null}
          <div className="mt-2 grid gap-2 lg:grid-cols-2">
            <div className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-xs font-black text-slate-500">학습 상태</p>
              <p className="mt-2 text-sm font-bold text-slate-800">
                완료 {insights.completedCount}개 · 퀴즈 기록 {insights.attemptedQuizCount}개
                {insights.confusedConceptCount > 0 ? ` · 헷갈림 ${insights.confusedConceptCount}개` : ""}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-xs font-black text-slate-500">최근 약점</p>
              <p className="mt-2 text-sm font-bold text-slate-800">
                {insights.weakConcepts.length > 0 ? insights.weakConcepts.join(", ") : "없음"}
              </p>
              {insights.weakQuestionTypes.length > 0 ? (
                <p className="mt-1 text-xs font-bold text-slate-400">유형: {insights.weakQuestionTypes.join(", ")}</p>
              ) : null}
              {insights.weakReasonTags.length > 0 ? (
                <p className="mt-1 text-xs font-bold text-slate-400">원인: {insights.weakReasonTags.join(", ")}</p>
              ) : null}
            </div>
          </div>
          <div className="mt-2 rounded-md border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-black text-slate-950">AI 코치 메모</p>
                {aiCoachSource ? (
                  <p className="mt-1 hidden text-xs font-bold text-slate-400 sm:block">
                    {aiCoachSource === "cache" ? "최근 응답 재사용" : aiCoachSource === "ai" ? "AI 생성" : "기본 메모"}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <p className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-500">
                  {aiCoachUsageCount}/{aiCoachDailyLimit}
                </p>
                <button
                  type="button"
                  onClick={generateAiCoachMemo}
                  disabled={aiCoachLoading}
                  className="rounded-md bg-slate-950 px-3 py-2 text-xs font-black text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:bg-slate-300 sm:text-sm"
                >
                  {aiCoachLoading ? "생성 중" : "메모 생성"}
                </button>
              </div>
            </div>
            {aiCoachMemo ? (
              <p className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">{aiCoachMemo}</p>
            ) : null}
          </div>
          {insights.reviewChapters.length > 0 ? (
            <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-black text-amber-800">복습 추천</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {insights.reviewChapters.map((chapter) => (
                  <Link
                    key={chapter.slug}
                    href={`/chapters/${chapter.slug}`}
                    className="rounded-md bg-white px-3 py-2 text-sm font-bold text-slate-800 hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                  >
                    {chapter.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mt-2 rounded-md border border-slate-200 bg-white p-2.5 sm:p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-950">추천 경로</p>
              </div>
            </div>
            <div className="relative mt-2">
              <button
                type="button"
                aria-label="이전 추천 경로"
                onClick={() => movePathPage("previous")}
                disabled={pathPageIndex === 0}
                className="absolute left-1 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/40 text-base font-black text-white shadow-sm backdrop-blur hover:bg-slate-950/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:bg-slate-950/10 disabled:text-white/40 sm:flex"
              >
                &lt;
              </button>
              <ol
                key={`path-page-${pathPageIndex}-${pathMotionDirection}`}
                className={`grid gap-3 sm:grid-cols-3 sm:px-8 ${
                  pathMotionEnabled
                    ? pathMotionDirection === "previous"
                      ? "path-page-motion-prev"
                      : "path-page-motion-next"
                    : ""
                }`}
              >
                {visibleRecommendedChapters.map((chapter, index) => {
                  const completed = completedChapters.includes(chapter.slug);
                  const recommendationIndex = pathPageIndex + index;
                  const reasons = recommendationReasons(chapter, profile, completedChapters, quizResults, chapterTitleBySlug);

                  return (
                    <li
                      key={chapter.slug}
                      className="relative min-h-36 rounded-md border border-slate-200 bg-white p-2 sm:p-3"
                    >
                      <div className="flex items-center justify-between gap-2 sm:items-start">
                        <div className="min-w-0">
                          <p className="text-[11px] font-black text-teal-700 sm:text-xs">추천 {recommendationIndex + 1}</p>
                          <h3 className="mt-0.5 line-clamp-2 text-sm font-black leading-5 text-slate-950 sm:truncate sm:text-base">
                            {chapter.title}
                          </h3>
                          <p className="mt-1 hidden text-xs font-bold text-slate-400 sm:block">{chapter.csConnection}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {reasons.map((reason) => (
                              <span key={reason} className="rounded bg-teal-50 px-2 py-1 text-[11px] font-black text-teal-700">
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span
                          className={`hidden shrink-0 rounded-md px-2 py-1 text-xs font-bold sm:block ${
                            completed ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {completed ? "완료" : "진행 전"}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-2">
                        <Link
                          href={`/chapters/${chapter.slug}`}
                          className="flex h-9 items-center justify-center rounded-md bg-slate-950 px-3 text-center text-[13px] font-black leading-none text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                        >
                          학습
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleCompleted(chapter.slug)}
                          className={`flex h-9 min-w-14 appearance-none items-center justify-center rounded-md border border-slate-300 px-3 text-center text-[12px] font-black leading-none hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${
                            completed ? "bg-white text-slate-700" : "bg-white text-slate-600"
                          }`}
                        >
                          {completed ? "완료" : "체크"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <button
                type="button"
                aria-label="다음 추천 경로"
                onClick={() => movePathPage("next")}
                disabled={pathPageIndex >= pathPageCount - 1}
                className="absolute right-1 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/40 text-base font-black text-white shadow-sm backdrop-blur hover:bg-slate-950/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:bg-slate-950/10 disabled:text-white/40 sm:flex"
              >
                &gt;
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
              <button
                type="button"
                onClick={() => movePathPage("previous")}
                disabled={pathPageIndex === 0}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-black text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                이전 추천
              </button>
              <button
                type="button"
                onClick={() => movePathPage("next")}
                disabled={pathPageIndex >= pathPageCount - 1}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-black text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                다음 추천
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function OptionGroup<TValue extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: TValue; label: string }>;
  value: TValue;
  onChange: (value: TValue) => void;
}) {
  return (
    <fieldset className="rounded-lg border border-slate-200 bg-white p-3">
      <legend className="px-1 text-sm font-bold text-slate-500">{label}</legend>
      <div className="mt-2 grid gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-md border px-3 py-2 text-left text-sm font-black ${
              value === option.value
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
            } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
