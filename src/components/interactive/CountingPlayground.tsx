"use client";

import { useState } from "react";

const allItems = ["A", "B", "C", "D", "E"];

function factorial(n: number): number {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

function permutations(n: number, r: number) {
  return factorial(n) / factorial(n - r);
}

function combinations(n: number, r: number) {
  return permutations(n, r) / factorial(r);
}

function repeatedCombinations(n: number, r: number) {
  return combinations(n + r - 1, r);
}

function buildResults(source: string[], r: number, ordered: boolean, repeated: boolean): string[] {
  const results: string[] = [];

  function visit(path: string[], start: number) {
    if (path.length === r) {
      results.push(ordered ? path.join("") : `{${path.join(",")}}`);
      return;
    }

    source.forEach((item, index) => {
      if (!repeated && path.includes(item)) return;
      if (!ordered && index < start) return;
      visit([...path, item], repeated || ordered ? index : index + 1);
    });
  }

  visit([], 0);
  return results;
}

export default function CountingPlayground() {
  const [r, setR] = useState(2);
  const [targetCount, setTargetCount] = useState(4);
  const [ordered, setOrdered] = useState(true);
  const [repeated, setRepeated] = useState(false);
  const items = allItems.slice(0, targetCount);
  const n = items.length;
  const maxR = repeated ? 4 : n;
  const effectiveR = Math.min(r, maxR);
  const examples = buildResults(items, effectiveR, ordered, repeated);
  const count = ordered
    ? repeated
      ? n ** effectiveR
      : permutations(n, effectiveR)
    : repeated
      ? repeatedCombinations(n, effectiveR)
      : combinations(n, effectiveR);
  const formula = ordered
    ? repeated
      ? `${n}^${effectiveR}`
      : `P(${n},${effectiveR}) = ${n}! / (${n}-${effectiveR})!`
    : repeated
      ? `C(${n}+${effectiveR}-1,${effectiveR})`
      : `C(${n},${effectiveR})`;
  const description = ordered
    ? repeated
      ? "순서를 구분하고 같은 대상을 다시 고를 수 있으므로 중복순열입니다."
      : "순서가 결과를 바꾸고 같은 대상을 다시 고르지 않으므로 순열입니다."
    : repeated
      ? "순서는 구분하지 않지만 같은 대상을 여러 번 고를 수 있으므로 중복조합입니다."
      : "순서도 구분하지 않고 중복도 허용하지 않으므로 조합입니다.";

  return (
    <section aria-label="경우의 수 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <h3 className="m-0 text-lg font-black text-slate-950">경우의 수 시뮬레이터</h3>
      <p className="mt-1 text-sm text-slate-600">
        같은 대상이라도 순서와 중복 허용 여부에 따라 세는 방식이 달라집니다.
      </p>

      <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
        <div className="grid gap-3 lg:grid-cols-[1.05fr_1.15fr_1fr]">
          <div>
            <p className="text-xs font-black uppercase text-slate-500">대상 개수</p>
            <div className="mt-2 grid grid-cols-3 rounded-md border border-slate-200 bg-slate-100 p-1">
              {[3, 4, 5].map((countOption) => (
                <button
                  key={countOption}
                  type="button"
                  onClick={() => setTargetCount(countOption)}
                  className={`h-9 rounded px-2 text-sm font-black ${
                    targetCount === countOption ? "bg-slate-950 text-white shadow-sm" : "text-slate-700"
                  }`}
                >
                  {countOption}개
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {items.map((item) => (
                <span key={item} className="rounded bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <label>
            <span className="flex items-center justify-between text-xs font-black uppercase text-slate-500">
              선택 개수 r
              <span className="rounded bg-slate-950 px-2 py-0.5 text-sm text-white">{effectiveR}</span>
            </span>
            <input
              type="range"
              min="1"
              max={maxR}
              value={effectiveR}
              onChange={(event) => setR(Number(event.target.value))}
              className="mt-4 w-full"
            />
          </label>

          <div>
            <p className="text-xs font-black uppercase text-slate-500">세는 방식</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrdered((current) => !current)}
                className={`flex h-9 items-center justify-center rounded-md border px-2 text-sm font-black ${
                  ordered ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-800"
                }`}
              >
                {ordered ? "순서 고려" : "순서 무시"}
              </button>
              <button
                type="button"
                onClick={() => setRepeated((current) => !current)}
                className={`flex h-9 items-center justify-center rounded-md border px-2 text-sm font-black ${
                  repeated ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-800"
                }`}
              >
                {repeated ? "중복 허용" : "중복 불가"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="h-[176px] overflow-hidden rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-500">결과 미리보기</p>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">
              전체 {examples.length.toLocaleString()}개
            </span>
          </div>
          <div className="mt-2 grid h-[118px] grid-cols-2 content-start gap-1.5 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-2 [scrollbar-width:none] sm:grid-cols-3 [&::-webkit-scrollbar]:hidden">
            {examples.map((example, index) => (
              <div
                key={example}
                className="flex min-w-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1"
              >
                <span className="shrink-0 text-[10px] font-black text-slate-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 whitespace-nowrap text-center font-mono text-sm font-black text-slate-900">
                  {example}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-bold text-slate-500">계산</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{count.toLocaleString()}가지</p>
          <p className="mt-1.5 text-sm leading-5 text-slate-700">{description}</p>
          <p className="mt-1.5 text-sm font-black leading-5 text-teal-800">{formula}</p>
        </div>
      </div>
    </section>
  );
}
