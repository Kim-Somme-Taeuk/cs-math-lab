"use client";

import { useMemo, useState } from "react";

type Proposition = "P" | "Q" | "R";
type ExpressionKey = "pAndQ" | "pOrNotQ" | "notPAndR" | "pAndQOrR" | "pAndQOrNotR";

const expressionOptions: Record<
  ExpressionKey,
  {
    label: string;
    evaluate: (values: Record<Proposition, boolean>) => boolean;
    explain: (values: Record<Proposition, boolean>) => string;
  }
> = {
  pAndQ: {
    label: "P AND Q",
    evaluate: ({ P, Q }) => P && Q,
    explain: ({ P, Q }) =>
      P && Q
        ? "P와 Q가 모두 참이라서 AND 결과가 참입니다."
        : `AND는 양쪽이 모두 참이어야 합니다. 지금은 ${!P ? "P" : "Q"}가 거짓입니다.`,
  },
  pOrNotQ: {
    label: "P OR NOT Q",
    evaluate: ({ P, Q }) => P || !Q,
    explain: ({ P, Q }) =>
      P || !Q
        ? `${P ? "P가 참" : "Q가 거짓이라 NOT Q가 참"}이므로 OR 결과가 참입니다.`
        : "P가 거짓이고 Q가 참이라 NOT Q도 거짓입니다. 둘 다 거짓이므로 OR 결과가 거짓입니다.",
  },
  notPAndR: {
    label: "NOT P AND R",
    evaluate: ({ P, R }) => !P && R,
    explain: ({ P, R }) =>
      !P && R
        ? "P가 거짓이라 NOT P가 참이고, R도 참이라 전체가 참입니다."
        : "NOT P와 R이 모두 참이어야 하는데, 둘 중 하나 이상이 거짓입니다.",
  },
  pAndQOrR: {
    label: "(P AND Q) OR R",
    evaluate: ({ P, Q, R }) => (P && Q) || R,
    explain: ({ P, Q, R }) =>
      (P && Q) || R
        ? `${P && Q ? "괄호 안 P AND Q가 참" : "R이 참"}이므로 전체 OR 결과가 참입니다.`
        : "괄호 안 P AND Q가 거짓이고 R도 거짓이라 전체가 거짓입니다.",
  },
  pAndQOrNotR: {
    label: "P AND (Q OR NOT R)",
    evaluate: ({ P, Q, R }) => P && (Q || !R),
    explain: ({ P, Q, R }) =>
      P && (Q || !R)
        ? "P가 참이고, 괄호 안 Q OR NOT R도 참이라 전체가 참입니다."
        : "AND의 왼쪽 P 또는 괄호 안 조건 중 하나가 거짓이라 전체가 거짓입니다.",
  },
};

function TruthBadge({ value }: { value: boolean }) {
  return (
    <span
      className={`inline-flex min-w-14 justify-center rounded-md px-2.5 py-1 text-sm font-bold ${
        value ? "bg-teal-100 text-teal-800" : "bg-rose-100 text-rose-800"
      }`}
    >
      {value ? "참" : "거짓"}
    </span>
  );
}

export default function TruthTablePlayground() {
  const [values, setValues] = useState<Record<Proposition, boolean>>({ P: true, Q: false, R: true });
  const [expressionKey, setExpressionKey] = useState<ExpressionKey>("pAndQ");
  const expression = expressionOptions[expressionKey];
  const result = useMemo(() => expression.evaluate(values), [expression, values]);

  return (
    <section aria-label="진리표 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4 lg:min-h-[650px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="m-0 text-lg font-black text-slate-950">논리 조건식 빌더</h3>
          <p className="mt-1 text-sm text-slate-600">
            P, Q, R의 상태와 조건식 조합을 바꾸며 결과 진리값을 확인합니다.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {(Object.keys(values) as Proposition[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setValues((current) => ({ ...current, [key]: !current[key] }))}
            className="rounded-md border border-slate-300 bg-white px-4 py-3 text-left hover:border-teal-500"
          >
            <span className="block text-sm font-bold text-slate-500">명제 {key}</span>
            <span className="mt-1 flex items-center gap-2 text-lg font-black text-slate-950">
              {values[key] ? "True" : "False"}
              <TruthBadge value={values[key]} />
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-[0.8fr_1fr_1fr_1.35fr_1.55fr]">
        {(Object.keys(expressionOptions) as ExpressionKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setExpressionKey(key)}
            className={`whitespace-nowrap rounded-md border px-3 py-2 text-sm font-black ${
              expressionKey === key
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
            }`}
          >
            {expressionOptions[key].label}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm font-bold text-slate-500">현재 값</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {(Object.keys(values) as Proposition[]).map((key) => (
            <div key={key} className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-bold text-slate-500">{key}</p>
              <p className="mt-1 text-lg font-black text-slate-950">{values[key] ? "참" : "거짓"}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="h-[270px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">현재 조건식</p>
          <p className="mt-2 h-16 text-2xl font-black leading-tight text-slate-950">{expression.label}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm font-bold text-slate-500">결과</span>
            <TruthBadge value={result} />
          </div>
          <p className="mt-4 h-20 overflow-y-auto text-sm leading-6 text-slate-700">{expression.explain(values)}</p>
        </div>

        <div className="h-[270px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">계산 흐름</p>
          <div className="mt-3 grid h-[210px] grid-rows-[1fr_1fr_auto] gap-2">
            <div className="overflow-y-auto rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
              조건식 <strong className="text-slate-950">{expression.label}</strong>에 현재 P, Q, R 값을 넣습니다.
            </div>
            <div className="overflow-y-auto rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
              AND는 모두 참인지, OR는 하나라도 참인지, NOT은 값을 뒤집는지 확인합니다.
            </div>
            <div className="rounded-md bg-slate-950 p-3 text-sm font-black text-white">
              최종 결과: {result ? "참" : "거짓"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
