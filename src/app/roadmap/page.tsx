import Link from "next/link";
import { roadmapSubjects, type ChapterStatus } from "@/lib/chapters";

const subjectStatusStyles = {
  active: "bg-teal-50 text-teal-700",
  planned: "bg-amber-50 text-amber-700",
};

const levelStatusStyles: Record<ChapterStatus, string> = {
  ready: "bg-teal-50 text-teal-700",
  draft: "bg-slate-200 text-slate-600",
  planned: "bg-amber-50 text-amber-700",
};

type Subject = (typeof roadmapSubjects)[number];
type Level = Subject["levels"][number];

function countChapters(subject: Subject) {
  return subject.levels.flatMap((level) => level.chapters).reduce(
    (counts, chapter) => {
      counts[chapter.status] += 1;
      counts.total += 1;
      return counts;
    },
    { ready: 0, draft: 0, planned: 0, total: 0 } satisfies Record<ChapterStatus | "total", number>,
  );
}

function levelStatus(level: Level) {
  if (level.chapters.some((chapter) => chapter.status === "ready")) return "ready";
  if (level.chapters.some((chapter) => chapter.status === "draft")) return "draft";
  return "planned";
}

function statusLabel(status: ChapterStatus) {
  if (status === "ready") return "공개 중";
  if (status === "draft") return "준비 중";
  return "예정";
}

export default function RoadmapPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-teal-700">CS Math Roadmap</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            컴공 수학 로드맵
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-700">
            과목별 학습 트랙을 먼저 고르고, 각 과목 페이지에서 Level별 챕터를 확인합니다.
            현재는 이산수학 Level 1이 실제 공개 범위입니다.
          </p>
        </div>

        <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
          <p className="text-sm font-bold text-teal-700">처음이라면 여기서 시작</p>
          <p className="mt-1 text-lg font-black text-slate-950">이산수학 Level 1</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            논리, 집합, 함수, 관계, 그래프까지 컴공 전공의 기초 언어를 먼저 잡습니다.
          </p>
          <Link
            href="/subjects/discrete-math"
            className="mt-4 inline-flex w-full justify-center rounded-md bg-slate-950 px-4 py-2.5 text-sm font-black text-white hover:bg-slate-800"
          >
            이산수학 트랙 보기
          </Link>
        </div>
      </section>

      <section aria-labelledby="subjects-title" className="mt-10">
        <div>
          <h2 id="subjects-title" className="text-2xl font-black tracking-tight text-slate-950">
            대주제
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            전체 챕터를 한 화면에 펼치기보다, 과목을 선택한 뒤 해당 과목의 학습 과정을 봅니다.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roadmapSubjects.map((subject) => {
            const counts = countChapters(subject);

            return (
              <Link
                key={subject.id}
                href={`/subjects/${subject.id}`}
                className="rounded-lg border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-black text-slate-950">{subject.title}</h3>
                  <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${subjectStatusStyles[subject.status]}`}>
                    {subject.status === "active" ? "진행 중" : "예정"}
                  </span>
                </div>
                <p className="mt-3 min-h-24 text-sm leading-6 text-slate-600">{subject.description}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <Stat label="Level" value={subject.levels.length} />
                  <Stat label="공개" value={counts.ready} tone="ready" />
                  <Stat label="예정" value={counts.planned} tone="planned" />
                </div>
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <p className="text-xs font-black uppercase text-slate-500">Levels</p>
                  <div className="mt-2 grid gap-2">
                    {subject.levels.map((level) => {
                      const status = levelStatus(level);

                      return (
                        <div key={level.level} className="flex items-center justify-between gap-2 text-sm">
                          <span className="font-bold text-slate-800">{level.title}</span>
                          <span className={`shrink-0 rounded px-2 py-1 text-xs font-bold ${levelStatusStyles[status]}`}>
                            {statusLabel(status)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <span className="mt-5 inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-black text-slate-800">
                  자세히 보기
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "ready" | "planned" }) {
  const toneStyles = {
    default: "bg-slate-50 text-slate-950",
    ready: "bg-teal-50 text-teal-700",
    planned: "bg-amber-50 text-amber-700",
  };

  return (
    <div className={`rounded-md px-2 py-2 ${toneStyles[tone]}`}>
      <p className="text-lg font-black">{value}</p>
      <p className="text-xs font-bold opacity-75">{label}</p>
    </div>
  );
}
