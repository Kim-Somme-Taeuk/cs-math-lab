"use client";

import { useState } from "react";

const scenarios = {
  complete: {
    label: "기저와 단계 모두 있음",
    base: true,
    step: true,
    description: "첫 도미노가 넘어지고, 넘어진 도미노가 다음 도미노를 밀어 모든 단계가 이어집니다.",
  },
  noBase: {
    label: "기저 사례 없음",
    base: false,
    step: true,
    description: "다음으로 이어지는 규칙은 있어도 첫 단계가 시작되지 않아 아무 도미노도 넘어지지 않습니다.",
  },
  noStep: {
    label: "귀납 단계 없음",
    base: true,
    step: false,
    description: "첫 도미노는 넘어지지만 다음 단계로 이어지는 규칙이 없어 전체를 보장하지 못합니다.",
  },
};

export default function InductionVisualizer() {
  const [scenarioKey, setScenarioKey] = useState<keyof typeof scenarios>("complete");
  const scenario = scenarios[scenarioKey];
  const fallenCount = scenario.base ? (scenario.step ? 6 : 1) : 0;

  return (
    <section aria-label="귀납법 도미노 실험" className="my-8 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <h3 className="m-0 text-lg font-black text-slate-950">귀납법 도미노 실험</h3>
      <p className="mt-1 text-sm text-slate-600">
        기저 사례와 귀납 단계 중 하나가 빠지면 전체 명제를 보장할 수 없는 이유를 확인합니다.
      </p>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {(Object.keys(scenarios) as Array<keyof typeof scenarios>).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setScenarioKey(key)}
            className={`rounded-md border px-3 py-2 text-sm font-black ${
              scenarioKey === key
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
            }`}
          >
            {scenarios[key].label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-6 gap-2">
        {Array.from({ length: 6 }, (_, index) => {
          const fallen = index < fallenCount;
          return (
            <div
              key={index}
              className={`flex h-20 items-center justify-center rounded-md border text-sm font-black ${
                fallen ? "border-teal-600 bg-teal-50 text-teal-800" : "border-slate-300 bg-white text-slate-400"
              }`}
            >
              P({index + 1})
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-md bg-white p-4">
        <p className="text-sm font-bold text-slate-500">현재 해석</p>
        <p className="mt-2 font-bold leading-7 text-slate-800">{scenario.description}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          기저 사례: {scenario.base ? "있음" : "없음"} / 귀납 단계: {scenario.step ? "있음" : "없음"}
        </p>
      </div>
    </section>
  );
}
