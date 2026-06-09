"use client";

import { useMemo, useState } from "react";

type FunctionKind = "linear" | "quadratic" | "exponential";

const functionLabels: Record<FunctionKind, string> = {
  linear: "선형 함수",
  quadratic: "이차 함수",
  exponential: "지수 함수",
};

function evaluate(kind: FunctionKind, x: number) {
  if (kind === "linear") return x + 1;
  if (kind === "quadratic") return (x * x) / 2 - 1;
  return 2 ** (x / 2);
}

function toPoint(x: number, y: number) {
  const px = 32 + ((x + 4) / 8) * 256;
  const py = 132 - ((y + 4) / 8) * 104;
  return `${px},${py}`;
}

export default function FunctionGraphPlayground() {
  const [kind, setKind] = useState<FunctionKind>("linear");
  const [input, setInput] = useState(1);
  const output = evaluate(kind, input);
  const points = useMemo(
    () =>
      Array.from({ length: 33 }, (_, index) => {
        const x = -4 + index * 0.25;
        const y = Math.max(-4, Math.min(4, evaluate(kind, x)));
        return toPoint(x, y);
      }).join(" "),
    [kind],
  );

  return (
    <section aria-label="함수 그래프 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">함수 그래프 실험</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          함수 종류와 입력값을 바꾸며 입력이 출력으로 이어지는 모습을 봅니다.
        </p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.2fr]">
        <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(functionLabels) as FunctionKind[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setKind(item)}
                className={`rounded-md border px-3 py-2 text-sm font-black ${
                  item === kind
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {functionLabels[item]}
              </button>
            ))}
          </div>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            입력 x: {input.toFixed(1)}
            <input
              type="range"
              min="-4"
              max="4"
              step="0.5"
              value={input}
              onChange={(event) => setInput(Number(event.target.value))}
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs font-bold text-slate-500">입력</p>
              <p className="mt-1 text-lg font-black text-slate-950">x = {input.toFixed(1)}</p>
            </div>
            <div className="rounded-md bg-teal-50 p-3">
              <p className="text-xs font-bold text-teal-700">출력</p>
              <p className="mt-1 text-lg font-black text-slate-950">f(x) = {output.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <svg viewBox="0 0 320 160" className="h-48 w-full" role="img" aria-label={`${functionLabels[kind]} 그래프`}>
            <path d="M32 80 H288" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M160 20 V132" stroke="#cbd5e1" strokeWidth="1.5" />
            <polyline points={points} fill="none" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={toPoint(input, Math.max(-4, Math.min(4, output))).split(",")[0]} cy={toPoint(input, Math.max(-4, Math.min(4, output))).split(",")[1]} r="5" fill="#0f172a" />
          </svg>
        </div>
      </div>
    </section>
  );
}
