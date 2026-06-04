import Link from "next/link";
import { notFound } from "next/navigation";
import { getChapter, getChapterNavigation, getReadyChapters } from "@/lib/chapters";
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

  const readyChapters = getReadyChapters();
  const { previous, next } = getChapterNavigation(slug);
  const Content = (await loader()).default;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 sm:p-8">
          <p className="text-sm font-bold text-teal-700">
            Chapter {String(chapter.order).padStart(2, "0")}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {chapter.title}
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-700">{chapter.description}</p>
          <nav aria-label="모바일 챕터 이동" className="mt-5 grid gap-2 sm:grid-cols-2 lg:hidden">
            {previous ? (
              <Link
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-center text-sm font-black text-slate-800"
                href={`/chapters/${previous.slug}`}
              >
                이전: {previous.shortTitle}
              </Link>
            ) : null}
            {next ? (
              <Link
                className="rounded-md bg-slate-950 px-4 py-2 text-center text-sm font-black text-white"
                href={`/chapters/${next.slug}`}
              >
                다음: {next.shortTitle}
              </Link>
            ) : null}
          </nav>
          <div className="relative mt-5 lg:hidden">
            <nav aria-label="챕터 섹션 바로가기" className="flex gap-2 overflow-x-auto pb-1 pr-10">
              {sectionLinks.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="shrink-0 rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-700"
                >
                  {section.label}
                </a>
              ))}
            </nav>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent" aria-hidden="true" />
            <p className="mt-1 text-right text-[11px] font-bold text-slate-400">오른쪽으로 더 보기</p>
          </div>
          <div className="math-content mt-8">
            <Content />
          </div>
        </article>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 lg:sticky lg:top-6">
          <h2 className="text-sm font-bold text-slate-500">챕터 안에서</h2>
          <nav className="mt-3 grid gap-1 border-b border-slate-200 pb-4" aria-label="챕터 섹션">
            {sectionLinks.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-md px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
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
                }`}
              >
                {item.order}. {item.title}
              </Link>
            ))}
          </div>
          <div className="mt-6 grid gap-2 border-t border-slate-200 pt-4">
            {previous ? (
              <Link className="text-sm font-bold text-slate-700 hover:text-teal-700" href={`/chapters/${previous.slug}`}>
                이전: {previous.title}
              </Link>
            ) : null}
            {next ? (
              <Link className="text-sm font-bold text-slate-700 hover:text-teal-700" href={`/chapters/${next.slug}`}>
                다음: {next.title}
              </Link>
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
}
