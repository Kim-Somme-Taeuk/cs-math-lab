import Link from "next/link";
import { chapters, roadmapSubjects } from "@/lib/chapters";

const readyChapters = chapters.filter((chapter) => chapter.status === "ready");
const activeSubject = roadmapSubjects.find((subject) => subject.status === "active");

export default function Home() {
  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-bold text-teal-700">컴공생을 위한 수학 학습 실험실</p>
            <h1 className="max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-[2.85rem] lg:leading-tight">
              수학 개념을 전공 맥락과
              <br className="hidden sm:block" /> 직접 연결합니다.
            </h1>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/chapters/logic"
                className="rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
              >
                첫 챕터 시작
              </Link>
              <Link
                href="/roadmap"
                className="rounded-md bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
              >
                로드맵 보기
              </Link>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-500">현재 공개 중</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">{activeSubject?.title} Level 1</h2>
              </div>
              <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">
                {readyChapters.length}개 챕터
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {readyChapters.map((chapter) => (
                <Link
                  key={chapter.slug}
                  href={`/chapters/${chapter.slug}`}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 hover:border-teal-500"
                >
                  <p className="text-xs font-bold text-teal-700">
                    {String(chapter.order).padStart(2, "0")}
                  </p>
                  <h2 className="mt-0.5 text-sm font-bold text-slate-950">{chapter.title}</h2>
                </Link>
              ))}
            </div>
            <Link
              href="/roadmap"
              className="mt-4 inline-flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100"
            >
              전체 로드맵 보기
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-teal-700">Math Subjects</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">대주제별 학습 구조</h2>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {roadmapSubjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/subjects/${subject.id}`}
              className="rounded-lg border border-slate-200 bg-white p-5 hover:border-teal-500"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-black text-slate-950">{subject.title}</h3>
                <span
                  className={`rounded-md px-2 py-1 text-xs font-bold ${
                    subject.status === "active"
                      ? "bg-teal-50 text-teal-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {subject.status === "active" ? "진행 중" : "예정"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{subject.description}</p>
            </Link>
          ))}
        </div>
      </section>

    </main>
  );
}
