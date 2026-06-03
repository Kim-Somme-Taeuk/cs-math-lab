"use client";

import { useMemo, useState } from "react";
import { implication } from "@/lib/logic";

function TruthBadge({ value }: { value: boolean }) {
  return (
    <span
      className={`inline-flex min-w-14 justify-center rounded-md px-2.5 py-1 text-sm font-bold ${
        value ? "bg-teal-100 text-teal-800" : "bg-rose-100 text-rose-800"
      }`}
    >
      {value ? "참" : "거짓"}
    </span>
  );
}

function ToggleButton({
  label,
  value,
  onClick,
}: {
  label: string;
  value: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-slate-300 bg-white px-4 py-3 text-left hover:border-teal-500"
    >
      <span className="block text-sm font-bold text-slate-500">{label}</span>
      <span className="mt-1 flex items-center gap-2 text-lg font-black text-slate-950">
        {value ? "True" : "False"}
        <TruthBadge value={value} />
      </span>
    </button>
  );
}

function formatTruth(value: boolean) {
  return value ? "참" : "거짓";
}

export default function ConditionalPlayground() {
  const [p, setP] = useState(true);
  const [q, setQ] = useState(false);
  const result = useMemo(() => implication(p, q), [p, q]);
  const converse = useMemo(() => implication(q, p), [p, q]);
  const contrapositive = useMemo(() => implication(!q, !p), [p, q]);
  const violation = p && !q;

  const truthTable = [
    [true, true],
    [true, false],
    [false, true],
    [false, false],
  ] as const;

  return (
    <section aria-label="조건문 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4 lg:min-h-[520px]">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">조건문 위반 탐지기</h3>
        <p className="mt-1 text-sm text-slate-600">
          P와 Q를 바꾸며 P -&gt; Q, Q -&gt; P, 대우가 어떻게 달라지는지 비교합니다.
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ToggleButton label="조건 P: 비가 온다" value={p} onClick={() => setP((current) => !current)} />
        <ToggleButton label="결론 Q: 우산을 가져간다" value={q} onClick={() => setQ((current) => !current)} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className={`min-h-[232px] rounded-lg border p-3 ${violation ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white"}`}>
          <p className="text-sm font-bold text-slate-500">현재 상황</p>
          <div className="mt-3 grid gap-2">
            <p className="flex items-center justify-between gap-3 text-sm font-bold text-slate-800">
              P -&gt; Q <TruthBadge value={result} />
            </p>
            <p className="flex items-center justify-between gap-3 text-sm font-bold text-slate-800">
              Q -&gt; P <TruthBadge value={converse} />
            </p>
            <p className="flex items-center justify-between gap-3 text-sm font-bold text-slate-800">
              NOT Q -&gt; NOT P <TruthBadge value={contrapositive} />
            </p>
          </div>
          <p className="mt-3 min-h-14 text-sm leading-6 text-slate-700">
            {violation
              ? "P가 참인데 Q가 거짓입니다. 이 한 경우만 P -> Q를 직접 위반하므로 빨간색으로 표시합니다."
              : p
                ? "비가 왔고 우산도 가져갔습니다. 약속이 지켜졌으므로 조건문은 참입니다."
                : "비가 오지 않았습니다. 약속을 검사할 상황이 아직 생기지 않았으므로 조건문은 참으로 봅니다."}
          </p>
        </div>

        <div className="min-h-[232px] rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-bold text-slate-500">네 가지 경우</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {truthTable.map(([rowP, rowQ]) => {
              const active = rowP === p && rowQ === q;
              const rowResult = implication(rowP, rowQ);
              const rowViolation = rowP && !rowQ;
              return (
                <div
                  key={`${String(rowP)}-${String(rowQ)}`}
                  className={`h-[124px] rounded-md border p-2.5 ${
                    rowViolation
                      ? active
                        ? "border-rose-500 bg-rose-50 ring-2 ring-rose-200"
                        : "border-rose-300 bg-rose-50"
                      : active
                        ? "border-teal-500 bg-teal-50 ring-2 ring-teal-200"
                        : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p className="text-sm font-bold text-slate-700">
                    P: {formatTruth(rowP)} / Q: {formatTruth(rowQ)}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-slate-500">P -&gt; Q</span>
                    <TruthBadge value={rowResult} />
                  </div>
                  <p className={`mt-1.5 text-sm ${rowViolation ? "font-black text-rose-700" : "text-slate-600"}`}>
                    {rowViolation ? "P 참, Q 거짓" : "위반 아님"}
                  </p>
                  <p
                    className={`mt-1 min-h-4 text-xs font-black ${
                      active ? (rowViolation ? "text-rose-700" : "text-teal-700") : "text-transparent"
                    }`}
                    aria-hidden={!active}
                  >
                    현재 선택한 경우
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
