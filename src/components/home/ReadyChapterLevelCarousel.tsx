"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Chapter, RoadmapLevel, RoadmapLevelId } from "@/lib/chapters";

type ReadyChapterLevel = {
  level: RoadmapLevelId;
  title: string;
  chapters: Chapter[];
};

type ReadyChapterLevelCarouselProps = {
  subjectTitle: string;
  levels: RoadmapLevel[];
};

function readyLevels(levels: RoadmapLevel[]): ReadyChapterLevel[] {
  return levels
    .map((level) => ({
      level: level.level,
      title: level.title,
      chapters: level.chapters.filter((chapter) => chapter.status === "ready"),
    }))
    .filter((level) => level.chapters.length > 0);
}

export function ReadyChapterLevelCarousel({ subjectTitle, levels }: ReadyChapterLevelCarouselProps) {
  const readyChapterLevels = useMemo(() => readyLevels(levels), [levels]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeLevel = readyChapterLevels[activeIndex] ?? readyChapterLevels[0];
  const totalReadyChapters = readyChapterLevels.reduce((sum, level) => sum + level.chapters.length, 0);

  if (!activeLevel) {
    return null;
  }

  const goToPreviousLevel = () => {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? readyChapterLevels.length - 1 : currentIndex - 1,
    );
  };

  const goToNextLevel = () => {
    setActiveIndex((currentIndex) =>
      currentIndex === readyChapterLevels.length - 1 ? 0 : currentIndex + 1,
    );
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-500">현재 공개 중</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">{subjectTitle} 공개 챕터</h2>
        </div>
        <span className="shrink-0 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">
          {totalReadyChapters}개 챕터
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={goToPreviousLevel}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-lg font-black text-slate-700 hover:bg-slate-100"
          aria-label="이전 레벨"
        >
          ‹
        </button>
        <div className="grid min-w-0 flex-1 grid-cols-3 gap-1 rounded-md bg-slate-200 p-1">
          {readyChapterLevels.map((level, index) => (
            <button
              key={level.level}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`min-h-8 rounded px-2 text-xs font-black ${
                index === activeIndex
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Level {level.level}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={goToNextLevel}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-lg font-black text-slate-700 hover:bg-slate-100"
          aria-label="다음 레벨"
        >
          ›
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <p className="text-xs font-bold text-teal-700">{activeLevel.title}</p>
          <p className="mt-0.5 text-sm font-bold text-slate-600">{activeLevel.chapters.length}개 공개</p>
        </div>
        <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-slate-500">
          {activeIndex + 1} / {readyChapterLevels.length}
        </span>
      </div>

      <div className="mt-4 grid h-[19.5rem] grid-cols-2 content-start gap-2">
        {activeLevel.chapters.map((chapter) => (
          <Link
            key={chapter.slug}
            href={`/chapters/${chapter.slug}`}
            className="flex min-h-14 min-w-0 flex-col rounded-md border border-slate-200 bg-white px-3 py-2 hover:border-teal-500"
          >
            <p className="text-xs font-bold text-teal-700">
              Level {chapter.level}-{chapter.order}
            </p>
            <p
              className="mt-0.5 block max-w-full overflow-hidden text-ellipsis text-sm font-bold text-slate-950"
              style={{ whiteSpace: "nowrap" }}
            >
              {chapter.title}
            </p>
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
