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
  const violation = p && !q;

  const truthTable = [
    [true, true],
    [true, false],
    [false, true],
    [false, false],
  ] as const;

  return (
    <section aria-label="조건문 실험" className="my-8 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">조건문 실험</h3>
        <p className="mt-1 text-sm text-slate-600">
          “P라면 Q이다”라는 약속이 언제 깨지는지 한 가지 경우에 집중해서 확인합니다.
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ToggleButton label="조건 P: 비가 온다" value={p} onClick={() => setP((current) => !current)} />
        <ToggleButton label="결론 Q: 우산을 가져간다" value={q} onClick={() => setQ((current) => !current)} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">현재 상황</p>
          <p className="mt-2 text-lg font-black text-slate-950">
            P -&gt; Q = <TruthBadge value={result} />
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            {violation
              ? "비가 왔는데 우산을 가져가지 않았습니다. 약속을 직접 어긴 사례이므로 조건문은 거짓입니다."
              : p
                ? "비가 왔고 우산도 가져갔습니다. 약속이 지켜졌으므로 조건문은 참입니다."
                : "비가 오지 않았습니다. 약속을 검사할 상황이 아직 생기지 않았으므로 조건문은 참으로 봅니다."}
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-[420px]">
            <thead>
              <tr>
                <th>P</th>
                <th>Q</th>
                <th>P -&gt; Q</th>
                <th>해석</th>
              </tr>
            </thead>
            <tbody>
              {truthTable.map(([rowP, rowQ]) => {
                const active = rowP === p && rowQ === q;
                const rowResult = implication(rowP, rowQ);
                return (
                  <tr key={`${String(rowP)}-${String(rowQ)}`} className={active ? "bg-teal-50" : ""}>
                    <td>{formatTruth(rowP)}</td>
                    <td>{formatTruth(rowQ)}</td>
                    <td>
                      <TruthBadge value={rowResult} />
                    </td>
                    <td>{rowP && !rowQ ? "유일한 위반" : "위반 아님"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
