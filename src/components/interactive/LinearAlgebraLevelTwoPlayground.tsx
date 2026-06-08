"use client";

import { useMemo, useState } from "react";

type Mode =
  | "span"
  | "independence"
  | "subspace"
  | "determinant"
  | "rank-column-space"
  | "linear-system"
  | "projection"
  | "least-squares"
  | "diagonalization";

function det2(matrix: [[number, number], [number, number]]) {
  return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
}

function dot(left: [number, number], right: [number, number]) {
  return left[0] * right[0] + left[1] * right[1];
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

export default function LinearAlgebraLevelTwoPlayground({ mode }: { mode: Mode }) {
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);
  const [c, setC] = useState(1);

  const values = useMemo(() => {
    const u: [number, number] = [1, 0];
    const v: [number, number] = mode === "independence" ? [2, 0] : [0, 1];
    const combination: [number, number] = [a * u[0] + b * v[0], a * u[1] + b * v[1]];
    const matrix: [[number, number], [number, number]] = [
      [2, c],
      [1, 2],
    ];
    const determinant = det2(matrix);
    const projectionBase: [number, number] = [1, 1];
    const target: [number, number] = [a, b];
    const projectionScale = dot(target, projectionBase) / dot(projectionBase, projectionBase);
    const projection: [number, number] = [projectionScale * projectionBase[0], projectionScale * projectionBase[1]];
    const error: [number, number] = [target[0] - projection[0], target[1] - projection[1]];
    const linePrediction = a;
    const residual = b - linePrediction;

    return {
      u,
      v,
      combination,
      matrix,
      determinant,
      rankHint: determinant === 0 ? "랭크 1 감각" : "랭크 2 감각",
      systemHint: determinant === 0 ? "해가 없거나 무한히 많을 수 있음" : "해가 하나로 정해지는 감각",
      projection,
      error,
      residual,
      diagonalHint: `x축 ${a}배, y축 ${b}배`,
    };
  }, [a, b, c, mode]);

  const modeTitle: Record<Mode, string> = {
    span: "span 판별",
    independence: "독립성 판별",
    subspace: "부분공간 조건",
    determinant: "행렬식 감각",
    "rank-column-space": "랭크와 열공간",
    "linear-system": "선형시스템 판별",
    projection: "정사영 실험",
    "least-squares": "최소제곱 감각",
    diagonalization: "대각화 맛보기",
  };

  return (
    <section aria-label={modeTitle[mode]} className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">{modeTitle[mode]}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          작은 2D 예시로 계산 절차보다 어떤 구조를 판단하는지 확인합니다.
        </p>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          a: {a}
          <input type="range" min="-3" max="4" value={a} onChange={(event) => setA(Number(event.target.value))} />
        </label>
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          b: {b}
          <input type="range" min="-3" max="4" value={b} onChange={(event) => setB(Number(event.target.value))} />
        </label>
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          c: {c}
          <input type="range" min="-2" max="4" value={c} onChange={(event) => setC(Number(event.target.value))} />
        </label>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <ResultCard label="선형결합" value={`${a}u + ${b}v = [${values.combination.join(", ")}]`} detail="span은 이런 모든 조합이 만드는 영역입니다." />
        <ResultCard label="독립성" value={`u=[${values.u}], v=[${values.v}]`} detail={mode === "independence" ? "같은 직선 위 벡터는 새 방향을 주지 못합니다." : "서로 다른 축은 새 방향을 줍니다."} />
        <ResultCard label="부분공간 조건" value="0 포함, 덧셈/스칼라 곱 닫힘" detail="작은 공간이 벡터 연산 뒤에도 그 안에 남는지 봅니다." />
        <ResultCard label="행렬식" value={`det = ${values.determinant}`} detail={values.determinant === 0 ? "면적이 0으로 눌려 정보가 사라지는 감각입니다." : "면적을 스케일하고 방향 보존/뒤집힘을 알려 줍니다."} />
        <ResultCard label="랭크" value={values.rankHint} detail="열벡터들이 실제로 만드는 독립 방향 수를 봅니다." />
        <ResultCard label="Ax = b" value={values.systemHint} detail="b가 열공간 안에 있는지로 해 존재를 판단합니다." />
        <ResultCard label="정사영" value={`proj = [${values.projection.map((n) => n.toFixed(1)).join(", ")}]`} detail="목표 벡터를 한 방향 위의 가장 가까운 그림자로 내립니다." />
        <ResultCard label="오차" value={`error = [${values.error.map((n) => n.toFixed(1)).join(", ")}]`} detail={`최소제곱에서는 오차 ${values.residual}의 제곱을 줄이는 감각으로 봅니다.`} />
        <ResultCard label="고유 방향" value={values.diagonalHint} detail="대각 행렬은 축 방향을 따로 스케일하는 변환처럼 읽을 수 있습니다." />
      </div>
    </section>
  );
}
