import Link from "next/link";
import { notFound } from "next/navigation";
import { getChapter, getChapterNavigation, getReadyChapters } from "@/lib/chapters";
import { chapterContentLoaders } from "@/lib/content";

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
          <div className="math-content mt-8">
            <Content />
          </div>
        </article>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 lg:sticky lg:top-6">
          <h2 className="text-sm font-bold text-slate-500">챕터 이동</h2>
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
                {item.order}. {item.shortTitle}
              </Link>
            ))}
          </div>
          <div className="mt-6 grid gap-2 border-t border-slate-200 pt-4">
            {previous ? (
              <Link className="text-sm font-bold text-slate-700 hover:text-teal-700" href={`/chapters/${previous.slug}`}>
                이전: {previous.shortTitle}
              </Link>
            ) : null}
            {next ? (
              <Link className="text-sm font-bold text-slate-700 hover:text-teal-700" href={`/chapters/${next.slug}`}>
                다음: {next.shortTitle}
              </Link>
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
}
