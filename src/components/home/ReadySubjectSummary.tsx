"use client";

import Link from "next/link";
import type { RoadmapSubject } from "@/lib/chapters";

type ReadySubjectSummaryProps = {
  subjects: RoadmapSubject[];
};

function readyChaptersByLevel(subject: RoadmapSubject) {
  return subject.levels.map((level) => ({
    level: level.level,
    title: level.title,
    count: level.chapters.filter((chapter) => chapter.status === "ready").length,
  }));
}

export function ReadySubjectSummary({ subjects }: ReadySubjectSummaryProps) {
  const readySubjects = subjects
    .map((subject) => ({
      subject,
      levels: readyChaptersByLevel(subject),
    }))
    .map((item) => ({
      ...item,
      readyCount: item.levels.reduce((sum, level) => sum + level.count, 0),
    }))
    .filter((item) => item.readyCount > 0);
  const totalReadyChapters = readySubjects.reduce((sum, item) => sum + item.readyCount, 0);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-500">현재 공개 중</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">공개 학습 트랙</h2>
        </div>
        <span className="shrink-0 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">
          {totalReadyChapters}개 챕터
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {readySubjects.map(({ subject, levels, readyCount }) => (
          <Link
            key={subject.id}
            href={`/subjects/${subject.id}`}
            className="block rounded-md border border-slate-200 bg-white p-4 hover:border-teal-500 hover:bg-teal-50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-black text-slate-950">{subject.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{subject.description}</p>
              </div>
              <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                {readyCount}개
              </span>
            </div>

            <dl className="mt-3 grid grid-cols-3 gap-2">
              {levels.map((level) => (
                <div key={level.level} className="rounded-md bg-slate-50 px-2 py-2 text-center">
                  <dt className="text-xs font-black text-teal-700">Level {level.level}</dt>
                  <dd className="mt-0.5 text-xs font-bold text-slate-600">{level.count}개 공개</dd>
                </div>
              ))}
            </dl>
          </Link>
        ))}
      </div>

      <Link
        href="/roadmap"
        className="mt-4 inline-flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100"
      >
        전체 로드맵 보기
      </Link>
    </div>
  );
}
