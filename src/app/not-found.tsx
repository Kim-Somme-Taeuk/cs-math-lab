import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-sm font-bold text-teal-700">페이지를 찾을 수 없습니다</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
        공개된 학습 경로에서 다시 시작하세요.
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-600">
        주소가 바뀌었거나 아직 공개되지 않은 챕터일 수 있습니다. 로드맵에서 현재 공개 중인 과목과 챕터를 확인할 수 있습니다.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/roadmap" className="rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">
          로드맵 보기
        </Link>
        <Link href="/" className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-100">
          홈으로 가기
        </Link>
      </div>
    </main>
  );
}
