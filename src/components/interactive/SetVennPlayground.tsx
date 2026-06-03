"use client";

import { useMemo, useState } from "react";

type SetOperation = "union" | "intersection" | "difference";
type FilterKey = "even" | "greaterThanThree" | "prime" | "lessThanFive";

type NumberCard = {
  id: string;
  value: number;
};

const cards: NumberCard[] = [
  { id: "1", value: 1 },
  { id: "2", value: 2 },
  { id: "3", value: 3 },
  { id: "4", value: 4 },
  { id: "5", value: 5 },
  { id: "6", value: 6 },
];

const filters: Record<FilterKey, { label: string; test: (card: NumberCard) => boolean }> = {
  even: { label: "짝수", test: (card) => card.value % 2 === 0 },
  greaterThanThree: { label: "3보다 큰 수", test: (card) => card.value > 3 },
  prime: { label: "소수", test: (card) => [2, 3, 5].includes(card.value) },
  lessThanFive: { label: "5보다 작은 수", test: (card) => card.value < 5 },
};

const operationLabels: Record<SetOperation, string> = {
  union: "A ∪ B",
  intersection: "A ∩ B",
  difference: "A - B",
};

function formatSet(items: string[]) {
  return items.length > 0 ? `{ ${items.join(", ")} }` : "{ }";
}

function getVennBucket(item: string, setA: string[], setB: string[]) {
  const inA = setA.includes(item);
  const inB = setB.includes(item);
  if (inA && inB) return "both";
  if (inA) return "aOnly";
  if (inB) return "bOnly";
  return "outside";
}

function getVennPosition(item: string, bucketIndex: number, setA: string[], setB: string[]) {
  const buckets = {
    aOnly: [
      [176, 124],
      [158, 174],
      [190, 224],
    ],
    both: [
      [238, 130],
      [282, 130],
      [238, 210],
      [282, 210],
    ],
    bOnly: [
      [344, 124],
      [362, 174],
      [330, 224],
    ],
    outside: [
      [82, 82],
      [438, 82],
      [260, 284],
    ],
  } satisfies Record<string, number[][]>;

  const bucket = buckets[getVennBucket(item, setA, setB)];
  return bucket[bucketIndex % bucket.length];
}

function evaluateDocumentSet(operation: SetOperation, setA: string[], setB: string[]) {
  if (operation === "union") return Array.from(new Set([...setA, ...setB])).sort();
  if (operation === "intersection") return setA.filter((item) => setB.includes(item));
  return setA.filter((item) => !setB.includes(item));
}

