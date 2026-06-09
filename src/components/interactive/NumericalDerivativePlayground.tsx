"use client";

import { useState } from "react";

function f(x: number) {
  return x * x * x - x;
}

function exactDerivative(x: number) {
  return 3 * x * x - 1;
}

export default function NumericalDerivativePlayground() {
  const [x, setX] = useState(1.5);
  const [h, setH] = useState(0.5);
  const forward = (f(x + h) - f(x)) / h;
  const central = (f(x + h) - f(x - h)) / (2 * h);
  const exact = exactDerivative(x);

  return (
    <section aria-label="수치미분 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">수치미분 실험</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          작은 h로 함수값 차이를 나누어 기울기를 근사합니다. h를 바꾸며 근사값이 어떻게 움직이는지 봅니다.
        </p>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          기준 x: {x.toFixed(2)}
          <input type="range" min="-2" max="2" step="0.25" value={x} onChange={(event) => setX(Number(event.target.value))} />
        </label>
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          h: {h.toFixed(2)}
          <input type="range" min="0.1" max="1.5" step="0.1" value={h} onChange={(event) => setH(Number(event.target.value))} />
        </label>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <p className="text-xs font-bold text-slate-500">전진 차분</p>
          <p className="mt-1 text-lg font-black text-slate-950">{forward.toFixed(4)}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">f(x+h)와 f(x)의 차이만 봅니다.</p>
        </div>
        <div className="rounded-md border border-teal-100 bg-teal-50 p-3">
          <p className="text-xs font-bold text-teal-700">중앙 차분</p>
          <p className="mt-1 text-lg font-black text-slate-950">{central.toFixed(4)}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">x 양쪽의 함수값을 함께 봐서 더 균형 잡힌 근사를 만듭니다.</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <p className="text-xs font-bold text-slate-500">참고 기울기</p>
          <p className="mt-1 text-lg font-black text-slate-950">{exact.toFixed(4)}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">이 실험 함수의 실제 도함수값과 비교합니다.</p>
        </div>
      </div>
    </section>
  );
}
