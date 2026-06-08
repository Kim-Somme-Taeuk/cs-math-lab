"use client";

import { useMemo, useState } from "react";

type Mode = "unweighted" | "weighted";
type GraphNode = "A" | "B" | "C" | "D" | "E" | "F";

const nodes: GraphNode[] = ["A", "B", "C", "D", "E", "F"];

const unweightedGraph: Record<GraphNode, GraphNode[]> = {
  A: ["B", "C"],
  B: ["A", "D"],
  C: ["A", "D", "E"],
  D: ["B", "C", "F"],
  E: ["C", "F"],
  F: ["D", "E"],
};

const weightedEdges: [GraphNode, GraphNode, number][] = [
  ["A", "B", 2],
  ["A", "C", 5],
  ["B", "C", 1],
  ["B", "D", 4],
  ["C", "D", 1],
  ["C", "E", 3],
  ["D", "F", 2],
  ["E", "F", 1],
];

function bfs(start: GraphNode) {
  const distance = new Map(nodes.map((node) => [node, Number.POSITIVE_INFINITY]));
  const previous = new Map<GraphNode, GraphNode>();
  const queue: GraphNode[] = [start];
  distance.set(start, 0);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;

    for (const next of unweightedGraph[current]) {
      if (distance.get(next) === Number.POSITIVE_INFINITY) {
        distance.set(next, (distance.get(current) ?? 0) + 1);
        previous.set(next, current);
        queue.push(next);
      }
    }
  }

  return { distance, previous };
}

function dijkstra(start: GraphNode) {
  const distance = new Map(nodes.map((node) => [node, Number.POSITIVE_INFINITY]));
  const previous = new Map<GraphNode, GraphNode>();
  const visited = new Set<GraphNode>();
  distance.set(start, 0);

  while (visited.size < nodes.length) {
    const current = nodes
      .filter((node) => !visited.has(node))
      .sort((left, right) => (distance.get(left) ?? 0) - (distance.get(right) ?? 0))[0];

    if (!current || distance.get(current) === Number.POSITIVE_INFINITY) break;
    visited.add(current);

    for (const [from, to, weight] of weightedEdges) {
      if (from !== current) continue;
      const nextDistance = (distance.get(current) ?? 0) + weight;
      if (nextDistance < (distance.get(to) ?? Number.POSITIVE_INFINITY)) {
        distance.set(to, nextDistance);
        previous.set(to, current);
      }
    }
  }

  return { distance, previous };
}

function restorePath(previous: Map<GraphNode, GraphNode>, start: GraphNode, target: GraphNode) {
  const path = [target];
  let current = target;

  while (current !== start && previous.has(current)) {
    current = previous.get(current) ?? start;
    path.unshift(current);
  }

  return path[0] === start ? path : [];
}

export default function ShortestPathPlayground() {
  const [mode, setMode] = useState<Mode>("weighted");
  const [target, setTarget] = useState<GraphNode>("F");

  const result = useMemo(() => {
    const data = mode === "unweighted" ? bfs("A") : dijkstra("A");
    return {
      ...data,
      path: restorePath(data.previous, "A", target),
    };
  }, [mode, target]);

  return (
    <section aria-label="최단 경로 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">최단 경로 실험</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          A에서 출발해 BFS와 다익스트라가 거리 배열을 어떻게 채우는지 비교합니다.
        </p>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`rounded-md px-4 py-3 text-sm font-black ${mode === "weighted" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-800"}`}
            onClick={() => setMode("weighted")}
          >
            가중치 있음
          </button>
          <button
            type="button"
            className={`rounded-md px-4 py-3 text-sm font-black ${mode === "unweighted" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-800"}`}
            onClick={() => setMode("unweighted")}
          >
            가중치 없음
          </button>
        </div>
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          목표 정점
          <select className="rounded-md border border-slate-300 px-3 py-2" value={target} onChange={(event) => setTarget(event.target.value as GraphNode)}>
            {nodes.map((node) => (
              <option key={node} value={node}>
                {node}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-xs font-bold text-slate-500">거리 배열</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {nodes.map((node) => (
              <div key={node} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-black text-slate-900">
                {node}: {result.distance.get(node)}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-xs font-bold text-slate-500">A에서 {target}까지</p>
          <p className="mt-2 text-xl font-black text-slate-950">{result.path.join(" -> ")}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            거리: {result.distance.get(target)} / 방식: {mode === "weighted" ? "다익스트라 맛보기" : "BFS"}
          </p>
        </div>
      </div>
    </section>
  );
}
