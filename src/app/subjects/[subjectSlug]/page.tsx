import Link from "next/link";
import { notFound } from "next/navigation";
import { roadmapSubjects, type ChapterStatus } from "@/lib/chapters";
import { getChapterVisualSpec, type ChapterVisualSpec } from "@/lib/chapterVisualSpecs";
import { getStudyLoadEstimate } from "@/lib/studyLoad";

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
  return "계획 중";
}

function levelStatus(level: Level) {
  if (level.chapters.some((chapter) => chapter.status === "ready")) return "ready";
  if (level.chapters.some((chapter) => chapter.status === "draft")) return "draft";
  return "planned";
}

function firstReadyChapter(subject: Subject) {
  return subject.levels.flatMap((level) => level.chapters).find((chapter) => chapter.status === "ready");
}

function firstReadyChapterByLevel(subject: Subject) {
  return subject.levels
    .map((level) => ({
      level,
      chapter: level.chapters.find((chapter) => chapter.status === "ready"),
    }))
    .filter((item): item is { level: Level; chapter: Chapter } => Boolean(item.chapter));
}

function chapterTitleBySlug(slug: string) {
  return roadmapSubjects
    .flatMap((subject) => subject.levels)
    .flatMap((level) => level.chapters)
    .find((chapter) => chapter.slug === slug)?.shortTitle;
}

