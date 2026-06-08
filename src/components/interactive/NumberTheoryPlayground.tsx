"use client";

import { useMemo, useState } from "react";

function divisorsOf(value: number) {
  return Array.from({ length: value }, (_, index) => index + 1).filter((candidate) => value % candidate === 0);
}

function gcd(left: number, right: number): number {
  let a = left;
  let b = right;

  while (b !== 0) {
    const next = a % b;
    a = b;
    b = next;
  }

  return a;
}

function isPrime(value: number) {
  if (value < 2) return false;

  for (let candidate = 2; candidate * candidate <= value; candidate += 1) {
    if (value % candidate === 0) return false;
  }

  return true;
}

function primeFactorsOf(value: number) {
  const factors: number[] = [];
  let remaining = value;
  let candidate = 2;

  while (candidate * candidate <= remaining) {
    while (remaining % candidate === 0) {
      factors.push(candidate);
      remaining /= candidate;
    }

    candidate += 1;
  }

  if (remaining > 1) factors.push(remaining);
  return factors;
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

export default function NumberTheoryPlayground() {
  const [a, setA] = useState(18);
  const [b, setB] = useState(24);
  const [dividend, setDividend] = useState(29);
  const [divisor, setDivisor] = useState(5);

  const values = useMemo(() => {
    const commonGcd = gcd(a, b);
    const lcm = (a * b) / commonGcd;
    const quotient = Math.floor(dividend / divisor);
    const remainder = dividend % divisor;

    return {
      aDivisors: divisorsOf(a),
      bDivisors: divisorsOf(b),
      aPrime: isPrime(a),
      bPrime: isPrime(b),
      aFactors: primeFactorsOf(a),
      bFactors: primeFactorsOf(b),
      commonGcd,
      lcm,
      quotient,
      remainder,
    };
  }, [a, b, dividend, divisor]);

  return (
    <section aria-label="정수론 판별" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">정수론 판별</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          두 수의 약수, 소수 여부, 소인수분해, gcd/lcm, 나눗셈 정리를 한 번에 확인합니다.
        </p>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          a: {a}
          <input type="range" min="2" max="60" value={a} onChange={(event) => setA(Number(event.target.value))} />
        </label>
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          b: {b}
          <input type="range" min="2" max="60" value={b} onChange={(event) => setB(Number(event.target.value))} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            나눠지는 수: {dividend}
            <input type="range" min="2" max="80" value={dividend} onChange={(event) => setDividend(Number(event.target.value))} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            나누는 수: {divisor}
            <input type="range" min="2" max="12" value={divisor} onChange={(event) => setDivisor(Number(event.target.value))} />
          </label>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <ResultCard label="a의 약수" value={values.aDivisors.join(", ")} detail={`${a}을 나누어떨어지게 하는 수입니다.`} />
        <ResultCard label="b의 약수" value={values.bDivisors.join(", ")} detail={`${b}을 나누어떨어지게 하는 수입니다.`} />
        <ResultCard
          label="소수 여부"
          value={`a: ${values.aPrime ? "소수" : "합성수"}, b: ${values.bPrime ? "소수" : "합성수"}`}
          detail="1과 자기 자신만 약수로 가지면 소수입니다."
        />
        <ResultCard label="소인수분해 a" value={values.aFactors.join(" x ")} detail="소수들의 곱으로 수를 표현합니다." />
        <ResultCard label="gcd(a, b)" value={String(values.commonGcd)} detail="두 수를 동시에 나누는 가장 큰 수입니다." />
        <ResultCard label="lcm(a, b)" value={String(values.lcm)} detail="두 수의 공통 배수 중 가장 작은 양수입니다." />
      </div>

      <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm font-bold leading-6 text-teal-900">
        나눗셈 정리: {dividend} = {divisor} x {values.quotient} + {values.remainder}
      </div>
    </section>
  );
}
