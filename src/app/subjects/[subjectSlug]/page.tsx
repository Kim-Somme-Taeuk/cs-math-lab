import Link from "next/link";
import { notFound } from "next/navigation";
import { roadmapSubjects, type ChapterStatus } from "@/lib/chapters";

const subjectStatusStyles = {
  active: "bg-teal-50 text-teal-700",
  planned: "bg-amber-50 text-amber-700",
};

const chapterStatusStyles: Record<ChapterStatus, string> = {
  ready: "bg-teal-50 text-teal-700",
  draft: "bg-slate-200 text-slate-600",
  planned: "bg-amber-50 text-amber-700",
};

type Subject = (typeof roadmapSubjects)[number];
type Level = Subject["levels"][number];
type Chapter = Level["chapters"][number];

type SubjectPageProps = {
  params: Promise<{
    subjectSlug: string;
  }>;
};

export function generateStaticParams() {
  return roadmapSubjects.map((subject) => ({
    subjectSlug: subject.id,
  }));
}

function statusLabel(status: ChapterStatus) {
  if (status === "ready") return "공개 중";
  if (status === "draft") return "준비 중";
  return "예정";
}

function levelStatus(level: Level) {
  if (level.chapters.some((chapter) => chapter.status === "ready")) return "ready";
  if (level.chapters.some((chapter) => chapter.status === "draft")) return "draft";
  return "planned";
}

