"use client";

import { useState } from "react";

function isAscending(values: number[]) {
  return values.every((value, index) => index === 0 || values[index - 1] <= value);
}

function lastIsMin(values: number[]) {
  if (values.length === 0) return false;

  const last = values[values.length - 1];
  return values.every((value) => last <= value);
}

function formatList(values: number[]) {
  return `[${values.join(", ")}]`;
}

function explain(values: number[]) {
  const assumes = values.length > 0 && isAscending(values);
  const conclusion = lastIsMin(values);
  const counterexample = assumes && !conclusion;

  if (counterexample) {
    return `${formatList(values)}은 조건은 만족하지만 결론이 깨지므로 반례입니다.`;
  }

  if (values.length === 0) {
    return "빈 리스트는 이번 주장의 대상인 비어 있지 않은 리스트가 아니므로 반례로 쓰지 않습니다.";
  }

  if (!assumes) {
    return `${formatList(values)}은 오름차순 정렬 조건을 만족하지 않으므로 반례가 아닙니다.`;
  }

  return `${formatList(values)}은 조건과 결론이 모두 참이라서 반례가 아닙니다.`;
}

export default function CounterexamplePlayground() {
  const [values, setValues] = useState([1, 2, 3]);
  const assumes = values.length > 0 && isAscending(values);
  const conclusion = lastIsMin(values);
  const counterexample = assumes && !conclusion;
  const updateValue = (index: number, nextValue: number) => {
    setValues((current) => current.map((value, valueIndex) => (valueIndex === index ? nextValue : value)));
  };

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
          <p className="text-sm font-bold text-slate-500">리스트 구성</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((index) => (
              <label key={index} className="grid gap-1 rounded-md border border-slate-200 bg-slate-50 p-2 text-sm font-bold text-slate-700">
                {index + 1}번째
                <input
                  type="number"
                  min="0"
                  max="9"
                  value={values[index] ?? 0}
                  disabled={index >= values.length}
                  onChange={(event) => updateValue(index, Number(event.target.value))}
                  className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm font-black text-slate-950 disabled:bg-slate-100 disabled:text-slate-300"
                />
              </label>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((length) => (
              <button
                key={length}
                type="button"
                onClick={() => setValues([1, 2, 3].slice(0, length))}
                className={`rounded-md border px-3 py-2 text-sm font-black ${
                  values.length === length
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                길이 {length}
              </button>
            ))}
          </div>
          <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm font-black text-slate-950">{formatList(values)}</p>
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
            {explain(values)}
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
