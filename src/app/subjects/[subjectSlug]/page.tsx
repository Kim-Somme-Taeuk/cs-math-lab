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

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { subjectSlug } = await params;
  const subject = roadmapSubjects.find((item) => item.id === subjectSlug);

  if (!subject) {
    notFound();
  }

  const startChapter = firstReadyChapter(subject);

  return (
    <main className="mx-auto max-w-6xl px-5 py-6 sm:py-8">
      <Link href="/roadmap" className="text-sm font-bold text-teal-700 hover:text-teal-800">
        로드맵으로 돌아가기
      </Link>

      <section className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{subject.title}</h1>
            <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${subjectStatusStyles[subject.status]}`}>
              {subject.status === "active" ? "진행 중" : "예정"}
            </span>
          </div>
        </div>

        {startChapter ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:min-w-80">
            <div>
              <p className="text-xs font-bold text-slate-500">추천 시작점</p>
              <p className="text-base font-black text-slate-950">{startChapter.title}</p>
            </div>
              <Link
                href={`/chapters/${startChapter.slug}`}
                className="inline-flex shrink-0 justify-center rounded-md bg-slate-950 px-3 py-2 text-sm font-black text-white hover:bg-slate-800"
              >
                시작
              </Link>
          </div>
        ) : null}
      </section>

      <section className="mt-4">
        <div className="grid gap-4">
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

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="border-b border-slate-200 pb-4">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-black tracking-tight text-slate-950">{level.title}</h3>
            <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${chapterStatusStyles[status]}`}>
              {statusLabel(status)}
            </span>
          </div>
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
      <p className="text-xs font-bold text-slate-400">{chapter.csConnection}</p>
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
      ) : chapter.level === 2 && chapter.subjectId === "discrete-math" ? (
        <LevelTwoVisual slug={chapter.slug} stroke={stroke} fill={fill} softFill={softFill} text={text} />
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
    return <MiniFunctionVisual text={text} />;
  }

  if (slug === "relations") {
    return <MiniRelationGridVisual text={text} />;
  }

  if (slug === "induction") {
    return <MiniInductionVisual text={text} />;
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

  return <MiniGraphVisual text={text} />;
}

