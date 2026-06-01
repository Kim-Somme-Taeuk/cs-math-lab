import Link from "next/link";
import { chapters } from "@/lib/chapters";

const readyChapters = chapters.filter((chapter) => chapter.status === "ready");

export default function Home() {
  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-bold text-teal-700">컴공생을 위한 수학 학습 실험실</p>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              수학 개념을 전공 맥락과 직접 연결합니다.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              CS Math Lab은 이산수학의 핵심 개념을 직관적인 설명, 인터랙티브 예제,
              손풀이 문제, 코드 연결로 학습하는 정적 웹사이트입니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/chapters/logic"
                className="rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
              >
                첫 챕터 시작
              </Link>
              <Link
                href="/roadmap"
                className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-100"
              >
                로드맵 보기
              </Link>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="grid gap-3">
              {readyChapters.map((chapter) => (
                <Link
                  key={chapter.slug}
                  href={`/chapters/${chapter.slug}`}
                  className="rounded-md border border-slate-200 bg-white p-4 hover:border-teal-500"
                >
                  <p className="text-sm font-bold text-teal-700">
                    {String(chapter.order).padStart(2, "0")}
                  </p>
                  <h2 className="mt-1 font-bold text-slate-950">{chapter.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{chapter.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-12 md:grid-cols-3">
        {[
          ["왜 배우는가", "정의부터 외우기보다 자료구조, 알고리즘, 조건문과의 연결을 먼저 봅니다."],
          ["직접 조작한다", "진리표와 집합 연산을 바꿔 보며 결과가 어떻게 달라지는지 확인합니다."],
          ["확장 가능하다", "MDX 콘텐츠와 React 컴포넌트를 분리해 선형대수, 확률통계로 넓힐 수 있습니다."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-slate-950">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
