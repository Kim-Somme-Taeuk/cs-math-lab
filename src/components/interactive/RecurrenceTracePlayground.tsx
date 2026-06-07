"use client";

import { useMemo, useState } from "react";

type TraceCase = {
  id: string;
  title: string;
  code: string;
  shrink: string;
  calls: string;
  work: string;
  recurrence: string;
  complexity: string;
  note: string;
};

const traceCases: TraceCase[] = [
  {
    id: "sum-to",
    title: "sum_to(n)",
    code: `def sum_to(n):
    if n == 1:
        return 1

    return sum_to(n - 1) + n`,
    shrink: "n이 n - 1로 줄어듦",
    calls: "재귀 호출 1개",
    work: "한 호출에서 O(1)",
    recurrence: "T(n) = T(n - 1) + O(1)",
    complexity: "O(n)",
    note: "호출이 한 줄로 n번 이어집니다.",
  },
  {
    id: "binary-search",
    title: "binary_search(values, target)",
    code: `def binary_search(values, target, left, right):
    if left > right:
        return False

    mid = (left + right) // 2
    if values[mid] == target:
        return True

    if values[mid] < target:
        return binary_search(values, target, mid + 1, right)

    return binary_search(values, target, left, mid - 1)`,
    shrink: "범위가 절반으로 줄어듦",
    calls: "재귀 호출 1개",
    work: "한 호출에서 O(1)",
    recurrence: "T(n) = T(n / 2) + O(1)",
    complexity: "O(log n)",
    note: "각 단계에서 남은 후보가 절반씩 사라집니다.",
  },
  {
    id: "fib",
    title: "naive_fib(n)",
    code: `def fib(n):
    if n <= 1:
        return n

    return fib(n - 1) + fib(n - 2)`,
    shrink: "n - 1과 n - 2로 줄어듦",
    calls: "재귀 호출 2개",
    work: "한 호출에서 O(1)",
    recurrence: "T(n) = T(n - 1) + T(n - 2) + O(1)",
    complexity: "O(2^n)",
    note: "같은 작은 문제가 계속 중복 계산되어 호출 트리가 빠르게 퍼집니다.",
  },
  {
    id: "merge-sort",
    title: "merge_sort(values)",
    code: `def merge_sort(values):
    if len(values) <= 1:
        return values

    mid = len(values) // 2
    left = merge_sort(values[:mid])
    right = merge_sort(values[mid:])

    return merge(left, right)`,
    shrink: "크기 n/2인 문제 2개",
    calls: "재귀 호출 2개",
    work: "한 호출에서 합치기 O(n)",
    recurrence: "T(n) = 2T(n / 2) + O(n)",
    complexity: "O(n log n)",
    note: "깊이는 log n이고, 각 레벨에서 합치는 비용이 전체 O(n)입니다.",
  },
];

const shrinkOptions = ["n이 n - 1로 줄어듦", "범위가 절반으로 줄어듦", "크기 n/2인 문제 2개"];
const callOptions = ["재귀 호출 1개", "재귀 호출 2개"];
const workOptions = ["한 호출에서 O(1)", "한 호출에서 O(n)"];
const recurrenceOptions = [
  "T(n) = T(n - 1) + O(1)",
  "T(n) = T(n / 2) + O(1)",
  "T(n) = T(n - 1) + T(n - 2) + O(1)",
  "T(n) = 2T(n / 2) + O(n)",
];

function Field({
  label,
  value,
  options,
  onChange,
  correct,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  correct: string;
}) {
  const answered = value.length > 0;
  const isCorrect = value === correct;

  return (
    <label className="grid gap-1 text-sm font-bold text-slate-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-950"
      >
        <option value="">선택</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {answered ? (
        <span className={isCorrect ? "text-xs text-teal-700" : "text-xs text-rose-700"}>
          {isCorrect ? "맞습니다." : `다시 보기: ${correct}`}
        </span>
      ) : null}
    </label>
  );
}

export default function RecurrenceTracePlayground() {
  const [caseId, setCaseId] = useState(traceCases[0].id);
  const [shrink, setShrink] = useState("");
  const [calls, setCalls] = useState("");
  const [work, setWork] = useState("");
  const [recurrence, setRecurrence] = useState("");
  const activeCase = traceCases.find((traceCase) => traceCase.id === caseId) ?? traceCases[0];
  const correctCount = [shrink === activeCase.shrink, calls === activeCase.calls, work === activeCase.work, recurrence === activeCase.recurrence]
    .filter(Boolean)
    .length;

  const reset = (nextCaseId: string) => {
    setCaseId(nextCaseId);
    setShrink("");
    setCalls("");
    setWork("");
    setRecurrence("");
  };

  const result = useMemo(() => {
    if (correctCount < 4) return "코드에서 입력 크기, 호출 수, 한 호출 비용을 먼저 분리해 보세요.";
    return `${activeCase.recurrence} 이므로 ${activeCase.complexity}로 읽습니다. ${activeCase.note}`;
  }, [activeCase, correctCount]);

  return (
    <section aria-label="재귀 코드 추적" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="m-0 text-lg font-black text-slate-950">재귀 코드 추적</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            코드 조각을 보고 입력 크기 변화, 재귀 호출 수, 한 호출의 추가 비용을 골라 점화식으로 바꿉니다.
          </p>
        </div>
        <p className="rounded-md bg-white px-3 py-2 text-sm font-black text-slate-950">{correctCount} / 4</p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {traceCases.map((traceCase) => (
          <button
            key={traceCase.id}
            type="button"
            onClick={() => reset(traceCase.id)}
            className={`rounded-md border px-3 py-2 text-sm font-black ${
              traceCase.id === activeCase.id
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            {traceCase.title}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <pre className="min-h-[290px] overflow-x-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-50">
          <code>{activeCase.code}</code>
        </pre>

        <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <Field label="입력 크기는 어떻게 줄어드나?" value={shrink} options={shrinkOptions} onChange={setShrink} correct={activeCase.shrink} />
          <Field label="재귀 호출은 몇 개인가?" value={calls} options={callOptions} onChange={setCalls} correct={activeCase.calls} />
          <Field label="한 호출의 추가 비용은?" value={work} options={workOptions} onChange={setWork} correct={activeCase.work} />
          <Field label="점화식은?" value={recurrence} options={recurrenceOptions} onChange={setRecurrence} correct={activeCase.recurrence} />
          <div className="min-h-[92px] rounded-md border border-teal-200 bg-teal-50 p-3 text-sm font-bold leading-6 text-teal-900">
            {result}
          </div>
        </div>
      </div>
    </section>
  );
}
