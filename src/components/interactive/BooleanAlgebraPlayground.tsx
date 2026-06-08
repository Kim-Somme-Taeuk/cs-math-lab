"use client";

import { useMemo, useState } from "react";

type Operation = "and" | "or";

function boolText(value: boolean) {
  return value ? "1 / 참" : "0 / 거짓";
}

export default function BooleanAlgebraPlayground() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const [operation, setOperation] = useState<Operation>("and");

  const values = useMemo(() => {
    const result = operation === "and" ? a && b : a || b;
    const deMorganLeft = !(a && b);
    const deMorganRight = !a || !b;
    const absorptionLeft = a || (a && b);

    return {
      result,
      notA: !a,
      notB: !b,
      deMorganLeft,
      deMorganRight,
      absorptionLeft,
    };
  }, [a, b, operation]);

  return (
    <section aria-label="부울 대수 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">부울 대수 실험</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          A와 B를 바꾸며 AND, OR, NOT, 드모르간 법칙, 흡수법칙을 확인합니다.
        </p>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <button
          type="button"
          className={`rounded-md px-4 py-3 text-sm font-black ${a ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-800"}`}
          onClick={() => setA((current) => !current)}
        >
          A: {boolText(a)}
        </button>
        <button
          type="button"
          className={`rounded-md px-4 py-3 text-sm font-black ${b ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-800"}`}
          onClick={() => setB((current) => !current)}
        >
          B: {boolText(b)}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`rounded-md px-4 py-3 text-sm font-black ${operation === "and" ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-800"}`}
            onClick={() => setOperation("and")}
          >
            AND
          </button>
          <button
            type="button"
            className={`rounded-md px-4 py-3 text-sm font-black ${operation === "or" ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-800"}`}
            onClick={() => setOperation("or")}
          >
            OR
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <p className="text-xs font-bold text-slate-500">선택한 연산</p>
          <p className="mt-1 text-lg font-black text-slate-950">
            A {operation.toUpperCase()} B = {boolText(values.result)}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">AND는 둘 다 참, OR는 하나라도 참이면 참입니다.</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <p className="text-xs font-bold text-slate-500">NOT</p>
          <p className="mt-1 text-lg font-black text-slate-950">
            NOT A = {boolText(values.notA)}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">NOT은 0과 1을 뒤집습니다.</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <p className="text-xs font-bold text-slate-500">흡수법칙</p>
          <p className="mt-1 text-lg font-black text-slate-950">
            A OR (A AND B) = {boolText(values.absorptionLeft)}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">결과는 항상 A와 같습니다.</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm font-bold leading-6 text-teal-900">
        드모르간: NOT (A AND B) = {boolText(values.deMorganLeft)}, (NOT A) OR (NOT B) = {boolText(values.deMorganRight)}
      </div>
    </section>
  );
}
