"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { roadmapSubjects, type ChapterStatus } from "@/lib/chapters";

const statusCopy: Record<ChapterStatus, { label: string; action: string }> = {
  ready: { label: "완성", action: "열기" },
  draft: { label: "초안", action: "준비 중" },
  planned: { label: "예정", action: "예정" },
};

const statusStyles: Record<
  ChapterStatus,
  { item: string; number: string; title: string; badge: string; body: string }
> = {
  ready: {
    item: "border-slate-200 bg-white",
    number: "bg-slate-100 text-slate-700",
    title: "text-slate-950",
    badge: "bg-teal-50 text-teal-700",
    body: "text-slate-700",
  },
  draft: {
    item: "border-slate-200 bg-slate-100 text-slate-500",
    number: "bg-slate-200 text-slate-500",
    title: "text-slate-500",
    badge: "bg-slate-200 text-slate-500",
    body: "text-slate-500",
  },
  planned: {
    item: "border-dashed border-slate-300 bg-white text-slate-500",
    number: "bg-amber-50 text-amber-700",
    title: "text-slate-600",
    badge: "bg-amber-50 text-amber-700",
    body: "text-slate-500",
  },
};

export default function RoadmapPage() {
  const [openSubjectIds, setOpenSubjectIds] = useState<string[]>([]);

  useEffect(() => {
    function scrollToSubject(subjectId: string) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          document.getElementById(subjectId)?.scrollIntoView({ block: "start" });
        });
      });
    }

    function syncOpenSubjectWithHash() {
      const subjectId = window.location.hash.replace("#", "");
      const subjectExists = roadmapSubjects.some((subject) => subject.id === subjectId);

      if (!subjectExists) {
        setOpenSubjectIds([]);
        return;
      }

      setOpenSubjectIds((current) => (current.includes(subjectId) ? current : [...current, subjectId]));
      scrollToSubject(subjectId);
    }

    syncOpenSubjectWithHash();
    window.addEventListener("hashchange", syncOpenSubjectWithHash);

    return () => window.removeEventListener("hashchange", syncOpenSubjectWithHash);
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-bold text-teal-700">CS Math Roadmap</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          컴공 수학 로드맵
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          CS Math Lab은 이산수학에서 시작하지만, 전체 구조는 이산수학, 선형대수,
          미적분, 확률통계로 확장되도록 설계합니다. 현재는 이산수학 Level 1의 ready
          챕터만 상세 페이지로 열립니다.
        </p>
        <Link
          href="/chapters/logic"
          className="mt-6 inline-flex rounded-md bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
        >
          처음이면 여기서 시작
        </Link>
      </div>

      <div className="mt-10 grid gap-10">
        {roadmapSubjects.map((subject) => (
          <details
            key={subject.id}
            id={subject.id}
            open={openSubjectIds.includes(subject.id)}
            onToggle={(event) => {
              if (event.currentTarget.open) {
                setOpenSubjectIds((current) => (current.includes(subject.id) ? current : [...current, subject.id]));
              } else {
                setOpenSubjectIds((current) => current.filter((id) => id !== subject.id));
              }
            }}
            className="group scroll-mt-6 rounded-lg border border-slate-200 bg-white"
          >
            <summary className="cursor-pointer list-none p-5 marker:hidden">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 id={`${subject.id}-title`} className="text-2xl font-black tracking-tight text-slate-950">
                      {subject.title}
                    </h2>
                    <span
                      className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                        subject.status === "active"
                          ? "bg-teal-50 text-teal-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {subject.status === "active" ? "진행 중" : "예정"}
                    </span>
                  </div>
                  <p className="mt-2 leading-7 text-slate-600">{subject.description}</p>
                </div>
                <span className="rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 group-open:bg-slate-950 group-open:text-white">
                  <span className="group-open:hidden">펼치기</span>
                  <span className="hidden group-open:inline">접기</span>
                </span>
              </div>
            </summary>

            <div className="grid gap-4 border-t border-slate-200 p-5">
              {subject.levels.map((level) => (
                <details
                  key={`${subject.id}-${level.level}`}
                  className="group/level rounded-lg border border-slate-200 bg-slate-50"
                >
                  <summary className="cursor-pointer list-none p-4 marker:hidden">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="max-w-3xl">
                        <h3
                          id={`${subject.id}-level-${level.level}`}
                          className="text-xl font-black tracking-tight text-slate-900"
                        >
                          {level.title}
                        </h3>
                        <p className="mt-2 leading-7 text-slate-600">{level.description}</p>
                      </div>
                      <span className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 group-open/level:bg-slate-950 group-open/level:text-white">
                        <span className="group-open/level:hidden">{level.chapters.length}개 챕터 보기</span>
                        <span className="hidden group-open/level:inline">접기</span>
                      </span>
                    </div>
                  </summary>

                  <ol className="grid gap-4 border-t border-slate-200 p-4">
                    {level.chapters.map((chapter) => {
                      const styles = statusStyles[chapter.status];
                      const copy = statusCopy[chapter.status];

                      return (
                        <li
                          key={chapter.slug}
                          data-testid={`chapter-${chapter.slug}`}
                          className={`rounded-lg border p-5 ${styles.item}`}
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <span className={`rounded-md px-2.5 py-1 text-sm font-bold ${styles.number}`}>
                                  {chapter.order}
                                </span>
                                <h4 className={`text-xl font-bold ${styles.title}`}>{chapter.title}</h4>
                                <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${styles.badge}`}>
                                  {copy.label}
                                </span>
                              </div>
                              <p className={`mt-3 leading-7 ${styles.body}`}>{chapter.description}</p>
                              <p className="mt-2 text-sm font-medium text-slate-500">
                                CS 연결: {chapter.csConnection}
                              </p>
                            </div>
                            {chapter.status === "ready" ? (
                              <Link
                                href={`/chapters/${chapter.slug}`}
                                className="rounded-md border border-slate-300 px-4 py-2 text-center text-sm font-bold text-slate-800 hover:bg-slate-100"
                              >
                                {copy.action}
                              </Link>
                            ) : (
                              <span className="rounded-md border border-slate-300 px-4 py-2 text-center text-sm font-bold text-slate-500">
                                {copy.action}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </details>
              ))}
            </div>
          </details>
        ))}
      </div>
    </main>
  );
}
