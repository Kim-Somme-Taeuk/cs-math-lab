"use client";

import { useMemo, useState } from "react";

type Mode =
  | "vector"
  | "vector-operations"
  | "dot-product"
  | "matrix"
  | "matrix-multiplication"
  | "linear-transformation"
  | "basis-dimension"
  | "inverse-matrix"
  | "eigenvector";

function dot(left: [number, number], right: [number, number]) {
  return left[0] * right[0] + left[1] * right[1];
}

function multiplyMatrixVector(matrix: [[number, number], [number, number]], vector: [number, number]): [number, number] {
  return [
    matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
    matrix[1][0] * vector[0] + matrix[1][1] * vector[1],
  ];
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

export default function LinearAlgebraPlayground({ mode }: { mode: Mode }) {
  const [x, setX] = useState(3);
  const [y, setY] = useState(2);
  const [scale, setScale] = useState(2);

  const values = useMemo(() => {
    const vector: [number, number] = [x, y];
    const other: [number, number] = [2, -1];
    const matrix: [[number, number], [number, number]] = [
      [2, 1],
      [0, 1],
    ];
    const rotation: [[number, number], [number, number]] = [
      [0, -1],
      [1, 0],
    ];
    const flatten: [[number, number], [number, number]] = [
      [1, 0],
      [0, 0],
    ];
    const diagonal: [[number, number], [number, number]] = [
      [scale, 0],
      [0, 1],
    ];

    return {
      vector,
      other,
      sum: [vector[0] + other[0], vector[1] + other[1]],
      scaled: [scale * vector[0], scale * vector[1]],
      dotValue: dot(vector, other),
      matrixVector: multiplyMatrixVector(matrix, vector),
      rotated: multiplyMatrixVector(rotation, vector),
      flattened: multiplyMatrixVector(flatten, vector),
      eigenResult: multiplyMatrixVector(diagonal, [1, 0]),
    };
  }, [x, y, scale]);

  const modeTitle: Record<Mode, string> = {
    vector: "벡터 보기",
    "vector-operations": "벡터 연산",
    "dot-product": "내적 비교",
    matrix: "행렬로 묶기",
    "matrix-multiplication": "행렬 곱셈",
    "linear-transformation": "선형변환",
    "basis-dimension": "기저와 좌표",
    "inverse-matrix": "되돌릴 수 있는가",
    eigenvector: "고유벡터 맛보기",
  };

  return (
    <section aria-label={modeTitle[mode]} className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">{modeTitle[mode]}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          2차원 예시를 움직이며 벡터와 행렬이 값을 어떻게 표현하고 바꾸는지 확인합니다.
        </p>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          x: {x}
          <input type="range" min="-5" max="5" value={x} onChange={(event) => setX(Number(event.target.value))} />
        </label>
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          y: {y}
          <input type="range" min="-5" max="5" value={y} onChange={(event) => setY(Number(event.target.value))} />
        </label>
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          scale: {scale}
          <input type="range" min="-3" max="4" value={scale} onChange={(event) => setScale(Number(event.target.value))} />
        </label>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <ResultCard label="벡터" value={`[${values.vector.join(", ")}]`} detail="숫자 묶음이면서 2D에서는 방향과 크기를 가진 화살표로 볼 수 있습니다." />
        <ResultCard label="덧셈" value={`[${values.sum.join(", ")}]`} detail="[2, -1]을 더하면 각 좌표를 따로 더합니다." />
        <ResultCard label="스칼라 곱" value={`[${values.scaled.join(", ")}]`} detail="스칼라는 방향을 유지하거나 뒤집고 크기를 바꿉니다." />
        <ResultCard label="내적" value={String(values.dotValue)} detail="값이 클수록 두 벡터가 비슷한 방향을 보는 감각과 연결됩니다." />
        <ResultCard label="행렬-벡터 곱" value={`[${values.matrixVector.join(", ")}]`} detail="행렬은 벡터를 다른 벡터로 보내는 규칙처럼 읽을 수 있습니다." />
        <ResultCard label="회전" value={`[${values.rotated.join(", ")}]`} detail="[[0,-1],[1,0]]은 2D 벡터를 90도 회전시키는 변환입니다." />
        <ResultCard label="투영 맛보기" value={`[${values.flattened.join(", ")}]`} detail="y 정보를 0으로 만들면 원래 벡터를 완전히 되돌릴 수 없습니다." />
        <ResultCard label="표준기저" value="[1, 0], [0, 1]" detail="2D 좌표를 만드는 기본 방향입니다." />
        <ResultCard label="고유벡터 맛보기" value={`[1, 0] -> [${values.eigenResult.join(", ")}]`} detail="방향은 그대로이고 크기만 바뀌는 벡터를 고유벡터 관점으로 봅니다." />
      </div>
    </section>
  );
}