export default function SetVennPlayground() {
  const [filterA, setFilterA] = useState<FilterKey>("even");
  const [filterB, setFilterB] = useState<FilterKey>("greaterThanThree");
  const [operation, setOperation] = useState<SetOperation>("union");
  const setA = useMemo(
    () => cards.filter(filters[filterA].test).map((card) => card.id),
    [filterA],
  );
  const setB = useMemo(
    () => cards.filter(filters[filterB].test).map((card) => card.id),
    [filterB],
  );
  const result = useMemo(() => evaluateDocumentSet(operation, setA, setB), [operation, setA, setB]);

  return (
    <section aria-label="집합 연산 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <h3 className="m-0 text-lg font-black text-slate-950">집합 필터 실험실</h3>
      <p className="mt-1 text-sm text-slate-600">
        숫자 카드 1부터 6까지에 조건 A와 B를 걸고, 합집합/교집합/차집합 결과가 어떻게 바뀌는지 봅니다.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-[0.95fr_1.05fr] md:items-start">
        <div className="grid gap-3">
          <fieldset className="rounded-lg border border-slate-200 bg-white px-3 pb-3 pt-2">
            <legend className="px-1 text-sm font-bold text-slate-700">A 조건</legend>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {(Object.keys(filters) as FilterKey[]).map((item) => (
                <button
                  key={`a-${item}`}
                  type="button"
                  onClick={() => setFilterA(item)}
                  className={`rounded-md border px-3 py-2.5 text-sm font-bold ${
                    filterA === item
                      ? "border-teal-600 bg-teal-50 text-teal-800"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  {filters[item].label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-slate-200 bg-white px-3 pb-3 pt-2">
            <legend className="px-1 text-sm font-bold text-slate-700">B 조건</legend>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {(Object.keys(filters) as FilterKey[]).map((item) => (
                <button
                  key={`b-${item}`}
                  type="button"
                  onClick={() => setFilterB(item)}
                  className={`rounded-md border px-3 py-2.5 text-sm font-bold ${
                    filterB === item
                      ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  {filters[item].label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-3 gap-2">
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

          <div className="grid gap-2 sm:grid-cols-2">
            {cards.map((card) => {
              const inA = setA.includes(card.id);
              const inB = setB.includes(card.id);
              const active = result.includes(card.id);
              return (
                <div
                  key={card.id}
                  className={`rounded-md border p-3 ${
                    active ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-2xl font-black text-slate-950">{card.value}</p>
                    <span className={`rounded-md px-2 py-1 text-xs font-black ${active ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {active ? "결과" : "제외"}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${inA ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-500"}`}>
                      A {inA ? "만족" : "아님"}
                    </span>
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${inB ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-slate-500"}`}>
                      B {inB ? "만족" : "아님"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <fieldset className="h-fit rounded-lg border border-slate-200 bg-white p-3">
          <legend className="px-1 text-sm font-bold text-slate-700">연산 결과</legend>
          <svg viewBox="0 0 520 306" role="img" aria-label="집합 A와 B의 벤 다이어그램" className="h-auto w-full">
            <rect x="20" y="24" width="480" height="282" rx="14" fill="#f8fafc" stroke="#cbd5e1" />
            <circle cx="220" cy="170" r="110" fill="#14b8a6" fillOpacity="0.23" stroke="#0f766e" strokeWidth="3" />
            <circle cx="300" cy="170" r="110" fill="#6366f1" fillOpacity="0.22" stroke="#4338ca" strokeWidth="3" />
            <text x="128" y="74" fill="#0f766e" fontSize="22" fontWeight="800">
              A
            </text>
            <text x="374" y="74" fill="#4338ca" fontSize="22" fontWeight="800">
              B
            </text>
            {cards.map((card, index) => {
              const bucket = getVennBucket(card.id, setA, setB);
              const bucketIndex = cards
                .slice(0, index)
                .filter((previousCard) => getVennBucket(previousCard.id, setA, setB) === bucket).length;
              const [x, y] = getVennPosition(card.id, bucketIndex, setA, setB);
              const active = result.includes(card.id);
              return (
                <g key={card.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r="19"
                    fill={active ? "#0f172a" : "#ffffff"}
                    stroke={active ? "#0f172a" : "#94a3b8"}
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={y + 7}
                    textAnchor="middle"
                    fill={active ? "#ffffff" : "#334155"}
                    fontSize="20"
                    fontWeight="800"
                  >
                    {card.id}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="mt-3 rounded-md bg-slate-50 p-3">
            <p className="text-sm font-bold text-slate-500">현재 연산</p>
            <p className="mt-1 text-2xl font-black text-slate-950">{operationLabels[operation]}</p>
            <p className="mt-2 h-6 overflow-hidden text-sm leading-6 text-slate-700">
              A = {formatSet(setA)}, B = {formatSet(setB)}
            </p>
            <p className="mt-2 text-base font-bold text-teal-800">결과 = {formatSet(result)}</p>
            <div className="mt-2 rounded-md border border-teal-100 bg-white p-2">
              <p className="text-sm font-bold text-slate-500">결과 원소</p>
              <div className="mt-2 flex min-h-9 flex-wrap content-start gap-1.5">
                {result.length > 0 ? (
                  result.map((item) => (
                    <span
                      key={item}
                      className="inline-flex h-9 min-w-9 items-center justify-center rounded-md bg-teal-700 px-3 text-base font-black text-white"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-base font-bold text-slate-500">없음</span>
                )}
              </div>
            </div>
            <div className="mt-2 rounded-md bg-white px-3 py-2 font-mono text-sm leading-6 text-slate-800">
              <p className="m-0">A = set({JSON.stringify(setA)})</p>
              <p className="m-0">B = set({JSON.stringify(setB)})</p>
              <p className="m-0">result = {operationLabels[operation]}</p>
            </div>
          </div>
        </fieldset>
      </div>
    </section>
  );
}
