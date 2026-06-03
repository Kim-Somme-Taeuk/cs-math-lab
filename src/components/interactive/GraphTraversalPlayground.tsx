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

const edges = [
  ["A", "B"],
  ["A", "C"],
  ["B", "D"],
  ["B", "E"],
  ["C", "F"],
  ["E", "F"],
] satisfies Array<[NodeId, NodeId]>;

const positions = {
  A: [210, 40],
  B: [130, 105],
  C: [290, 105],
  D: [80, 180],
  E: [180, 180],
  F: [320, 180],
} satisfies Record<NodeId, [number, number]>;

function shortenEdge(from: NodeId, to: NodeId) {
  const [x1, y1] = positions[from];
  const [x2, y2] = positions[to];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  const shrink = 30;

  return {
    x1,
    y1,
    x2: x2 - (dx / length) * shrink,
    y2: y2 - (dy / length) * shrink,
  };
}

function buildSteps(mode: "bfs" | "dfs", start: NodeId) {
  const visited = new Set<NodeId>([start]);
  const order: NodeId[] = [];
  const pending: NodeId[] = [start];
  const distances: Partial<Record<NodeId, number>> = { [start]: 0 };
  const steps: {
    current: NodeId | null;
    pending: NodeId[];
    order: NodeId[];
    distances: Partial<Record<NodeId, number>>;
  }[] = [{ current: null, pending: [...pending], order: [], distances: { ...distances } }];

  while (pending.length > 0) {
    const current = mode === "bfs" ? pending.shift()! : pending.pop()!;
    order.push(current);

    for (const next of graph[current]) {
      if (!visited.has(next)) {
        visited.add(next);
        distances[next] = (distances[current] ?? 0) + 1;
        pending.push(next);
      }
    }

    steps.push({ current, pending: [...pending], order: [...order], distances: { ...distances } });
  }

  return steps;
}

export default function GraphTraversalPlayground() {
  const [mode, setMode] = useState<"bfs" | "dfs">("bfs");
  const [start, setStart] = useState<NodeId>("A");
  const [stepIndex, setStepIndex] = useState(0);
  const steps = useMemo(() => buildSteps(mode, start), [mode, start]);
  const step = steps[Math.min(stepIndex, steps.length - 1)];

  function reset(nextMode = mode, nextStart = start) {
    setMode(nextMode);
    setStart(nextStart);
    setStepIndex(0);
  }

  return (
    <section aria-label="그래프 탐색 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <h3 className="m-0 text-lg font-black text-slate-950">DFS/BFS 단계 실행기</h3>
      <p className="mt-1 text-sm text-slate-600">
        같은 그래프라도 큐를 쓰는 BFS와 스택처럼 움직이는 DFS는 방문 순서가 달라질 수 있습니다.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_1fr]">
        {[
          ["bfs", "BFS"],
          ["dfs", "DFS"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => reset(key as typeof mode)}
            className={`rounded-md border px-3 py-2 text-sm font-black ${
              mode === key
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
        <select
          value={start}
          onChange={(event) => reset(mode, event.target.value as NodeId)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800"
          aria-label="시작 노드"
        >
          {nodes.map((node) => (
            <option key={node} value={node}>
              시작 {node}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr] md:items-start">
        <div className="h-[432px] rounded-lg border border-slate-200 bg-white p-4">
          <svg viewBox="0 0 420 230" role="img" aria-label="방향 그래프 예시" className="h-auto w-full">
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path
                  d="M1.5,1.5 L6,4 L1.5,6.5"
                  fill="none"
                  stroke="#64748b"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.2"
                />
              </marker>
            </defs>
            {edges.map(([from, to]) => {
              const edge = shortenEdge(from, to);
              return (
                <line
                  key={`${from}-${to}`}
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  markerEnd="url(#arrowhead)"
                />
              );
            })}
            {nodes.map((node) => {
              const [x, y] = positions[node];
              const visited = step.order.includes(node);
              const active = step.current === node;

              return (
                <g key={node}>
                  <circle
                    cx={x}
                    cy={y}
                    r="24"
                    fill={active ? "#0f172a" : visited ? "#ccfbf1" : "#f8fafc"}
                    stroke={active ? "#0f172a" : visited ? "#0f766e" : "#94a3b8"}
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={y + 6}
                    textAnchor="middle"
                    fill={active ? "#ffffff" : "#115e59"}
                    fontWeight="900"
                    fontSize="18"
                  >
                    {node}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            이 예시는 화살표 방향으로만 이동할 수 있는 단방향 그래프입니다.
          </p>
          <div className="mt-3 rounded-md bg-slate-50 p-3">
            <p className="text-sm font-bold text-slate-500">{start}에서 시작한 방문 순서</p>
            <div className="mt-2 grid h-[88px] grid-cols-3 content-start gap-2">
              {step.order.length > 0 ? (
                step.order.map((node, index) => (
                  <span key={node} className="rounded-md bg-white px-2 py-2 text-center text-sm font-black text-slate-800">
                    {index + 1}. {node}
                  </span>
                ))
              ) : (
                <span className="col-span-3 text-sm font-bold text-slate-400">아직 방문한 정점이 없습니다.</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex h-[432px] flex-col rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">현재 탐색 상태</p>
          <div className="mt-3 grid h-[306px] gap-3 rounded-md bg-slate-50 p-3">
            <p className="text-sm font-bold text-slate-700">현재 처리: {step.current ?? "아직 없음"}</p>
            <p className="text-sm font-bold text-slate-700">
              {mode === "bfs" ? "queue" : "stack"} = [{step.pending.join(", ")}]
            </p>
            <p className="h-12 text-sm leading-6 text-slate-700">
              {mode === "bfs"
                ? `최단 간선 수: ${nodes
                    .filter((node) => step.distances[node] !== undefined)
                    .map((node) => `${node}:${step.distances[node]}`)
                    .join(", ")}`
                : "DFS에서는 가까운 순서보다 한 갈래를 깊게 따라가는 흐름을 봅니다."}
            </p>
            <p className="h-12 text-sm leading-6 text-slate-700">
              {mode === "bfs"
                ? "BFS는 가중치가 없는 그래프에서 시작점으로부터 가까운 정점부터 방문합니다."
                : "DFS는 한 갈래를 가능한 깊게 따라간 뒤 돌아옵니다."}
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setStepIndex((current) => Math.min(current + 1, steps.length - 1))}
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white"
            >
              한 단계 실행
            </button>
            <button
              type="button"
              onClick={() => setStepIndex(0)}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800"
            >
              초기화
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
