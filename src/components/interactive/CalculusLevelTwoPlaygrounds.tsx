"use client";

import { useMemo, useState } from "react";

function curve(x: number) {
  return 0.5 * x * x + 1;
}

function surface(x: number, y: number) {
  return x * x + 0.5 * y * y + x * y;
}

function partialX(x: number, y: number) {
  return 2 * x + y;
}

function partialY(x: number, y: number) {
  return y + x;
}

function graphPoint(x: number, y: number) {
  return {
    x: 36 + (x / 4) * 248,
    y: 132 - (y / 10) * 108,
  };
}

export function RiemannSumPlayground() {
  const [slices, setSlices] = useState(6);
  const width = 4 / slices;
  const rectangles = useMemo(
    () =>
      Array.from({ length: slices }, (_, index) => {
        const left = index * width;
        const height = curve(left + width / 2);
        const top = graphPoint(left, height);
        const bottom = graphPoint(left, 0);
        const right = graphPoint(left + width, 0);
        return {
          x: top.x,
          y: top.y,
          width: right.x - bottom.x,
          height: bottom.y - top.y,
        };
      }),
    [slices, width],
  );
  const estimate = rectangles.reduce((total, _, index) => {
    const middle = index * width + width / 2;
    return total + curve(middle) * width;
  }, 0);
  const exact = 44 / 3;
  const curvePoints = useMemo(
    () =>
      Array.from({ length: 49 }, (_, index) => {
        const x = (index / 48) * 4;
        const point = graphPoint(x, curve(x));
        return `${point.x},${point.y}`;
      }).join(" "),
    [],
  );

  return (
    <section aria-label="리만 합 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">리만 합 실험</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          조각 수를 늘리며 직사각형 넓이 합이 곡선 아래 넓이를 더 촘촘하게 따라가는지 봅니다.
        </p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            조각 수: {slices}
            <input type="range" min="2" max="24" step="1" value={slices} onChange={(event) => setSlices(Number(event.target.value))} />
          </label>
          <div className="mt-4 grid gap-2">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs font-bold text-slate-500">직사각형 합 근사</p>
              <p className="mt-1 text-lg font-black text-slate-950">{estimate.toFixed(3)}</p>
            </div>
            <div className="rounded-md bg-teal-50 p-3">
              <p className="text-xs font-bold text-teal-700">참고 넓이</p>
              <p className="mt-1 text-lg font-black text-slate-950">{exact.toFixed(3)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <svg viewBox="0 0 320 160" className="h-52 w-full" role="img" aria-label="직사각형으로 근사한 곡선 아래 넓이">
            <path d="M36 132 H292" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M36 24 V132" stroke="#cbd5e1" strokeWidth="1.5" />
            {rectangles.map((rect, index) => (
              <rect
                key={`${index}-${slices}`}
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                fill="#99f6e4"
                stroke="#0f766e"
                strokeWidth="1"
                opacity="0.72"
              />
            ))}
            <polyline points={curvePoints} fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </section>
  );
}

export function PartialDerivativePlayground() {
  const [x, setX] = useState(1);
  const [y, setY] = useState(1);
  const value = surface(x, y);
  const dx = partialX(x, y);
  const dy = partialY(x, y);
  const length = Math.hypot(dx, dy) || 1;
  const arrowX = 80 + (dx / length) * 54;
  const arrowY = 80 - (dy / length) * 54;

  return (
    <section aria-label="편미분과 그래디언트 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">편미분과 그래디언트 실험</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          f(x, y)=x^2+0.5y^2+xy에서 x만 움직일 때와 y만 움직일 때의 변화율을 나누어 봅니다.
        </p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            x: {x.toFixed(1)}
            <input type="range" min="-2" max="2" step="0.5" value={x} onChange={(event) => setX(Number(event.target.value))} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            y: {y.toFixed(1)}
            <input type="range" min="-2" max="2" step="0.5" value={y} onChange={(event) => setY(Number(event.target.value))} />
          </label>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs font-bold text-slate-500">함수값</p>
              <p className="mt-1 text-lg font-black text-slate-950">{value.toFixed(2)}</p>
            </div>
            <div className="rounded-md bg-teal-50 p-3">
              <p className="text-xs font-bold text-teal-700">x 방향 변화율</p>
              <p className="mt-1 text-lg font-black text-slate-950">{dx.toFixed(2)}</p>
            </div>
            <div className="rounded-md bg-teal-50 p-3">
              <p className="text-xs font-bold text-teal-700">y 방향 변화율</p>
              <p className="mt-1 text-lg font-black text-slate-950">{dy.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <svg viewBox="0 0 160 160" className="h-52 w-full" role="img" aria-label="그래디언트 방향">
            <path d="M20 80 H140" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M80 20 V140" stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx="80" cy="80" r="42" fill="none" stroke="#ccfbf1" strokeWidth="14" />
            <circle cx="80" cy="80" r="26" fill="none" stroke="#99f6e4" strokeWidth="10" />
            <line x1="80" y1="80" x2={arrowX} y2={arrowY} stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
            <circle cx="80" cy="80" r="5" fill="#0f766e" />
            <text x="86" y="74" className="fill-slate-700 text-[9px] font-bold">
              grad f
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}
