"use client";

import { useState } from "react";

const items = ["A", "B", "C", "D"];

function factorial(n: number): number {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

function permutations(n: number, r: number) {
  return factorial(n) / factorial(n - r);
}

function combinations(n: number, r: number) {
  return permutations(n, r) / factorial(r);
}

export default function CountingPlayground() {
  const [mode, setMode] = useState<"ordered" | "unordered" | "pin">("ordered");
  const n = items.length;
  const r = 2;
  const count = mode === "ordered" ? permutations(n, r) : mode === "unordered" ? combinations(n, r) : 10 ** 4;

  const examples =
    mode === "ordered"
      ? ["AB", "AC", "AD", "BA", "BC", "BD"]
      : mode === "unordered"
        ? ["{A, B}", "{A, C}", "{A, D}", "{B, C}", "{B, D}", "{C, D}"]
        : ["0000", "0001", "0010", "1111", "9090", "9999"];

  const description =
    mode === "ordered"
      ? "순서가 결과를 바꾸므로 AB와 BA를 서로 다른 경우로 셉니다."
      : mode === "unordered"
        ? "순서가 결과를 바꾸지 않으므로 {A, B}와 {B, A}를 한 번만 셉니다."
        : "각 자리마다 0부터 9까지 10가지를 고르고, 같은 숫자를 다시 쓸 수 있습니다.";

  return (
    <section aria-label="경우의 수 실험" className="my-8 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <h3 className="m-0 text-lg font-black text-slate-950">경우의 수 실험</h3>
      <p className="mt-1 text-sm text-slate-600">
        같은 대상이라도 순서와 중복 허용 여부에 따라 세는 방식이 달라집니다.
      </p>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {[
          ["ordered", "순서 있는 2명"],
          ["unordered", "순서 없는 2명"],
          ["pin", "4자리 PIN"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key as typeof mode)}
            className={`rounded-md border px-3 py-2 text-sm font-black ${
              mode === key
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">예시 일부</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {examples.map((example) => (
              <span key={example} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-bold text-slate-800">
                {example}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">계산</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{count.toLocaleString()}가지</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">{description}</p>
          <p className="mt-2 text-sm leading-6 text-teal-800">
            {mode === "ordered"
              ? "4P2 = 4 x 3"
              : mode === "unordered"
                ? "4C2 = (4 x 3) / 2"
                : "10 x 10 x 10 x 10"}
          </p>
        </div>
      </div>
    </section>
  );
}
