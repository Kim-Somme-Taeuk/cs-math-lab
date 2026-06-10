"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { completedChaptersStorageKey } from "@/lib/personalization";

export default function NextChapterButton({ href, label }: { href: string; label: string }) {
  const [completed, setCompleted] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const displayLabel = href.startsWith("/subjects/") && label === "다음 챕터로 가기" ? "과목 로드맵으로 돌아가기" : label;

  useEffect(() => {
    const currentSlug = window.location.pathname.match(/^\/chapters\/([^/]+)/)?.[1] ?? null;
    setSlug(currentSlug);

    if (!currentSlug) return;

    try {
      const completedSlugs = JSON.parse(window.localStorage.getItem(completedChaptersStorageKey) ?? "[]") as string[];
      setCompleted(completedSlugs.includes(currentSlug));
    } catch {
      setCompleted(false);
    }
  }, []);

  function markCompleted() {
    if (!slug) return;

    try {
      const completedSlugs = JSON.parse(window.localStorage.getItem(completedChaptersStorageKey) ?? "[]") as string[];
      const nextCompleted = completedSlugs.includes(slug) ? completedSlugs : [...completedSlugs, slug];
      window.localStorage.setItem(completedChaptersStorageKey, JSON.stringify(nextCompleted));
      setCompleted(true);
    } catch {
      setCompleted(true);
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={markCompleted}
        className={`inline-flex w-full items-center justify-center rounded-md border px-4 py-3 text-sm font-black sm:w-auto ${
          completed
            ? "border-teal-300 bg-teal-50 text-teal-800"
            : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
        } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500`}
      >
        {completed ? "완료로 기록됨" : "학습 완료로 표시"}
      </button>
      <Link
        className="inline-flex w-full items-center justify-center rounded-md bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 sm:w-auto"
        href={href}
      >
        {displayLabel}
      </Link>
    </div>
  );
}
