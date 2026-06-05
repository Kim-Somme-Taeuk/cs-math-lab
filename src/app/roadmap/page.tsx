import Link from "next/link";
import PersonalizedPathPanel from "@/components/personalization/PersonalizedPathPanel";
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

const subjectCardDescriptions: Partial<Record<Subject["id"], string>> = {
  calculus: "변화율, 누적, 최적화 개념을 알고리즘과 모델 학습에 연결합니다.",
};

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
  const readyChapters = roadmapSubjects
    .flatMap((subject) => subject.levels)
    .flatMap((level) => level.chapters)
    .filter((chapter) => chapter.status === "ready");

  return (
    <main className="mx-auto max-w-6xl px-5 py-6 sm:py-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">컴공 수학 로드맵</h1>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-teal-200 bg-teal-50 p-3 sm:min-w-80">
          <div>
            <p className="text-xs font-bold text-teal-700">처음이라면</p>
            <p className="text-base font-black text-slate-950">이산수학 Level 1</p>
          </div>
          <Link
            href="/subjects/discrete-math"
            className="inline-flex shrink-0 justify-center rounded-md bg-slate-950 px-3 py-2 text-sm font-black text-white hover:bg-slate-800"
          >
            시작
          </Link>
        </div>
      </section>

      <PersonalizedPathPanel readyChapters={readyChapters} />

      <section className="mt-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {roadmapSubjects.map((subject) => {
            const counts = countChapters(subject);

            return (
              <Link
                key={subject.id}
                href={`/subjects/${subject.id}`}
                className="rounded-lg border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-black text-slate-950">{subject.title}</h3>
                  <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${subjectStatusStyles[subject.status]}`}>
                    {subject.status === "active" ? "진행 중" : "예정"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-5 text-slate-600">
                  {subjectCardDescriptions[subject.id] ?? subject.description}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <Stat label="Level" value={subject.levels.length} />
                  <Stat label="공개" value={counts.ready} tone="ready" />
                  <Stat label="예정" value={counts.planned} tone="planned" />
                </div>
                <div className="mt-3 border-t border-slate-200 pt-3">
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
                <span className="mt-3 inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-black text-slate-800">
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
