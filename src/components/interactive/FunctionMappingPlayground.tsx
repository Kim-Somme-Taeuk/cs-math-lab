"use client";

import { useMemo, useState } from "react";

type MappingTarget = "0" | "1" | "2";
type Mapping = Record<string, MappingTarget[]>;

const inputs = ["alice", "bob", "chris"];
const outputs: MappingTarget[] = ["0", "1", "2"];

function formatTargets(targets: MappingTarget[]) {
  return targets.length > 0 ? targets.join(", ") : "없음";
}

function targetTone(targets: MappingTarget[]) {
  if (targets.length === 0) return "bg-rose-50 text-rose-700";
  if (targets.length > 1) return "bg-rose-50 text-rose-700";
  return "bg-teal-50 text-teal-800";
}

function toggleTarget(mapping: Mapping, input: string, target: MappingTarget): Mapping {
  const currentTargets = mapping[input];
  const nextTargets = currentTargets.includes(target)
    ? currentTargets.filter((item) => item !== target)
    : [...currentTargets, target].sort();
  return { ...mapping, [input]: nextTargets };
}

export default function FunctionMappingPlayground() {
  const [mapping, setMapping] = useState<Mapping>({
    alice: ["1"],
    bob: ["1"],
    chris: ["2"],
  });

  const result = useMemo(() => {
    const missingInputs = inputs.filter((input) => mapping[input].length === 0);
    const splitInputs = inputs.filter((input) => mapping[input].length > 1);

    if (missingInputs.length > 0) {
      return {
        valid: false,
        title: "함수가 아닙니다",
        reason: `${missingInputs.join(", ")}의 출력이 정해지지 않았습니다.`,
      };
    }

    if (splitInputs.length > 0) {
      return {
        valid: false,
        title: "함수가 아닙니다",
        reason: `${splitInputs.join(", ")}가 여러 출력으로 연결됩니다.`,
      };
    }

    return {
      valid: true,
      title: "함수입니다",
      reason: "모든 입력이 정확히 하나의 출력으로 연결됩니다.",
    };
  }, [mapping]);

  return (
    <section aria-label="함수 대응 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <h3 className="m-0 text-lg font-black text-slate-950">함수 매핑 직접 조작기</h3>
      <p className="mt-1 text-sm text-slate-600">
        입력 원소와 출력 원소 사이의 연결을 직접 켜고 끄며 함수인지 판정합니다.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-[0.95fr_1.05fr] md:items-start">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-bold text-slate-500">연결 선택</p>
          <div className="mt-2 grid w-full gap-1.5 text-sm">
            <div className="grid grid-cols-[3.75rem_repeat(3,minmax(0,1fr))] gap-1.5 rounded-md bg-slate-100 p-1.5 text-xs font-black text-slate-600">
              <span className="px-1.5 py-1">입력</span>
              {outputs.map((output) => (
                <span key={output} className="px-1 py-1 text-center">
                  출력 {output}
                </span>
              ))}
            </div>
            {inputs.map((input) => (
              <div
                key={input}
                className="grid grid-cols-[3.75rem_repeat(3,minmax(0,1fr))] gap-1.5 rounded-md bg-slate-50 p-1.5"
              >
                <span className="flex items-center px-1.5 font-black text-slate-950">{input}</span>
                {outputs.map((output) => (
                  <button
                    key={`${input}-${output}`}
                    type="button"
                    onClick={() => setMapping((current) => toggleTarget(current, input, output))}
                    className={`h-9 rounded-md border px-1 text-xs font-black ${
                      mapping[input].includes(output)
                        ? "border-teal-600 bg-teal-50 text-teal-800"
                        : "border-slate-300 bg-white text-slate-600"
                    }`}
                  >
                    {mapping[input].includes(output) ? "연결" : "없음"}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <dl className="mt-2 grid gap-2 sm:grid-cols-3">
            {inputs.map((input) => (
              <div key={input} className="rounded-md bg-slate-50 px-3 py-2 text-sm">
                <dt className="font-black text-slate-950">{input}</dt>
                <dd className="m-0 mt-1">
                  <span className={`inline-flex min-w-12 justify-center rounded px-2 py-0.5 text-xs font-black ${targetTone(mapping[input])}`}>
                    {formatTargets(mapping[input])}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <svg viewBox="0 0 420 260" role="img" aria-label="입력 집합과 출력 집합 사이의 대응" className="h-auto w-full">
            <text x="48" y="28" fill="#0f172a" fontWeight="800">
              입력
            </text>
            <text x="318" y="28" fill="#0f172a" fontWeight="800">
              출력
            </text>
            {inputs.map((input, index) => (
              <g key={input}>
                <circle cx="72" cy={70 + index * 70} r="24" fill="#f0fdfa" stroke="#0f766e" strokeWidth="2" />
                <text x="72" y={75 + index * 70} textAnchor="middle" fill="#115e59" fontWeight="800" fontSize="13">
                  {input}
                </text>
              </g>
            ))}
            {outputs.map((output, index) => (
              <g key={output}>
                <circle cx="342" cy={70 + index * 70} r="24" fill="#eef2ff" stroke="#4338ca" strokeWidth="2" />
                <text x="342" y={76 + index * 70} textAnchor="middle" fill="#3730a3" fontWeight="800" fontSize="18">
                  {output}
                </text>
              </g>
            ))}
            {inputs.flatMap((input, inputIndex) =>
              mapping[input].map((target) => {
                const outputIndex = outputs.indexOf(target);
                const split = mapping[input].length > 1;

                return (
                  <line
                    key={`${input}-${target}`}
                    x1="98"
                    y1={70 + inputIndex * 70}
                    x2="316"
                    y2={70 + outputIndex * 70}
                    stroke={split ? "#e11d48" : "#0f172a"}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                );
              }),
            )}
          </svg>
          <div
            className={`mt-3 h-[96px] rounded-md p-3 ${
              result.valid ? "bg-teal-50 text-teal-900" : "bg-rose-50 text-rose-900"
            }`}
          >
            <p className="font-black">{result.title}</p>
            <p className="mt-1 text-sm leading-6">{result.reason}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