function LevelTwoVisual({
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
  if (slug === "logical-equivalence") {
    return (
      <div className="flex h-full items-center justify-center gap-2">
        <span className={`rounded border ${stroke} bg-white px-2 py-1 text-xs font-black ${text}`}>P</span>
        <span className={`text-xs font-black ${text}`}>≡</span>
        <span className={`rounded border ${stroke} ${softFill} px-2 py-1 text-xs font-black ${text}`}>Q</span>
      </div>
    );
  }

  if (slug === "predicate-logic") {
    return (
      <div className="flex h-full items-center justify-center gap-2">
        <span className={`text-sm font-black ${text}`}>∀x</span>
        <div className="grid grid-cols-3 gap-1">
          {[true, true, false, true, false, true].map((active, index) => (
            <span key={index} className={`h-2.5 w-2.5 rounded-full border ${stroke} ${active ? fill : "bg-white"}`} />
          ))}
        </div>
        <span className={`text-sm font-black ${text}`}>∃</span>
      </div>
    );
  }

  if (slug === "proof-techniques") {
    return <MiniProofVisual text={text} />;
  }

  if (slug === "equivalence-relations") {
    return (
      <div className="flex h-full items-center justify-center gap-3">
        {[0, 1, 2].map((group) => (
          <div key={group} className="flex gap-1">
            <span className={`h-3 w-3 rounded-full ${fill}`} />
            <span className={`h-3 w-3 rounded-full border ${stroke} ${softFill}`} />
          </div>
        ))}
      </div>
    );
  }

  if (slug === "partial-orders") {
    return <MiniPosetVisual text={text} />;
  }

  if (slug === "inclusion-exclusion") {
    return <MiniInclusionExclusionVisual text={text} />;
  }

  if (slug === "pigeonhole-principle") {
    return (
      <div className="flex h-full items-center justify-center gap-2">
        {[0, 1, 2].map((box) => (
          <div key={box} className={`flex h-8 w-7 flex-col-reverse items-center gap-0.5 rounded border ${stroke} bg-white pb-1`}>
            {Array.from({ length: box === 1 ? 2 : 1 }).map((_, index) => (
              <span key={index} className={`h-1.5 w-1.5 rounded-full ${fill}`} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (slug === "recurrences") {
    return (
      <div className="flex h-full items-center justify-center gap-1.5">
        {[1, 2, 3, 5].map((value, index) => (
          <span key={index} className={`rounded border ${stroke} bg-white px-1.5 py-1 text-xs font-black ${text}`}>
            {value}
          </span>
        ))}
        <span className={`text-xs font-black ${text}`}>...</span>
      </div>
    );
  }

  return <MiniTreeVisual text={text} />;
}

function MiniGraphVisual({ text }: { text: string }) {
  return (
    <div className={`flex h-full items-center justify-center ${text}`}>
      <svg aria-hidden="true" viewBox="0 0 112 56" className="h-14 w-28">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5">
          <path d="M29 20 L55 12 L84 34" />
          <path d="M29 20 L42 39 L84 34" />
        </g>
        <g fill="currentColor">
          <circle cx="29" cy="20" r="5" />
          <circle cx="55" cy="12" r="5" />
          <circle cx="84" cy="34" r="5" />
          <circle cx="42" cy="39" r="5" />
        </g>
      </svg>
    </div>
  );
}

function MiniFunctionVisual({ text }: { text: string }) {
  return (
    <div className={`flex h-full items-center justify-center ${text}`}>
      <svg aria-hidden="true" viewBox="0 0 112 56" className="h-14 w-28">
        <defs>
          <marker id="function-arrow" markerHeight="5" markerWidth="5" orient="auto" refX="4.5" refY="2.5">
            <path d="M0 0 L5 2.5 L0 5 Z" fill="currentColor" />
          </marker>
        </defs>
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" markerEnd="url(#function-arrow)">
          <path d="M31 14 C48 14 57 20 73 20" />
          <path d="M31 28 C49 28 56 28 73 28" />
          <path d="M31 42 C48 42 57 36 73 36" />
        </g>
        <g fill="currentColor">
          <circle cx="25" cy="14" r="4.5" />
          <circle cx="25" cy="28" r="4.5" />
          <circle cx="25" cy="42" r="4.5" />
          <circle cx="82" cy="20" r="4.5" />
          <circle cx="82" cy="36" r="4.5" />
        </g>
      </svg>
    </div>
  );
}

function MiniRelationGridVisual({ text }: { text: string }) {
  const selected = new Set([0, 1, 3, 4, 8]);

  return (
    <div className={`flex h-full items-center justify-center ${text}`}>
      <svg aria-hidden="true" viewBox="0 0 112 56" className="h-14 w-28">
        <g fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.7">
          <path d="M34 12 H82" />
          <path d="M34 28 H82" />
          <path d="M34 44 H82" />
          <path d="M34 12 V44" />
          <path d="M50 12 V44" />
          <path d="M66 12 V44" />
          <path d="M82 12 V44" />
        </g>
        {Array.from({ length: 9 }).map((_, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          const cx = 42 + col * 16;
          const cy = 20 + row * 8;

          return (
            <rect
              key={index}
              x={cx - 4}
              y={cy - 4}
              width="8"
              height="8"
              rx="1.5"
              fill={selected.has(index) ? "currentColor" : "white"}
              stroke="currentColor"
              strokeWidth="1.4"
              opacity={selected.has(index) ? 1 : 0.55}
            />
          );
        })}
      </svg>
    </div>
  );
}

function MiniInductionVisual({ text }: { text: string }) {
  return (
    <div className={`flex h-full items-center justify-center ${text}`}>
      <svg aria-hidden="true" viewBox="0 0 112 56" className="h-14 w-28">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" opacity="0.75">
          <path d="M23 42 H90" />
          <path d="M34 34 H90" />
          <path d="M45 26 H90" />
        </g>
        <g fill="currentColor">
          <rect x="20" y="35" width="10" height="14" rx="2" transform="rotate(-18 25 42)" />
          <rect x="36" y="29" width="10" height="14" rx="2" transform="rotate(-18 41 36)" />
          <rect x="52" y="23" width="10" height="14" rx="2" transform="rotate(-18 57 30)" />
          <rect x="68" y="17" width="10" height="14" rx="2" transform="rotate(-18 73 24)" />
        </g>
      </svg>
    </div>
  );
}

function MiniProofVisual({ text }: { text: string }) {
  return (
    <div className={`flex h-full items-center justify-center ${text}`}>
      <svg aria-hidden="true" viewBox="0 0 112 56" className="h-14 w-28">
        <defs>
          <marker id="proof-arrow" markerHeight="5" markerWidth="5" orient="auto" refX="4.5" refY="2.5">
            <path d="M0 0 L5 2.5 L0 5 Z" fill="currentColor" />
          </marker>
        </defs>
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" markerEnd="url(#proof-arrow)">
          <path d="M30 28 H48" />
          <path d="M64 28 H82" />
        </g>
        <g fill="white" stroke="currentColor" strokeWidth="2">
          <rect x="15" y="19" width="18" height="18" rx="4" />
          <rect x="47" y="19" width="18" height="18" rx="4" />
          <rect x="79" y="19" width="18" height="18" rx="4" />
        </g>
        <g fill="currentColor" className="text-[10px] font-black">
          <text x="24" y="31" textAnchor="middle">
            P
          </text>
          <text x="56" y="31" textAnchor="middle">
            ...
          </text>
          <text x="88" y="31" textAnchor="middle">
            Q
          </text>
        </g>
      </svg>
    </div>
  );
}

function MiniInclusionExclusionVisual({ text }: { text: string }) {
  return (
    <div className={`flex h-full items-center justify-center ${text}`}>
      <svg aria-hidden="true" viewBox="0 0 112 56" className="h-14 w-28">
        <circle cx="47" cy="28" r="17" fill="currentColor" opacity="0.16" stroke="currentColor" strokeWidth="2" />
        <circle cx="65" cy="28" r="17" fill="currentColor" opacity="0.16" stroke="currentColor" strokeWidth="2" />
        <path
          d="M56 15 C62 18 65 23 65 28 C65 33 62 38 56 41 C50 38 47 33 47 28 C47 23 50 18 56 15 Z"
          fill="currentColor"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}

function MiniPosetVisual({ text }: { text: string }) {
  return (
    <div className={`flex h-full items-center justify-center ${text}`}>
      <svg aria-hidden="true" viewBox="0 0 112 56" className="h-14 w-28">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5">
          <path d="M36 39 L56 17 L76 39" />
          <path d="M45 39 H67" opacity="0.35" />
        </g>
        <g fill="currentColor">
          <circle cx="36" cy="39" r="5" />
          <circle cx="56" cy="17" r="5" />
          <circle cx="76" cy="39" r="5" />
        </g>
      </svg>
    </div>
  );
}

function MiniTreeVisual({ text }: { text: string }) {
  return (
    <div className={`flex h-full items-center justify-center ${text}`}>
      <svg aria-hidden="true" viewBox="0 0 112 56" className="h-14 w-28">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5">
          <path d="M56 11 L37 28 L24 43" />
          <path d="M56 11 L75 28 L88 43" />
        </g>
        <g fill="currentColor">
          <circle cx="56" cy="11" r="5" />
          <circle cx="37" cy="28" r="5" />
          <circle cx="75" cy="28" r="5" />
          <circle cx="24" cy="43" r="5" />
          <circle cx="88" cy="43" r="5" />
        </g>
      </svg>
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
