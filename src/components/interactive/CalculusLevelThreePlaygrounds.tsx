"use client";

import { useMemo, useState } from "react";

function loss(x: number) {
  return (x - 2) * (x - 2) + 1;
}

function gradient(x: number) {
  return 2 * (x - 2);
}

function toGraphPoint(x: number, y: number) {
  return {
    x: 32 + ((x + 4) / 8) * 256,
    y: 132 - (y / 38) * 108,
  };
}

function descentPath(start: number, rate: number, steps: number) {
  const points = [{ x: start, y: loss(start) }];
  let current = start;

  for (let i = 0; i < steps; i += 1) {
    current = current - rate * gradient(current);
    points.push({ x: current, y: loss(current) });
  }

  return points;
}

function curvePoints() {
  return Array.from({ length: 81 }, (_, index) => {
    const x = -4 + index * 0.1;
    const point = toGraphPoint(x, Math.min(38, loss(x)));
    return `${point.x},${point.y}`;
  }).join(" ");
}

export function GradientDescentPlayground() {
  const [start, setStart] = useState(-3);
  const [rate, setRate] = useState(0.2);
  const path = descentPath(start, rate, 8);
  const points = useMemo(() => curvePoints(), []);
  const current = path.at(-1) ?? path[0];

  return (
    <section aria-label="경사하강법 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">경사하강법 실험</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          현재 위치에서 기울기의 반대 방향으로 여러 번 이동하며 손실이 줄어드는지 봅니다.
        </p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            시작 x: {start.toFixed(1)}
            <input type="range" min="-3.5" max="3.5" step="0.5" value={start} onChange={(event) => setStart(Number(event.target.value))} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            학습률: {rate.toFixed(2)}
            <input type="range" min="0.05" max="0.9" step="0.05" value={rate} onChange={(event) => setRate(Number(event.target.value))} />
          </label>
          <div className="rounded-md bg-teal-50 p-3">
            <p className="text-xs font-bold text-teal-700">8번 업데이트 후</p>
            <p className="mt-1 text-lg font-black text-slate-950">x={current.x.toFixed(3)}, loss={current.y.toFixed(3)}</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <svg viewBox="0 0 320 160" className="h-52 w-full" role="img" aria-label="경사하강법 이동 경로">
            <path d="M32 132 H288" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M160 24 V132" stroke="#e2e8f0" strokeWidth="1.5" />
            <polyline points={points} fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
            <polyline
              points={path.map((item) => {
                const point = toGraphPoint(item.x, item.y);
                return `${point.x},${point.y}`;
              }).join(" ")}
              fill="none"
              stroke="#0f766e"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {path.map((item, index) => {
              const point = toGraphPoint(item.x, item.y);
              return <circle key={index} cx={point.x} cy={point.y} r={index === path.length - 1 ? 5 : 3.5} fill={index === 0 ? "#f97316" : "#14b8a6"} />;
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}

export function LearningRatePlayground() {
  const [rate, setRate] = useState(0.25);
  const path = descentPath(-3, rate, 10);
  const finalLoss = path.at(-1)?.y ?? loss(-3);
  const behavior = rate > 0.8 ? "크게 튀며 불안정해질 수 있습니다." : rate < 0.12 ? "안정적이지만 아주 느리게 움직입니다." : "비교적 안정적으로 최솟값에 가까워집니다.";

  return (
    <section aria-label="학습률 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">학습률 실험</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          같은 시작점에서 학습률만 바꿔 업데이트가 느린지, 안정적인지, 튀는지 비교합니다.
        </p>
      </div>
      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          학습률: {rate.toFixed(2)}
          <input type="range" min="0.02" max="1.05" step="0.03" value={rate} onChange={(event) => setRate(Number(event.target.value))} />
        </label>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-500">업데이트 횟수</p>
            <p className="mt-1 text-lg font-black text-slate-950">{path.length - 1}</p>
          </div>
          <div className="rounded-md bg-teal-50 p-3">
            <p className="text-xs font-bold text-teal-700">마지막 손실</p>
            <p className="mt-1 text-lg font-black text-slate-950">{finalLoss.toFixed(3)}</p>
          </div>
          <div className="rounded-md bg-amber-50 p-3">
            <p className="text-xs font-bold text-amber-700">해석</p>
            <p className="mt-1 text-sm font-bold leading-6 text-slate-800">{behavior}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EulerMethodPlayground() {
  const [dt, setDt] = useState(0.25);
  const steps = Math.round(3 / dt);
  const values = useMemo(() => {
    const result = [{ t: 0, y: 1 }];
    let y = 1;

    for (let i = 0; i < steps; i += 1) {
      const t = i * dt;
      y = y + (-0.7 * y) * dt;
      result.push({ t: t + dt, y });
    }

    return result;
  }, [dt, steps]);
  const last = values.at(-1) ?? values[0];
  const exact = Math.exp(-0.7 * 3);

  return (
    <section aria-label="오일러 방법 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">오일러 방법 실험</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          변화율 dy/dt=-0.7y를 이용해 현재 상태에서 다음 상태를 조금씩 예측합니다.
        </p>
      </div>
      <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_1fr]">
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          dt: {dt.toFixed(2)}
          <input type="range" min="0.1" max="1" step="0.05" value={dt} onChange={(event) => setDt(Number(event.target.value))} />
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-md bg-teal-50 p-3">
            <p className="text-xs font-bold text-teal-700">오일러 근사</p>
            <p className="mt-1 text-lg font-black text-slate-950">{last.y.toFixed(4)}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-500">참고값</p>
            <p className="mt-1 text-lg font-black text-slate-950">{exact.toFixed(4)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
