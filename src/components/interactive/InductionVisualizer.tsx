"use client";

import { useState } from "react";

const scenarios = {
  complete: {
    label: "기저와 단계 모두 있음",
    shortLabel: "전체",
    base: true,
    step: true,
    description: "P(1)이 참이고, P(k)에서 P(k+1)로 넘어가는 연결도 있어 모든 칸이 이어집니다.",
  },
  noBase: {
    label: "기저 사례 없음",
    shortLabel: "기저X",
    base: false,
    step: true,
    description: "넘어가는 규칙은 있어도 첫 칸 P(1)이 출발하지 않으면 전체가 시작되지 않습니다.",
  },
  noStep: {
    label: "귀납 단계 없음",
    shortLabel: "단계X",
    base: true,
    step: false,
    description: "P(1)은 확인했지만 P(k)에서 P(k+1)로 넘어가는 연결이 없어 첫 칸에서 멈춥니다.",
  },
};

const proofSteps = [
  {
    label: "Base",
    title: "P(1)을 직접 확인",
    body: "1 = 1(1+1)/2 이므로 첫 칸은 참입니다.",
  },
  {
    label: "Assume",
    title: "P(k)를 참이라고 가정",
    body: "1 + ... + k = k(k+1)/2 를 다음 칸으로 가기 위해 잠시 사용합니다.",
  },
  {
    label: "Step",
    title: "P(k+1)로 연결",
    body: "양쪽에 k+1을 더해 1 + ... + k + (k+1) 모양을 만듭니다.",
  },
];

export default function InductionVisualizer() {
  const [scenarioKey, setScenarioKey] = useState<keyof typeof scenarios>("complete");
  const scenario = scenarios[scenarioKey];
  const activeCount = scenario.base ? (scenario.step ? 6 : 1) : 0;

  return (
    <section aria-label="귀납법 도미노 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <h3 className="m-0 text-lg font-black text-slate-950">귀납법 연결 시뮬레이터</h3>
      <p className="mt-1 text-sm text-slate-600">
        기저 사례가 출발점이고, 귀납 단계가 다음 칸으로 이어지는 연결이라는 점만 확인합니다.
      </p>

      <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-sm font-bold text-slate-500">명제 P(n)</p>
        <p className="mt-1 rounded-md bg-slate-50 px-3 py-2 font-mono text-sm font-black text-slate-950">
          1+2+...+n = n(n+1)/2
        </p>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {proofSteps.map((step, index) => (
          <div key={step.label} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded bg-slate-950 px-2 py-1 text-xs font-black text-white">{index + 1}</span>
              <span className="text-xs font-black uppercase text-slate-500">{step.label}</span>
            </div>
            <p className="mt-3 font-black text-slate-950">{step.title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{step.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-2.5 sm:p-3">
          <p className="text-sm font-bold text-slate-500">무엇이 빠지면 끊기는가</p>
          <div className="mt-2 grid grid-cols-3 gap-1.5 sm:gap-2">
            {(Object.keys(scenarios) as Array<keyof typeof scenarios>).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setScenarioKey(key)}
                className={`h-9 rounded-md border px-2 text-sm font-black sm:h-10 ${
                  scenarioKey === key
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-300 bg-white text-slate-800"
                }`}
              >
                {scenarios[key].shortLabel}
              </button>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:mt-3 sm:gap-2">
            <div className={`rounded-md px-2 py-1.5 text-sm font-black sm:px-3 sm:py-2 ${scenario.base ? "bg-teal-50 text-teal-800" : "bg-rose-50 text-rose-800"}`}>
              기저 {scenario.base ? "있음" : "없음"}
            </div>
            <div className={`rounded-md px-2 py-1.5 text-sm font-black sm:px-3 sm:py-2 ${scenario.step ? "bg-teal-50 text-teal-800" : "bg-rose-50 text-rose-800"}`}>
              단계 {scenario.step ? "있음" : "없음"}
            </div>
          </div>
          <p className="mt-2 text-sm font-bold leading-5 text-slate-700 sm:mt-3 sm:h-16">{scenario.description}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-bold text-slate-500">연결되는 P(n)</p>
          <div className="mt-3 grid grid-cols-6 gap-1.5">
            {Array.from({ length: 6 }, (_, index) => {
              const active = index < activeCount;
              return (
                <div
                  key={index}
                  className={`flex h-14 items-center justify-center rounded-md border text-sm font-black ${
                    active ? "border-teal-600 bg-teal-50 text-teal-800" : "border-slate-300 bg-white text-slate-400"
                  }`}
                >
                  P({index + 1})
                </div>
              );
            })}
          </div>
          <div className="mt-3 rounded-md bg-slate-50 p-3">
            <p className="text-sm font-bold text-slate-500">핵심</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              P(k)를 증명하는 것이 아니라, 이미 참이라고 가정했을 때 P(k+1)로 넘어갈 수 있는지 보는 단계입니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
