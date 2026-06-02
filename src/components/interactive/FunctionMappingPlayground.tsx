"use client";

import { useMemo, useState } from "react";

type MappingTarget = "0" | "1" | "2";
type Mapping = Record<string, MappingTarget[]>;

const inputs = ["alice", "bob", "chris"];
const outputs: MappingTarget[] = ["0", "1", "2"];

const presets: { label: string; mapping: Mapping }[] = [
  {
    label: "여러 입력이 같은 출력",
    mapping: {
      alice: ["1"],
      bob: ["1"],
      chris: ["2"],
    },
  },
  {
    label: "한 입력이 두 출력",
    mapping: {
      alice: ["0", "2"],
      bob: ["1"],
      chris: ["2"],
    },
  },
  {
    label: "출력이 빠진 입력",
    mapping: {
      alice: ["0"],
      bob: [],
      chris: ["2"],
    },
  },
];

function formatTargets(targets: MappingTarget[]) {
  return targets.length > 0 ? targets.join(", ") : "없음";
}

export default function FunctionMappingPlayground() {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const mapping = presets[selectedPreset].mapping;

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
    <section aria-label="함수 대응 실험" className="my-8 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <h3 className="m-0 text-lg font-black text-slate-950">함수 대응 실험</h3>
      <p className="mt-1 text-sm text-slate-600">
        입력 집합의 각 원소가 출력 집합의 원소 몇 개로 연결되는지 확인합니다.
      </p>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {presets.map((preset, index) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => setSelectedPreset(index)}
            className={`rounded-md border px-3 py-2 text-sm font-black ${
              selectedPreset === index
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">대응 목록</p>
          <dl className="mt-3 grid gap-3">
            {inputs.map((input) => (
              <div key={input} className="grid grid-cols-[5rem_1fr] gap-3 rounded-md bg-slate-50 p-3 text-sm">
                <dt className="font-black text-slate-950">{input}</dt>
                <dd className="m-0 text-slate-700">-&gt; {formatTargets(mapping[input])}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
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
        </div>
      </div>

      <div
        className={`mt-5 rounded-md p-4 ${
          result.valid ? "bg-teal-50 text-teal-900" : "bg-rose-50 text-rose-900"
        }`}
      >
        <p className="font-black">{result.title}</p>
        <p className="mt-1 text-sm leading-6">{result.reason}</p>
      </div>
    </section>
  );
}
