"use client";

import { Fragment, useMemo, useState } from "react";

const elements = ["1", "2", "3"];

function pair(a: string, b: string) {
  return `(${a},${b})`;
}

function formatPair(value: string) {
  const [a, b] = value.replace(/[()]/g, "").split(",");
  return `(${a}, ${b})`;
}

function formatCompactPair(value: string) {
  const [a, b] = value.replace(/[()]/g, "").split(",");
  return `(${a},${b})`;
}

function togglePair(pairs: string[], value: string) {
  return pairs.includes(value) ? pairs.filter((item) => item !== value) : [...pairs, value].sort();
}

export default function RelationPlayground() {
  const [pairs, setPairs] = useState(["(1,1)", "(2,2)", "(3,3)", "(1,2)", "(2,1)", "(2,3)"]);

  const analysis = useMemo(() => {
    const missingReflexive = elements.map((item) => pair(item, item)).filter((item) => !pairs.includes(item));
    const missingSymmetricCases = pairs
      .filter((item) => {
        const [a, b] = item.replace(/[()]/g, "").split(",");
        return !pairs.includes(pair(b, a));
      })
      .map((item) => {
        const [a, b] = item.replace(/[()]/g, "").split(",");
        return { selected: item, missing: pair(b, a) };
      });
    const missingTransitiveCases: { first: string; second: string; missing: string }[] = [];

    for (const first of pairs) {
      const [a, b] = first.replace(/[()]/g, "").split(",");
      for (const second of pairs) {
        const [c, d] = second.replace(/[()]/g, "").split(",");
        const needed = pair(a, d);
        if (b === c && !pairs.includes(needed)) {
          missingTransitiveCases.push({ first, second, missing: needed });
        }
      }
    }

    const firstSymmetricCase = missingSymmetricCases[0];
    const firstTransitiveCase = missingTransitiveCases[0];

    return {
      reflexive: missingReflexive.length === 0,
      symmetric: missingSymmetricCases.length === 0,
      transitive: missingTransitiveCases.length === 0,
      highlightMissing: new Set([
        ...missingReflexive,
        ...(firstSymmetricCase ? [firstSymmetricCase.missing] : []),
        ...(firstTransitiveCase ? [firstTransitiveCase.missing] : []),
      ]),
      highlightSelected: new Set([
        ...(firstSymmetricCase ? [firstSymmetricCase.selected] : []),
        ...(firstTransitiveCase ? [firstTransitiveCase.first, firstTransitiveCase.second] : []),
      ]),
      reflexiveReason:
        missingReflexive.length === 0
          ? "모든 자기 자신 쌍이 있습니다."
          : `대각선 ${missingReflexive.map(formatPair).join(", ")} 필요`,
      symmetricReason:
        missingSymmetricCases.length === 0
          ? "모든 쌍에 대해 반대 방향 쌍이 있습니다."
          : `${formatPair(firstSymmetricCase.selected)}의 반대 ${formatPair(firstSymmetricCase.missing)} 필요`,
      transitiveReason:
        missingTransitiveCases.length === 0
          ? "이어지는 두 쌍이 있을 때 건너뛴 쌍도 있습니다."
          : `${formatPair(firstTransitiveCase.first)}에서 ${formatPair(firstTransitiveCase.second)}로 이어 보면 ${formatPair(firstTransitiveCase.missing)} 필요`,
    };
  }, [pairs]);

  const rows = [
    ["반사성", analysis.reflexive, analysis.reflexiveReason],
    ["대칭성", analysis.symmetric, analysis.symmetricReason],
    ["추이성", analysis.transitive, analysis.transitiveReason],
  ] as const;

  return (
    <section aria-label="관계 성질 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <h3 className="m-0 text-lg font-black text-slate-950">관계 성질 판별기</h3>
      <p className="mt-1 text-sm text-slate-600">
        3x3 관계쌍 체크보드에서 순서쌍을 직접 고릅니다. 노란 칸을 이어 보면 필요한 칸이 표시됩니다.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="min-w-0 h-[328px] overflow-hidden rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-bold text-slate-500">관계 R</p>
          <div className="mt-2 grid min-w-0 grid-cols-[1.5rem_repeat(3,minmax(0,1fr))] gap-1">
            <span />
            {elements.map((b) => (
              <span key={`head-${b}`} className="text-center text-sm font-black text-slate-700">
                {b}
              </span>
            ))}
            {elements.map((a) => (
              <Fragment key={`row-${a}`}>
                <span className="flex items-center text-sm font-black text-slate-700">{a}</span>
                {elements.map((b) => {
                  const value = pair(a, b);
                  const selected = pairs.includes(value);
                  const missing = analysis.highlightMissing.has(value);
                  const selectedCounterexample = analysis.highlightSelected.has(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPairs((current) => togglePair(current, value))}
                      className={`min-w-0 w-full rounded-md border px-1 py-2 text-xs font-black sm:text-sm ${
                        missing
                          ? "border-dashed border-rose-300 bg-rose-50/40 text-rose-600"
                          : selectedCounterexample
                            ? "border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-100"
                            : selected
                          ? "border-teal-600 bg-teal-50 text-teal-800"
                          : "border-slate-300 bg-white text-slate-500"
                      }`}
                    >
                      {missing ? "필요" : selected ? formatCompactPair(value) : "없음"}
                    </button>
                  );
                })}
              </Fragment>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
            <span className="rounded bg-teal-50 px-2 py-1 text-teal-800">선택한 관계</span>
            <span className="rounded bg-amber-50 px-2 py-1 text-amber-900">반례의 출발</span>
            <span className="rounded border border-dashed border-rose-300 bg-rose-50/40 px-2 py-1 text-rose-700">필요한 칸</span>
          </div>
          <div className="mt-3 flex h-10 items-center gap-1.5 overflow-hidden rounded-md bg-slate-50 px-2 text-sm text-slate-700">
            <span className="shrink-0 font-black text-slate-500">R</span>
            <div className="flex min-w-0 flex-1 flex-wrap gap-0.5">
              {pairs.length === 0 ? (
                <span className="flex h-4 items-center rounded bg-white px-1 font-mono text-[10px] font-bold text-slate-500">{"{}"}</span>
              ) : (
                pairs.map((value) => (
                  <span key={value} className="flex h-4 items-center rounded bg-white px-1 font-mono text-[10px] font-bold leading-none text-slate-700">
                    {formatCompactPair(value)}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="min-w-0 h-[328px] rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-bold text-slate-500">성질 판정</p>
          <div className="mt-2 grid gap-2">
          {rows.map(([label, valid, reason]) => (
            <div
              key={label}
              className={`h-[82px] rounded-md border px-3 py-2 ${
                valid ? "border-teal-200 bg-teal-50 text-teal-900" : "border-rose-200 bg-rose-50 text-rose-900"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-black">{label}</p>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-black ${
                    valid ? "bg-teal-700 text-white" : "bg-rose-700 text-white"
                  }`}
                >
                  {valid ? "만족" : "실패"}
                </span>
              </div>
              <p className="mt-1 h-7 overflow-y-auto text-sm leading-6">{reason}</p>
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
