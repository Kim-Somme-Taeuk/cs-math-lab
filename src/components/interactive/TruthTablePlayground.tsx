"use client";

import { useMemo, useState } from "react";
import { evaluateLogic } from "@/lib/logic";

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

export default function TruthTablePlayground() {
  const [p, setP] = useState(true);
  const [q, setQ] = useState(false);
  const result = useMemo(() => evaluateLogic({ p, q }), [p, q]);

  const rows = [
    ["P AND Q", result.and, "두 조건이 모두 참이어야 참입니다."],
    ["P OR Q", result.or, "둘 중 하나라도 참이면 참입니다."],
    ["NOT P", result.notP, "P의 참/거짓을 뒤집습니다."],
    ["NOT Q", result.notQ, "Q의 참/거짓을 뒤집습니다."],
  ] as const;

  return (
    <section aria-label="진리표 실험" className="my-8 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="m-0 text-lg font-black text-slate-950">진리표 실험</h3>
          <p className="mt-1 text-sm text-slate-600">P와 Q를 바꾸며 논리 연산 결과를 확인합니다.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ToggleButton label="명제 P" value={p} onClick={() => setP((current) => !current)} />
        <ToggleButton label="명제 Q" value={q} onClick={() => setQ((current) => !current)} />
      </div>

      <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-[460px]">
          <thead>
            <tr>
              <th>식</th>
              <th>결과</th>
              <th>해석</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([expression, value, explanation]) => (
              <tr key={expression}>
                <td className="font-bold text-slate-950">{expression}</td>
                <td>
                  <TruthBadge value={value} />
                </td>
                <td>{explanation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-md bg-white p-4 text-sm leading-6 text-slate-700">
        이 챕터에서는 AND, OR, NOT처럼 조건을 조합하는 기본 부품에 집중합니다. “P라면 Q이다”
        형태의 조건문은 다음 챕터에서 별도로 다룹니다.
      </div>
    </section>
  );
}