function firstReadyChapter(subject: Subject) {
  return subject.levels.flatMap((level) => level.chapters).find((chapter) => chapter.status === "ready");
}

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

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { subjectSlug } = await params;
  const subject = roadmapSubjects.find((item) => item.id === subjectSlug);

  if (!subject) {
    notFound();
  }

  const counts = countChapters(subject);
  const startChapter = firstReadyChapter(subject);

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <Link href="/roadmap" className="text-sm font-bold text-teal-700 hover:text-teal-800">
        로드맵으로 돌아가기
      </Link>

      <section className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{subject.title}</h1>
            <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${subjectStatusStyles[subject.status]}`}>
              {subject.status === "active" ? "진행 중" : "예정"}
            </span>
          </div>
          <p className="mt-4 text-lg leading-8 text-slate-700">{subject.description}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">추천 시작점</p>
          {startChapter ? (
            <>
              <p className="mt-1 text-lg font-black text-slate-950">{startChapter.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">CS 연결: {startChapter.csConnection}</p>
              <Link
                href={`/chapters/${startChapter.slug}`}
                className="mt-4 inline-flex w-full justify-center rounded-md bg-slate-950 px-4 py-2.5 text-sm font-black text-white hover:bg-slate-800"
              >
                시작하기
              </Link>
            </>
          ) : (
            <>
              <p className="mt-1 text-lg font-black text-slate-950">아직 준비 중</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                이 과목의 상세 챕터는 아직 공개되지 않았습니다.
              </p>
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="summary-title" className="mt-8 grid gap-3 sm:grid-cols-4">
        <h2 id="summary-title" className="sr-only">
          과목 상태 요약
        </h2>
        <Stat label="Level" value={subject.levels.length} />
        <Stat label="전체 챕터" value={counts.total} />
        <Stat label="공개" value={counts.ready} tone="ready" />
        <Stat label="예정" value={counts.planned} tone="planned" />
      </section>

      <section aria-labelledby="levels-title" className="mt-10">
        <div>
          <h2 id="levels-title" className="text-2xl font-black tracking-tight text-slate-950">
            Level별 학습 과정
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            ready 챕터는 상세 페이지로 이동할 수 있고, planned 챕터는 예정 상태로만 표시합니다.
          </p>
        </div>

        <div className="mt-5 grid gap-5">
          {subject.levels.map((level) => (
            <LevelSection key={level.level} level={level} />
          ))}
        </div>
      </section>
    </main>
  );
}

function LevelSection({ level }: { level: Level }) {
  const status = levelStatus(level);
  const readyCount = level.chapters.filter((chapter) => chapter.status === "ready").length;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-black tracking-tight text-slate-950">{level.title}</h3>
            <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${chapterStatusStyles[status]}`}>
              {statusLabel(status)}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{level.description}</p>
        </div>
        <div className="flex gap-2 text-xs font-bold text-slate-500">
          <span className="rounded bg-slate-50 px-2 py-1">{level.chapters.length}개 챕터</span>
          <span className="rounded bg-teal-50 px-2 py-1 text-teal-700">{readyCount}개 공개</span>
        </div>
      </div>

      <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {level.chapters.map((chapter) => (
          <li key={chapter.slug}>
            <ChapterCard chapter={chapter} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function ChapterCard({ chapter }: { chapter: Chapter }) {
  const content = (
    <div className="flex h-full flex-col justify-between gap-3">
      <div>
        <ChapterVisual chapter={chapter} />
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-100 text-sm font-black text-slate-600">
              {chapter.order}
            </span>
            <div className="min-w-0">
              <h4 className="text-base font-black leading-5 text-slate-950">{chapter.title}</h4>
            </div>
          </div>
          <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${chapterStatusStyles[chapter.status]}`}>
            {statusLabel(chapter.status)}
          </span>
        </div>
      </div>
      <p className="text-xs font-bold text-slate-400">CS 연결: {chapter.csConnection}</p>
    </div>
  );

  if (chapter.status === "ready") {
    return (
      <Link
        href={`/chapters/${chapter.slug}`}
        className="block h-full rounded-md border border-slate-200 bg-white p-3 hover:border-teal-300 hover:bg-teal-50"
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={`h-full rounded-md border p-3 ${
        chapter.status === "draft" ? "border-slate-200 bg-slate-100" : "border-dashed border-slate-300 bg-white"
      }`}
    >
      {content}
    </div>
  );
}

function ChapterVisual({ chapter }: { chapter: Chapter }) {
  const muted = chapter.status !== "ready";
  const stroke = muted ? "border-slate-300" : "border-teal-500";
  const fill = muted ? "bg-slate-200" : "bg-teal-500";
  const softFill = muted ? "bg-slate-100" : "bg-teal-50";
  const text = muted ? "text-slate-400" : "text-teal-700";

  return (
    <div className={`mb-3 h-14 overflow-hidden rounded-md border ${muted ? "border-slate-200 bg-slate-50" : "border-teal-100 bg-teal-50/50"}`}>
      {chapter.level === 1 ? (
        <LevelOneVisual slug={chapter.slug} stroke={stroke} fill={fill} softFill={softFill} text={text} />
      ) : (
        <PlannedVisual order={chapter.order} stroke={stroke} fill={fill} softFill={softFill} text={text} />
      )}
    </div>
  );
}

function LevelOneVisual({
  slug,
  stroke,
  fill,
  softFill,
  text,
}: {
  slug: string;
  stroke: string;
  fill: string;
  softFill: string;
  text: string;
}) {
  if (slug === "logic") {
    return (
      <div className="flex h-full items-center justify-center gap-2">
        <span className={`rounded border ${stroke} bg-white px-2 py-1 text-xs font-black ${text}`}>P</span>
        <span className={`text-xs font-black ${text}`}>AND</span>
        <span className={`rounded border ${stroke} bg-white px-2 py-1 text-xs font-black ${text}`}>Q</span>
      </div>
    );
  }

  if (slug === "conditionals") {
    return (
      <div className="flex h-full items-center justify-center gap-3">
        <span className={`h-3 w-3 rounded-full ${fill}`} />
        <span className={`h-px w-12 ${fill}`} />
        <span className={`text-lg font-black leading-none ${text}`}>→</span>
        <span className={`h-3 w-3 rounded-full ${fill}`} />
      </div>
    );
  }

  if (slug === "sets") {
    return (
      <div className="relative mx-auto h-full w-24">
        <span className={`absolute left-5 top-3 h-8 w-8 rounded-full border ${stroke} ${softFill}`} />
        <span className={`absolute left-10 top-3 h-8 w-8 rounded-full border ${stroke} ${softFill}`} />
      </div>
    );
  }

  if (slug === "functions") {
    return (
      <div className="flex h-full items-center justify-center gap-3">
        <div className="grid gap-1">
          <span className={`h-2 w-2 rounded-full ${fill}`} />
          <span className={`h-2 w-2 rounded-full ${fill}`} />
          <span className={`h-2 w-2 rounded-full ${fill}`} />
        </div>
        <div className={`h-px w-12 ${fill}`} />
        <div className="grid gap-1">
          <span className={`h-2 w-2 rounded-full ${fill}`} />
          <span className={`h-2 w-2 rounded-full ${fill}`} />
        </div>
      </div>
    );
  }

  if (slug === "relations") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 9 }).map((_, index) => (
            <span
              key={index}
              className={`h-3 w-3 rounded-sm border ${stroke} ${
                [0, 1, 3, 4, 8].includes(index) ? fill : "bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (slug === "induction") {
    return (
      <div className="flex h-full items-end justify-center gap-1 pb-3">
        {[1, 2, 3, 4, 5].map((height) => (
          <span key={height} className={`w-4 rounded-t ${fill}`} style={{ height: `${height * 6}px` }} />
        ))}
      </div>
    );
  }

  if (slug === "counting") {
    return (
      <div className="flex h-full items-center justify-center gap-1.5">
        {["A", "B", "C", "D"].map((item) => (
          <span key={item} className={`rounded border ${stroke} bg-white px-2 py-1 text-xs font-black ${text}`}>
            {item}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-full w-28">
      <span className={`absolute left-4 top-4 h-3 w-3 rounded-full ${fill}`} />
      <span className={`absolute left-12 top-2 h-3 w-3 rounded-full ${fill}`} />
      <span className={`absolute left-20 top-7 h-3 w-3 rounded-full ${fill}`} />
      <span className={`absolute left-8 top-8 h-px w-12 -rotate-12 ${fill}`} />
      <span className={`absolute left-14 top-6 h-px w-10 rotate-45 ${fill}`} />
    </div>
  );
}

function PlannedVisual({
  order,
  stroke,
  fill,
  softFill,
  text,
}: {
  order: number;
  stroke: string;
  fill: string;
  softFill: string;
  text: string;
}) {
  const variant = order % 3;

  if (variant === 0) {
    return (
      <div className="flex h-full items-center justify-center gap-2">
        <span className={`h-8 w-8 rounded-full border ${stroke} ${softFill}`} />
        <span className={`h-8 w-8 rounded-full border ${stroke} ${softFill}`} />
        <span className={`h-8 w-8 rounded-full border ${stroke} ${softFill}`} />
      </div>
    );
  }

  if (variant === 1) {
    return (
      <div className="flex h-full items-end justify-center gap-1 pb-3">
        {[4, 2, 5, 3, 6].map((height, index) => (
          <span key={index} className={`w-3 rounded-t ${fill}`} style={{ height: `${height * 4}px` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 8 }).map((_, index) => (
          <span key={index} className={`h-3 w-3 rounded-sm border ${stroke} ${index % 2 === 0 ? fill : "bg-white"}`} />
        ))}
      </div>
      <span className={`ml-3 text-xs font-black ${text}`}>#{order}</span>
    </div>
  );
}

function Stat({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "ready" | "planned" }) {
  const toneStyles = {
    default: "bg-slate-50 text-slate-950",
    ready: "bg-teal-50 text-teal-700",
    planned: "bg-amber-50 text-amber-700",
  };

  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-4 ${toneStyles[tone]}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs font-bold opacity-75">{label}</p>
    </div>
  );
}
