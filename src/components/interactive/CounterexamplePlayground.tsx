"use client";

import { useState } from "react";

type Example = {
  id: string;
  values: number[];
  label: string;
};

const examples: Example[] = [
  { id: "single", values: [1], label: "[1]" },
  { id: "ascending", values: [1, 2, 3], label: "[1, 2, 3]" },
  { id: "descending", values: [3, 2, 1], label: "[3, 2, 1]" },
  { id: "empty", values: [], label: "[]" },
];

function isAscending(values: number[]) {
  return values.every((value, index) => index === 0 || values[index - 1] <= value);
}

function lastIsMin(values: number[]) {
  if (values.length === 0) return false;

  const last = values[values.length - 1];
  return values.every((value) => last <= value);
}

function explain(example: Example) {
  const assumes = example.values.length > 0 && isAscending(example.values);
  const conclusion = lastIsMin(example.values);
  const counterexample = assumes && !conclusion;

  if (counterexample) {
    return `${example.label}은 조건은 만족하지만 결론이 깨지므로 반례입니다.`;
  }

  if (example.values.length === 0) {
    return "빈 리스트는 이번 주장의 대상인 비어 있지 않은 리스트가 아니므로 반례로 쓰지 않습니다.";
  }

  if (!assumes) {
    return `${example.label}은 오름차순 정렬 조건을 만족하지 않으므로 반례가 아닙니다.`;
  }

  return `${example.label}은 조건과 결론이 모두 참이라서 반례가 아닙니다.`;
}

export default function CounterexamplePlayground() {
  const [selectedId, setSelectedId] = useState("ascending");
  const selected = examples.find((example) => example.id === selectedId) ?? examples[1];
  const assumes = selected.values.length > 0 && isAscending(selected.values);
  const conclusion = lastIsMin(selected.values);
  const counterexample = assumes && !conclusion;

  return (
    <section aria-label="반례 찾기 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">반례 찾기</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          주장: 모든 비어 있지 않은 오름차순 정렬 리스트의 마지막 원소가 최솟값이다.
        </p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-bold text-slate-500">예시 선택</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {examples.map((example) => (
              <button
                key={example.id}
                type="button"
                onClick={() => setSelectedId(example.id)}
                className={`rounded-md border px-3 py-2 text-sm font-black ${
                  selected.id === example.id
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[178px] rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-bold text-slate-500">판정</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Status label="가정 만족" active={assumes} />
            <Status label="결론 깨짐" active={!conclusion} />
            <Status label="반례" active={counterexample} emphasis />
          </div>
          <p
            className={`mt-3 flex min-h-[72px] items-center rounded-md p-3 text-sm font-bold leading-6 ${
              counterexample ? "bg-teal-50 text-teal-900" : "bg-slate-50 text-slate-700"
            }`}
          >
            {explain(selected)}
          </p>
        </div>
      </div>
    </section>
  );
}

function Status({ label, active, emphasis = false }: { label: string; active: boolean; emphasis?: boolean }) {
  const activeStyle = emphasis ? "border-teal-500 bg-teal-50 text-teal-800" : "border-sky-500 bg-sky-50 text-sky-800";
  const inactiveStyle = "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <div
      className={`flex min-h-10 items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm font-black ${
        active ? activeStyle : inactiveStyle
      }`}
    >
      <span>{label}</span>
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/80 text-sm leading-none shadow-sm">
        {active ? "✓" : "×"}
      </span>
    </div>
  );
}
