"use client";

import { useMemo, useState } from "react";
import { evaluateSetOperation, type SetOperation, universe } from "@/lib/setUtils";

const operationLabels: Record<SetOperation, string> = {
  union: "A ∪ B",
  intersection: "A ∩ B",
  difference: "A - B",
  complement: "Aᶜ",
};

function toggleItem(items: string[], item: string) {
  return items.includes(item)
    ? items.filter((current) => current !== item)
    : [...items, item].sort();
}

function formatSet(items: string[]) {
  return items.length > 0 ? `{ ${items.join(", ")} }` : "{ }";
}

export default function SetVennPlayground() {
  const [setA, setSetA] = useState(["1", "2", "3"]);
  const [setB, setSetB] = useState(["3", "4", "5"]);
  const [operation, setOperation] = useState<SetOperation>("union");
  const result = useMemo(() => evaluateSetOperation(operation, setA, setB), [operation, setA, setB]);

  return (
    <section className="my-8 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <h3 className="m-0 text-lg font-black text-slate-950">집합 연산 실험</h3>
      <p className="mt-1 text-sm text-slate-600">전체집합 U = {formatSet(universe)}에서 A와 B를 바꿔 봅니다.</p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="grid gap-4">
          <fieldset className="rounded-lg border border-slate-200 bg-white p-4">
            <legend className="px-1 text-sm font-bold text-slate-700">집합 A</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {universe.map((item) => (
                <button
                  key={`a-${item}`}
                  type="button"
                  onClick={() => setSetA((current) => toggleItem(current, item))}
                  className={`rounded-md border px-3 py-2 text-sm font-bold ${
                    setA.includes(item)
                      ? "border-teal-600 bg-teal-50 text-teal-800"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-slate-200 bg-white p-4">
            <legend className="px-1 text-sm font-bold text-slate-700">집합 B</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {universe.map((item) => (
                <button
                  key={`b-${item}`}
                  type="button"
                  onClick={() => setSetB((current) => toggleItem(current, item))}
                  className={`rounded-md border px-3 py-2 text-sm font-bold ${
                    setB.includes(item)
                      ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(Object.keys(operationLabels) as SetOperation[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setOperation(item)}
                className={`rounded-md border px-3 py-2 text-sm font-black ${
                  operation === item
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                }`}
              >
                {operationLabels[item]}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <svg viewBox="0 0 420 260" role="img" aria-label="집합 A와 B의 벤 다이어그램" className="h-auto w-full">
            <rect x="18" y="22" width="384" height="210" rx="12" fill="#f8fafc" stroke="#cbd5e1" />
            <circle cx="175" cy="130" r="82" fill="#14b8a6" fillOpacity="0.23" stroke="#0f766e" strokeWidth="3" />
            <circle cx="245" cy="130" r="82" fill="#6366f1" fillOpacity="0.22" stroke="#4338ca" strokeWidth="3" />
            <text x="110" y="58" fill="#0f766e" fontWeight="800">
              A
            </text>
            <text x="300" y="58" fill="#4338ca" fontWeight="800">
              B
            </text>
            {universe.map((item, index) => {
              const positions = [
                [128, 118],
                [160, 164],
                [210, 130],
                [260, 164],
                [292, 118],
                [210, 48],
              ];
              const [x, y] = positions[index];
              const active = result.includes(item);
              return (
                <g key={item}>
                  <circle
                    cx={x}
                    cy={y}
                    r="15"
                    fill={active ? "#0f172a" : "#ffffff"}
                    stroke={active ? "#0f172a" : "#94a3b8"}
                  />
                  <text x={x} y={y + 5} textAnchor="middle" fill={active ? "#ffffff" : "#334155"} fontWeight="800">
                    {item}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="mt-4 rounded-md bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-500">현재 연산</p>
            <p className="mt-1 text-2xl font-black text-slate-950">{operationLabels[operation]}</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              A = {formatSet(setA)}, B = {formatSet(setB)}
            </p>
            <p className="mt-2 text-base font-bold text-teal-800">결과 = {formatSet(result)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
