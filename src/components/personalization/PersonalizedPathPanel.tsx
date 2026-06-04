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
  getAdaptiveRecommendedChapters,
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
      concepts: result.concepts?.length ? result.concepts : getConceptTagsForChapter(result.slug),
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
    return Object.values(stored);
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

export default function PersonalizedPathPanel({ readyChapters }: PersonalizedPathPanelProps) {
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [draftProfile, setDraftProfile] = useState<LearningProfile>(defaultProfile);
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [understandingChecks, setUnderstandingChecks] = useState<UnderstandingCheckResult[]>([]);
  const [editing, setEditing] = useState(false);
  const [aiCoachMemo, setAiCoachMemo] = useState<string | null>(null);
  const [aiCoachSource, setAiCoachSource] = useState<"ai" | "fallback" | "cache" | null>(null);
  const [aiCoachLoading, setAiCoachLoading] = useState(false);
  const [aiCoachUsageCount, setAiCoachUsageCount] = useState(0);

  useEffect(() => {
    const storedProfile = readProfile();
    setProfile(storedProfile);
    setDraftProfile(storedProfile ?? defaultProfile);
    setCompletedChapters(readCompletedChapters());
    setQuizResults(readQuizResults());
    setUnderstandingChecks(readUnderstandingChecks());
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

  const aiLearningContext = useMemo(() => {
    return buildAiLearningContext({
      profile,
      readyChapters,
      completedSlugs: completedChapters,
      quizResults,
      understandingChecks,
    });
  }, [completedChapters, profile, quizResults, readyChapters, understandingChecks]);

  const aiContextHash = useMemo(() => hashText(JSON.stringify(aiLearningContext)), [aiLearningContext]);

  if (readyChapters.length === 0) {
    return null;
  }

  function saveProfile() {
    window.localStorage.setItem(learningProfileStorageKey, JSON.stringify(draftProfile));
    setProfile(draftProfile);
    setEditing(false);
  }

  function toggleCompleted(slug: string) {
    const nextCompleted = completedChapters.includes(slug)
      ? completedChapters.filter((item) => item !== slug)
      : [...completedChapters, slug];

    window.localStorage.setItem(completedChaptersStorageKey, JSON.stringify(nextCompleted));
    setCompletedChapters(nextCompleted);
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
      setAiCoachMemo("오늘 AI 코치 호출 한도에 도달했습니다. 저장된 코치 메모와 추천 경로를 기준으로 이어가세요.");
      setAiCoachSource("fallback");
      setAiCoachUsageCount(usage.count);
      return;
    }

    setAiCoachLoading(true);
    setAiCoachSource(null);

    try {
      const nextUsage = incrementCoachUsage();
      setAiCoachUsageCount(nextUsage.count);

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
    <section className="mt-8 rounded-lg border border-teal-200 bg-teal-50/50 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-teal-700">개인화 추천</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">내 학습 경로</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            목표와 선호를 브라우저에 저장하고, 현재 공개된 챕터 안에서 추천 순서를 조정합니다.
          </p>
        </div>
        {profile && !editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-800 hover:bg-slate-100"
          >
            다시 설정
          </button>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
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
              className="w-full rounded-md bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 sm:w-auto"
            >
              추천 경로 만들기
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          {profile ? (
            <p className="rounded-md bg-white px-3 py-2 text-sm font-bold text-slate-700">{getProfileSummary(profile)}</p>
          ) : null}
          <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr_1.2fr]">
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
                {insights.weakConcepts.length > 0 ? insights.weakConcepts.join(", ") : "아직 뚜렷한 약점 기록 없음"}
              </p>
              {insights.weakQuestionTypes.length > 0 ? (
                <p className="mt-1 text-xs font-bold text-slate-400">유형: {insights.weakQuestionTypes.join(", ")}</p>
              ) : null}
              {insights.weakReasonTags.length > 0 ? (
                <p className="mt-1 text-xs font-bold text-slate-400">원인: {insights.weakReasonTags.join(", ")}</p>
              ) : null}
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-xs font-black text-slate-500">코치 메모</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{insights.coachMessage}</p>
            </div>
          </div>
          <div className="mt-3 rounded-md border border-slate-200 bg-white p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-slate-950">AI 코치 메모</p>
                <p className="mt-1 text-xs font-bold text-slate-400">
                  학습 목표, 완료 챕터, 오답 태그만 전송됩니다. 오늘 {aiCoachUsageCount} / {aiCoachDailyLimit}회 사용
                  {aiCoachSource
                    ? ` · ${aiCoachSource === "cache" ? "최근 응답 재사용" : aiCoachSource === "ai" ? "AI 생성" : "기본 메모"}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={generateAiCoachMemo}
                disabled={aiCoachLoading}
                className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {aiCoachLoading ? "생성 중" : "AI 코치 메모 생성"}
              </button>
            </div>
            {aiCoachMemo ? <p className="mt-3 text-sm leading-6 text-slate-700">{aiCoachMemo}</p> : null}
          </div>
          {insights.reviewChapters.length > 0 ? (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-black text-amber-800">복습 추천</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {insights.reviewChapters.map((chapter) => (
                  <Link
                    key={chapter.slug}
                    href={`/chapters/${chapter.slug}`}
                    className="rounded-md bg-white px-3 py-2 text-sm font-bold text-slate-800 hover:bg-amber-100"
                  >
                    {chapter.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          <ol className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recommendedChapters.map((chapter, index) => {
              const completed = completedChapters.includes(chapter.slug);

              return (
                <li key={chapter.slug} className="rounded-md border border-slate-200 bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-teal-700">추천 {index + 1}</p>
                      <h3 className="mt-1 text-base font-black text-slate-950">{chapter.title}</h3>
                      <p className="mt-1 text-xs font-bold text-slate-400">{chapter.csConnection}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${
                        completed ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {completed ? "완료" : "진행 전"}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                    <Link
                      href={`/chapters/${chapter.slug}`}
                      className="rounded-md bg-slate-950 px-3 py-2 text-center text-sm font-black text-white hover:bg-slate-800"
                    >
                      학습하기
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleCompleted(chapter.slug)}
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-100"
                    >
                      {completed ? "해제" : "완료"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
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
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
