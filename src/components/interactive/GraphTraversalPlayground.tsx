"use client";

import { useMemo, useState } from "react";

type NodeId = "A" | "B" | "C" | "D" | "E" | "F";

const nodes: NodeId[] = ["A", "B", "C", "D", "E", "F"];

const graph: Record<NodeId, NodeId[]> = {
  A: ["B", "C"],
  B: ["D", "E"],
  C: ["F"],
  D: [],
  E: ["F"],
  F: [],
};

const positions = {
  A: [210, 40],
  B: [130, 105],
  C: [290, 105],
  D: [80, 180],
  E: [180, 180],
  F: [320, 180],
} satisfies Record<NodeId, [number, number]>;

function traverse(mode: "bfs" | "dfs") {
  const visited = new Set<NodeId>(["A"]);
  const order: NodeId[] = [];
  const pending: NodeId[] = ["A"];

  while (pending.length > 0) {
    const current = mode === "bfs" ? pending.shift()! : pending.pop()!;
    order.push(current);

    for (const next of graph[current]) {
      if (!visited.has(next)) {
        visited.add(next);
        pending.push(next);
      }
    }
  }

  return order;
}

export default function GraphTraversalPlayground() {
  const [mode, setMode] = useState<"bfs" | "dfs">("bfs");
  const order = useMemo(() => traverse(mode), [mode]);

  return (
    <section aria-label="그래프 탐색 실험" className="my-8 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <h3 className="m-0 text-lg font-black text-slate-950">그래프 탐색 실험</h3>
      <p className="mt-1 text-sm text-slate-600">
        같은 그래프라도 큐를 쓰는 BFS와 스택처럼 움직이는 DFS는 방문 순서가 달라질 수 있습니다.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {[
          ["bfs", "BFS"],
          ["dfs", "DFS"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key as typeof mode)}
            className={`rounded-md border px-3 py-2 text-sm font-black ${
              mode === key
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <svg viewBox="0 0 420 230" role="img" aria-label="방향 그래프 예시" className="h-auto w-full">
            {nodes.flatMap((from) =>
              graph[from].map((to) => {
                const [x1, y1] = positions[from];
                const [x2, y2] = positions[to];
                return (
                  <line
                    key={`${from}-${to}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#94a3b8"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                );
              }),
            )}
            {nodes.map((node) => {
              const [x, y] = positions[node];

              return (
              <g key={node}>
                <circle cx={x} cy={y} r="24" fill="#f0fdfa" stroke="#0f766e" strokeWidth="2" />
                <text x={x} y={y + 6} textAnchor="middle" fill="#115e59" fontWeight="900" fontSize="18">
                  {node}
                </text>
              </g>
              );
            })}
          </svg>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">A에서 시작한 방문 순서</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {order.map((node, index) => (
              <span key={node} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-black text-slate-800">
                {index + 1}. {node}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            {mode === "bfs"
              ? "BFS는 시작점에서 가까운 정점부터 넓게 방문합니다."
              : "DFS는 한 갈래를 가능한 깊게 따라간 뒤 돌아옵니다."}
          </p>
        </div>
      </div>
    </section>
  );
}
