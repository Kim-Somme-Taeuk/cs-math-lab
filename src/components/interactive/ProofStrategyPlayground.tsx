"use client";

import { useMemo, useState } from "react";

type Strategy = "direct" | "contrapositive" | "contradiction" | "counterexample" | "induction";

type ProofCase = {
  id: string;
  claim: string;
  hint: string;
  answer: Strategy;
  reason: string;
};

const strategies: Record<Strategy, string> = {
  direct: "직접 증명",
  contrapositive: "대우 증명",
  contradiction: "모순 증명",
  counterexample: "반례",
  induction: "귀납법",
};

const cases: ProofCase[] = [
  {
    id: "even-plus-two",
    claim: "n이 짝수이면 n + 2도 짝수이다.",
    hint: "짝수의 정의 n = 2k를 바로 펼칠 수 있습니다.",
    answer: "direct",
    reason: "가정인 n이 짝수라는 말을 정의로 풀면 n + 2 = 2(k + 1)이 바로 나옵니다.",
  },
  {
    id: "square-even",
    claim: "n²이 짝수이면 n도 짝수이다.",
    hint: "결론을 직접 보이기보다 n이 홀수라고 두면 계산이 단순합니다.",
    answer: "contrapositive",
    reason: "대우인 'n이 홀수이면 n²도 홀수이다'를 보이면 원래 명제가 따라옵니다.",
  },
  {
    id: "sorted-last-min",
    claim: "모든 오름차순 리스트의 마지막 원소는 최솟값이다.",
    hint: "모든 경우를 말하는데, 아주 작은 예시 하나가 의심스럽습니다.",
    answer: "counterexample",
    reason: "[1, 2, 3]은 오름차순이지만 마지막 원소 3은 최솟값이 아닙니다.",
  },
  {
    id: "sum-formula",
    claim: "1 + 2 + ... + n = n(n + 1) / 2 이다.",
    hint: "n에서 n + 1로 한 항을 더해 이어 갈 수 있습니다.",
    answer: "induction",
    reason: "기저 사례를 확인하고, k까지의 합에서 k + 1을 더해 다음 식을 만들 수 있습니다.",
  },
];

export default function ProofStrategyPlayground() {
  const [caseId, setCaseId] = useState(cases[0].id);
  const [selected, setSelected] = useState<Strategy>("direct");
  const currentCase = useMemo(() => cases.find((item) => item.id === caseId) ?? cases[0], [caseId]);
  const correct = selected === currentCase.answer;

  return (
    <section aria-label="증명 방법 선택 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">증명 방법 선택기</h3>
        <p className="mt-1 text-sm text-slate-600">
          주장의 생김새를 보고 어떤 증명 방법이 가장 자연스러운지 골라 봅니다.
        </p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-bold text-slate-500">주장 선택</p>
          <div className="mt-3 grid gap-2">
            {cases.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCaseId(item.id);
                  setSelected("direct");
                }}
                className={`rounded-md border p-3 text-left text-sm leading-6 ${
                  item.id === currentCase.id
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                <span className="block text-xs font-black opacity-70">예제 {index + 1}</span>
                <span className="mt-1 block font-bold">{item.claim}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-bold text-slate-500">방법 고르기</p>
          <p className="mt-2 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">{currentCase.hint}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(Object.keys(strategies) as Strategy[]).map((strategy) => (
              <button
                key={strategy}
                type="button"
                onClick={() => setSelected(strategy)}
                className={`min-h-10 rounded-md border px-3 py-2 text-sm font-black ${
                  selected === strategy
                    ? "border-teal-600 bg-teal-50 text-teal-800"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                {strategies[strategy]}
              </button>
            ))}
          </div>
          <div
            className={`mt-3 rounded-md p-3 text-sm leading-6 ${
              correct ? "bg-teal-50 text-teal-900" : "bg-amber-50 text-amber-900"
            }`}
          >
            <p className="font-black">
              {correct ? "좋은 선택입니다." : `더 자연스러운 선택은 ${strategies[currentCase.answer]}입니다.`}
            </p>
            <p className="mt-1">{currentCase.reason}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
