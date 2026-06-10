"use client";

import { useEffect, useState } from "react";
import {
  understandingChecksStorageKey,
  getConceptIdForChapter,
  type UnderstandingCheckResult,
  type UnderstandingStatus,
} from "@/lib/personalization";

type UnderstandingCheckProps = {
  concept: string;
  prompt?: string;
};

function readChecks() {
  try {
    return JSON.parse(window.localStorage.getItem(understandingChecksStorageKey) ?? "{}") as Record<
      string,
      UnderstandingCheckResult
    >;
  } catch {
    return {};
  }
}

function getChapterSlug() {
  return window.location.pathname.match(/^\/chapters\/([^/]+)/)?.[1] ?? "unknown";
}

export default function UnderstandingCheck({ concept, prompt }: UnderstandingCheckProps) {
  const [status, setStatus] = useState<UnderstandingStatus | null>(null);

  useEffect(() => {
    const slug = getChapterSlug();
    const conceptId = getConceptIdForChapter(slug);
    const stored = readChecks()[`${slug}:${conceptId}:${concept}`] ?? readChecks()[`${slug}:${concept}`];
    setStatus(stored?.status ?? null);
  }, [concept]);

  function saveStatus(nextStatus: UnderstandingStatus) {
    const slug = getChapterSlug();
    const conceptId = getConceptIdForChapter(slug);
    const checks = readChecks();
    window.localStorage.setItem(
      understandingChecksStorageKey,
      JSON.stringify({
        ...checks,
        [`${slug}:${conceptId}:${concept}`]: {
          slug,
          conceptId,
          concept,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        },
      }),
    );
    setStatus(nextStatus);
  }

  return (
    <section className="mt-3 mb-6 rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-slate-500">이해도 체크</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            {prompt ?? `${concept} 개념을 따라갈 수 있나요?`}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:min-w-64">
          <button
            type="button"
            onClick={() => saveStatus("understood")}
            className={`rounded-md border px-3 py-2 text-sm font-black ${
              status === "understood"
                ? "border-teal-600 bg-teal-50 text-teal-800"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500`}
          >
            이해했음
          </button>
          <button
            type="button"
            onClick={() => saveStatus("confused")}
            className={`rounded-md border px-3 py-2 text-sm font-black ${
              status === "confused"
                ? "border-amber-500 bg-amber-50 text-amber-800"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500`}
          >
            아직 헷갈림
          </button>
        </div>
      </div>
      {status === "confused" ? (
        <div className="mt-3 rounded-md bg-amber-50 p-3">
          <p className="text-sm font-bold leading-6 text-amber-900">
            헷갈리면 바로 다음으로 넘기지 말고 관련 설명이나 실험을 한 번 더 확인하세요.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="#definition"
              className="rounded-md bg-white px-3 py-2 text-sm font-black text-slate-800 hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            >
              핵심 정의 다시 보기
            </a>
            <a
              href="#practice"
              className="rounded-md bg-white px-3 py-2 text-sm font-black text-slate-800 hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            >
              실험으로 확인
            </a>
            <a
              href="#review"
              className="rounded-md bg-white px-3 py-2 text-sm font-black text-slate-800 hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            >
              관련 문제 풀기
            </a>
          </div>
        </div>
      ) : null}
    </section>
  );
}
