"use client";

import { useState } from "react";

const scenarios = {
  complete: {
    label: "기저와 단계 모두 있음",
    shortLabel: "전체",
    base: true,
    step: true,
    description: "첫 도미노가 넘어지고, 넘어진 도미노가 다음 도미노를 밀어 모든 단계가 이어집니다.",
  },
  noBase: {
    label: "기저 사례 없음",
    shortLabel: "기저 없음",
    base: false,
    step: true,
    description: "다음으로 이어지는 규칙은 있어도 첫 단계가 시작되지 않아 아무 도미노도 넘어지지 않습니다.",
  },
  noStep: {
    label: "귀납 단계 없음",
    shortLabel: "단계 없음",
    base: true,
    step: false,
    description: "첫 도미노는 넘어지지만 다음 단계로 이어지는 규칙이 없어 전체를 보장하지 못합니다.",
  },
};

type Slot = "base" | "hypothesis" | "step";
type Card = "base" | "hypothesis" | "step";

const slots: { key: Slot; label: string; answer: Card }[] = [
  { key: "base", label: "1단계: 출발 확인", answer: "base" },
  { key: "hypothesis", label: "2단계: 임시 가정", answer: "hypothesis" },
  { key: "step", label: "3단계: 다음 칸으로 이동", answer: "step" },
];

const cards: Record<Card, { label: string; body: string }> = {
  base: { label: "Base Case", body: "가장 작은 n에서 명제가 참인지 직접 확인합니다." },
  hypothesis: { label: "Hypothesis", body: "n = k에서 이미 참이라고 가정합니다." },
  step: { label: "Step", body: "가정으로부터 n = k + 1도 참임을 보입니다." },
};

export default function InductionVisualizer() {
  const [scenarioKey, setScenarioKey] = useState<keyof typeof scenarios>("complete");
  const [placements, setPlacements] = useState<Record<Slot, Card>>({
    base: "hypothesis",
    hypothesis: "base",
    step: "step",
  });
  const scenario = scenarios[scenarioKey];
  const fallenCount = scenario.base ? (scenario.step ? 6 : 1) : 0;
  const wrongSlots = slots.filter((slot) => placements[slot.key] !== slot.answer);
  const assembled = wrongSlots.length === 0;

  return (
    <section aria-label="귀납법 도미노 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <h3 className="m-0 text-lg font-black text-slate-950">귀납법 증명 카드 조립기</h3>
      <p className="mt-1 text-sm text-slate-600">
        증명의 세 카드를 순서에 맞게 놓고, 도미노 시각화로 기저와 단계의 역할을 확인합니다.
      </p>

      <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
        <p className="font-black text-slate-950">사용 방법</p>
        <ol className="mt-1.5 grid gap-1.5 sm:grid-cols-3">
          <li className="flex h-7 items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-950 text-[11px] font-black leading-none text-white">1</span>
            <span className="leading-none">카드 선택</span>
          </li>
          <li className="flex h-7 items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-950 text-[11px] font-black leading-none text-white">2</span>
            <span className="leading-none">피드백 확인</span>
          </li>
          <li className="flex h-7 items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-950 text-[11px] font-black leading-none text-white">3</span>
            <span className="leading-none">도미노 비교</span>
          </li>
        </ol>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {slots.map((slot) => (
          <div key={slot.key} className="flex h-[292px] flex-col rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-sm font-bold text-slate-700">{slot.label}</p>
            <div className="mt-2 grid gap-2">
              {(Object.keys(cards) as Card[]).map((card) => (
                <button
                  key={`${slot.key}-${card}`}
                  type="button"
                  onClick={() => setPlacements((current) => ({ ...current, [slot.key]: card }))}
                  className={`h-10 rounded-md border px-3 text-left text-sm font-bold ${
                    placements[slot.key] === card
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  {cards[card].label}
                </button>
              ))}
            </div>
            <p className="mt-3 h-12 text-sm leading-6 text-slate-600">{cards[placements[slot.key]].body}</p>
            <p
              className={`mt-auto h-10 text-sm font-bold leading-5 ${
                placements[slot.key] === slot.answer ? "text-teal-700" : "text-rose-700"
              }`}
            >
              {placements[slot.key] === slot.answer ? "이 단계에 맞는 카드입니다." : "이 단계의 역할과 카드가 맞지 않습니다."}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
        <div className={`h-[282px] rounded-lg p-4 ${assembled ? "bg-teal-50 text-teal-900" : "bg-rose-50 text-rose-900"}`}>
          <p className="font-black">{assembled ? "증명 흐름이 맞습니다." : "카드 순서가 아직 맞지 않습니다."}</p>
          <p className="mt-2 h-20 text-sm leading-6">
            {assembled
              ? "기저 사례로 출발하고, n = k를 가정한 뒤, 그 가정으로 n = k + 1을 보입니다."
              : "귀납 가정은 n = k를 새로 증명하는 단계가 아니라, 다음 단계로 넘어가기 위해 임시로 가정하는 카드입니다."}
          </p>
          <div className="mt-3 grid gap-2">
            {slots.map((slot) => {
              const correct = placements[slot.key] === slot.answer;
              return (
                <div key={slot.key} className="flex items-center justify-between gap-3 rounded-md bg-white/70 px-3 py-2 text-sm">
                  <span className="font-bold">{slot.label}</span>
                  <span className={`font-black ${correct ? "text-teal-700" : "text-rose-700"}`}>
                    {correct ? "맞음" : "확인 필요"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-[282px] rounded-lg border border-slate-200 bg-white p-3">
          <div>
            <p className="text-sm font-black text-slate-950">도미노 실험</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(Object.keys(scenarios) as Array<keyof typeof scenarios>).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setScenarioKey(key)}
                  className={`rounded-md border px-2 py-2 text-sm font-black ${
                    scenarioKey === key
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  {scenarios[key].shortLabel}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-6 gap-2">
            {Array.from({ length: 6 }, (_, index) => {
              const fallen = index < fallenCount;
              return (
                <div
                  key={index}
                  className={`flex h-14 items-center justify-center rounded-md border text-sm font-black ${
                    fallen ? "border-teal-600 bg-teal-50 text-teal-800" : "border-slate-300 bg-white text-slate-400"
                  }`}
                >
                  P({index + 1})
                </div>
              );
            })}
          </div>

          <div className="mt-3 grid h-[108px] grid-cols-[1fr_auto] gap-3 rounded-md bg-slate-50 p-3">
            <div>
              <p className="text-sm font-bold text-slate-500">현재 해석</p>
              <p className="mt-1 h-16 text-sm font-bold leading-5 text-slate-800">{scenario.description}</p>
            </div>
            <p className="self-end text-sm leading-6 text-slate-600">
              기저: {scenario.base ? "있음" : "없음"} / 단계: {scenario.step ? "있음" : "없음"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
