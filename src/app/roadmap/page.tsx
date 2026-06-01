import Link from "next/link";
import { chapters } from "@/lib/chapters";

export default function RoadmapPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-bold text-teal-700">Discrete Math Roadmap</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          이산수학 입문 로드맵
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          논리에서 시작해 집합, 함수, 관계, 귀납법, 경우의 수, 그래프로 이어지는
          순서입니다. 각 챕터는 다음 전공 과목을 이해하기 위한 도구로 설계됩니다.
        </p>
      </div>

      <ol className="mt-10 grid gap-4">
        {chapters.map((chapter) => (
          <li key={chapter.slug} className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-bold text-slate-700">
                    {chapter.order}
                  </span>
                  <h2 className="text-xl font-bold text-slate-950">{chapter.title}</h2>
                  <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">
                    {chapter.status === "ready" ? "완성" : "초안"}
                  </span>
                </div>
                <p className="mt-3 leading-7 text-slate-700">{chapter.description}</p>
                <p className="mt-2 text-sm font-medium text-slate-500">CS 연결: {chapter.csConnection}</p>
              </div>
              <Link
                href={`/chapters/${chapter.slug}`}
                className="rounded-md border border-slate-300 px-4 py-2 text-center text-sm font-bold text-slate-800 hover:bg-slate-100"
              >
                열기
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
