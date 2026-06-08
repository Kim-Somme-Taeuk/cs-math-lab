"use client";

import { useMemo, useState } from "react";

const examples = {
  build: {
    label: "빌드 작업",
    nodes: ["코드 작성", "테스트", "빌드", "배포"],
    edges: [
      ["코드 작성", "테스트"],
      ["테스트", "빌드"],
      ["빌드", "배포"],
    ],
  },
  course: {
    label: "선수 과목",
    nodes: ["기초 수학", "이산수학", "자료구조", "알고리즘"],
    edges: [
      ["기초 수학", "이산수학"],
      ["이산수학", "자료구조"],
      ["자료구조", "알고리즘"],
      ["이산수학", "알고리즘"],
    ],
  },
  parallel: {
    label: "여러 가능한 순서",
    nodes: ["설계", "API", "UI", "통합", "출시"],
    edges: [
      ["설계", "API"],
      ["설계", "UI"],
      ["API", "통합"],
      ["UI", "통합"],
      ["통합", "출시"],
    ],
  },
} as const;

type ExampleKey = keyof typeof examples;

function topologicalSort(nodes: readonly string[], edges: readonly (readonly [string, string])[]) {
  const indegree = new Map(nodes.map((node) => [node, 0]));
  const outgoing = new Map(nodes.map((node) => [node, [] as string[]]));

  for (const [from, to] of edges) {
    indegree.set(to, (indegree.get(to) ?? 0) + 1);
    outgoing.get(from)?.push(to);
  }

  const queue = nodes.filter((node) => indegree.get(node) === 0);
  const order: string[] = [];
  const snapshots: string[] = [];

  while (queue.length > 0) {
    snapshots.push(queue.join(", "));
    const current = queue.shift();
    if (!current) break;
    order.push(current);

    for (const next of outgoing.get(current) ?? []) {
      indegree.set(next, (indegree.get(next) ?? 0) - 1);
      if (indegree.get(next) === 0) queue.push(next);
    }
  }

  return { order, snapshots };
}

export default function TopologicalSortPlayground() {
  const [selected, setSelected] = useState<ExampleKey>("parallel");
  const example = examples[selected];
  const result = useMemo(() => topologicalSort(example.nodes, example.edges), [example]);

  return (
    <section aria-label="위상 정렬 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">위상 정렬 실험</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          의존성 예시를 바꾸며 진입 차수 0인 작업부터 꺼내는 순서를 확인합니다.
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {(Object.keys(examples) as ExampleKey[]).map((key) => (
          <button
            key={key}
            type="button"
            className={`rounded-md px-4 py-3 text-sm font-black ${selected === key ? "bg-slate-950 text-white" : "bg-white text-slate-800"}`}
            onClick={() => setSelected(key)}
          >
            {examples[key].label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-xs font-bold text-slate-500">의존성</p>
          <div className="mt-2 grid gap-2">
            {example.edges.map(([from, to]) => (
              <div key={`${from}-${to}`} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-bold text-slate-800">
                {from} -&gt; {to}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-xs font-bold text-slate-500">위상 정렬 결과</p>
          <ol className="mt-2 grid gap-2">
            {result.order.map((node, index) => (
              <li key={node} className="rounded-md bg-teal-50 px-3 py-2 text-sm font-black text-teal-900">
                {index + 1}. {node}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm font-bold leading-6 text-teal-900">
        큐 변화: {result.snapshots.map((snapshot) => `[${snapshot}]`).join(" -> ")}
      </div>
    </section>
  );
}