function studyLoadLabel(chapter: Chapter) {
  return getStudyLoadEstimate(chapter).label;
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { subjectSlug } = await params;
  const subject = roadmapSubjects.find((item) => item.id === subjectSlug);

  if (!subject) {
    notFound();
  }

  const startChapter = firstReadyChapter(subject);
  const levelStartChapters = firstReadyChapterByLevel(subject);

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
              {subject.status === "active" ? "진행 중" : "계획 중"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{subject.description}</p>
        </div>

        {startChapter ? (
          <div className="rounded-lg border border-slate-200 bg-white p-3 sm:min-w-80">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-500">추천 시작점</p>
                <p className="text-base font-black text-slate-950">{startChapter.title}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">처음이면 Level 1부터, 익숙하면 Level별 시작점을 고르세요.</p>
              </div>
                <Link
                  href={`/chapters/${startChapter.slug}`}
                  className="inline-flex shrink-0 justify-center rounded-md bg-slate-950 px-3 py-2 text-sm font-black text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                >
                  시작
                </Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200 pt-3">
              {levelStartChapters.map(({ level, chapter }) => (
                <Link
                  key={level.level}
                  href={`/chapters/${chapter.slug}`}
                  className="rounded-md bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 hover:bg-teal-50 hover:text-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                >
                  Level {level.level}부터
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 sm:min-w-80">
            <div>
            <p className="text-xs font-bold text-amber-700">아직 공개 전</p>
            <p className="mt-1 text-sm font-bold leading-6 text-slate-800">
              이 과목은 계획 중입니다. 지금은 공개된 과목부터 학습할 수 있고, 아래 목록은 예정 범위입니다.
            </p>
            <Link
              href="/roadmap"
              className="mt-3 inline-flex rounded-md bg-slate-950 px-3 py-2 text-sm font-black text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            >
              공개 과목 보기
            </Link>
            </div>
          </div>
        )}
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
          <p className="mt-2 text-sm leading-6 text-slate-600">{level.description}</p>
        </div>
      </div>

      {status === "planned" ? (
        <details className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-3">
          <summary className="cursor-pointer text-sm font-black text-slate-700 marker:text-slate-400">
            계획 중인 챕터 {level.chapters.length}개 보기
          </summary>
          <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {level.chapters.map((chapter) => (
              <li key={chapter.slug}>
                <ChapterCard chapter={chapter} />
              </li>
            ))}
          </ol>
        </details>
      ) : (
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {level.chapters.map((chapter) => (
            <li key={chapter.slug}>
              <ChapterCard chapter={chapter} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function ChapterCard({ chapter }: { chapter: Chapter }) {
  const prerequisiteTitles = chapter.prerequisites?.map(chapterTitleBySlug).filter(Boolean).slice(0, 2) ?? [];
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
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded bg-slate-50 px-2 py-1 text-[11px] font-black text-slate-500">
            {studyLoadLabel(chapter)}
          </span>
          {prerequisiteTitles.length > 0 ? (
            <span className="rounded bg-teal-50 px-2 py-1 text-[11px] font-black text-teal-700">
              먼저: {prerequisiteTitles.join(", ")}
            </span>
          ) : (
            <span className="rounded bg-teal-50 px-2 py-1 text-[11px] font-black text-teal-700">
              선행 없음
            </span>
          )}
        </div>
      </div>
      <p className="text-xs font-bold text-slate-400">{chapter.csConnection}</p>
    </div>
  );

  if (chapter.status === "ready") {
    return (
      <Link
        href={`/chapters/${chapter.slug}`}
        className="block h-full rounded-md border border-slate-200 bg-white p-3 hover:border-teal-300 hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
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
  const visualSpec = getChapterVisualSpec(chapter.slug);

  return (
    <div
      className={`relative mb-3 h-14 overflow-hidden rounded-md border ${
        muted ? "border-slate-200 bg-slate-50" : "border-teal-100 bg-teal-50/50"
      }`}
      aria-hidden="true"
    >
      {visualSpec ? (
        <ChapterSpecVisual slug={chapter.slug} spec={visualSpec} stroke={stroke} fill={fill} softFill={softFill} text={text} />
      ) : (
        <div className="relative h-full overflow-hidden">
          {chapter.level === 1 && chapter.subjectId === "discrete-math" ? (
            <LevelOneVisual slug={chapter.slug} stroke={stroke} fill={fill} softFill={softFill} text={text} />
          ) : chapter.level === 2 && chapter.subjectId === "discrete-math" ? (
            <LevelTwoVisual slug={chapter.slug} stroke={stroke} fill={fill} softFill={softFill} text={text} />
          ) : chapter.subjectId === "linear-algebra" ? (
            <LinearAlgebraVisual slug={chapter.slug} level={chapter.level} stroke={stroke} fill={fill} softFill={softFill} text={text} />
          ) : chapter.subjectId === "calculus" ? (
            <CalculusVisual slug={chapter.slug} level={chapter.level} stroke={stroke} fill={fill} softFill={softFill} text={text} />
          ) : (
            <PlannedVisual chapter={chapter} fill={fill} text={text} />
          )}
        </div>
      )}
    </div>
  );
}

function ChapterSpecVisual({
  slug,
  spec,
  stroke,
  fill,
  softFill,
  text,
}: {
  slug: string;
  spec: ChapterVisualSpec;
  stroke: string;
  fill: string;
  softFill: string;
  text: string;
}) {
  return <SpecShape slug={slug} spec={spec} stroke={stroke} fill={fill} softFill={softFill} text={text} />;
}

function SpecShape({ slug, spec, stroke, fill, softFill, text }: { slug: string; spec: ChapterVisualSpec; stroke: string; fill: string; softFill: string; text: string }) {
  const variant = visualVariant(slug);

  return <ShapeOnlyStrip slug={slug} kind={spec.kind} variant={variant} stroke={stroke} fill={fill} softFill={softFill} text={text} />;
}

function visualVariant(slug: string) {
  return Array.from(slug).reduce((total, char) => total + char.charCodeAt(0), 0) % 6;
}

function ShapeOnlyStrip({
  slug,
  kind,
  variant,
  stroke,
  fill,
  softFill,
  text,
}: {
  slug: string;
  kind: ChapterVisualSpec["kind"];
  variant: number;
  stroke: string;
  fill: string;
  softFill: string;
  text: string;
}) {
  if (slug === "logic") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <rect x="31" y="13" width="48" height="32" rx="5" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M31 24 H79 M31 34 H79 M47 13 V45 M63 13 V45" stroke="currentColor" strokeWidth="1.5" opacity="0.58" />
          <circle cx="39" cy="19" r="2.6" fill="currentColor" />
          <circle cx="55" cy="29" r="2.6" fill="currentColor" opacity="0.55" />
          <circle cx="71" cy="39" r="3.2" fill="currentColor" />
          <path d="M86 21 H101 M86 35 H101 M101 21 C115 21 115 35 101 35" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
          <circle cx="86" cy="21" r="2.8" fill="white" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="86" cy="35" r="2.8" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (slug === "sets") {
    return (
      <div className={`relative h-full w-full ${text}`}>
        <span className={`absolute left-1/2 top-1/2 h-10 w-10 -translate-x-[72%] -translate-y-1/2 rounded-full border ${stroke} ${softFill}`} />
        <span className={`absolute left-1/2 top-1/2 h-10 w-10 -translate-x-[28%] -translate-y-1/2 rounded-full border ${stroke} ${softFill}`} />
        <span className="absolute left-1/2 top-1/2 h-6 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current opacity-15" />
      </div>
    );
  }

  if (slug === "vectors") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="vectors-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <path d="M25 43 H103 M32 46 V13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.3" />
          <path d="M32 43 L82 18" stroke="currentColor" strokeLinecap="round" strokeWidth="3" markerEnd="url(#vectors-arrow)" />
          <path d="M82 43 V18 M32 18 H82" stroke="currentColor" strokeDasharray="3 3" strokeLinecap="round" strokeWidth="1.45" opacity="0.48" />
          <path d="M44 37 C48 40 55 42 63 43" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" opacity="0.42" />
          <path d="M50 47 H82 M50 44 V50 M82 44 V50" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.48" />
          <path d="M86 18 V43 M83 18 H89 M83 43 H89" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.48" />
          <circle cx="32" cy="43" r="3.7" fill="currentColor" />
          <circle cx="82" cy="18" r="4.4" fill="currentColor" />
          <circle cx="82" cy="43" r="3.3" fill="white" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </div>
    );
  }

  if (slug === "vector-operations") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M31 40 L58 20 L88 20 L61 40 Z" fill="currentColor" opacity="0.1" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1.7" />
          <path d="M31 40 L58 20 M31 40 L61 40" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.45" />
          <path d="M31 40 L88 20" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
          <circle cx="31" cy="40" r="3.4" fill="currentColor" />
          <circle cx="58" cy="20" r="3.2" fill="white" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="61" cy="40" r="3.6" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="88" cy="20" r="4" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (slug === "conditionals") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <rect x="23" y="17" width="24" height="22" rx="5" fill="white" stroke="currentColor" strokeWidth="2" />
          <circle cx="31" cy="24" r="3" fill="currentColor" />
          <circle cx="39" cy="32" r="3" fill="white" stroke="currentColor" strokeWidth="1.4" />
          <path d="M49 28 H61" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" opacity="0.42" />
          <circle cx="55" cy="28" r="2.4" fill="currentColor" opacity="0.5" />
          <path d="M68 17 L82 28 L68 39 L54 28 Z" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M82 28 H91" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" opacity="0.42" />
          <circle cx="86.5" cy="28" r="2.4" fill="currentColor" opacity="0.5" />
          <rect x="95" y="13" width="23" height="30" rx="4" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <path d="M103 13 V43 M95 23 H118 M95 33 H118" stroke="currentColor" strokeWidth="1.15" opacity="0.42" />
          <circle cx="100" cy="18" r="2.2" fill="currentColor" />
          <circle cx="111" cy="18" r="2.2" fill="currentColor" opacity="0.5" />
          <circle cx="100" cy="28" r="2.2" fill="white" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="111" cy="28" r="2.2" fill="currentColor" />
          <circle cx="100" cy="38" r="2.2" fill="white" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="111" cy="38" r="2.2" fill="white" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      </div>
    );
  }

  if (slug === "predicate-logic") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <rect x="24" y="14" width="32" height="28" rx="6" fill="white" stroke="currentColor" strokeWidth="2" />
          {[32, 42, 32, 46].map((cx, index) => (
            <circle key={index} cx={cx} cy={[23, 22, 34, 34][index]} r={index === 1 ? 3.8 : 3} fill={index === 1  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.4" opacity={index === 1 ? 1 : 0.72} />
          ))}
          <path d="M62 17 C69 17 69 39 62 39 M62 17 H68 M62 39 H68" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.1" />
          <rect x="76" y="16" width="27" height="12" rx="3" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <rect x="76" y="32" width="27" height="12" rx="3" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <path d="M81 22 H96 M81 38 H92" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.58" />
          <path d="M105 21 L109 25 L117 15" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" opacity="0.7" />
          <path d="M106 34 L116 44 M116 34 L106 44" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.55" />
        </svg>
      </div>
    );
  }

  if (slug === "functions") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <rect x="24" y="13" width="22" height="30" rx="6" fill="white" stroke="currentColor" strokeWidth="2" />
          <rect x="82" y="13" width="22" height="30" rx="6" fill="white" stroke="currentColor" strokeWidth="2" />
          {[21, 28, 35].map((cy, index) => (
            <circle key={cy} cx="35" cy={cy} r={index === 1 ? 3.4 : 2.8} fill={index === 1 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.45" opacity={index === 1 ? 1 : 0.78} />
          ))}
          {[21, 28, 35].map((cy, index) => (
            <circle key={cy} cx="93" cy={cy} r={index === 2 ? 3.4 : 2.8} fill={index === 2  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.45" opacity={index === 2 ? 1 : 0.78} />
          ))}
          <path d="M46 21 C58 17 70 19 82 21 M46 28 C58 28 70 35 82 35 M46 35 C58 38 70 34 82 28" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.46" />
          <path d="M54 14 H72 M63 14 V42 M54 42 H72" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.34" />
          <circle cx="63" cy="28" r="4.4" fill="currentColor" opacity="0.9" />
        </svg>
      </div>
    );
  }

  if (slug === "relations") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <rect x="36" y="13" width="48" height="30" rx="5" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M48 13 V43 M60 13 V43 M72 13 V43 M36 23 H84 M36 33 H84" stroke="currentColor" strokeWidth="1.35" opacity="0.42" />
          {[42, 54, 66, 78, 42, 54, 66, 78, 42, 54, 66, 78].map((cx, index) => {
            const active = [1, 4, 6, 11].includes(index);
            return <rect key={index} x={cx - 3} y={[18, 18, 18, 18, 28, 28, 28, 28, 38, 38, 38, 38][index] - 3} width="6" height="6" rx="1.3" fill={active ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.1" opacity={active ? 1 : 0.58} />;
          })}
          <path d="M24 19 H31 M24 29 H31 M24 39 H31 M90 19 H105 M90 29 H100 M90 39 H108" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.45" />
        </svg>
      </div>
    );
  }

  if (slug === "induction") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M27 42 H101" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.28" />
          {[33, 52, 71, 90].map((x, index) => (
            <rect key={x} x={x - 6} y={34 - index * 5} width="12" height={8 + index * 5} rx="3" fill={index === 0 || index === 3  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.8" />
          ))}
          <path d="M39 38 H46 M58 33 H65 M77 28 H84" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.42" />
          {[46, 65, 84].map((cx, index) => (
            <circle key={cx} cx={cx} cy={[38, 33, 28][index]} r="2.25" fill="currentColor" opacity="0.54" />
          ))}
          <path d="M29 18 H43 M36 11 V25" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.42" />
          <path d="M86 16 H100 M93 9 V23" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.42" />
          <circle cx="33" cy="34" r="3.4" fill="white" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="90" cy="19" r="3.8" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (slug === "counting") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M41 28 L61 18 M41 28 L61 38 M67 18 L89 13 M67 18 L89 23 M67 38 L89 33 M67 38 L89 43" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.78" />
          <rect x="32" y="22" width="12" height="12" rx="3" fill="currentColor" stroke="currentColor" strokeWidth="2" />
          {[18, 38].map((cy) => (
            <rect key={cy} x="58" y={cy - 5} width="10" height="10" rx="2.5" fill="white" stroke="currentColor" strokeWidth="2" />
          ))}
          {[13, 23, 33, 43].map((cy, index) => (
            <rect key={cy} x="88" y={cy - 4.5} width="9" height="9" rx="2" fill={index === 2  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.8" />
          ))}
        </svg>
      </div>
    );
  }

  if (slug === "discrete-probability") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <rect x="25" y="14" width="44" height="30" rx="5" fill="white" stroke="currentColor" strokeWidth="2" />
          {[34, 47, 60, 34, 47, 60].map((cx, index) => {
            const selected = index === 1 || index === 4;
            return (
              <circle key={index} cx={cx} cy={index < 3 ? 23 : 35} r={selected ? 3.9 : 3.1} fill={selected  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.5" opacity={selected ? 1 : 0.7} />
            );
          })}
          <path d="M74 29 H84" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
          <path d="M80 24 L85 29 L80 34" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <rect x="91" y="18" width="18" height="22" rx="4" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M96 25 H104 M96 33 H104" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.55" />
          <rect x="94" y="21" width="12" height="6" rx="3" fill="currentColor" opacity="0.82" />
        </svg>
      </div>
    );
  }

  if (slug === "asymptotic-analysis") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M26 43 H104 M32 46 V14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          {[41, 56, 71, 86].map((cx, index) => {
            const height = [7, 14, 23, 32][index];
            return <rect key={cx} x={cx - 5} y={43 - height} width="10" height={height} rx="2" fill={index === 3  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.5" opacity={index === 3 ? 1 : 0.82} />;
          })}
          <path d="M38 48 H89 M38 45 V51 M89 45 V51" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.38" />
          <path d="M95 14 C105 19 109 28 107 39" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.58" />
          <path d="M102 39 H112 M107 34 V44" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.4" />
          <circle cx="86" cy="11" r="3.5" fill="currentColor" opacity="0.9" />
        </svg>
      </div>
    );
  }

  if (slug === "graphs") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M31 18 L55 13 L77 24 L67 42 L40 39 L31 18 M31 18 L67 42 M55 13 L40 39 M55 13 L77 24 M40 39 L77 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" opacity="0.72" />
          <path d="M31 18 L55 13 L77 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
          {[31, 55, 77, 67, 40].map((cx, index) => (
            <circle key={index} cx={cx} cy={[18, 13, 24, 42, 39][index]} r={index === 1 ? 5 : 4.2} fill={index === 1  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="2" />
          ))}
          <path d="M91 18 H112 M91 28 H112 M91 38 H112" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.34" />
          <circle cx="96" cy="18" r="2.8" fill="currentColor" opacity="0.9" />
          <circle cx="107" cy="28" r="2.8" fill="currentColor" opacity="0.45" />
          <circle cx="101" cy="38" r="2.8" fill="white" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </div>
    );
  }

  if (slug === "trees") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M64 10 L42 27 L31 43 M42 27 L55 43 M64 10 L86 27 L75 43 M86 27 L98 43" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.15" />
          <path d="M64 10 L42 27 L55 43" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" opacity="0.84" />
          {[64, 42, 86, 31, 55, 75, 98].map((cx, index) => (
            <circle key={index} cx={cx} cy={[10, 27, 27, 43, 43, 43, 43][index]} r={index === 0 ? 5 : 3.9} fill={index === 0 || index === 4  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.8" />
          ))}
          <path d="M104 18 H116 M110 12 V24" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.38" />
          <path d="M28 48 H58 M28 45 V51 M58 45 V51" stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" opacity="0.35" />
        </svg>
      </div>
    );
  }

  if (slug === "recursion-recurrences") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <rect x="25" y="13" width="28" height="12" rx="4" fill="currentColor" opacity="0.88" stroke="currentColor" strokeWidth="1.6" />
          <rect x="65" y="10" width="18" height="9" rx="3" fill="white" stroke="currentColor" strokeWidth="1.5" />
          <rect x="88" y="10" width="18" height="9" rx="3" fill="white" stroke="currentColor" strokeWidth="1.5" />
          <path d="M54 19 H62" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M62 19 C66 17 67 15 70 15" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.65" />
          <path d="M62 19 C67 20 69 17 72 15" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.48" />
          <path d="M83 15 H88" stroke="currentColor" strokeLinecap="round" strokeWidth="1.65" opacity="0.62" />
          <rect x="65" y="28" width="13" height="8" rx="2.5" fill="white" stroke="currentColor" strokeWidth="1.4" />
          <rect x="83" y="28" width="13" height="8" rx="2.5" fill="white" stroke="currentColor" strokeWidth="1.4" />
          <rect x="101" y="28" width="13" height="8" rx="2.5" fill="white" stroke="currentColor" strokeWidth="1.4" />
          <path d="M74 19 L71 28 M97 19 L90 28 M97 19 L107 28" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.54" />
          {[71, 90, 107].map((cx, index) => (
            <circle key={cx} cx={cx} cy="28" r={index === 2 ? 2.5 : 2.2} fill="currentColor" opacity="0.5" />
          ))}
          <path d="M27 39 H111" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" opacity="0.24" />
          {[31, 43, 55, 67, 79, 91].map((x, index) => (
            <rect key={x} x={x} y={43 - [16, 13, 10, 8, 6, 5][index]} width="8" height={[16, 13, 10, 8, 6, 5][index]} rx="1.5" fill={index === 0 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.25" opacity={index === 0 ? 0.9 : 0.75} />
          ))}
          <path d="M48 47 H94 M48 44 V50 M94 44 V50" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" opacity="0.34" />
        </svg>
      </div>
    );
  }

  if (slug === "shortest-paths") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="shortest-path-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <path d="M25 40 L75 37 L101 17 M50 19 L75 37" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" opacity="0.36" />
          <path d="M25 40 L50 19 L101 17" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" markerEnd="url(#shortest-path-arrow)" />
          <rect x="36" y="25" width="13" height="8" rx="3" fill="white" stroke="currentColor" strokeWidth="1.4" opacity="0.9" />
          <rect x="72" y="31" width="13" height="8" rx="3" fill="white" stroke="currentColor" strokeWidth="1.4" opacity="0.72" />
          {[25, 50, 75, 101].map((cx, index) => (
            <circle key={cx} cx={cx} cy={[40, 19, 37, 17][index]} r={index === 3 ? 5 : 4} fill={index === 3  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="2" />
          ))}
        </svg>
      </div>
    );
  }

  if (slug === "dot-product") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="dot-product-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <path d="M26 42 H78 M32 45 V16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          <path d="M33 42 L76 42" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.7" markerEnd="url(#dot-product-arrow)" />
          <path d="M33 42 L69 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.7" markerEnd="url(#dot-product-arrow)" />
          <path d="M46 38 C50 41 56 42 63 42" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.5" />
          <circle cx="33" cy="42" r="3.8" fill="currentColor" />
          <circle cx="69" cy="24" r="3.6" fill="white" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="76" cy="42" r="3.8" fill="currentColor" />
          <path d="M88 36 H116" stroke="currentColor" strokeLinecap="round" strokeWidth="5" opacity="0.13" />
          <path d="M88 36 H106" stroke="currentColor" strokeLinecap="round" strokeWidth="2.35" />
          <circle cx="106" cy="36" r="3.7" fill="currentColor" />
          <path d="M91 23 H111 M91 20 V26 M111 20 V26" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.42" />
          <circle cx="101" cy="23" r="3" fill="white" stroke="currentColor" strokeWidth="1.45" />
        </svg>
      </div>
    );
  }

  if (slug === "orthogonality-projection") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M28 43 H104" stroke="currentColor" strokeLinecap="round" strokeWidth="2.1" opacity="0.55" />
          <path d="M34 43 L79 19" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" opacity="0.7" />
          <path d="M34 43 L76 43" stroke="currentColor" strokeLinecap="round" strokeWidth="2.8" />
          <path d="M79 19 L76 43" stroke="currentColor" strokeDasharray="3 3" strokeLinecap="round" strokeWidth="2" opacity="0.65" />
          <path d="M70 43 V37 H77" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" opacity="0.78" />
          <circle cx="34" cy="43" r="3.6" fill="currentColor" />
          <circle cx="76" cy="43" r="4.4" fill="currentColor" />
          <circle cx="79" cy="19" r="3.8" fill="white" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </div>
    );
  }

  if (slug === "matrix-multiplication") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          {[23, 31, 39].map((x) =>
            [18, 26, 34].map((y, row) => (
              <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" rx="1.3" fill={row === 1  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.3" />
            )),
          )}
          {[60, 68, 76].map((x, column) =>
            [18, 26, 34].map((y) => (
              <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" rx="1.3" fill={column === 1  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.3" />
            )),
          )}
          <path d="M48 29 H56 M84 29 H93" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" opacity="0.38" />
          <circle cx="52" cy="29" r="2.5" fill="currentColor" opacity="0.52" />
          <circle cx="88.5" cy="29" r="2.5" fill="currentColor" opacity="0.52" />
          <rect x="96" y="17" width="22" height="22" rx="4" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M107 17 V39 M96 28 H118" stroke="currentColor" strokeWidth="1.4" opacity="0.45" />
          <rect x="97.5" y="18.5" width="8" height="8" rx="1.8" fill="currentColor" />
          <path d="M101 23 H104 M102.5 21.5 V24.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" opacity="0.62" />
          <path d="M29 44 H43 M64 44 H78 M36 41 V47 M71 41 V47" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.4" />
        </svg>
      </div>
    );
  }

  if (slug === "eigen-diagonalization") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="eigen-diagonalization-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <rect x="22" y="17" width="22" height="22" rx="4" fill="white" stroke="currentColor" strokeWidth="1.9" />
          <path d="M28 24 H38 M28 32 H38 M33 17 V39" stroke="currentColor" strokeWidth="1.25" opacity="0.45" />
          <path d="M47 28 H58" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" markerEnd="url(#eigen-diagonalization-arrow)" />
          <rect x="64" y="11" width="30" height="34" rx="4" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M74 11 V45 M84 11 V45 M64 22 H94 M64 34 H94" stroke="currentColor" strokeWidth="1.25" opacity="0.3" />
          <rect x="68" y="15" width="7" height="7" rx="1.4" fill="currentColor" />
          <rect x="80.5" y="27" width="7" height="7" rx="1.4" fill="currentColor" opacity="0.82" />
          <rect x="90" y="38" width="2" height="2" rx="0.6" fill="currentColor" opacity="0.22" />
          <path d="M99 28 H110" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" markerEnd="url(#eigen-diagonalization-arrow)" />
          <path d="M113 18 L119 23 L113 28 M119 23 H105 M113 38 H121" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" opacity="0.5" />
          <circle cx="68" cy="15" r="2.2" fill="white" opacity="0.82" />
        </svg>
      </div>
    );
  }

  if (slug === "svd-intuition") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <rect x="19" y="15" width="20" height="26" rx="4" fill="white" stroke="currentColor" strokeWidth="1.9" />
          <path d="M25 21 H34 M25 28 H34 M25 35 H31" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" opacity="0.55" />
          <path d="M43 28 H51 M75 28 H83 M105 28 H112" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.36" />
          {[47, 79, 108.5].map((cx) => (
            <circle key={cx} cx={cx} cy="28" r="2.25" fill="currentColor" opacity="0.5" />
          ))}
          <path d="M56 42 H71 V15 M56 42 L71 28" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.95" />
          <circle cx="61" cy="34" r="2.9" fill="currentColor" opacity="0.82" />
          <circle cx="68" cy="24" r="2.6" fill="white" stroke="currentColor" strokeWidth="1.3" />
          <rect x="87" y="14" width="15" height="28" rx="3" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <path d="M92 19 V37 M98 24 V33" stroke="currentColor" strokeLinecap="round" strokeWidth="2.15" />
          <path d="M116 15 H123 V41 H116 Z M116 15 L123 22 M116 28 L123 35" fill="white" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" transform="rotate(-12 119.5 28)" />
          <path d="M53 46 H122" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" opacity="0.24" />
          <circle cx="94" cy="20" r="2.8" fill="currentColor" />
          <circle cx="29" cy="28" r="2.6" fill="currentColor" opacity="0.72" />
        </svg>
      </div>
    );
  }

  if (slug === "matrices") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M37 12 C29 12 29 44 37 44 M91 12 C99 12 99 44 91 44" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.25" />
          {[47, 59, 71, 83].map((x, column) =>
            [18, 28, 38].map((y, row) => {
              const highlighted = row === 1 || column === 2;
              return <rect key={`${column}-${row}`} x={x - 4} y={y - 4} width="8" height="8" rx="1.5" fill={highlighted ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.35" opacity={highlighted ? (row === 1 && column === 2 ? 1 : 0.72) : 0.56} />;
            }),
          )}
          <path d="M43 28 H87 M71 14 V42" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          <path d="M31 47 H97 M31 44 V50 M97 44 V50" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" opacity="0.28" />
        </svg>
      </div>
    );
  }

  if (slug === "matrix-factorization-numerical-stability") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <rect x="22" y="15" width="24" height="27" rx="4" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M30 15 V42 M38 15 V42 M22 24 H46 M22 33 H46" stroke="currentColor" strokeWidth="1.2" opacity="0.42" />
          <path d="M28 39 L43 19" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.62" />
          <path d="M50 28 H60" stroke="currentColor" strokeLinecap="round" strokeWidth="1.65" opacity="0.36" />
          <circle cx="55" cy="28" r="2.5" fill="currentColor" opacity="0.52" />
          <path d="M67 42 H82 V16 M67 42 L82 27" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M88 16 H105 V42 H88 Z M88 16 H105 M88 25 H105 M88 34 H105" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" opacity="0.76" />
          <circle cx="34" cy="29" r="3.6" fill="currentColor" />
          <circle cx="97" cy="25" r="3.4" fill="currentColor" />
          <path d="M65 48 H108" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.28" />
          <path d="M70 48 L78 43 L89 46 L101 38" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" opacity="0.68" />
          <path d="M111 18 L116 23 L124 13" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" opacity="0.62" />
          <path d="M111 37 H121" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.4" />
        </svg>
      </div>
    );
  }

  if (slug === "graphics-pipeline-intro") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="graphics-pipeline-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <path d="M24 39 L40 17 L58 37 Z" fill="white" stroke="currentColor" strokeWidth="2.1" />
          <path d="M33 34 L40 17 L47 35" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.45" />
          <path d="M61 28 H70" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" markerEnd="url(#graphics-pipeline-arrow)" />
          <rect x="75" y="15" width="16" height="26" rx="3" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M79 20 H87 M79 28 H87 M79 36 H87" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.58" />
          <path d="M93 28 H101" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" markerEnd="url(#graphics-pipeline-arrow)" />
          <rect x="105" y="16" width="17" height="24" rx="2" fill="white" stroke="currentColor" strokeWidth="2" />
          {[110, 115, 120, 110, 115, 120, 110, 115, 120].map((cx, index) => (
            <rect
              key={index}
              x={cx - 1.4}
              y={[21, 21, 21, 28, 28, 28, 35, 35, 35][index] - 1.4}
              width="2.8"
              height="2.8"
              rx="0.6"
              fill={[1, 3, 4, 5, 7].includes(index) ? "currentColor" : "white"}
              stroke="currentColor"
              strokeWidth="0.55"
              opacity={[1, 4, 7].includes(index) ? 1 : 0.55}
            />
          ))}
          <path d="M28 45 H58 M28 42 V48 M58 42 V48" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.36" />
        </svg>
      </div>
    );
  }

  if (slug === "coordinate-systems-transform-matrices") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M22 43 V18 M22 43 H50" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          <path d="M22 43 L39 28 M22 43 L46 36" stroke="currentColor" strokeLinecap="round" strokeWidth="2.05" />
          <path d="M39 28 V43 M39 28 H22" stroke="currentColor" strokeDasharray="3 3" strokeLinecap="round" strokeWidth="1.25" opacity="0.38" />
          <circle cx="39" cy="28" r="3.4" fill="currentColor" />
          <rect x="56" y="16" width="18" height="24" rx="4" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <path d="M62 16 V40 M68 16 V40 M56 24 H74 M56 32 H74" stroke="currentColor" strokeWidth="1.05" opacity="0.36" />
          <rect x="59" y="19" width="4.8" height="4.8" rx="1" fill="currentColor" />
          <rect x="67" y="30" width="4.8" height="4.8" rx="1" fill="currentColor" opacity="0.34" />
          <path d="M48 29 H56 M74 29 H82" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.34" />
          <circle cx="52" cy="29" r="2.3" fill="currentColor" opacity="0.5" />
          <circle cx="78" cy="29" r="2.3" fill="currentColor" opacity="0.5" />
          <path d="M86 43 V17 M86 43 H116" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          <path d="M86 43 L107 26 M86 43 L113 34" stroke="currentColor" strokeLinecap="round" strokeWidth="2.05" />
          <path d="M103 26 V43 M103 26 H86" stroke="currentColor" strokeDasharray="3 3" strokeLinecap="round" strokeWidth="1.25" opacity="0.38" />
          <path d="M92 37 C99 33 104 29 110 23" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.34" />
          <circle cx="103" cy="26" r="3.4" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (slug === "affine-transformations-homogeneous-coordinates") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="affine-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <path d="M22 42 H45 V19 H22 Z" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M27 37 L39 25 M27 25 H39 M27 37 H39" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.48" />
          <path d="M48 29 H59" stroke="currentColor" strokeLinecap="round" strokeWidth="2" markerEnd="url(#affine-arrow)" />
          <rect x="66" y="11" width="30" height="34" rx="4" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M76 11 V45 M86 11 V45 M66 22 H96 M66 33 H96" stroke="currentColor" strokeWidth="1.25" opacity="0.4" />
          <rect x="69" y="14" width="6" height="6" rx="1.3" fill="currentColor" />
          <rect x="81" y="25" width="6" height="6" rx="1.3" fill="currentColor" opacity="0.26" />
          <rect x="90" y="37" width="4" height="4" rx="1" fill="currentColor" opacity="0.58" />
          <path d="M99 29 H109" stroke="currentColor" strokeLinecap="round" strokeWidth="2" markerEnd="url(#affine-arrow)" />
          <path d="M113 42 V20 M113 42 H122" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.32" />
          <path d="M113 42 L119 24" stroke="currentColor" strokeLinecap="round" strokeWidth="2.05" markerEnd="url(#affine-arrow)" />
          <circle cx="119" cy="24" r="3.5" fill="currentColor" />
          <path d="M109 16 H121 M115 10 V22" stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" opacity="0.42" />
        </svg>
      </div>
    );
  }

  if (slug === "rotations-2d-3d") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="rotation-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <path d="M24 43 H68 M34 46 V14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.24" />
          <path d="M35 28 H51 V44 H35 Z" fill="white" stroke="currentColor" strokeWidth="1.7" opacity="0.46" />
          <path d="M37 24 L54 29 L49 45 L32 40 Z" fill="currentColor" opacity="0.18" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.9" />
          <path d="M45 43 C38 37 37 28 43 21 C48 16 55 15 61 19" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" markerEnd="url(#rotation-arrow)" />
          <circle cx="34" cy="43" r="3.4" fill="currentColor" />
          <circle cx="51" cy="44" r="2.7" fill="white" stroke="currentColor" strokeWidth="1.4" opacity="0.76" />
          <path d="M83 43 V15 M72 33 H105" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.28" />
          <ellipse cx="91" cy="31" rx="19" ry="8" fill="none" stroke="currentColor" strokeWidth="1.75" opacity="0.48" />
          <path d="M91 31 L91 16" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" markerEnd="url(#rotation-arrow)" />
          <path d="M78 34 L92 26 L105 32 L91 40 Z" fill="white" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.75" opacity="0.88" />
          <path d="M98 20 C105 23 109 29 108 36" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" markerEnd="url(#rotation-arrow)" />
          <circle cx="91" cy="31" r="3.2" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (slug === "gradient-jacobian-intro") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="jacobian-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <path d="M24 41 H57 M31 44 V15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.26" />
          <path d="M33 34 L45 28 M33 34 L49 39" stroke="currentColor" strokeLinecap="round" strokeWidth="2.05" markerEnd="url(#jacobian-arrow)" />
          <circle cx="33" cy="34" r="3.8" fill="currentColor" />
          <path d="M50 28 H61" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" markerEnd="url(#jacobian-arrow)" />
          <rect x="65" y="14" width="25" height="28" rx="5" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M73 14 V42 M65 23 H90 M65 33 H90" stroke="currentColor" strokeWidth="1.25" opacity="0.4" />
          {[70, 82, 70, 82].map((cx, index) => (
            <rect key={index} x={cx - 3} y={[18, 18, 29, 29][index]} width="6" height="6" rx="1.3" fill={index === 0 || index === 3 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.1" opacity={index === 0 || index === 3 ? 1 : 0.65} />
          ))}
          <path d="M93 28 H104" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" markerEnd="url(#jacobian-arrow)" />
          <path d="M108 20 L118 16 M108 36 L119 42" stroke="currentColor" strokeLinecap="round" strokeWidth="2.05" markerEnd="url(#jacobian-arrow)" />
          <circle cx="108" cy="20" r="3.3" fill="white" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="108" cy="36" r="3.3" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (slug === "neural-network-linear-layers") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M35 19 L62 15 M35 19 L62 24 M35 19 L62 33 M35 19 L62 42 M35 28 L62 15 M35 28 L62 24 M35 28 L62 33 M35 28 L62 42 M35 37 L62 15 M35 37 L62 24 M35 37 L62 33 M35 37 L62 42" stroke="currentColor" strokeLinecap="round" strokeWidth="1.05" opacity="0.3" />
          <path d="M66 15 L94 23 M66 24 L94 23 M66 33 L94 23 M66 42 L94 23 M66 15 L94 34 M66 24 L94 34 M66 33 L94 34 M66 42 L94 34" stroke="currentColor" strokeLinecap="round" strokeWidth="1.05" opacity="0.28" />
          <path d="M54 12 C60 16 60 40 54 44 M74 12 C68 16 68 40 74 44" fill="currentColor" opacity="0.08" />
          {[20, 28, 36].map((cy, index) => (
            <circle key={cy} cx="32" cy={cy} r={index === 1 ? 4 : 3.2} fill={index === 1 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.55" opacity={index === 1 ? 1 : 0.82} />
          ))}
          {[15, 24, 33, 42].map((cy, index) => (
            <circle key={cy} cx="64" cy={cy} r={index === 2 ? 4 : 3.2} fill={index === 2 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.55" opacity={index === 2 ? 1 : 0.82} />
          ))}
          {[23, 34].map((cy, index) => (
            <circle key={cy} cx="97" cy={cy} r={index === 1 ? 4 : 3.3} fill={index === 1 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.55" opacity={index === 1 ? 1 : 0.82} />
          ))}
          <circle cx="84" cy="13" r="5" fill="white" stroke="currentColor" strokeWidth="1.5" />
          <path d="M81 13 H87 M84 10 V16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" opacity="0.58" />
          <circle cx="107" cy="29" r="3" fill="currentColor" opacity="0.86" />
        </svg>
      </div>
    );
  }

  if (slug === "inverse-matrices") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M23 42 H47 M29 45 V18 M82 42 H106 M88 45 V18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.25" />
          <path d="M29 42 L44 28 M88 42 L103 28" stroke="currentColor" strokeLinecap="round" strokeWidth="2.25" />
          <path d="M55 42 H76 M61 45 V18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.18" />
          <path d="M61 42 L74 22 M61 42 L77 36" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.5" />
          <rect x="47" y="17" width="14" height="21" rx="3.5" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <rect x="67" y="17" width="14" height="21" rx="3.5" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <path d="M51 24 H57 M51 31 H57 M71 24 H77 M71 31 H77" stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" opacity="0.52" />
          <path d="M45 29 H47 M62 29 H67 M81 29 H86" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.36" />
          <path d="M57 43 C65 50 77 47 84 39" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.44" />
          <circle cx="44" cy="28" r="3.5" fill="currentColor" />
          <circle cx="74" cy="22" r="3.2" fill="white" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="103" cy="28" r="3.5" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (slug === "eigenvectors-intro") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M23 44 H110 M30 46 V15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.24" />
          <path d="M26 41 L105 17" stroke="currentColor" strokeDasharray="4 4" strokeLinecap="round" strokeWidth="1.75" opacity="0.5" />
          <path d="M39 37 L65 29" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.25" opacity="0.5" />
          <path d="M39 37 L98 19" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
          <path d="M67 29 H78" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" opacity="0.36" />
          <circle cx="78" cy="29" r="2.3" fill="currentColor" opacity="0.42" />
          <rect x="80" y="23" width="15" height="11" rx="3" fill="white" stroke="currentColor" strokeWidth="1.6" />
          <path d="M84 29 H91" stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" opacity="0.58" />
          <path d="M75 43 H103 M75 40 V46 M103 40 V46" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.42" />
          <circle cx="39" cy="37" r="3.7" fill="currentColor" />
          <circle cx="65" cy="29" r="3.7" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="98" cy="19" r="4.3" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (slug === "basis-dimension") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M25 43 H105 M33 46 V14" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.24" />
          <path d="M33 43 L55 26 M33 43 L72 43" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.55" />
          <path d="M55 26 L94 26 M72 43 L94 26 M72 43 L111 43 M55 26 L94 43" stroke="currentColor" strokeDasharray="3 3" strokeLinecap="round" strokeWidth="1.25" opacity="0.34" />
          <path d="M47 32 L86 32 M60 37 L99 37 M46 43 L68 26 M59 43 L81 26 M72 43 L94 26" stroke="currentColor" strokeLinecap="round" strokeWidth="1.15" opacity="0.18" />
          <circle cx="33" cy="43" r="3.7" fill="currentColor" />
          <circle cx="55" cy="26" r="3.2" fill="white" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="72" cy="43" r="3.2" fill="white" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="94" cy="26" r="4.4" fill="currentColor" />
          <path d="M88 18 H102 M95 11 V25" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.42" />
          <path d="M88 50 H102 M88 47 V53 M102 47 V53" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" opacity="0.34" />
        </svg>
      </div>
    );
  }

  if (slug === "linear-combination-span") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="linear-combination-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <path d="M28 44 H107 M35 46 V14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.28" />
          <path d="M32 43 L58 20 L101 22 L76 45 Z" fill="currentColor" opacity="0.14" stroke="currentColor" strokeWidth="1.8" />
          <path d="M43 43 L69 20 M55 44 L81 21 M67 44 L93 22 M36 39 H82 M48 31 H94" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" opacity="0.34" />
          <path d="M35 43 L58 20" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.45" markerEnd="url(#linear-combination-arrow)" />
          <path d="M35 43 L76 45" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.45" markerEnd="url(#linear-combination-arrow)" />
          {[
            [56, 34],
            [68, 29],
            [82, 34],
            [72, 40],
          ].map(([cx, cy], index) => (
            <circle key={index} cx={cx} cy={cy} r={index === 1 ? 4 : 3.1} fill={index === 1  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.5" opacity={index === 1 ? 1 : 0.78} />
          ))}
          <path d="M91 14 H105 M98 7 V21" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.38" />
        </svg>
      </div>
    );
  }

  if (slug === "linear-independence") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="linear-independence-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <path d="M25 43 H61 M31 45 V16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.28" />
          <path d="M31 43 L47 22" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" markerEnd="url(#linear-independence-arrow)" />
          <path d="M31 43 L57 40" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" markerEnd="url(#linear-independence-arrow)" />
          <path d="M47 22 L57 40" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.45" />
          <path d="M72 43 H108 M78 45 V16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.28" />
          <path d="M78 43 L103 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.6" markerEnd="url(#linear-independence-arrow)" />
          <path d="M78 43 L95 30" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" opacity="0.45" markerEnd="url(#linear-independence-arrow)" />
          <path d="M91 33 H104" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.5" />
          <circle cx="31" cy="43" r="3.7" fill="currentColor" />
          <circle cx="78" cy="43" r="3.7" fill="white" stroke="currentColor" strokeWidth="1.7" />
          <path d="M58 19 L64 25 L73 13" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" opacity="0.7" />
          <path d="M106 16 L116 26 M116 16 L106 26" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.58" />
        </svg>
      </div>
    );
  }

  if (slug === "subspaces") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="subspace-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <ellipse cx="65" cy="31" rx="40" ry="15" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" />
          <path d="M36 31 H94 M65 18 V44" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" opacity="0.28" />
          <path d="M47 35 L61 25" stroke="currentColor" strokeLinecap="round" strokeWidth="2.3" markerEnd="url(#subspace-arrow)" />
          <path d="M61 25 L82 32" stroke="currentColor" strokeLinecap="round" strokeWidth="2.3" markerEnd="url(#subspace-arrow)" />
          <path d="M48 39 C58 46 77 45 87 37" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" opacity="0.5" markerEnd="url(#subspace-arrow)" />
          <circle cx="47" cy="35" r="3.8" fill="currentColor" />
          <circle cx="61" cy="25" r="3.4" fill="white" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="82" cy="32" r="3.7" fill="white" stroke="currentColor" strokeWidth="1.7" />
          <path d="M91 19 L96 24 L105 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" opacity="0.62" />
        </svg>
      </div>
    );
  }

  if (slug === "rank-column-space") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="rank-column-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          {[27, 39, 51].map((x, column) =>
            [15, 23, 31, 39].map((y, row) => (
              <rect key={`${column}-${row}`} x={x} y={y} width="7" height="6" rx="1.4" fill={column < 2  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.35" opacity={column === 2 ? 0.28 : 1} />
            )),
          )}
          <path d="M66 29 H78" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" markerEnd="url(#rank-column-arrow)" />
          <path d="M84 43 L108 30 L115 36 L91 49 Z" fill="currentColor" opacity="0.14" stroke="currentColor" strokeWidth="1.8" />
          <path d="M92 44 L103 34 M92 44 L112 38" stroke="currentColor" strokeLinecap="round" strokeWidth="2.1" markerEnd="url(#rank-column-arrow)" />
          <circle cx="92" cy="44" r="3.7" fill="currentColor" />
          <circle cx="103" cy="34" r="3" fill="white" stroke="currentColor" strokeWidth="1.45" />
          <circle cx="112" cy="38" r="3" fill="white" stroke="currentColor" strokeWidth="1.45" />
        </svg>
      </div>
    );
  }

  if (slug === "linear-systems") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="linear-systems-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <rect x="23" y="16" width="24" height="24" rx="4" fill="white" stroke="currentColor" strokeWidth="1.9" />
          <path d="M31 16 V40 M39 16 V40 M23 24 H47 M23 32 H47" stroke="currentColor" strokeWidth="1.15" opacity="0.42" />
          <rect x="25.5" y="18.5" width="5.8" height="5.8" rx="1.2" fill="currentColor" />
          <rect x="40" y="33.5" width="5" height="5" rx="1.1" fill="currentColor" opacity="0.22" stroke="currentColor" strokeWidth="1" />
          <path d="M51 28 H64" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" markerEnd="url(#linear-systems-arrow)" />
          <path d="M71 43 H116 M77 46 V13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.26" />
          <path d="M73 38 L113 17" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.35" />
          <path d="M73 18 L114 40" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.35" opacity="0.74" />
          <circle cx="94" cy="27" r="5.2" fill="currentColor" />
          <circle cx="94" cy="27" r="9" fill="none" stroke="currentColor" strokeWidth="1.35" opacity="0.28" />
          <path d="M88 49 H100 M94 42 V52" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.44" />
          <path d="M106 14 L111 19 L119 10" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" opacity="0.54" />
        </svg>
      </div>
    );
  }

  if (slug === "linear-transformations") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="linear-transform-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <path d="M28 17 H56 M28 29 H56 M28 41 H56 M28 17 V41 M42 17 V41 M56 17 V41" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.45" />
          <path d="M72 19 L101 14 M75 31 L104 25 M78 43 L107 36 M72 19 L78 43 M86 17 L92 40 M101 14 L107 36" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" opacity="0.75" />
          <path d="M57 30 H70" stroke="currentColor" strokeLinecap="round" strokeWidth="2" markerEnd="url(#linear-transform-arrow)" />
          <path d="M76 31 L92 28 L104 25" stroke="currentColor" strokeLinecap="round" strokeWidth="2.6" />
          <circle cx="92" cy="28" r="4" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (slug === "determinants") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="determinant-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <path d="M24 42 H56 M30 45 V16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          <path d="M31 40 L49 40 L49 22 L31 22 Z" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M31 40 L49 40 L49 22 L31 22 Z" fill="currentColor" opacity="0.12" />
          <path d="M31 40 L49 40 M31 40 L31 22" stroke="currentColor" strokeLinecap="round" strokeWidth="2.1" markerEnd="url(#determinant-arrow)" />
          <path d="M59 31 H71" stroke="currentColor" strokeLinecap="round" strokeWidth="2" markerEnd="url(#determinant-arrow)" />
          <path d="M78 43 H114 M84 45 V14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          <path d="M86 40 L113 40 L103 17 L76 17 Z" fill="currentColor" opacity="0.22" stroke="currentColor" strokeWidth="2" />
          <path d="M86 40 L113 40 M86 40 L76 17" stroke="currentColor" strokeLinecap="round" strokeWidth="2.1" markerEnd="url(#determinant-arrow)" />
          <path d="M87 47 H112 M87 44 V50 M112 44 V50" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.52" />
          <path d="M113 37 V22 M110 37 H116 M110 22 H116" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.48" />
          <circle cx="101" cy="29" r="3.5" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (slug === "least-squares") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M25 41 L104 17" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" opacity="0.65" />
          {[38, 52, 66, 80, 94].map((cx, index) => {
            const actualY = [34, 22, 30, 20, 25][index];
            const fitY = [37, 33, 29, 25, 21][index];

            return (
              <g key={cx}>
                <path d={`M${cx} ${actualY} V${fitY}`} stroke="currentColor" strokeDasharray="3 3" strokeLinecap="round" strokeWidth="1.8" opacity="0.55" />
                <circle cx={cx} cy={actualY} r="3.5" fill={index === 2  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.8" />
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  if (slug === "pca-dimensionality-reduction") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="pca-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <ellipse cx="52" cy="29" rx="31" ry="10" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="1.7" transform="rotate(-22 52 29)" />
          <path d="M26 39 L82 17" stroke="currentColor" strokeLinecap="round" strokeWidth="2.25" markerEnd="url(#pca-arrow)" />
          {[34, 43, 52, 61, 70].map((cx, index) => {
            const cy = [36, 29, 32, 23, 20][index];
            const projX = [37, 46, 54, 64, 73][index];
            const projY = [35, 31, 28, 24, 21][index];
            return (
              <g key={cx}>
                <path d={`M${cx} ${cy} L${projX} ${projY}`} stroke="currentColor" strokeDasharray="2 3" strokeLinecap="round" strokeWidth="1.25" opacity="0.42" />
                <circle cx={cx} cy={cy} r={index === 2 ? 3.6 : 2.8} fill={index === 2 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.35" />
                <circle cx={projX} cy={projY} r="2" fill="currentColor" opacity="0.7" />
              </g>
            );
          })}
          <path d="M91 29 H104" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" markerEnd="url(#pca-arrow)" />
          <path d="M108 40 H122 M108 43 V37 M122 43 V37" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.55" />
          {[111, 116, 121].map((cx, index) => (
            <circle key={cx} cx={cx} cy="40" r={index === 1 ? 3 : 2.4} fill={index === 1 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.25" />
          ))}
        </svg>
      </div>
    );
  }

  if (slug === "rate-of-change") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="rate-delta-arrow" markerWidth="4.8" markerHeight="4.8" refX="4.3" refY="2.4" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L4.8 2.4 L0 4.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.05" />
            </marker>
          </defs>
          <path d="M25 42 H63 M31 45 V16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.3" />
          <rect x="36" y="29" width="10" height="13" rx="2.5" fill="white" stroke="currentColor" strokeWidth="1.7" />
          <rect x="52" y="19" width="10" height="23" rx="2.5" fill="currentColor" opacity="0.9" stroke="currentColor" strokeWidth="1.7" />
          <path d="M46 35 H52" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" markerEnd="url(#rate-delta-arrow)" />
          <path d="M41 47 H57 M41 43 V49 M57 43 V49" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.48" />
          <path d="M73 42 H110 M79 45 V16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.28" />
          <path d="M82 36 L104 21" stroke="currentColor" strokeLinecap="round" strokeWidth="2.45" />
          <path d="M82 36 H104 M104 36 V21" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" opacity="0.5" markerEnd="url(#rate-delta-arrow)" />
          <circle cx="82" cy="36" r="3.6" fill="white" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="104" cy="21" r="3.6" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (slug === "calculus-functions-graphs") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="function-graph-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.1" />
            </marker>
          </defs>
          <path d="M28 42 H108 M34 45 V14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.3" />
          <path d="M39 37 C49 22 58 18 67 27 C76 36 88 33 101 18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.35" />
          <path d="M63 42 V28 M34 28 H63" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.48" />
          <circle cx="63" cy="28" r="4.3" fill="currentColor" />
          <circle cx="63" cy="42" r="3.1" fill="white" stroke="currentColor" strokeWidth="1.4" />
          <rect x="19" y="22" width="18" height="12" rx="3" fill="white" stroke="currentColor" strokeWidth="1.6" />
          <path d="M24 28 H33 M37 28 H46" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" markerEnd="url(#function-graph-arrow)" />
        </svg>
      </div>
    );
  }

  if (slug === "limits") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="limits-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <path d="M25 42 H104 M32 45 V15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.26" />
          <path d="M31 36 C42 25 52 22 62 28" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.3" markerEnd="url(#limits-arrow)" />
          <path d="M97 20 C84 17 75 21 66 28" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.3" markerEnd="url(#limits-arrow)" />
          <circle cx="64" cy="28" r="5.1" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M64 42 V28 M32 28 H64" stroke="currentColor" strokeDasharray="3 3" strokeLinecap="round" strokeWidth="1.5" opacity="0.45" />
          <circle cx="64" cy="28" r="2.1" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (slug === "continuity") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M26 42 H104 M33 45 V15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.26" />
          <path d="M32 35 C44 23 54 22 64 28 C75 35 88 33 99 21" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.55" />
          <path d="M64 42 V28 M33 28 H64" stroke="currentColor" strokeDasharray="3 3" strokeLinecap="round" strokeWidth="1.35" opacity="0.42" />
          <circle cx="64" cy="28" r="5.2" fill="currentColor" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="51" cy="25" r="3.2" fill="white" stroke="currentColor" strokeWidth="1.5" opacity="0.82" />
          <circle cx="78" cy="33" r="3.2" fill="white" stroke="currentColor" strokeWidth="1.5" opacity="0.82" />
          <path d="M47 47 H81 M47 44 V50 M81 44 V50" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.4" />
          <path d="M91 12 L96 17 L105 8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" opacity="0.6" />
        </svg>
      </div>
    );
  }

  if (slug === "meaning-of-derivative") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M24 42 H72 M31 45 V16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.26" />
          <path d="M29 38 C42 32 53 24 68 22" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.46" />
          <circle cx="58" cy="26" r="10" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="1.8" />
          <path d="M43 31 L72 21" stroke="currentColor" strokeLinecap="round" strokeWidth="2.7" />
          <circle cx="58" cy="26" r="4.3" fill="currentColor" />
          <path d="M78 29 H89" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" opacity="0.55" />
          <circle cx="102" cy="29" r="15" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M91 35 C98 28 105 25 113 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.65" opacity="0.5" />
          <path d="M93 33 L112 25" stroke="currentColor" strokeLinecap="round" strokeWidth="2.35" />
          <circle cx="102" cy="29" r="3.7" fill="currentColor" />
          <path d="M93 44 H111 M93 41 V47 M111 41 V47" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.42" />
        </svg>
      </div>
    );
  }

  if (slug === "derivative-graph-reading") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M25 27 H103 M31 29 V9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.24" />
          <path d="M33 25 C45 10 59 10 70 25 C78 36 91 36 101 25" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.25" />
          <path d="M65 10 V45" stroke="currentColor" strokeDasharray="3 3" strokeLinecap="round" strokeWidth="1.4" opacity="0.42" />
          <path d="M42 20 L55 15 M78 31 L91 35" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.58" />
          <circle cx="65" cy="22" r="4.2" fill="currentColor" />
          <path d="M26 44 H104 M31 47 V34" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.24" />
          <path d="M34 38 C45 34 55 34 65 40 C77 46 89 47 101 43" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.15" />
          <circle cx="47" cy="36" r="3.3" fill="currentColor" />
          <circle cx="82" cy="45" r="3.1" fill="white" stroke="currentColor" strokeWidth="1.5" />
          <path d="M47 49 H82 M47 46 V52 M82 46 V52" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" opacity="0.36" />
        </svg>
      </div>
    );
  }

  if (slug === "basic-derivative-rules") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="derivative-rules-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <rect x="24" y="15" width="28" height="26" rx="5" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M31 32 C35 22 42 22 45 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
          <path d="M34 20 H43 M39 17 V23" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.5" />
          <path d="M56 28 H72" stroke="currentColor" strokeLinecap="round" strokeWidth="2" markerEnd="url(#derivative-rules-arrow)" />
          <rect x="80" y="15" width="28" height="26" rx="5" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M87 31 L101 25" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
          <circle cx="94" cy="28" r="4" fill="currentColor" />
          <path d="M111 19 H119 M115 15 V23 M111 36 H119" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.48" />
          <path d="M29 46 H103 M29 43 V49 M103 43 V49" stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" opacity="0.32" />
        </svg>
      </div>
    );
  }

  if (slug === "numerical-derivative") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M24 42 H104 M31 45 V16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.28" />
          <path d="M31 37 C45 26 64 21 91 22" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.5" />
          <path d="M56 27 L69 24" stroke="currentColor" strokeLinecap="round" strokeWidth="2.7" />
          <path d="M56 42 V27 M69 42 V24 M56 42 H69" stroke="currentColor" strokeLinecap="round" strokeWidth="1.65" opacity="0.5" />
          <path d="M56 47 H69 M56 44 V50 M69 44 V50" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.66" />
          <circle cx="56" cy="27" r="4" fill="currentColor" />
          <circle cx="69" cy="24" r="3.6" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <path d="M78 20 H91 M78 20 L86 13 M78 36 H91 M78 36 L86 43" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.35" />
          <path d="M43 17 H54 M48.5 12 V22" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" opacity="0.38" />
        </svg>
      </div>
    );
  }

  if (slug === "riemann-sums") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M24 42 H104 M30 44 V16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.32" />
          {[33, 45, 57, 69, 81, 93].map((x, index) => {
            const height = [8, 14, 18, 20, 17, 12][index];
            return <rect key={x} x={x} y={42 - height} width="10" height={height} rx="1.2" fill={index === 3  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.5" opacity={index === 3 ? 1 : 0.86} />;
          })}
          <path d="M31 36 C44 25 58 18 72 21 C84 23 93 30 103 34" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.1" opacity="0.66" />
          {[38, 50, 62, 74, 86, 98].map((cx, index) => (
            <circle key={cx} cx={cx} cy={[34, 28, 23, 22, 27, 33][index]} r={index === 3 ? 3.2 : 2.4} fill={index === 3  ? "currentColor" : "currentColor"} opacity={index === 3 ? 1 : 0.45} />
          ))}
        </svg>
      </div>
    );
  }

  if (slug === "meaning-of-integral") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M25 42 H104 M31 44 V15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.3" />
          <path d="M33 39 C44 23 58 19 72 24 C84 28 93 35 100 38 L100 42 H33 Z" fill="currentColor" opacity="0.72" stroke="currentColor" strokeWidth="1.7" />
          <path d="M33 39 C44 23 58 19 72 24 C84 28 93 35 100 38" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
          <path d="M46 42 V31 M59 42 V24 M72 42 V24 M85 42 V31" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" opacity="0.38" />
          <circle cx="72" cy="24" r="3.8" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <path d="M50 17 C58 12 72 12 82 17" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.42" />
        </svg>
      </div>
    );
  }

  if (slug === "basic-integral-rules") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="basic-integral-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <path d="M24 42 H62 M30 45 V16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          <path d="M31 37 C38 28 48 25 60 30" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.6" />
          {[34, 43, 52].map((x, index) => {
            const height = [7, 12, 16][index];
            return <rect key={x} x={x} y={42 - height} width="7" height={height} rx="1.2" fill={index === 2 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.35" />;
          })}
          <path d="M66 29 H79" stroke="currentColor" strokeLinecap="round" strokeWidth="2" markerEnd="url(#basic-integral-arrow)" />
          <path d="M84 14 C76 23 77 39 85 47" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.25" />
          <path d="M91 42 H118 M97 45 V17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          <path d="M98 38 C104 35 109 27 115 17" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.25" />
          <path d="M98 38 L106 33 L112 23 L115 17 L115 42 H98 Z" fill="currentColor" opacity="0.16" stroke="currentColor" strokeWidth="1.25" />
          <circle cx="115" cy="17" r="3.4" fill="currentColor" />
          <circle cx="106" cy="33" r="2.8" fill="white" stroke="currentColor" strokeWidth="1.35" />
          <path d="M103 49 H115 M103 46 V52 M115 46 V52" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" opacity="0.38" />
        </svg>
      </div>
    );
  }

  if (slug === "area-accumulation") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="area-accumulation-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <path d="M25 40 H67 M31 43 V16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.28" />
          <path d="M33 36 C41 29 52 27 65 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.55" />
          {[34, 44, 54].map((x, index) => (
            <rect key={x} x={x} y={40 - [8, 13, 18][index]} width="8" height={[8, 13, 18][index]} rx="1.4" fill={index === 2  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.4" />
          ))}
          <path d="M70 28 H82" stroke="currentColor" strokeLinecap="round" strokeWidth="2" markerEnd="url(#area-accumulation-arrow)" />
          <path d="M88 42 H117 M94 45 V17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          <path d="M95 39 C101 35 106 28 113 18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.25" />
          <path d="M95 39 L103 34 L110 24 L113 18 L113 42 H95 Z" fill="currentColor" opacity="0.16" stroke="currentColor" strokeWidth="1.3" />
          {[96, 103, 110].map((cx, index) => (
            <circle key={cx} cx={cx} cy={[38, 34, 24][index]} r={index === 2 ? 3.6 : 2.8} fill={index === 2 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.35" />
          ))}
          <path d="M91 49 H113 M91 46 V52 M113 46 V52" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" opacity="0.36" />
        </svg>
      </div>
    );
  }

  if (slug === "fundamental-theorem-calculus") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="ftc-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <path d="M25 42 H63 M31 45 V17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          <path d="M33 38 C42 25 52 23 61 32 L61 42 H33 Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M33 38 C42 25 52 23 61 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.25" />
          <path d="M46 42 V27 M57 42 V31" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" opacity="0.34" />
          <path d="M68 28 H81" stroke="currentColor" strokeLinecap="round" strokeWidth="2" markerEnd="url(#ftc-arrow)" />
          <path d="M88 42 H113 M93 45 V17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          <path d="M94 37 C101 24 108 22 113 29" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.25" />
          <path d="M99 32 L113 27" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
          <circle cx="57" cy="31" r="3.6" fill="white" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="106" cy="29" r="4" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (slug === "multivariable-functions") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="multivariable-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <rect x="22" y="14" width="18" height="28" rx="4" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <rect x="48" y="14" width="18" height="28" rx="4" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <path d="M27 23 H35 M27 33 H34 M53 23 H61 M53 33 H60" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.55" />
          <circle cx="31" cy="33" r="3.1" fill="currentColor" />
          <circle cx="57" cy="23" r="3.1" fill="currentColor" opacity="0.72" />
          <path d="M40 28 H48 M66 28 H75" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" markerEnd="url(#multivariable-arrow)" />
          <path d="M82 42 H116 M88 45 V17 M88 42 L101 31" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          <path d="M94 35 C101 27 111 27 116 35 M94 35 C102 41 111 40 116 35" fill="currentColor" opacity="0.09" stroke="currentColor" strokeWidth="1.55" />
          <path d="M101 31 V20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.65" opacity="0.48" />
          <circle cx="101" cy="31" r="4.1" fill="currentColor" />
          <circle cx="101" cy="20" r="3.3" fill="white" stroke="currentColor" strokeWidth="1.5" />
          <path d="M105 20 H116 M111 14 V26" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.42" />
        </svg>
      </div>
    );
  }

  if (slug === "partial-derivatives") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="partial-derivative-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <path d="M26 42 H99 M32 45 V17 M32 42 L45 31" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          <path d="M41 36 C53 27 68 27 82 36 M41 36 C55 43 69 43 82 36" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="1.55" />
          <path d="M41 36 C53 27 68 27 82 36" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" opacity="0.54" />
          <path d="M59 18 L59 45" stroke="currentColor" strokeLinecap="round" strokeWidth="5" opacity="0.13" />
          <path d="M59 21 C64 28 64 38 59 44" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.1" />
          <path d="M48 34 H72" stroke="currentColor" strokeLinecap="round" strokeWidth="2.35" markerEnd="url(#partial-derivative-arrow)" />
          <circle cx="59" cy="34" r="4.2" fill="currentColor" />
          <path d="M89 22 V42 M85 22 H93 M85 42 H93" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.46" />
          <path d="M95 19 H108 M101.5 13 V25 M95 37 H108" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.44" />
          <circle cx="101.5" cy="31" r="3.6" fill="white" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  if (slug === "gradient") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="gradient-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <path d="M26 43 H100 M34 46 V16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.25" />
          <path d="M39 37 C51 26 67 23 86 20" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.34" />
          <path d="M39 43 C51 32 68 28 91 25" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.5" />
          <path d="M39 49 C54 38 74 34 97 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.28" />
          <path d="M49 38 L59 33 M64 32 L75 27 M79 37 L91 31" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.32" />
          <path d="M61 34 L92 17" stroke="currentColor" strokeLinecap="round" strokeWidth="3" markerEnd="url(#gradient-arrow)" />
          <circle cx="61" cy="34" r="4.2" fill="currentColor" />
          <path d="M57 34 H65 M61 30 V38" stroke="white" strokeLinecap="round" strokeWidth="1.25" opacity="0.82" />
          <circle cx="92" cy="17" r="3.6" fill="white" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  if (slug === "autodiff-intro") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <circle cx="26" cy="20" r="4.6" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="26" cy="38" r="4.6" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="56" cy="29" r="6.3" fill="currentColor" opacity="0.9" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="88" cy="29" r="5.2" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <path d="M31 20 L50 27 M31 38 L50 31 M62 29 H82" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
          <path d="M84 40 C70 49 47 48 31 39" fill="none" stroke="currentColor" strokeDasharray="3 3" strokeLinecap="round" strokeWidth="1.8" opacity="0.62" />
          <path d="M84 18 C70 9 47 10 31 19" fill="none" stroke="currentColor" strokeDasharray="3 3" strokeLinecap="round" strokeWidth="1.8" opacity="0.52" />
          <path d="M52 29 H60 M56 25 V33" stroke="white" strokeLinecap="round" strokeWidth="1.5" opacity="0.86" />
          <circle cx="88" cy="29" r="2.6" fill="currentColor" />
          <circle cx="84" cy="40" r="2.3" fill="currentColor" opacity="0.58" />
          <circle cx="84" cy="18" r="2.3" fill="currentColor" opacity="0.5" />
          <path d="M100 18 H116 M100 38 H116" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.38" />
          <path d="M109 12 V24 M109 32 V44" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.38" />
        </svg>
      </div>
    );
  }

  if (slug === "calculus-in-machine-learning") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="calculus-ml-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <rect x="23" y="17" width="17" height="20" rx="4" fill="white" stroke="currentColor" strokeWidth="1.9" />
          <path d="M28 24 H35 M28 30 H35" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.58" />
          <path d="M42 27 H54" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" markerEnd="url(#calculus-ml-arrow)" />
          <path d="M60 16 C71 34 81 34 92 16" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.15" />
          <circle cx="76" cy="29" r="4.1" fill="currentColor" />
          <path d="M94 25 H105" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" markerEnd="url(#calculus-ml-arrow)" />
          <rect x="108" y="15" width="15" height="25" rx="3" fill="white" stroke="currentColor" strokeWidth="1.9" />
          <path d="M112 23 H119 M112 31 H118 M115.5 19 V36" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.58" />
          <path d="M108 43 C86 52 54 49 35 38" fill="none" stroke="currentColor" strokeDasharray="3 3" strokeLinecap="round" strokeWidth="1.9" opacity="0.65" markerEnd="url(#calculus-ml-arrow)" />
          <path d="M55 45 H75 M55 42 V48 M75 42 V48" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.38" />
          <circle cx="31.5" cy="27" r="2.6" fill="currentColor" opacity="0.5" />
        </svg>
      </div>
    );
  }

  if (slug === "chain-rule") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <circle cx="24" cy="28" r="4" fill="white" stroke="currentColor" strokeWidth="2" />
          <rect x="38" y="16" width="18" height="24" rx="5" fill="white" stroke="currentColor" strokeWidth="2" />
          <rect x="70" y="16" width="18" height="24" rx="5" fill="currentColor" opacity="0.9" stroke="currentColor" strokeWidth="2" />
          <circle cx="104" cy="28" r="4" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M28 28 H38 M56 28 H70 M88 28 H100" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" opacity="0.44" />
          {[33, 63, 94].map((cx) => (
            <circle key={cx} cx={cx} cy="28" r="2.4" fill="currentColor" opacity="0.54" />
          ))}
          <rect x="42" y="43" width="16" height="8" rx="2.5" fill="white" stroke="currentColor" strokeWidth="1.5" />
          <rect x="71" y="43" width="16" height="8" rx="2.5" fill="white" stroke="currentColor" strokeWidth="1.5" />
          <path d="M58 47 H71 M65 44 V50" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.58" />
          <path d="M88 47 H101" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.42" />
          <rect x="103" y="41" width="16" height="12" rx="3" fill="white" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="111" cy="47" r="2.8" fill="currentColor" />
          <path d="M44 24 H51 M75 24 H83 M75 32 H83" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.62" />
        </svg>
      </div>
    );
  }

  if (slug === "gradient-descent") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <ellipse cx="66" cy="31" rx="39" ry="17" fill="none" stroke="currentColor" strokeWidth="1.7" opacity="0.28" />
          <ellipse cx="66" cy="31" rx="27" ry="11" fill="none" stroke="currentColor" strokeWidth="1.7" opacity="0.42" />
          <ellipse cx="66" cy="31" rx="14" ry="5.5" fill="none" stroke="currentColor" strokeWidth="1.7" opacity="0.6" />
          <path d="M31 18 L45 24 L57 29 L66 31" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.35" />
          <circle cx="31" cy="18" r="3.5" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="45" cy="24" r="3.3" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="57" cy="29" r="3.3" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="66" cy="31" r="4.4" fill="currentColor" />
          <path d="M90 16 H104 M97 9 V23" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.38" />
        </svg>
      </div>
    );
  }

  if (slug === "learning-rate") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M24 42 H58 M30 44 V16 M72 42 H109 M78 44 V16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.28" />
          <path d="M30 37 C38 19 49 19 56 37 M78 37 C87 19 99 19 107 37" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.58" />
          <path d="M32 25 L38 30 L43 33 L48 35 L52 36" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.05" />
          <path d="M81 24 L105 36 L84 20 L108 33" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.35" />
          {[32, 38, 43, 48].map((cx, index) => (
            <circle key={cx} cx={cx} cy={[25, 30, 33, 35][index]} r="2.1" fill="white" stroke="currentColor" strokeWidth="1.15" opacity="0.78" />
          ))}
          {[81, 105, 84].map((cx, index) => (
            <circle key={cx} cx={cx} cy={[24, 36, 20][index]} r="2.15" fill="white" stroke="currentColor" strokeWidth="1.15" opacity="0.72" />
          ))}
          <circle cx="52" cy="36" r="3.7" fill="currentColor" />
          <circle cx="108" cy="33" r="3.5" fill="currentColor" opacity="0.8" />
          <path d="M36 48 H52 M36 45 V51 M52 45 V51" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.46" />
          <path d="M83 48 H108 M83 45 V51 M108 45 V51" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" opacity="0.58" />
          <path d="M45 38 H53 M99 38 H107" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.32" />
        </svg>
      </div>
    );
  }

  if (slug === "loss-functions") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          {[31, 44, 57].map((cx, index) => {
            const targetY = [20, 34, 25][index];
            const predictedY = [33, 27, 39][index];

            return (
              <g key={cx}>
                <path d={`M${cx} ${targetY} V${predictedY}`} stroke="currentColor" strokeDasharray="3 3" strokeLinecap="round" strokeWidth="1.7" opacity="0.62" />
                <circle cx={cx} cy={targetY} r="3.1" fill="white" stroke="currentColor" strokeWidth="1.5" />
                <circle cx={cx} cy={predictedY} r="3.4" fill={index === 2  ? "currentColor" : "currentColor"} opacity={index === 2 ? 1 : 0.55} />
              </g>
            );
          })}
          <path d="M68 28 H80" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" opacity="0.5" />
          <rect x="84" y="14" width="25" height="28" rx="5" fill="white" stroke="currentColor" strokeWidth="2" />
          {[91, 99, 107].map((x, index) => (
            <rect key={x} x={x - 4} y={35 - [5, 10, 16][index]} width="7" height={[5, 10, 16][index]} rx="2" fill={index === 2  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.4" />
          ))}
          <path d="M87 38 H111" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.34" />
          <path d="M112 20 L117 25 L124 15" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" opacity="0.58" />
          <path d="M25 45 H61 M25 42 V48 M61 42 V48" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.36" />
        </svg>
      </div>
    );
  }

  if (slug === "optimization-intro") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M25 43 H103 M31 46 V14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          <path d="M35 18 C45 46 82 46 96 18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.45" />
          <path d="M51 34 C58 42 73 42 80 34" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="6" opacity="0.1" />
          <circle cx="66" cy="39" r="4.8" fill="currentColor" />
          {[43, 89].map((cx) => (
            <circle key={cx} cx={cx} cy="29" r="3.2" fill="white" stroke="currentColor" strokeWidth="1.5" opacity="0.74" />
          ))}
          <path d="M58 47 H74 M58 44 V50 M74 44 V50" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.48" />
          <path d="M91 12 L96 17 L105 8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" opacity="0.55" />
        </svg>
      </div>
    );
  }

  if (slug === "optimization-problems") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M26 43 H105 M33 46 V14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.24" />
          <path d="M43 42 L53 24 L79 19 L98 32 L86 44 L59 45 Z" fill="currentColor" opacity="0.13" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
          <path d="M38 37 L101 24 M45 45 L72 15 M59 17 L99 39" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.42" />
          <path d="M45 39 C56 29 70 23 88 22 M50 45 C62 36 78 31 96 31" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.28" />
          <circle cx="60" cy="34" r="3.1" fill="white" stroke="currentColor" strokeWidth="1.55" opacity="0.78" />
          <circle cx="77" cy="27" r="3.1" fill="white" stroke="currentColor" strokeWidth="1.55" opacity="0.78" />
          <circle cx="88" cy="32" r="5" fill="currentColor" />
          <circle cx="88" cy="32" r="8" fill="none" stroke="currentColor" strokeWidth="1.45" opacity="0.36" />
          <path d="M104 16 L99 24 M104 16 L107 24 M104 16 L96 15" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.55" opacity="0.52" />
        </svg>
      </div>
    );
  }

  if (slug === "numerical-integration") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M24 41 H72 M30 44 V17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          <path d="M31 36 C42 24 57 23 70 30" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.55" />
          {[33, 45, 57].map((x, index) => (
            <rect key={x} x={x} y={41 - [8, 15, 13][index]} width="10" height={[8, 15, 13][index]} rx="1.3" fill={index === 1  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.35" opacity={index === 1 ? 0.82 : 0.9} />
          ))}
          <path d="M74 29 H84" stroke="currentColor" strokeLinecap="round" strokeWidth="1.65" opacity="0.36" />
          <circle cx="79" cy="29" r="2.45" fill="currentColor" opacity="0.52" />
          <path d="M89 41 H116 M94 44 V17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          <path d="M95 36 C102 24 110 23 115 30" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.55" />
          {[96, 106].map((x, index) => (
            <path key={x} d={`M${x} 41 H${x + 10} L${x + 8} ${[29, 27][index]} L${x + 2} ${[35, 31][index]} Z`} fill={index === 1  ? "currentColor" : "white"} opacity={index === 1 ? 0.82 : 0.9} stroke="currentColor" strokeWidth="1.35" />
          ))}
          <path d="M92 49 H117 M92 46 V52 M117 46 V52" stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" opacity="0.38" />
        </svg>
      </div>
    );
  }

  if (slug === "differential-equations-intro") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M24 43 H105 M31 46 V14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.25" />
          {[
            [42, 35, -18],
            [58, 29, -26],
            [75, 24, -10],
            [93, 25, 15],
            [47, 22, 16],
            [70, 17, 2],
          ].map(([x, y, rotate], index) => (
            <g key={index} transform={`translate(${x} ${y}) rotate(${rotate})`}>
              <path d="M-5 0 H5" stroke="currentColor" strokeLinecap="round" strokeWidth={index === 1 ? 2 : 1.45} opacity={index === 1 ? 0.8 : 0.38} />
            </g>
          ))}
          <path d="M33 40 C45 37 56 31 67 25 C79 19 91 19 101 25" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.35" />
          <path d="M57 30 L78 20" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
          <circle cx="67" cy="25" r="4.4" fill="currentColor" />
          <circle cx="84" cy="21" r="3" fill="white" stroke="currentColor" strokeWidth="1.45" opacity="0.78" />
          <path d="M88 38 H109 M88 38 L102 29" stroke="currentColor" strokeLinecap="round" strokeWidth="1.65" opacity="0.45" />
          <circle cx="88" cy="38" r="2.9" fill="white" stroke="currentColor" strokeWidth="1.35" />
          <circle cx="102" cy="29" r="3.2" fill="currentColor" opacity="0.72" />
        </svg>
      </div>
    );
  }

  if (slug === "euler-method-simulation") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M25 42 H105 M31 45 V15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.32" />
          <path d="M34 39 C51 29 70 23 99 24" fill="none" stroke="currentColor" strokeDasharray="3 3" strokeLinecap="round" strokeWidth="1.65" opacity="0.42" />
          <path d="M34 39 H51 V34 H68 V30 H85 V29 H102" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
          {[34, 51, 68, 85, 102].map((cx, index) => (
            <g key={cx}>
              <circle cx={cx} cy={[39, 34, 30, 29, 33][index]} r={index === 1 ? 4 : 3.4} fill={index === 1  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.7" />
            </g>
          ))}
          <path d="M48 47 H88 M48 44 V50 M88 44 V50" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.38" />
          <path d="M97 16 H108 M102.5 10.5 V21.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.34" />
        </svg>
      </div>
    );
  }

  if (slug === "proof-techniques") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <rect x="25" y="11" width="26" height="11" rx="3" fill="white" stroke="currentColor" strokeWidth="1.6" />
          <rect x="77" y="11" width="26" height="11" rx="3" fill="white" stroke="currentColor" strokeWidth="1.6" />
          <path d="M31 16.5 H45 M83 16.5 H97" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.58" />
          <path d="M38 22 L57 31 M90 22 L71 31" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.46" />
          <rect x="54" y="27" width="20" height="10" rx="3" fill="white" stroke="currentColor" strokeWidth="1.7" />
          <path d="M59 32 H69" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.58" />
          <path d="M64 37 V42" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.48" />
          <rect x="46" y="42" width="36" height="9" rx="3" fill="currentColor" opacity="0.9" stroke="currentColor" strokeWidth="1.7" />
          <path d="M54 46.5 H74" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.58" />
          <path d="M96 35 L101 40 L111 28" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" opacity="0.62" />
          <circle cx="38" cy="22" r="2.5" fill="currentColor" opacity="0.56" />
          <circle cx="90" cy="22" r="2.5" fill="currentColor" opacity="0.56" />
        </svg>
      </div>
    );
  }

  if (slug === "logical-equivalence") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <rect x="23" y="13" width="31" height="30" rx="5" fill="white" stroke="currentColor" strokeWidth="2" />
          <rect x="76" y="13" width="31" height="30" rx="5" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M31 13 V43 M43 13 V43 M23 23 H54 M23 33 H54" stroke="currentColor" strokeWidth="1.25" opacity="0.36" />
          <path d="M84 13 V43 M96 13 V43 M76 23 H107 M76 33 H107" stroke="currentColor" strokeWidth="1.25" opacity="0.36" />
          {[28, 40, 28, 40].map((cx, index) => {
            const cy = [18, 28, 38, 38][index];
            return <rect key={index} x={cx - 3} y={cy - 3} width="6" height="6" rx="1.4" fill={index === 0 || index === 3 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.1" opacity={index === 0 || index === 3 ? 1 : 0.58} />;
          })}
          {[81, 93, 81, 93].map((cx, index) => {
            const cy = [18, 28, 38, 38][index];
            return <rect key={index} x={cx - 3} y={cy - 3} width="6" height="6" rx="1.4" fill={index === 0 || index === 3 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.1" opacity={index === 0 || index === 3 ? 1 : 0.58} />;
          })}
          <path d="M59 24 H70 M70 34 H59" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.44" />
          <circle cx="64.5" cy="24" r="2.2" fill="currentColor" opacity="0.5" />
          <circle cx="64.5" cy="34" r="2.2" fill="currentColor" opacity="0.5" />
          <circle cx="64.5" cy="29" r="3.2" fill="currentColor" />
          <path d="M111 21 L116 26 L123 17 M111 36 L116 41 L123 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" opacity="0.62" />
        </svg>
      </div>
    );
  }

  if (slug === "equivalence-relations") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M25 29 C25 19 33 14 43 17 C51 19 54 27 50 36 C45 44 32 43 27 35 C25 33 25 31 25 29 Z" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" />
          <path d="M56 29 C56 18 66 14 76 18 C84 21 86 32 79 39 C72 46 60 42 57 34 C56 32 56 30 56 29 Z" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" />
          <path d="M88 29 C88 20 96 15 105 17 C114 20 116 31 110 38 C104 45 92 42 89 34 C88 32 88 30 88 29 Z" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" />
          {[
            [34, 25],
            [42, 32],
            [65, 24],
            [74, 34],
            [97, 32],
            [105, 24],
          ].map(([cx, cy], index) => (
            <circle key={index} cx={cx} cy={cy} r={index === 2 ? 4 : 3.1} fill={index === 2 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.45" opacity={index === 2 ? 1 : 0.82} />
          ))}
          <path d="M34 25 C39 20 45 25 42 32 M65 24 C71 19 78 26 74 34 M97 32 C101 38 109 31 105 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.56" />
          <path d="M51 28 H56 M82 28 H88" stroke="currentColor" strokeDasharray="3 4" strokeLinecap="round" strokeWidth="1.35" opacity="0.24" />
          <path d="M52 20 L57 15 M57 20 L52 15 M82 41 L87 46 M87 41 L82 46" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.48" />
        </svg>
      </div>
    );
  }

  if (slug === "inclusion-exclusion") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <circle cx="55" cy="28" r="18" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" />
          <circle cx="73" cy="28" r="18" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" />
          <path d="M64 14 C72 20 72 36 64 42 C56 36 56 20 64 14 Z" fill="currentColor" opacity="0.9" />
          <path d="M37 28 H49 M79 28 H91 M43 22 V34 M85 22 V34 M60 28 H68" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  if (slug === "partial-orders") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M27 43 H101 M35 30 H93 M51 17 H77" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.16" />
          <path d="M38 43 L54 30 M65 43 L54 30 M65 43 L82 30 M92 43 L82 30 M54 30 L66 17 M82 30 L66 17" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.1" />
          <path d="M54 30 H82" stroke="currentColor" strokeDasharray="3 4" strokeLinecap="round" strokeWidth="1.35" opacity="0.36" />
          {[38, 65, 92, 54, 82, 66].map((cx, index) => (
            <circle key={index} cx={cx} cy={[43, 43, 43, 30, 30, 17][index]} r={index === 5 ? 4.8 : 3.9} fill={index === 5 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.9" />
          ))}
          <path d="M55 46 H91 M55 49 V43 M91 49 V43" stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" opacity="0.34" />
          <path d="M26 22 L36 32 M36 22 L26 32 M96 22 L106 32 M106 22 L96 32" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.5" />
          <circle cx="65" cy="43" r="2.1" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (slug === "dag-topological-sort") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="dag-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <path d="M31 15 L57 13 M31 15 L57 28 M57 13 L84 20 M57 28 L84 20 M84 20 L105 30" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" markerEnd="url(#dag-arrow)" />
          {[31, 57, 57, 84, 105].map((cx, index) => (
            <circle key={index} cx={cx} cy={[15, 13, 28, 20, 30][index]} r={index === 0 ? 4.8 : 4.1} fill={index === 0  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="2" />
          ))}
          <path d="M27 42 H109" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.28" />
          {[31, 49, 67, 85, 103].map((cx, index) => (
            <rect key={cx} x={cx - 6} y="37" width="12" height="10" rx="2.5" fill={index === 0  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.6" />
          ))}
          <path d="M37 42 H43 M55 42 H61 M73 42 H79 M91 42 H97" stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" opacity="0.36" />
          {[43, 61, 79, 97].map((cx) => (
            <circle key={cx} cx={cx} cy="42" r="1.9" fill="currentColor" opacity="0.42" />
          ))}
        </svg>
      </div>
    );
  }

  if (slug === "modular-arithmetic") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="modular-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <circle cx="64" cy="28" r="19" fill="none" stroke="currentColor" strokeWidth="2.3" />
          <path d="M64 9 C80 9 93 21 93 37" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" markerEnd="url(#modular-arrow)" />
          <path d="M64 28 L83 28" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.26" />
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <circle
              key={item}
              cx={64 + 19 * Math.cos((item / 6) * Math.PI * 2 - Math.PI / 2)}
              cy={28 + 19 * Math.sin((item / 6) * Math.PI * 2 - Math.PI / 2)}
              r={item === 3 ? 4.6 : 3.2}
              className={item === 3 ? fill : ""}
              fill={item === 3 ? undefined : "white"}
              stroke="currentColor"
              strokeWidth="1.6"
            />
          ))}
          <circle cx="64" cy="9" r="3.5" fill="white" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </div>
    );
  }

  if (slug === "number-theory") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M24 39 H108" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.28" />
          {[32, 48, 64, 80, 96].map((cx, index) => (
            <g key={cx}>
              <path d={`M${cx} 35 V43`} stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.38" />
              <circle cx={cx} cy="39" r={index === 2 ? 4.5 : 3.4} fill={index === 2 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.55" opacity={index === 2 ? 1 : 0.82} />
            </g>
          ))}
          <path d="M32 28 H96 M32 25 V31 M96 25 V31" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.5" />
          <path d="M48 18 H80 M48 15 V21 M80 15 V21" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.38" />
          <rect x="28" y="10" width="13" height="10" rx="3" fill="white" stroke="currentColor" strokeWidth="1.45" />
          <rect x="57.5" y="10" width="13" height="10" rx="3" fill="currentColor" opacity="0.9" stroke="currentColor" strokeWidth="1.45" />
          <rect x="87" y="10" width="13" height="10" rx="3" fill="white" stroke="currentColor" strokeWidth="1.45" />
          <path d="M34.5 20 V29 M64 20 V35 M93.5 20 V29" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" opacity="0.36" />
        </svg>
      </div>
    );
  }

  if (slug === "boolean-algebra") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <circle cx="27" cy="20" r="4" fill="currentColor" />
          <circle cx="27" cy="36" r="4" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M31 20 H45 M31 36 H45" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
          <path d="M45 14 H58 C75 14 75 42 58 42 H45 Z" fill="white" stroke="currentColor" strokeWidth="2.2" />
          <path d="M75 28 H87" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" opacity="0.46" />
          <circle cx="81" cy="28" r="2.4" fill="currentColor" opacity="0.54" />
          <circle cx="93" cy="28" r="4.2" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M97 28 H109" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" opacity="0.46" />
          <circle cx="103" cy="28" r="2.4" fill="currentColor" opacity="0.54" />
          <path d="M47 20 H56 M47 36 H56" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.5" />
          <circle cx="109" cy="28" r="4.6" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (slug === "euclidean-algorithm") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M24 17 H78" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          {[25, 39, 53].map((x) => (
            <rect key={x} x={x} y="11" width="12" height="12" rx="2.5" fill="white" stroke="currentColor" strokeWidth="1.55" />
          ))}
          <rect x="67" y="11" width="8" height="12" rx="2.2" fill="currentColor" opacity="0.82" stroke="currentColor" strokeWidth="1.55" />
          <path d="M71 23 C67 29 62 32 55 34" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.65" opacity="0.62" />
          <circle cx="55" cy="34" r="2.4" fill="currentColor" opacity="0.55" />
          <path d="M37 35 H82" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          {[38, 52].map((x) => (
            <rect key={x} x={x} y="29" width="12" height="12" rx="2.5" fill="white" stroke="currentColor" strokeWidth="1.55" />
          ))}
          <rect x="66" y="29" width="7" height="12" rx="2" fill="currentColor" opacity="0.56" stroke="currentColor" strokeWidth="1.55" />
          <path d="M69 41 C73 45 80 47 88 45" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.65" opacity="0.58" />
          <circle cx="88" cy="45" r="2.4" fill="currentColor" opacity="0.5" />
          <circle cx="95" cy="43" r="5" fill="currentColor" />
          <circle cx="111" cy="43" r="4.2" fill="white" stroke="currentColor" strokeWidth="1.6" opacity="0.75" />
          <path d="M91 16 H105 M91 13 V19 M105 13 V19" stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" opacity="0.36" />
          <path d="M92 25 H100 M92 22 V28 M100 22 V28" stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" opacity="0.5" />
          <path d="M103 43 H107" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.5" />
        </svg>
      </div>
    );
  }

  if (slug === "pigeonhole-principle") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          {[22, 47, 72, 97].map((x, index) => (
            <g key={x}>
              <path d={`M${x} 20 V42 H${x + 18} V20`} fill="white" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" opacity={index === 1 ? 1 : 0.78} />
              {index === 1 ? (
                <>
                  <circle cx={x + 6} cy="34" r="3.1" fill="currentColor" />
                  <circle cx={x + 12} cy="34" r="3.1" fill="currentColor" />
                </>
              ) : (
                <circle cx={x + 9} cy="34" r="3.1" fill="currentColor" />
              )}
            </g>
          ))}
        </svg>
      </div>
    );
  }

  if (slug === "recurrences") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <rect x="25" y="18" width="17" height="18" rx="4" fill="white" stroke="currentColor" strokeWidth="1.7" />
          <rect x="50" y="18" width="17" height="18" rx="4" fill="white" stroke="currentColor" strokeWidth="1.7" />
          <rect x="75" y="18" width="17" height="18" rx="4" fill="currentColor" opacity="0.86" stroke="currentColor" strokeWidth="1.7" />
          <path d="M43 27 H49 M68 27 H74" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.4" />
          <circle cx="49" cy="27" r="2.1" fill="currentColor" opacity="0.5" />
          <circle cx="74" cy="27" r="2.1" fill="currentColor" opacity="0.5" />
          <path d="M30 27 H37 M55 27 H62 M80 27 H87" stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" opacity="0.58" />
          <rect x="47" y="41" width="25" height="9" rx="3" fill="white" stroke="currentColor" strokeWidth="1.45" />
          <path d="M54 45.5 H66" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" opacity="0.55" />
          <path d="M58 36 V41 M42 45.5 H47 M72 45.5 H84" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.42" />
          <path d="M95 27 H103" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.4" />
          <circle cx="103" cy="27" r="2.1" fill="currentColor" opacity="0.5" />
          <circle cx="109" cy="27" r="3.6" fill="white" stroke="currentColor" strokeWidth="1.55" />
        </svg>
      </div>
    );
  }

  if (kind === "venn" || kind === "overlap") {
    return (
      <div className={`relative h-full w-full ${text}`}>
        <span className={`absolute left-1/2 top-1/2 h-9 w-9 -translate-x-[70%] -translate-y-1/2 rounded-full border ${stroke} ${softFill}`} />
        <span className={`absolute left-1/2 top-1/2 h-9 w-9 -translate-x-[30%] -translate-y-1/2 rounded-full border ${stroke} ${softFill}`} />
        {variant % 2 === 0 ? <span className={`absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full ${fill} opacity-35`} /> : null}
      </div>
    );
  }

  if (kind === "mapping" || kind === "flow" || kind === "computation") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <g fill="currentColor">
            <circle cx="22" cy="18" r="4.5" />
            <circle cx="22" cy="38" r="4.5" />
            <circle cx="106" cy={variant % 2 === 0 ? 22 : 16} r="4.5" />
            <circle cx="106" cy={variant % 2 === 0 ? 34 : 40} r="4.5" />
          </g>
          <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2">
            <path d="M30 18 C48 15 68 18 98 23" />
            <path d="M30 38 C54 39 72 36 98 34" />
          </g>
        </svg>
      </div>
    );
  }

  if (kind === "grid" || kind === "matrix") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} className={`h-2.5 w-2.5 rounded-sm border ${stroke} ${(index + variant) % 3 === 0 ? fill : "bg-white"}`} />
          ))}
        </div>
      </div>
    );
  }

  if (kind === "network" || kind === "tree" || kind === "path") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4">
            <path d="M28 19 L64 10 L100 30" />
            <path d="M28 19 L46 42 L100 30" opacity={kind === "path" ? 0.4 : 1} />
            {variant > 1 ? <path d="M64 10 L46 42" opacity="0.5" /> : null}
          </g>
          {[28, 64, 100, 46].map((cx, index) => (
            <circle key={index} cx={cx} cy={[19, 10, 30, 42][index]} r={index === variant ? 6 : 5} fill="currentColor" />
          ))}
        </svg>
      </div>
    );
  }

  if (kind === "vector" || kind === "transform") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <defs>
            <marker id="generic-vector-arrow" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
            </marker>
          </defs>
          <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.6">
            <path d="M28 42 L86 15" markerEnd="url(#generic-vector-arrow)" />
            <path d="M32 42 H104" opacity="0.3" />
            <path d="M32 42 V12" opacity="0.3" />
          </g>
          {variant % 2 === 0 ? <path d="M58 42 L98 28" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.65" /> : null}
        </svg>
      </div>
    );
  }

  if (kind === "curve" || kind === "limit" || kind === "optimization") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M17 40 C38 10 55 13 70 28 S100 43 112 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
          <circle cx={kind === "limit" ? 70 : 86} cy={kind === "limit" ? 28 : 35} r="4.5" fill="currentColor" />
          {kind === "optimization" ? <path d="M26 18 L45 32 L62 36 L82 31" fill="none" stroke="currentColor" strokeDasharray="4 4" strokeLinecap="round" strokeWidth="2" /> : null}
        </svg>
      </div>
    );
  }

  if (kind === "area" || kind === "bars") {
    return (
      <div className={`flex h-full items-end justify-center gap-1 pb-2 ${text}`}>
        {[14, 22, 32, 27, 18, 11].map((height, index) => (
          <span key={index} className={`w-4 rounded-t border border-current ${(index + variant) % 3 === 0 ? fill : softFill}`} style={{ height }} />
        ))}
      </div>
    );
  }

  if (kind === "scatter" || kind === "field") {
    return (
      <div className={`relative h-full w-full ${text}`}>
        {[23, 37, 48, 61, 72, 84].map((left, index) => (
          <span key={index} className={`absolute h-2 w-2 rounded-full ${fill}`} style={{ left: `${left}%`, top: [34, 24, 29, 17, 22, 13][(index + variant) % 6] }} />
        ))}
        <span className="absolute left-[18%] right-[18%] top-8 h-0.5 rotate-[-15deg] rounded bg-current opacity-70" />
      </div>
    );
  }

  if (kind === "number-line" || kind === "sequence" || kind === "steps") {
    return (
      <div className={`relative h-full w-full ${text}`}>
        <span className="absolute left-[18%] right-[18%] top-7 h-px bg-current" />
        {[0, 1, 2, 3].map((step) => (
          <span
            key={step}
            className={`absolute h-3 w-3 rounded-full ${step === variant ? fill : "bg-white"} border ${stroke}`}
            style={{ left: `${24 + step * 16}%`, top: `${22 - step * 2}px` }}
          />
        ))}
      </div>
    );
  }

  if (kind === "circuit" || kind === "logic") {
    return (
      <div className={`flex h-full items-center justify-center gap-2 ${text}`}>
        <span className={`h-3 w-3 rounded-full ${fill}`} />
        <span className="h-px w-6 bg-current" />
        <span className={`h-7 w-10 rounded-full border ${stroke} bg-white`} />
        <span className="h-px w-6 bg-current" />
        <span className={`h-3 w-3 rounded-full ${fill}`} />
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center gap-2">
      {[0, 1, 2].map((index) => (
        <span key={index} className={`h-8 w-7 rounded border ${stroke} ${(index + variant) % 2 === 0 ? softFill : "bg-white"}`}>
          <span className={`mx-auto mt-2 block h-2 w-2 rounded-full ${fill}`} />
        </span>
      ))}
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
      <div className="flex h-full items-center justify-center gap-1.5">
        {[0, 1, 2, 3].map((box) => (
          <div key={box} className={`flex h-8 w-6 flex-row items-end justify-center gap-0.5 rounded border ${stroke} bg-white pb-1`}>
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

function LinearAlgebraVisual({
  slug,
  level,
  stroke,
  fill,
  softFill,
  text,
}: {
  slug: string;
  level: number;
  stroke: string;
  fill: string;
  softFill: string;
  text: string;
}) {
  if (level === 2) {
    if (slug.includes("determinants") || slug.includes("rank") || slug.includes("systems")) {
      return <MiniMatrixGridVisual stroke={stroke} fill={fill} text={text} />;
    }

    if (slug.includes("orthogonality") || slug.includes("least-squares")) {
      return <MiniProjectionVisual text={text} />;
    }

    return <MiniVectorSpanVisual stroke={stroke} fill={fill} softFill={softFill} text={text} />;
  }

  if (slug.includes("coordinate") || slug.includes("affine") || slug.includes("graphics") || slug.includes("rotation")) {
    return <MiniTransformAxesVisual text={text} />;
  }

  if (slug.includes("pca") || slug.includes("svd") || slug.includes("factorization")) {
    return <MiniDataAxesVisual fill={fill} text={text} />;
  }

  return <MiniLayerVisual stroke={stroke} fill={fill} text={text} />;
}

function CalculusVisual({
  slug,
  level,
  stroke,
  fill,
  softFill,
  text,
}: {
  slug: string;
  level: number;
  stroke: string;
  fill: string;
  softFill: string;
  text: string;
}) {
  if (level === 1) {
    if (slug.includes("limits") || slug.includes("continuity")) {
      return <MiniLimitVisual fill={fill} text={text} />;
    }

    if (slug.includes("derivative") || slug.includes("optimization")) {
      return <MiniDerivativeVisual text={text} />;
    }

    return <MiniCurveVisual text={text} />;
  }

  if (level === 2) {
    if (slug.includes("integral") || slug.includes("riemann") || slug.includes("area")) {
      return <MiniIntegralVisual fill={fill} softFill={softFill} text={text} />;
    }

    return <MiniGradientFieldVisual fill={fill} text={text} />;
  }

  if (slug.includes("gradient") || slug.includes("loss") || slug.includes("learning")) {
    return <MiniOptimizationPathVisual text={text} />;
  }

  if (slug.includes("integration") || slug.includes("euler") || slug.includes("differential")) {
    return <MiniNumericalStepsVisual stroke={stroke} fill={fill} softFill={softFill} text={text} />;
  }

  return <MiniComputationGraphVisual stroke={stroke} text={text} />;
}

function MiniCurveVisual({ text }: { text: string }) {
  return (
    <div className={`flex h-full items-center justify-center ${text}`}>
      <svg aria-hidden="true" viewBox="0 0 112 56" className="h-14 w-28">
        <path d="M16 42 C34 12 50 12 66 30 S88 48 98 16" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.6" />
        <circle cx="66" cy="30" r="4" fill="currentColor" />
      </svg>
    </div>
  );
}

function MiniLimitVisual({ fill, text }: { fill: string; text: string }) {
  return (
    <div className={`flex h-full items-center justify-center gap-2 ${text}`}>
      <span className="text-xs font-black">x</span>
      <span className="h-px w-8 bg-current" />
      <span className={`h-3 w-3 rounded-full ${fill}`} />
      <span className="h-px w-8 bg-current" />
      <span className="text-xs font-black">a</span>
    </div>
  );
}

function MiniDerivativeVisual({ text }: { text: string }) {
  return (
    <div className={`flex h-full items-center justify-center ${text}`}>
      <svg aria-hidden="true" viewBox="0 0 112 56" className="h-14 w-28">
        <path d="M18 43 C42 39 54 25 92 13" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" opacity="0.7" />
        <path d="M42 36 L82 18" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
        <circle cx="62" cy="27" r="4" fill="currentColor" />
      </svg>
    </div>
  );
}

function MiniIntegralVisual({ fill, softFill, text }: { fill: string; softFill: string; text: string }) {
  return (
    <div className={`flex h-full items-end justify-center gap-1 px-5 pb-3 ${text}`}>
      {[18, 26, 34, 24, 16].map((height, index) => (
        <span key={index} className={`w-4 rounded-t border border-current ${index === 2 ? fill : softFill}`} style={{ height }} />
      ))}
    </div>
  );
}

function MiniGradientFieldVisual({ fill, text }: { fill: string; text: string }) {
  return (
    <div className={`grid h-full grid-cols-4 items-center gap-1 px-7 py-3 ${text}`}>
      {["↗", "→", "↘", "↓", "↑", "↗", "→", "↘"].map((arrow, index) => (
        <span key={index} className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black ${index % 3 === 0 ? fill : ""}`}>
          {arrow}
        </span>
      ))}
    </div>
  );
}

function MiniOptimizationPathVisual({ text }: { text: string }) {
  return (
    <div className={`flex h-full items-center justify-center ${text}`}>
      <svg aria-hidden="true" viewBox="0 0 112 56" className="h-14 w-28">
        <path d="M18 14 C42 50 70 50 94 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
        <path d="M26 20 L43 35 L58 40 L72 35" fill="none" stroke="currentColor" strokeDasharray="4 4" strokeLinecap="round" strokeWidth="2.2" />
        {[26, 43, 58, 72].map((cx, index) => (
          <circle key={index} cx={cx} cy={[20, 35, 40, 35][index]} r={index === 3 ? 4 : 3} fill="currentColor" />
        ))}
      </svg>
    </div>
  );
}

function MiniNumericalStepsVisual({ stroke, fill, softFill, text }: { stroke: string; fill: string; softFill: string; text: string }) {
  return (
    <div className={`flex h-full items-end justify-center gap-1.5 pb-3 ${text}`}>
      {[0, 1, 2, 3].map((step) => (
        <span key={step} className={`h-6 w-6 rounded border ${stroke} ${step === 3 ? fill : softFill}`} style={{ transform: `translateY(${-step * 3}px)` }} />
      ))}
    </div>
  );
}

function MiniComputationGraphVisual({ stroke, text }: { stroke: string; text: string }) {
  return (
    <div className={`flex h-full items-center justify-center ${text}`}>
      <svg aria-hidden="true" viewBox="0 0 112 56" className="h-14 w-28">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2">
          <path d="M28 20 L54 28 L82 16" />
          <path d="M28 38 L54 28 L82 40" />
        </g>
        {[28, 54, 82].map((cx, index) => (
          <circle key={index} cx={cx} cy={index === 0 ? 20 : index === 1 ? 28 : 16} r="5" fill={index === 1  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="2" />
        ))}
        <circle cx="28" cy="38" r="5" fill="white" stroke="currentColor" strokeWidth="2" className={stroke} />
        <circle cx="82" cy="40" r="5" fill="white" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  );
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

function MiniVectorSpanVisual({ stroke, fill, softFill, text }: { stroke: string; fill: string; softFill: string; text: string }) {
  return (
    <div className={`relative h-full ${text}`}>
      <span className={`absolute left-4 top-6 h-px w-20 ${fill}`} />
      <span className={`absolute left-12 top-3 h-9 w-px ${fill}`} />
      <span className={`absolute left-12 top-6 h-3 w-3 rounded-full ${fill}`} />
      <span className={`absolute left-20 top-3 h-7 w-7 rounded border ${stroke} ${softFill}`} />
    </div>
  );
}

function MiniMatrixGridVisual({ stroke, fill, text }: { stroke: string; fill: string; text: string }) {
  return (
    <div className={`flex h-full items-center justify-center gap-1 ${text}`}>
      {Array.from({ length: 9 }).map((_, index) => (
        <span key={index} className={`h-3 w-3 rounded-sm border ${stroke} ${index % 2 === 0 ? fill : "bg-white"}`} />
      ))}
    </div>
  );
}

function MiniProjectionVisual({ text }: { text: string }) {
  return (
    <div className={`flex h-full items-center justify-center ${text}`}>
      <svg aria-hidden="true" viewBox="0 0 112 56" className="h-14 w-28">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2">
          <path d="M22 42 H90" opacity="0.45" />
          <path d="M36 18 L64 42" />
          <path d="M36 18 L36 42" strokeDasharray="3 3" opacity="0.65" />
        </g>
        <g fill="currentColor">
          <circle cx="36" cy="18" r="4.5" />
          <circle cx="36" cy="42" r="4.5" />
          <circle cx="64" cy="42" r="4.5" />
        </g>
      </svg>
    </div>
  );
}

function MiniTransformAxesVisual({ text }: { text: string }) {
  return (
    <div className={`flex h-full items-center justify-center ${text}`}>
      <svg aria-hidden="true" viewBox="0 0 112 56" className="h-14 w-28">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4">
          <path d="M32 42 L78 42" />
          <path d="M32 42 L32 11" />
          <path d="M58 42 L88 22" opacity="0.75" />
          <path d="M58 42 L48 16" opacity="0.75" />
        </g>
        <g fill="currentColor">
          <circle cx="32" cy="42" r="4" />
          <circle cx="58" cy="42" r="4" />
        </g>
      </svg>
    </div>
  );
}

function MiniDataAxesVisual({ fill, text }: { fill: string; text: string }) {
  return (
    <div className={`relative h-full ${text}`}>
      <span className={`absolute left-6 top-8 h-2 w-2 rounded-full ${fill}`} />
      <span className={`absolute left-10 top-6 h-2 w-2 rounded-full ${fill}`} />
      <span className={`absolute left-14 top-7 h-2 w-2 rounded-full ${fill}`} />
      <span className={`absolute left-20 top-4 h-2 w-2 rounded-full ${fill}`} />
      <span className={`absolute left-28 top-5 h-2 w-2 rounded-full ${fill}`} />
      <span className="absolute left-7 top-8 h-0.5 w-24 rotate-[-16deg] rounded bg-current opacity-75" />
    </div>
  );
}

function MiniLayerVisual({ stroke, fill, text }: { stroke: string; fill: string; text: string }) {
  return (
    <div className={`flex h-full items-center justify-center gap-2 ${text}`}>
      {[0, 1, 2].map((column) => (
        <div key={column} className="grid gap-1">
          {Array.from({ length: column === 1 ? 3 : 2 }).map((_, index) => (
            <span key={index} className={`h-2.5 w-2.5 rounded-full border ${stroke} ${column === 1 ? fill : "bg-white"}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

function MiniFunctionVisual({ text }: { text: string }) {
  return (
    <div className={`flex h-full items-center justify-center ${text}`}>
      <svg aria-hidden="true" viewBox="0 0 112 56" className="h-14 w-28">
        <defs>
          <marker id="function-arrow" markerHeight="5" markerWidth="5" orient="auto" refX="4.5" refY="2.5">
            <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
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
            <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.15" />
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

function PlannedVisual({ chapter, fill, text }: { chapter: Chapter; fill: string; text: string }) {
  const title = chapter.title;

  if (title.includes("여사건")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <rect x="19" y="10" width="90" height="36" rx="2.5" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M19 10 H109 V46 H19 Z M45 18 C58 14 75 20 75 30 C75 41 58 44 45 38 C36 34 36 22 45 18 Z" fillRule="evenodd" fill="currentColor" opacity="0.3" />
          <path d="M45 18 C58 14 75 20 75 30 C75 41 58 44 45 38 C36 34 36 22 45 18 Z" fill="white" stroke="currentColor" strokeWidth="2" />
          <circle cx="31" cy="22" r="2.2" fill="currentColor" opacity="0.56" />
          <circle cx="88" cy="20" r="2.4" fill="currentColor" opacity="0.56" />
          <circle cx="95" cy="36" r="2.8" fill="currentColor" opacity="0.56" />
          <path d="M84 30 H101 M86 39 H100" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.34" />
        </svg>
      </div>
    );
  }

  if (title.includes("합사건") && title.includes("곱사건")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <circle cx="42" cy="27" r="13" fill="currentColor" opacity="0.36" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="56" cy="27" r="13" fill="currentColor" opacity="0.36" stroke="currentColor" strokeWidth="1.8" />
          <path d="M25 43 H73 M83 43 H116" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.26" />
          <circle cx="96" cy="28" r="13" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="108" cy="28" r="13" fill="white" stroke="currentColor" strokeWidth="1.8" opacity="0.82" />
          <path d="M102 16 C108 22 108 34 102 40 C96 34 96 22 102 16 Z" fill="currentColor" opacity="0.86" />
          <path d="M77 21 H82 M77 35 H82" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.45" />
        </svg>
      </div>
    );
  }

  if (title.includes("합사건")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <circle cx="55" cy="28" r="17" fill="currentColor" opacity="0.65" stroke="currentColor" strokeWidth="2" />
          <circle cx="73" cy="28" r="17" fill="currentColor" opacity="0.38" stroke="currentColor" strokeWidth="2" />
          <path d="M41 28 H48 M80 28 H87 M94 28 H106" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" opacity="0.5" />
          <path d="M100 22 V34" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" opacity="0.5" />
        </svg>
      </div>
    );
  }

  if (title.includes("곱사건")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <circle cx="55" cy="28" r="17" fill="white" stroke="currentColor" strokeWidth="2" />
          <circle cx="73" cy="28" r="17" fill="white" stroke="currentColor" strokeWidth="2" opacity="0.82" />
          <path d="M64 13 C72 20 72 36 64 43 C56 36 56 20 64 13 Z" fill="currentColor" opacity="0.86" />
          <path d="M91 25 H105 M98 18 V32" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" opacity="0.55" />
        </svg>
      </div>
    );
  }

  if (title.includes("베이즈")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <g fill="white" stroke="currentColor" strokeWidth="1.8">
            <rect x="25" y="12" width="20" height="14" rx="4" />
            <rect x="25" y="31" width="20" height="14" rx="4" />
            <rect x="73" y="19" width="26" height="18" rx="5" />
          </g>
          <rect x="29" y="16" width="12" height="6" rx="3" fill="currentColor" opacity="0.45" />
          <rect x="29" y="35" width="7" height="6" rx="3" fill="currentColor" opacity="0.45" />
          <rect x="78" y="24" width="16" height="8" rx="4" fill="currentColor" opacity="0.72" />
          <path d="M46 19 C58 19 63 24 72 28" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" opacity="0.5" />
          <path d="M46 38 C58 38 63 33 72 28" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" opacity="0.32" />
          <path d="M38 27 C48 43 62 47 76 40" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" opacity="0.64" />
          <circle cx="38" cy="27" r="3.4" fill="white" stroke="currentColor" strokeWidth="1.45" />
          <circle cx="76" cy="40" r="3.6" fill="currentColor" opacity="0.78" />
          <circle cx="93" cy="14" r="3.2" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (title.includes("조건부")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <rect x="25" y="12" width="52" height="32" rx="6" fill="white" stroke="currentColor" strokeWidth="2" opacity="0.86" />
          <rect x="52" y="12" width="25" height="32" rx="6" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
          {[35, 47, 60, 70, 38, 55, 68].map((cx, index) => {
            const inCondition = cx > 51;
            return (
              <circle
                key={index}
                cx={cx}
                cy={[21, 22, 20, 23, 35, 34, 36][index]}
                r={inCondition ? 3.2 : 2.7}
                className={inCondition ? fill : ""}
                fill={inCondition ? undefined : "white"}
                stroke="currentColor"
                strokeWidth="1.3"
                opacity={inCondition ? 1 : 0.48}
              />
            );
          })}
          <path d="M82 28 H94" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" opacity="0.42" />
          <circle cx="88" cy="28" r="2.6" fill="currentColor" opacity="0.58" />
          <rect x="99" y="18" width="17" height="20" rx="5" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <rect x="103" y="22" width="9" height="12" rx="3" fill="currentColor" opacity="0.72" />
        </svg>
      </div>
    );
  }

  if (title.includes("독립")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <rect x="22" y="15" width="25" height="25" rx="5" fill="white" stroke="currentColor" strokeWidth="1.9" />
          <rect x="53" y="15" width="25" height="25" rx="5" fill="white" stroke="currentColor" strokeWidth="1.9" />
          {[30, 39, 30, 39].map((cx, index) => (
            <circle key={index} cx={cx} cy={[23, 23, 32, 32][index]} r={index === 0 ? 3 : 2.4} fill={index === 0 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.25" opacity={index === 0 ? 1 : 0.66} />
          ))}
          {[61, 70, 61, 70].map((cx, index) => (
            <rect key={index} x={cx - 2.6} y={[20.5, 20.5, 30.5, 30.5][index]} width="5.2" height="5.2" rx="1.1" fill={index === 3 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.25" opacity={index === 3 ? 1 : 0.66} />
          ))}
          <path d="M83 28 H94" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" opacity="0.45" />
          <path d="M89 22 V34" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" opacity="0.45" />
          <rect x="99" y="13" width="20" height="30" rx="4" fill="white" stroke="currentColor" strokeWidth="1.8" />
          <path d="M109 13 V43 M99 28 H119" stroke="currentColor" strokeWidth="1.1" opacity="0.36" />
          <rect x="100.8" y="14.8" width="7" height="11.5" rx="1.5" fill="currentColor" opacity="0.22" stroke="currentColor" strokeWidth="0.9" />
          <rect x="110.8" y="29.8" width="6.8" height="11.2" rx="1.5" fill="currentColor" opacity="0.55" stroke="currentColor" strokeWidth="0.9" />
          <circle cx="109" cy="28" r="3.3" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (title === "확률의 의미") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M29 38 H99 M35 41 V18 M93 41 V18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.3" />
          <path d="M36 34 C48 31 55 25 63 21 C75 15 86 19 94 29" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" opacity="0.58" />
          <path d="M36 34 C48 31 55 25 63 21 C75 15 86 19 94 29 L94 38 H36 Z" fill="currentColor" opacity="0.18" />
          {[39, 51, 63, 75, 87].map((cx, index) => (
            <circle key={cx} cx={cx} cy={[33, 28, 21, 19, 25][index]} r={index === 2 ? 4 : 3} fill={index === 2 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.45" opacity={index === 2 ? 1 : 0.78} />
          ))}
          <path d="M44 45 H84 M44 42 V48 M84 42 V48" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.4" />
        </svg>
      </div>
    );
  }

  if (title.includes("표본공간")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <rect x="29" y="13" width="70" height="30" rx="6" fill="white" stroke="currentColor" strokeWidth="2" opacity="0.8" />
          <path d="M61 13 H99 V43 H61 C69 36 69 20 61 13 Z" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="1.5" />
          {[42, 55, 68, 81, 42, 55, 68, 81].map((cx, index) => {
            const selected = index === 2 || index === 3 || index === 6;
            return <circle key={index} cx={cx} cy={index < 4 ? 23 : 34} r={selected ? 3.8 : 3} fill={selected  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.5" opacity={selected ? 1 : 0.7} />;
          })}
        </svg>
      </div>
    );
  }

  if (title.includes("경우의 수")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M39 28 L61 18 M39 28 L61 38 M67 18 L89 14 M67 18 L89 23 M67 38 L89 34 M67 38 L89 43" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.72" />
          <circle cx="39" cy="28" r="4.5" fill="currentColor" />
          {[61, 61, 89, 89, 89, 89].map((cx, index) => (
            <rect key={index} x={cx - 4} y={[14, 34, 10, 19, 30, 39][index]} width="8" height="8" rx="2" fill="white" stroke="currentColor" strokeWidth="1.5" />
          ))}
        </svg>
      </div>
    );
  }

  if (title === "확률변수") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <rect x="24" y="14" width="32" height="28" rx="6" fill="white" stroke="currentColor" strokeWidth="2" />
          {[34, 46, 38, 48].map((cx, index) => (
            <circle key={index} cx={cx} cy={[23, 24, 34, 35][index]} r={index === 2 ? 3.4 : 2.8} fill={index === 2 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.35" opacity={index === 2 ? 1 : 0.72} />
          ))}
          <path d="M59 28 H72" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
          <path d="M68 23 L74 28 L68 33" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
          <path d="M82 39 H112 M88 42 V16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          {[90, 99, 108].map((cx, index) => (
            <g key={cx}>
              <path d={`M${cx} 39 V${[29, 22, 33][index]}`} stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.42" />
              <circle cx={cx} cy={[29, 22, 33][index]} r={index === 1 ? 4 : 3.1} fill={index === 1 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.4" opacity={index === 1 ? 1 : 0.78} />
            </g>
          ))}
          <path d="M91 45 H108 M91 42 V48 M108 42 V48" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" opacity="0.36" />
        </svg>
      </div>
    );
  }

  if (title.includes("베르누이")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M30 42 H98 M36 44 V15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.26" />
          <rect x="44" y="30" width="14" height="12" rx="2.5" fill="white" stroke="currentColor" strokeWidth="1.7" />
          <rect x="75" y="16" width="14" height="26" rx="2.5" fill="currentColor" opacity="0.78" stroke="currentColor" strokeWidth="1.7" />
          <path d="M51 42 V47 M82 42 V47" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.34" />
          <path d="M47 49 H55 M78 49 H86" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.44" />
          <circle cx="51" cy="24" r="5.2" fill="white" stroke="currentColor" strokeWidth="1.6" />
          <path d="M48 24 H54" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" opacity="0.58" />
          <circle cx="82" cy="9.5" r="5.2" fill="currentColor" opacity="0.9" />
          <path d="M78.5 9.5 L81 12 L86 7" fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.35" opacity="0.9" />
          <path d="M62 24 C67 19 70 17 75 17" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.42" />
          <path d="M62 36 C67 39 70 39 75 37" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.26" />
          <circle cx="109" cy="20" r="3.2" fill="currentColor" opacity="0.72" />
          <circle cx="109" cy="36" r="3.2" fill="white" stroke="currentColor" strokeWidth="1.4" opacity="0.78" />
        </svg>
      </div>
    );
  }

  if (title.includes("이항")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M24 43 H58 M68 43 H111" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.26" />
          {[0, 1, 2, 3, 4].map((index) => (
            <g key={index}>
              <rect x={25 + index * 7} y={index % 2 === 0 ? 18 : 28} width="10" height="10" rx="2.5" fill={[1, 2, 4].includes(index) ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.35" opacity={[1, 2, 4].includes(index) ? 0.86 : 0.8} />
              <path d={`M${30 + index * 7} ${index % 2 === 0 ? 28 : 38} V43`} stroke="currentColor" strokeLinecap="round" strokeWidth="1.1" opacity="0.22" />
            </g>
          ))}
          <path d="M60 30 H69" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" opacity="0.5" />
          <path d="M66 25 L72 30 L66 35" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.35" opacity="0.62" />
          {[77, 87, 97, 107].map((cx, index) => {
            const height = [7, 16, 24, 13][index];
            return <rect key={cx} x={cx - 4} y={43 - height} width="8" height={height} rx="1.5" fill={index === 2 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.35" opacity={index === 2 ? 0.88 : 0.9} />;
          })}
          <circle cx="97" cy="15" r="3.2" fill="currentColor" opacity="0.72" />
          <path d="M77 48 H107 M77 45 V51 M107 45 V51" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" opacity="0.34" />
        </svg>
      </div>
    );
  }

  if (title.includes("정규") || (title.includes("분포") && !title.includes("확률분포 시각화"))) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M25 42 H104 M31 45 V16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.32" />
          <path d="M37 41 C47 41 49 17 65 17 C82 17 84 41 96 41" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.6" />
          <path d="M53 41 C56 31 60 23 65 23 C71 23 75 31 78 41 Z" fill="currentColor" opacity="0.76" stroke="currentColor" strokeWidth="1.5" />
          <path d="M65 17 V44 M52 42 V35 M78 42 V35" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.48" />
          <path d="M42 45 C52 50 78 50 89 45" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.42" />
          <circle cx="65" cy="23" r="3.7" fill="white" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </div>
    );
  }

  if (title.includes("이산확률변수")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M28 42 H103 M34 44 V16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.3" />
          {[43, 57, 71, 85].map((cx, index) => (
            <rect key={cx} x={cx - 5} y={42 - [9, 22, 15, 7][index]} width="10" height={[9, 22, 15, 7][index]} rx="2" fill={index === 1 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.45" opacity={index === 1 ? 0.9 : 0.86} />
          ))}
          <circle cx="57" cy="15" r="3.2" fill="currentColor" opacity="0.78" />
          <path d="M42 47 H86 M42 44 V50 M86 44 V50" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.34" />
        </svg>
      </div>
    );
  }

  if (title.includes("샘플링") || title.includes("난수")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <ellipse cx="51" cy="25" rx="29" ry="15" fill="white" stroke="currentColor" strokeWidth="2" />
          {[
            { cx: 36, cy: 22, selected: false },
            { cx: 45, cy: 18, selected: true },
            { cx: 55, cy: 27, selected: false },
            { cx: 64, cy: 21, selected: true },
            { cx: 42, cy: 31, selected: false },
            { cx: 58, cy: 34, selected: true },
          ].map(({ cx, cy, selected }, index) => (
            <circle key={index} cx={cx} cy={cy} r={selected ? 3.4 : 2.6} fill={selected ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.3" opacity={selected ? 1 : 0.66} />
          ))}
          <path d="M82 40 H113 M82 37 V43 M113 37 V43" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.38" />
          {[89, 99, 109].map((cx, index) => (
            <rect key={cx} x={cx - 4.5} y={[28, 22, 31][index]} width="9" height="9" rx="2.2" fill={index === 1 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.4" opacity={index === 1 ? 0.9 : 0.84} />
          ))}
          <path d="M45 36 C55 45 77 47 93 37" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.3" />
        </svg>
      </div>
    );
  }

  if (title === "기대값") {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M28 34 H101" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" opacity="0.58" />
          <path d="M61 34 L52 46 H70 Z" fill="white" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          {[38, 50, 73, 90].map((cx, index) => (
            <g key={cx}>
              <path d={`M${cx} 34 V${[24, 19, 22, 27][index]}`} stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" opacity="0.42" />
              <circle
                cx={cx}
                cy={[24, 19, 22, 27][index]}
                r={[3.2, 4.6, 3.8, 2.8][index]}
                className={index === 1 ? fill : ""}
                fill={index === 1 ? undefined : "white"}
                stroke="currentColor"
                strokeWidth="1.5"
                opacity={index === 1 ? 1 : 0.82}
              />
            </g>
          ))}
          <circle cx="61" cy="34" r="4.3" fill="currentColor" />
          <path d="M46 46 H76" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" opacity="0.36" />
        </svg>
      </div>
    );
  }

  if (title.includes("표본평균")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <rect x="25" y="16" width="35" height="25" rx="5" fill="white" stroke="currentColor" strokeWidth="2" />
          {[34, 43, 52, 37, 49].map((cx, index) => (
            <circle
              key={index}
              cx={cx}
              cy={[24, 21, 28, 35, 34][index]}
              r={index === 2 ? 3.4 : 2.7}
              className={index === 2 ? fill : ""}
              fill={index === 2 ? undefined : "white"}
              stroke="currentColor"
              strokeWidth="1.35"
              opacity={index === 2 ? 1 : 0.74}
            />
          ))}
          <path d="M64 28 H77" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" opacity="0.35" />
          <circle cx="70.5" cy="28" r="2.8" fill="currentColor" opacity="0.55" />
          <path d="M83 38 H111 M88 41 V17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.28" />
          <path d="M90 32 H105" stroke="currentColor" strokeLinecap="round" strokeWidth="5" opacity="0.12" />
          <path d="M90 32 H105" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
          <circle cx="98" cy="32" r="5" fill="currentColor" />
          <path d="M88 19 H106 M97 19 V32" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.42" />
          <path d="M31 46 H55 M31 43 V49 M55 43 V49" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.38" />
        </svg>
      </div>
    );
  }

  if (title.includes("표본분산")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M25 41 H104 M31 43 V16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.28" />
          <path d="M63 16 V44" stroke="currentColor" strokeLinecap="round" strokeWidth="1.85" opacity="0.58" />
          {[
            [39, 35],
            [50, 25],
            [76, 23],
            [91, 34],
          ].map(([cx, cy], index) => (
            <g key={index}>
              <path d={`M${cx} ${cy} H63`} stroke="currentColor" strokeLinecap="round" strokeWidth="5" opacity="0.1" />
              <path d={`M${cx} ${cy} H63`} stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.52" />
              <circle cx={cx} cy={cy} r={index === 3 ? 3.8 : 3} fill={index === 3  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.45" />
            </g>
          ))}
          <circle cx="63" cy="30" r="4.2" fill="currentColor" />
          <path d="M46 48 H82 M46 45 V51 M82 45 V51" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.36" />
          <path d="M98 18 L102 14 M103 14 L107 18 M99 26 L104 21 M105 21 L110 26" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.52" />
        </svg>
      </div>
    );
  }

  if (title.includes("분산") || title.includes("표준편차")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M29 41 H101" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.28" />
          <path d="M65 16 V45" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" opacity="0.56" />
          <path d="M49 25 C55 20 75 20 81 25 L81 41 H49 Z" fill="currentColor" opacity="0.16" stroke="currentColor" strokeWidth="1.5" />
          <path d="M38 33 C48 19 82 19 92 33" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.1" opacity="0.72" />
          <path d="M49 47 H81 M49 43 V50 M81 43 V50" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" opacity="0.62" />
          <path d="M38 47 H92 M38 45 V49 M92 45 V49" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" opacity="0.32" />
          {[49, 57, 65, 73, 81].map((cx, index) => (
            <circle key={cx} cx={cx} cy={[33, 27, 22, 27, 33][index]} r={index === 2 ? 4.1 : 2.8} fill={index === 2  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.4" opacity={index === 2 ? 1 : 0.78} />
          ))}
        </svg>
      </div>
    );
  }

  if (title.includes("확률분포 시각화")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M25 42 H104 M31 45 V15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.28" />
          {[40, 50, 60, 70, 80].map((cx, index) => {
            const height = [8, 18, 25, 17, 9][index];
            return <rect key={cx} x={cx - 4} y={42 - height} width="8" height={height} rx="1.3" fill={index === 2 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.35" opacity={index === 2 ? 0.88 : 0.92} />;
          })}
          <path d="M36 39 C47 24 58 19 70 24 C80 28 89 35 98 38" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.72" />
          <rect x="104" y="17" width="15" height="22" rx="4" fill="white" stroke="currentColor" strokeWidth="1.7" />
          <path d="M108 23 H115 M108 29 H114 M108 35 H116" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.56" />
        </svg>
      </div>
    );
  }

  if (title.includes("모집단과 표본")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <ellipse cx="64" cy="28" rx="42" ry="18" fill="white" stroke="currentColor" strokeWidth="2" />
          <ellipse cx="69" cy="27" rx="16" ry="10" fill="currentColor" opacity="0.1" stroke="currentColor" strokeDasharray="3 3" strokeWidth="1.6" />
          {[
            { cx: 38, cy: 24, sample: false },
            { cx: 48, cy: 34, sample: false },
            { cx: 57, cy: 21, sample: false },
            { cx: 64, cy: 32, sample: true },
            { cx: 72, cy: 23, sample: true },
            { cx: 82, cy: 31, sample: true },
            { cx: 91, cy: 23, sample: false },
          ].map(({ cx, cy, sample }, index) => (
            <circle key={index} cx={cx} cy={cy} r={sample ? 3.5 : 2.7} fill={sample ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.35" opacity={sample ? 1 : 0.68} />
          ))}
          <path d="M43 47 H85 M43 44 V50 M85 44 V50" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.36" />
          <path d="M102 18 C109 22 112 29 110 37" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.34" />
        </svg>
      </div>
    );
  }

  if (title.includes("모델 평가") || title.includes("오차")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M24 42 H75 M30 45 V15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.28" />
          <path d="M35 37 L70 20" stroke="currentColor" strokeLinecap="round" strokeWidth="2" opacity="0.58" />
          {[40, 51, 62].map((cx, index) => {
            const actualY = [28, 38, 25][index];
            const fitY = [34, 29, 24][index];
            return (
              <g key={cx}>
                <path d={`M${cx} ${actualY} V${fitY}`} stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" opacity="0.62" />
                <circle cx={cx} cy={actualY} r={index === 1 ? 4 : 3.1} fill={index === 1  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.5" />
              </g>
            );
          })}
          <rect x="85" y="15" width="24" height="26" rx="5" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M91 23 H103 M91 30 H100 M91 37 H96" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.5" />
          <path d="M104 19 L109 24 L118 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <circle cx="97" cy="30" r="3.5" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (title.includes("신뢰구간")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M27 45 H102 M65 14 V47" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          {[
            { x1: 39, x2: 78, y: 20, covers: true },
            { x1: 48, x2: 86, y: 29, covers: true },
            { x1: 31, x2: 60, y: 38, covers: false },
          ].map(({ x1, x2, y, covers }, index) => (
            <g key={index} opacity={covers ? 1 : 0.62}>
              <path d={`M${x1} ${y} H${x2} M${x1} ${y - 5} V${y + 5} M${x2} ${y - 5} V${y + 5}`} stroke="currentColor" strokeLinecap="round" strokeWidth={covers ? 2.15 : 1.75} />
              <circle cx={(x1 + x2) / 2} cy={y} r={covers ? 3.4 : 2.8} fill={covers ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.35" />
            </g>
          ))}
          <circle cx="65" cy="29" r="4.5" fill="white" stroke="currentColor" strokeWidth="1.6" />
          <path d="M91 18 L96 23 L105 13" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" opacity="0.58" />
          <path d="M91 36 L101 46 M101 36 L91 46" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.44" />
        </svg>
      </div>
    );
  }

  if (title.includes("추정")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <ellipse cx="42" cy="29" rx="22" ry="15" fill="white" stroke="currentColor" strokeWidth="2" />
          {[31, 40, 50, 36, 47].map((cx, index) => (
            <circle key={index} cx={cx} cy={[24, 21, 27, 36, 35][index]} r={index === 2 ? 3.4 : 2.5} fill={index === 2 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.35" opacity={index === 2 ? 1 : 0.72} />
          ))}
          <path d="M65 29 H79" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" opacity="0.34" />
          <circle cx="72" cy="29" r="2.7" fill="currentColor" opacity="0.55" />
          <path d="M87 40 H116 M94 43 V16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.28" />
          <circle cx="103" cy="29" r="11" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="1.5" />
          <path d="M103 19 V39 M93 29 H113" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.44" />
          <circle cx="103" cy="29" r="5.2" fill="currentColor" />
          <path d="M84 18 L90 24 M90 18 L84 24" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.44" />
          <path d="M114 17 L118 21 L124 13" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.55" opacity="0.58" />
        </svg>
      </div>
    );
  }

  if (title.includes("가설검정")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M26 42 H105 M32 45 V15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.3" />
          <path d="M36 40 C47 18 61 18 72 39 C81 32 91 28 101 28" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.25" />
          <path d="M87 42 V29 H104 V42 Z" fill="currentColor" opacity="0.46" stroke="currentColor" strokeWidth="1.4" />
          <path d="M86 17 V44" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" opacity="0.58" />
          <circle cx="96" cy="28" r="4" fill="currentColor" />
          <path d="M103 17 L108 22 L117 12" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" opacity="0.74" />
        </svg>
      </div>
    );
  }

  if (title.includes("회귀")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M28 42 H103 M34 45 V16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.3" />
          {[40, 50, 61, 72, 83, 94].map((cx, index) => {
            const actualY = [36, 31, 32, 23, 24, 17][index];
            const fitY = [37, 33, 29, 25, 21, 17][index];
            return (
              <g key={cx}>
                <path d={`M${cx} ${actualY} V${fitY}`} stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" opacity="0.45" />
                <circle cx={cx} cy={actualY} r={index === 3 ? 4 : 3} fill={index === 3 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.45" />
              </g>
            );
          })}
          <path d="M35 39 L96 16" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" opacity="0.72" />
        </svg>
      </div>
    );
  }

  if (title.includes("상관")) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${text}`}>
        <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
          <path d="M27 42 H103 M34 45 V15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" opacity="0.28" />
          <ellipse cx="66" cy="29" rx="34" ry="11" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="1.8" transform="rotate(-24 66 29)" />
          {[
            [41, 36],
            [50, 32],
            [58, 34],
            [66, 28],
            [75, 25],
            [84, 21],
            [92, 24],
          ].map(([cx, cy], index) => (
            <circle key={index} cx={cx} cy={cy} r={index === 3 ? 4 : 2.9} fill={index === 3 ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.45" opacity={index === 3 ? 1 : 0.82} />
          ))}
          <path d="M44 45 H91 M44 48 V42 M91 48 V42" stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" opacity="0.34" />
          <path d="M101 20 C108 24 111 30 111 38" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.65" opacity="0.42" />
          <path d="M105 36 H117 M111 30 V42" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" opacity="0.42" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex h-full w-full items-center justify-center ${text}`}>
      <svg aria-hidden="true" viewBox="0 0 128 56" className="h-full w-full">
        <path d="M30 39 H101 M36 42 V17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.28" />
        {[41, 53, 65, 77, 89].map((cx, index) => (
          <circle key={cx} cx={cx} cy={[33, 25, 37, 21, 30][index]} r={index === chapter.order % 5 ? 4 : 3.1} fill={index === chapter.order % 5  ? "currentColor" : "white"} stroke="currentColor" strokeWidth="1.5" />
        ))}
      </svg>
    </div>
  );
}
