"use client";

import { useMemo, useState } from "react";

type EuclideanStep = {
  a: number;
  b: number;
  quotient: number;
  remainder: number;
};

function gcdSteps(left: number, right: number) {
  const steps: EuclideanStep[] = [];
  let a = left;
  let b = right;

  while (b !== 0) {
    const quotient = Math.floor(a / b);
    const remainder = a % b;
    steps.push({ a, b, quotient, remainder });
    a = b;
    b = remainder;
  }

  return { gcd: a, steps };
}

export default function EuclideanAlgorithmPlayground() {
  const [a, setA] = useState(84);
  const [b, setB] = useState(30);

  const values = useMemo(() => {
    const larger = Math.max(a, b);
    const smaller = Math.min(a, b);
    const result = gcdSteps(larger, smaller);
    const lcm = (larger * smaller) / result.gcd;

    return { larger, smaller, lcm, ...result };
  }, [a, b]);

  return (
    <section aria-label="유클리드 알고리즘 추적" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">유클리드 알고리즘 추적</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          두 수를 바꾸며 gcd(a, b)가 gcd(b, a mod b)로 줄어드는 과정을 확인합니다.
        </p>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          a: {a}
          <input type="range" min="2" max="160" value={a} onChange={(event) => setA(Number(event.target.value))} />
        </label>
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          b: {b}
          <input type="range" min="2" max="160" value={b} onChange={(event) => setB(Number(event.target.value))} />
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <p className="text-xs font-bold text-slate-500">정렬된 입력</p>
          <p className="mt-1 text-lg font-black text-slate-950">
            ({values.larger}, {values.smaller})
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">큰 수를 앞에 두고 시작합니다.</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <p className="text-xs font-bold text-slate-500">gcd</p>
          <p className="mt-1 text-lg font-black text-slate-950">{values.gcd}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">나머지가 0이 되기 직전의 b입니다.</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <p className="text-xs font-bold text-slate-500">lcm</p>
          <p className="mt-1 text-lg font-black text-slate-950">{values.lcm}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">a x b / gcd(a, b)로 연결됩니다.</p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="grid grid-cols-4 bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">
          <span>a</span>
          <span>b</span>
          <span>q</span>
          <span>r</span>
        </div>
        {values.steps.map((step) => (
          <div key={`${step.a}-${step.b}-${step.remainder}`} className="grid grid-cols-4 border-t border-slate-200 px-3 py-2 text-sm font-bold text-slate-800">
            <span>{step.a}</span>
            <span>{step.b}</span>
            <span>{step.quotient}</span>
            <span>{step.remainder}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm font-bold leading-6 text-teal-900">
        마지막 줄에서 나머지가 0이면 gcd는 그때의 b입니다. 단계 수는 {values.steps.length}번입니다.
      </div>
    </section>
  );
}
