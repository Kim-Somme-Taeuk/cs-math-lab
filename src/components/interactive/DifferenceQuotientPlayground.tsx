"use client";

import { useMemo, useState } from "react";

function f(x: number) {
  return x * x;
}

function toPoint(x: number, y: number) {
  const px = 32 + ((x + 1) / 5) * 256;
  const py = 132 - (y / 16) * 104;
  return { x: px, y: py };
}

export default function DifferenceQuotientPlayground() {
  const [baseX, setBaseX] = useState(2);
  const [gap, setGap] = useState(1);
  const nextX = baseX + gap;
  const averageRate = (f(nextX) - f(baseX)) / gap;
  const instantRate = 2 * baseX;
  const curvePoints = useMemo(
    () =>
      Array.from({ length: 41 }, (_, index) => {
        const x = -1 + index * 0.125;
        const y = Math.min(16, f(x));
        const point = toPoint(x, y);
        return `${point.x},${point.y}`;
      }).join(" "),
    [],
  );
  const leftPoint = toPoint(baseX, f(baseX));
  const rightPoint = toPoint(nextX, f(nextX));

  return (
    <section aria-label="평균 변화율 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">평균 변화율 실험</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          두 점 사이 간격을 줄이며 평균 변화율이 한 점 근처의 기울기 감각에 가까워지는지 봅니다.
        </p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.2fr]">
        <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            기준 x: {baseX.toFixed(1)}
            <input type="range" min="0" max="3" step="0.5" value={baseX} onChange={(event) => setBaseX(Number(event.target.value))} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            간격 h: {gap.toFixed(2)}
            <input type="range" min="0.25" max="2" step="0.25" value={gap} onChange={(event) => setGap(Number(event.target.value))} />
          </label>
          <div className="grid gap-2">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs font-bold text-slate-500">평균 변화율</p>
              <p className="mt-1 text-lg font-black text-slate-950">{averageRate.toFixed(2)}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                x={baseX.toFixed(1)}에서 x={nextX.toFixed(1)}까지의 출력 변화 / 입력 변화입니다.
              </p>
            </div>
            <div className="rounded-md bg-teal-50 p-3">
              <p className="text-xs font-bold text-teal-700">순간 기울기 참고값</p>
              <p className="mt-1 text-lg font-black text-slate-950">{instantRate.toFixed(2)}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">f(x)=x^2에서는 x 근처의 순간 기울기가 2x로 읽힙니다.</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <svg viewBox="0 0 320 160" className="h-48 w-full" role="img" aria-label="두 점 사이 평균 변화율">
            <path d="M32 132 H288" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M83 20 V132" stroke="#cbd5e1" strokeWidth="1.5" />
            <polyline points={curvePoints} fill="none" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <line x1={leftPoint.x} y1={leftPoint.y} x2={rightPoint.x} y2={rightPoint.y} stroke="#0f172a" strokeWidth="2.5" />
            <circle cx={leftPoint.x} cy={leftPoint.y} r="5" fill="#0f172a" />
            <circle cx={rightPoint.x} cy={rightPoint.y} r="5" fill="#14b8a6" />
          </svg>
        </div>
      </div>
    </section>
  );
}
