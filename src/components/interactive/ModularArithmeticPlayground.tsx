"use client";

import { useMemo, useState } from "react";

function normalizedModulo(value: number, modulus: number) {
  return ((value % modulus) + modulus) % modulus;
}

function residueCycle(modulus: number, count: number) {
  return Array.from({ length: count }, (_, index) => normalizedModulo(index, modulus));
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

export default function ModularArithmeticPlayground() {
  const [a, setA] = useState(17);
  const [b, setB] = useState(23);
  const [modulus, setModulus] = useState(5);
  const [negativeValue, setNegativeValue] = useState(-7);
  const [base, setBase] = useState(3);
  const [exponent, setExponent] = useState(8);

  const values = useMemo(() => {
    const aMod = normalizedModulo(a, modulus);
    const bMod = normalizedModulo(b, modulus);
    let powerMod = 1;

    for (let step = 0; step < exponent; step += 1) {
      powerMod = (powerMod * base) % modulus;
    }

    return {
      aMod,
      bMod,
      sumDirect: normalizedModulo(a + b, modulus),
      sumReduced: normalizedModulo(aMod + bMod, modulus),
      productDirect: normalizedModulo(a * b, modulus),
      productReduced: normalizedModulo(aMod * bMod, modulus),
      negativeRaw: negativeValue % modulus,
      negativeNormalized: normalizedModulo(negativeValue, modulus),
      cycle: residueCycle(modulus, modulus * 2 + 1),
      powerMod,
    };
  }, [a, b, modulus, negativeValue, base, exponent]);

  return (
    <section aria-label="모듈러 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">모듈러 실험</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          두 수와 modulus를 바꾸며 나머지를 먼저 줄여도 합과 곱 결과가 유지되는지 확인합니다.
        </p>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            a: {a}
            <input type="range" min="0" max="80" value={a} onChange={(event) => setA(Number(event.target.value))} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            b: {b}
            <input type="range" min="0" max="80" value={b} onChange={(event) => setB(Number(event.target.value))} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            m: {modulus}
            <input type="range" min="2" max="12" value={modulus} onChange={(event) => setModulus(Number(event.target.value))} />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            음수 값: {negativeValue}
            <input
              type="range"
              min="-30"
              max="-1"
              value={negativeValue}
              onChange={(event) => setNegativeValue(Number(event.target.value))}
            />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            base: {base}
            <input type="range" min="2" max="12" value={base} onChange={(event) => setBase(Number(event.target.value))} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            exponent: {exponent}
            <input type="range" min="2" max="20" value={exponent} onChange={(event) => setExponent(Number(event.target.value))} />
          </label>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <ResultCard label="a mod m" value={`${a} mod ${modulus} = ${values.aMod}`} detail="a를 m으로 나눈 나머지입니다." />
        <ResultCard label="b mod m" value={`${b} mod ${modulus} = ${values.bMod}`} detail="같은 나머지는 같은 그룹으로 묶입니다." />
        <ResultCard
          label="합"
          value={`${values.sumDirect} = ${values.sumReduced}`}
          detail="(a + b) mod m과 ((a mod m) + (b mod m)) mod m은 같습니다."
        />
        <ResultCard
          label="곱"
          value={`${values.productDirect} = ${values.productReduced}`}
          detail="곱도 먼저 나머지를 줄인 뒤 계산할 수 있습니다."
        />
        <ResultCard
          label="음수 나머지"
          value={`${values.negativeRaw} -> ${values.negativeNormalized}`}
          detail="언어별 % 결과가 달라질 수 있어 0 이상 m 미만으로 보정합니다."
        />
        <ResultCard
          label="큰 거듭제곱"
          value={`${base}^${exponent} mod ${modulus} = ${values.powerMod}`}
          detail="중간 결과를 계속 줄이면 큰 수도 작게 계산할 수 있습니다."
        />
      </div>

      <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-3">
        <p className="text-sm font-bold text-teal-900">순환 구조</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {values.cycle.map((value, index) => (
            <span key={`${index}-${value}`} className="rounded-md bg-white px-2 py-1 text-sm font-black text-slate-900">
              {index} {"->"} {value}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
