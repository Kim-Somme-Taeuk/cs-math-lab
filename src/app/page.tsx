import Link from "next/link";
import { ReadySubjectSummary } from "@/components/home/ReadySubjectSummary";
import { roadmapSubjects } from "@/lib/chapters";

const activeSubjects = roadmapSubjects.filter((subject) => subject.status === "active");

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
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
              처음이라면 조건문, 테스트, 필터링의 기반이 되는 이산수학 Level 1의 명제와 논리부터 시작하면 됩니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/chapters/logic"
                className="rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              >
                첫 챕터 시작
              </Link>
              <Link
                href="/roadmap"
                className="rounded-md bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              >
                로드맵 보기
              </Link>
            </div>
          </div>
          <ReadySubjectSummary subjects={activeSubjects} />
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
              className="rounded-lg border border-slate-200 bg-white p-5 hover:border-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
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
                  {subject.status === "active" ? "학습 가능" : "계획 중"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{subject.description}</p>
              {subject.status === "planned" ? (
                <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800">
                  아직 공개 전입니다. 현재는 계획 목록만 볼 수 있습니다.
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      </section>

    </main>
  );
}
