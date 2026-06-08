"use client";

import { useMemo, useState } from "react";

type Experiment = "coin" | "die";
type DieEvent = "even" | "at-least-three" | "specific";

const dieEvents: Record<DieEvent, { label: string; matches: (value: number) => boolean; numerator: number }> = {
  even: {
    label: "짝수가 나온다",
    matches: (value) => value % 2 === 0,
    numerator: 3,
  },
  "at-least-three": {
    label: "3 이상이 나온다",
    matches: (value) => value >= 3,
    numerator: 4,
  },
  specific: {
    label: "특정 값 6이 나온다",
    matches: (value) => value === 6,
    numerator: 1,
  },
};

const deterministicRolls = [1, 6, 2, 5, 3, 4, 6, 1, 2, 3, 5, 4];
const deterministicCoins = ["H", "T", "H", "H", "T", "T", "H", "T", "H", "T", "H", "T"];

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function ResultCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

export default function ProbabilityPlayground() {
  const [experiment, setExperiment] = useState<Experiment>("die");
  const [dieEvent, setDieEvent] = useState<DieEvent>("even");
  const [trials, setTrials] = useState(24);
  const activeDieEvent = dieEvents[dieEvent];
  const isDie = experiment === "die";

  const simulation = useMemo(() => {
    const outcomes = Array.from({ length: trials }, (_, index) =>
      isDie ? deterministicRolls[index % deterministicRolls.length] : deterministicCoins[index % deterministicCoins.length],
    );
    const successCount = outcomes.filter((outcome) => {
      if (isDie) return activeDieEvent.matches(outcome as number);
      return outcome === "H";
    }).length;

    return { outcomes, successCount };
  }, [activeDieEvent, isDie, trials]);

  const numerator = isDie ? activeDieEvent.numerator : 1;
  const denominator = isDie ? 6 : 2;
  const theoretical = numerator / denominator;
  const experimental = simulation.successCount / trials;
  const eventLabel = isDie ? activeDieEvent.label : "앞면이 나온다";
  const complementLabel = isDie ? `${activeDieEvent.label}가 아니다` : "앞면이 나오지 않는다";
  const sampleSpace = isDie ? "{1, 2, 3, 4, 5, 6}" : "{앞면, 뒷면}";

  return (
    <section aria-label="확률 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="m-0 text-lg font-black text-slate-950">확률 실험</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            표본공간과 사건을 고른 뒤, 이론 확률과 반복 실험 비율을 비교합니다.
          </p>
        </div>
        <p className="rounded-md bg-white px-3 py-2 text-sm font-black text-slate-950">{simulation.successCount} / {trials}</p>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setExperiment("die")}
            className={`rounded-md border px-3 py-2 text-sm font-black ${
              isDie ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            주사위
          </button>
          <button
            type="button"
            onClick={() => setExperiment("coin")}
            className={`rounded-md border px-3 py-2 text-sm font-black ${
              !isDie ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            동전
          </button>
        </div>

        {isDie ? (
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            사건 선택
            <select
              value={dieEvent}
              onChange={(event) => setDieEvent(event.target.value as DieEvent)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-950"
            >
              {Object.entries(dieEvents).map(([value, event]) => (
                <option key={value} value={value}>
                  {event.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="grid gap-1 text-sm font-bold text-slate-700">
          시행 횟수: {trials}
          <input
            type="range"
            min="6"
            max="120"
            step="6"
            value={trials}
            onChange={(event) => setTrials(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <ResultCard label="표본공간" value={sampleSpace} detail="가능한 모든 결과의 집합입니다." />
        <ResultCard label="사건" value={eventLabel} detail="표본공간 중 조건을 만족하는 결과만 모은 부분집합입니다." />
        <ResultCard
          label="이론 확률"
          value={`${numerator} / ${denominator} = ${percent(theoretical)}`}
          detail="모든 결과가 같은 가능성이라고 보고 원하는 경우를 전체 경우로 나눕니다."
        />
        <ResultCard
          label="실험 비율"
          value={`${simulation.successCount} / ${trials} = ${percent(experimental)}`}
          detail="시행 횟수를 늘리면 실험 비율이 이론 확률 근처로 흔들립니다."
        />
        <ResultCard
          label="여사건"
          value={`1 - ${percent(1 - theoretical)} = ${percent(theoretical)}`}
          detail={`${complementLabel}를 세는 쪽이 쉬울 때 반대로 계산합니다.`}
        />
        <ResultCard
          label="기댓값 감각"
          value={`${trials}회 중 약 ${Math.round(trials * theoretical)}회`}
          detail="같은 실험을 많이 반복했을 때 평균적으로 기대되는 성공 횟수입니다."
        />
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-sm font-bold text-slate-500">최근 결과</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {simulation.outcomes.slice(0, 36).map((outcome, index) => {
            const matched = isDie ? activeDieEvent.matches(outcome as number) : outcome === "H";

            return (
              <span
                key={`${outcome}-${index}`}
                className={`flex h-8 min-w-8 items-center justify-center rounded border px-2 text-sm font-black ${
                  matched ? "border-teal-500 bg-teal-50 text-teal-800" : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                {isDie ? outcome : outcome === "H" ? "앞" : "뒤"}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
