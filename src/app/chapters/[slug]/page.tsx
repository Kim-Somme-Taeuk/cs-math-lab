import Link from "next/link";
import { notFound } from "next/navigation";
import ChapterAiChatbot from "@/components/interactive/ChapterAiChatbot";
import { ChapterSlugProvider } from "@/components/interactive/ChapterSlugProvider";
import { getChapter, getChapterNavigation, getReadyChapters, getReadyChaptersInSameLevel } from "@/lib/chapters";
import { chapterContentLoaders } from "@/lib/content";

const sectionLinks = [
  { id: "why", label: "왜 배우나" },
  { id: "intuition", label: "감 잡기" },
  { id: "definition", label: "핵심 정의" },
  { id: "pitfalls", label: "헷갈리는 지점" },
  { id: "practice", label: "직접 실험" },
  { id: "code", label: "코드로 읽기" },
  { id: "cs-context", label: "전공 맥락" },
  { id: "review", label: "종합 점검" },
  { id: "next", label: "다음으로" },
];

type ChapterPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getReadyChapters().map((chapter) => ({ slug: chapter.slug }));
}

export async function generateMetadata({ params }: ChapterPageProps) {
  const { slug } = await params;
  const chapter = getChapter(slug);

  if (!chapter || chapter.status !== "ready") {
    return {};
  }

  return {
    title: `${chapter.title} | CS Math Lab`,
    description: chapter.description,
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  const loader = chapterContentLoaders[slug];

  if (!chapter || chapter.status !== "ready" || !loader) {
    notFound();
  }

  const readyChapters = getReadyChaptersInSameLevel(slug);
  const { previous, next } = getChapterNavigation(slug);
  const Content = (await loader()).default;
  const estimatedMinutes = chapter.level === 1 ? "10-15분" : chapter.level === 2 ? "15-20분" : "20분 내외";
  const conceptSummary = chapter.conceptTags?.slice(0, 3).join(", ") ?? chapter.csConnection;

  return (
    <main className="mx-auto max-w-6xl px-0 py-0 sm:px-5 sm:py-10">
      <ChapterAiChatbot slug={slug} chapterTitle={chapter.title} />
      <details className="group fixed bottom-4 left-4 z-40 lg:hidden">
        <summary className="flex h-11 w-11 list-none items-center justify-center rounded-full bg-slate-950/55 text-white shadow-lg shadow-slate-900/20 backdrop-blur marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500">
          <span className="sr-only">챕터 이동 열기</span>
          <span className="grid gap-1" aria-hidden="true">
            <span className="block h-0.5 w-5 rounded-full bg-white" />
            <span className="block h-0.5 w-5 rounded-full bg-white" />
            <span className="block h-0.5 w-5 rounded-full bg-white" />
          </span>
        </summary>
        <div className="absolute bottom-14 left-0 w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
          <div className="max-h-[72vh] overflow-y-auto p-4">
            <h2 className="text-sm font-bold text-slate-500">챕터 안에서</h2>
            <nav className="mt-3 grid grid-cols-2 gap-1 border-b border-slate-200 pb-4" aria-label="모바일 챕터 섹션">
              {sectionLinks.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                >
                  {section.label}
                </a>
              ))}
            </nav>
            <h2 className="mt-4 text-sm font-bold text-slate-500">챕터 이동</h2>
            <div className="mt-3 grid gap-1">
              {readyChapters.map((item) => (
                <Link
                  key={item.slug}
                  href={`/chapters/${item.slug}`}
                  className={`rounded-md px-3 py-2 text-sm font-semibold ${
                    item.slug === slug
                      ? "bg-slate-950 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500`}
                >
                  {item.order}. {item.title}
                </Link>
              ))}
            </div>
            <div className="mt-4 grid gap-2 border-t border-slate-200 pt-4">
              {previous ? (
                <Link className="rounded-md border border-slate-300 px-3 py-2 text-sm font-black text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500" href={`/chapters/${previous.slug}`}>
                  이전: {previous.shortTitle}
                </Link>
              ) : null}
              {next ? (
                <Link className="rounded-md bg-slate-950 px-3 py-2 text-sm font-black text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500" href={`/chapters/${next.slug}`}>
                  다음: {next.shortTitle}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </details>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article className="min-w-0 border-y border-slate-200 bg-white p-4 sm:rounded-lg sm:border sm:p-8">
          <p className="text-sm font-bold text-teal-700">
            Level {chapter.level}-{chapter.order}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {chapter.title}
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-700">{chapter.description}</p>
          <dl className="mt-5 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-black text-slate-500">학습량</dt>
              <dd className="mt-1 font-bold text-slate-800">{estimatedMinutes}</dd>
            </div>
            <div>
              <dt className="font-black text-slate-500">주요 개념</dt>
              <dd className="mt-1 font-bold text-slate-800">{conceptSummary}</dd>
            </div>
            <div>
              <dt className="font-black text-slate-500">전공 연결</dt>
              <dd className="mt-1 font-bold text-slate-800">{chapter.csConnection}</dd>
            </div>
          </dl>
          <div className="math-content mt-8">
            <ChapterSlugProvider slug={slug}>
              <Content />
            </ChapterSlugProvider>
          </div>
        </article>

        <aside className="hidden h-fit rounded-lg border border-slate-200 bg-white p-5 lg:sticky lg:top-6 lg:block">
          <h2 className="text-sm font-bold text-slate-500">챕터 안에서</h2>
          <nav className="mt-3 grid gap-1 border-b border-slate-200 pb-4" aria-label="챕터 섹션">
            {sectionLinks.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-md px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              >
                {section.label}
              </a>
            ))}
          </nav>
          <h2 className="mt-4 text-sm font-bold text-slate-500">챕터 이동</h2>
          <div className="mt-4 grid gap-2">
            {readyChapters.map((item) => (
              <Link
                key={item.slug}
                href={`/chapters/${item.slug}`}
                className={`rounded-md px-3 py-2 text-sm font-semibold ${
                  item.slug === slug
                    ? "bg-slate-950 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500`}
              >
                {item.order}. {item.title}
              </Link>
            ))}
          </div>
          <div className="mt-6 grid gap-2 border-t border-slate-200 pt-4">
            {previous ? (
              <Link className="text-sm font-bold text-slate-700 hover:text-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500" href={`/chapters/${previous.slug}`}>
                이전: {previous.title}
              </Link>
            ) : null}
            {next ? (
              <Link className="text-sm font-bold text-slate-700 hover:text-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500" href={`/chapters/${next.slug}`}>
                다음: {next.title}
              </Link>
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
}
