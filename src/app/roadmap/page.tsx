import Link from "next/link";
import { roadmapLevels, type ChapterStatus } from "@/lib/chapters";

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
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-bold text-teal-700">Discrete Math Roadmap</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          이산수학 입문 로드맵
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          현재 사이트는 이산수학 전체가 아니라 컴공생을 위한 입문 MVP에서 시작합니다.
          Level 1은 현재 학습 범위이고, Level 2와 Level 3은 향후 확장 방향입니다.
        </p>
      </div>

      <div className="mt-10 grid gap-10">
        {roadmapLevels.map((level) => (
          <section key={level.level} aria-labelledby={`level-${level.level}-title`}>
            <div className="max-w-3xl">
              <h2
                id={`level-${level.level}-title`}
                className="text-2xl font-black tracking-tight text-slate-950"
              >
                {level.title}
              </h2>
              <p className="mt-2 leading-7 text-slate-600">{level.description}</p>
            </div>

            <ol className="mt-5 grid gap-4">
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
                          <h3 className={`text-xl font-bold ${styles.title}`}>{chapter.title}</h3>
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
          </section>
        ))}
      </div>
    </main>
  );
}
