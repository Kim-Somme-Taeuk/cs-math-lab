"use client";

import { useMemo, useState } from "react";

type Mode =
  | "coordinate-transform"
  | "affine-homogeneous"
  | "rotation"
  | "graphics-pipeline"
  | "pca"
  | "svd"
  | "numerical-stability"
  | "gradient-jacobian"
  | "neural-linear-layer";

function ResultCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

function formatPair(pair: [number, number]) {
  return `[${pair.map((value) => value.toFixed(1)).join(", ")}]`;
}

export default function LinearAlgebraLevelThreePlayground({ mode }: { mode: Mode }) {
  const [x, setX] = useState(2);
  const [y, setY] = useState(1);
  const [scale, setScale] = useState(2);
  const [angle, setAngle] = useState(45);

  const values = useMemo(() => {
    const radians = (angle * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const point: [number, number] = [x, y];
    const rotated: [number, number] = [cos * x - sin * y, sin * x + cos * y];
    const scaled: [number, number] = [scale * x, y / Math.max(1, scale)];
    const translated: [number, number] = [x + scale, y + 1];
    const projected: [number, number] = [x / (scale + 1), y / (scale + 1)];
    const pcaMain = Math.abs(x) >= Math.abs(y) ? "x 방향 분산이 큼" : "y 방향 분산이 큼";
    const singularHint = scale >= 2 ? "첫 방향이 더 강함" : "두 방향이 비슷함";
    const conditionHint = Math.abs(scale - 1) <= 1 ? "비교적 안정" : "작은 오차가 커질 수 있음";
    const gradient: [number, number] = [2 * x, 2 * y];
    const layer: [number, number] = [scale * x - y, x + scale * y];

    return {
      point,
      rotated,
      scaled,
      translated,
      projected,
      pcaMain,
      singularHint,
      conditionHint,
      gradient,
      layer,
    };
  }, [angle, scale, x, y]);

  const modeTitle: Record<Mode, string> = {
    "coordinate-transform": "좌표계 변환 실험",
    "affine-homogeneous": "동차좌표 실험",
    rotation: "회전 실험",
    "graphics-pipeline": "파이프라인 실험",
    pca: "PCA 방향 실험",
    svd: "SVD 감각 실험",
    "numerical-stability": "수치 안정성 판별",
    "gradient-jacobian": "그래디언트와 야코비안 실험",
    "neural-linear-layer": "선형 계층 실험",
  };

  return (
    <section aria-label={modeTitle[mode]} className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">{modeTitle[mode]}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          작은 2D 숫자 예시로 선형대수가 어떤 응용 문제를 모델링하는지 확인합니다.
        </p>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-4">
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          x: {x}
          <input type="range" min="-3" max="4" value={x} onChange={(event) => setX(Number(event.target.value))} />
        </label>
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          y: {y}
          <input type="range" min="-3" max="4" value={y} onChange={(event) => setY(Number(event.target.value))} />
        </label>
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          scale: {scale}
          <input type="range" min="1" max="5" value={scale} onChange={(event) => setScale(Number(event.target.value))} />
        </label>
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          angle: {angle}°
          <input type="range" min="0" max="90" step="15" value={angle} onChange={(event) => setAngle(Number(event.target.value))} />
        </label>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <ResultCard label="좌표 표현" value={formatPair(values.point)} detail="좌표는 같은 점을 어떤 기준 벡터로 설명하는지에 따라 달라집니다." />
        <ResultCard label="아핀 변환" value={formatPair(values.translated)} detail="동차좌표를 쓰면 이동도 행렬 곱 흐름에 함께 넣을 수 있습니다." />
        <ResultCard label="회전" value={formatPair(values.rotated)} detail="회전 행렬은 길이 감각을 유지하며 방향을 바꿉니다." />
        <ResultCard label="그래픽스 파이프라인" value={formatPair(values.projected)} detail="모델 좌표는 여러 행렬을 지나 화면에 가까운 좌표로 해석됩니다." />
        <ResultCard label="PCA" value={values.pcaMain} detail="데이터가 가장 많이 퍼지는 방향을 주요 축으로 잡습니다." />
        <ResultCard label="SVD" value={values.singularHint} detail="행렬을 방향 회전, 강도 스케일, 다시 회전하는 구조로 읽습니다." />
        <ResultCard label="수치 안정성" value={values.conditionHint} detail="조건이 나쁘면 입력의 작은 흔들림이 결과에서 크게 보일 수 있습니다." />
        <ResultCard label="그래디언트" value={formatPair(values.gradient)} detail="여러 변수 함수가 가장 빠르게 증가하는 방향을 나타냅니다." />
        <ResultCard label="선형 계층" value={formatPair(values.layer)} detail="가중치 행렬은 입력 특징을 다른 특징 공간으로 보냅니다." />
      </div>
    </section>
  );
}
