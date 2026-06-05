"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

function ToggleButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-3 py-2 text-sm font-black ${
        active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
      }`}
    >
      {children}
    </button>
  );
}

function ResultCard({ label, value, good = true }: { label: string; value: string; good?: boolean }) {
  return (
    <div className={`min-h-[74px] rounded-md border p-3 ${good ? "border-teal-200 bg-teal-50" : "border-rose-200 bg-rose-50"}`}>
      <p className={`text-xs font-black ${good ? "text-teal-700" : "text-rose-700"}`}>{label}</p>
      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}

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

export function LogicalEquivalencePlayground() {
  const [p, setP] = useState(true);
  const [q, setQ] = useState(true);
  const [ruleKey, setRuleKey] = useState<"deMorganAnd" | "deMorganOr" | "implication" | "contrapositive" | "inverse">("deMorganAnd");
  const rules = {
    deMorganAnd: {
      label: "AND 부정",
      leftLabel: "not (P and Q)",
      rightLabel: "not P or not Q",
      left: (left: boolean, right: boolean) => !(left && right),
      right: (left: boolean, right: boolean) => !left || !right,
      explanation: "AND 전체를 부정하면 각각을 부정하고 OR로 연결합니다.",
    },
    deMorganOr: {
      label: "OR 부정",
      leftLabel: "not (P or Q)",
      rightLabel: "not P and not Q",
      left: (left: boolean, right: boolean) => !(left || right),
      right: (left: boolean, right: boolean) => !left && !right,
      explanation: "OR 전체를 부정하면 각각을 부정하고 AND로 연결합니다.",
    },
    implication: {
      label: "조건문 변형",
      leftLabel: "P이면 Q",
      rightLabel: "not P or Q",
      left: (left: boolean, right: boolean) => !left || right,
      right: (left: boolean, right: boolean) => !left || right,
      explanation: "P이면 Q는 P가 아니거나 Q인 경우와 같은 진리값을 갖습니다.",
    },
    contrapositive: {
      label: "대우",
      leftLabel: "P이면 Q",
      rightLabel: "not Q이면 not P",
      left: (left: boolean, right: boolean) => !left || right,
      right: (left: boolean, right: boolean) => right || !left,
      explanation: "조건문은 대우와 동치입니다. 역 Q -> P와는 다릅니다.",
    },
    inverse: {
      label: "역",
      leftLabel: "P이면 Q",
      rightLabel: "Q이면 P",
      left: (left: boolean, right: boolean) => !left || right,
      right: (left: boolean, right: boolean) => !right || left,
      explanation: "P가 거짓이고 Q가 참인 행에서 두 식의 값이 달라집니다. 역은 일반적으로 동치가 아닙니다.",
    },
  };
  const rule = rules[ruleKey];
  const left = rule.left(p, q);
  const right = rule.right(p, q);
  const rows = [
    [true, true],
    [true, false],
    [false, true],
    [false, false],
  ];
  const equivalent = rows.every(([rowP, rowQ]) => rule.left(rowP, rowQ) === rule.right(rowP, rowQ));

  return (
    <section aria-label="논리적 동치 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">동치 조건식 비교기</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          규칙을 고르고 P, Q 값을 바꾸며 두 식의 진리값 열이 같은지 확인합니다.
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setP((value) => !value)}
          className="rounded-md border border-slate-300 bg-white px-4 py-3 text-left hover:border-teal-500"
        >
          <span className="block text-sm font-bold text-slate-500">명제 P</span>
          <span className="mt-1 flex items-center gap-2 text-lg font-black text-slate-950">
            {p ? "True" : "False"}
            <TruthBadge value={p} />
          </span>
        </button>
        <button
          type="button"
          onClick={() => setQ((value) => !value)}
          className="rounded-md border border-slate-300 bg-white px-4 py-3 text-left hover:border-teal-500"
        >
          <span className="block text-sm font-bold text-slate-500">명제 Q</span>
          <span className="mt-1 flex items-center gap-2 text-lg font-black text-slate-950">
            {q ? "True" : "False"}
            <TruthBadge value={q} />
          </span>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-5">
        {(Object.keys(rules) as Array<keyof typeof rules>).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setRuleKey(key)}
            className={`min-h-10 rounded-md border px-3 py-2 text-sm font-black ${
              ruleKey === key
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
            }`}
          >
            {rules[key].label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="min-h-[246px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">현재 비교</p>
          <div className="mt-3 grid gap-2">
            <div className="flex min-h-12 items-center justify-between gap-3 rounded-md bg-slate-50 p-3">
              <span className="text-sm font-black text-slate-950">{rule.leftLabel}</span>
              <TruthBadge value={left} />
            </div>
            <div className="flex min-h-12 items-center justify-between gap-3 rounded-md bg-slate-50 p-3">
              <span className="text-sm font-black text-slate-950">{rule.rightLabel}</span>
              <TruthBadge value={right} />
            </div>
          </div>
          <div
            className={`mt-3 min-h-[104px] rounded-md border p-3 text-sm font-bold leading-6 ${
              equivalent ? "border-teal-200 bg-teal-50 text-teal-900" : "border-rose-200 bg-rose-50 text-rose-900"
            }`}
          >
            <p className="font-black">{equivalent ? "두 식은 동치입니다." : "동치가 아닙니다."}</p>
            <p className="mt-1">{rule.explanation}</p>
          </div>
        </div>

        <div className="min-h-[246px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">진리표 확인</p>
          <div className="mt-3 grid gap-2">
            {rows.map(([rowP, rowQ]) => {
              const rowLeft = rule.left(rowP, rowQ);
              const rowRight = rule.right(rowP, rowQ);
              const selected = rowP === p && rowQ === q;

              return (
                <div
                  key={`${rowP}-${rowQ}`}
                  className={`grid h-11 grid-cols-[0.72fr_0.72fr_1fr_1fr] items-center rounded-md border px-2 text-center text-sm font-bold ${
                    selected
                      ? "border-teal-500 bg-teal-50 text-teal-900 ring-2 ring-teal-100"
                      : rowLeft !== rowRight
                        ? "border-rose-300 bg-rose-50 text-rose-900"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  <span>P {rowP ? "참" : "거짓"}</span>
                  <span>Q {rowQ ? "참" : "거짓"}</span>
                  <TruthBadge value={rowLeft} />
                  <TruthBadge value={rowRight} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function PredicateLogicPlayground() {
  const [users, setUsers] = useState([
    { name: "Alice", active: true, admin: false },
    { name: "Bob", active: true, admin: true },
    { name: "Chris", active: false, admin: false },
    { name: "Dana", active: false, admin: true },
  ]);
  const [predicateKey, setPredicateKey] = useState<"active" | "admin">("active");
  const [quantifierKey, setQuantifierKey] = useState<"forall" | "exists" | "notForall" | "notExists">("forall");
  const predicateLabel = predicateKey === "active" ? "Active" : "Admin";
  const predicateValues = users.map((user) => ({ ...user, value: user[predicateKey] }));
  const allTrue = predicateValues.every((user) => user.value);
  const someTrue = predicateValues.some((user) => user.value);
  const falseUsers = predicateValues.filter((user) => !user.value).map((user) => user.name);
  const trueUsers = predicateValues.filter((user) => user.value).map((user) => user.name);
  const quantifiers = {
    forall: {
      label: `∀x ${predicateLabel}(x)`,
      value: allTrue,
      equivalent: null,
      note: allTrue ? "모든 사용자가 술어를 만족합니다." : `${falseUsers.join(", ")}가 반례입니다.`,
    },
    exists: {
      label: `∃x ${predicateLabel}(x)`,
      value: someTrue,
      equivalent: null,
      note: someTrue ? `${trueUsers.join(", ")}가 증인입니다.` : "술어를 만족하는 사용자가 없습니다.",
    },
    notForall: {
      label: `¬∀x ${predicateLabel}(x)`,
      value: !allTrue,
      equivalent: `∃x ¬${predicateLabel}(x)`,
      note: !allTrue ? `${falseUsers.join(", ")}가 술어를 만족하지 않습니다.` : "모든 사용자가 만족하므로 전체 부정은 거짓입니다.",
    },
    notExists: {
      label: `¬∃x ${predicateLabel}(x)`,
      value: !someTrue,
      equivalent: `∀x ¬${predicateLabel}(x)`,
      note: !someTrue ? "모든 사용자가 술어를 만족하지 않습니다." : `${trueUsers.join(", ")}가 증인이라서 존재 부정은 거짓입니다.`,
    },
  };
  const statement = quantifiers[quantifierKey];
  const toggleUser = (name: string, key: "active" | "admin") => {
    setUsers((current) => current.map((user) => (user.name === name ? { ...user, [key]: !user[key] } : user)));
  };

  return (
    <section aria-label="술어 논리 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">수량자 조건 판별기</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          정의역의 속성을 직접 바꾸고 수량자 문장의 참거짓을 확인합니다.
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="min-h-[250px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">정의역 users</p>
          <div className="mt-3 grid gap-2">
            {predicateValues.map((user) => (
              <div
                key={user.name}
                className={`grid min-h-[74px] gap-2 rounded-md border p-3 ${
                  user.value ? "border-teal-200 bg-teal-50" : "border-slate-200 bg-slate-50"
                }`}
              >
                <div>
                  <p className="text-sm font-black text-slate-950">{user.name}</p>
                  <p className="text-xs font-bold text-slate-500">
                    active {user.active ? "참" : "거짓"} · admin {user.admin ? "참" : "거짓"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => toggleUser(user.name, "active")}
                    className={`rounded-md border px-2 py-1 text-xs font-black ${
                      user.active ? "border-teal-600 bg-teal-600 text-white" : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    active
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleUser(user.name, "admin")}
                    className={`rounded-md border px-2 py-1 text-xs font-black ${
                      user.admin ? "border-teal-600 bg-teal-600 text-white" : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    admin
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-[250px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">문장 선택</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <ToggleButton active={predicateKey === "active"} onClick={() => setPredicateKey("active")}>Active(x)</ToggleButton>
            <ToggleButton active={predicateKey === "admin"} onClick={() => setPredicateKey("admin")}>Admin(x)</ToggleButton>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(Object.keys(quantifiers) as Array<keyof typeof quantifiers>).map((key) => (
              <ToggleButton
                key={key}
                active={quantifierKey === key}
                onClick={() => setQuantifierKey(key)}
              >
                {quantifiers[key].label}
              </ToggleButton>
            ))}
          </div>
          <div className="mt-3 grid gap-2">
            <ResultCard label="현재 문장" value={statement.label} good={statement.value} />
            <ResultCard label="참/거짓" value={statement.value ? "참" : "거짓"} good={statement.value} />
            <ResultCard label="∀ 반례" value={falseUsers.length > 0 ? falseUsers.join(", ") : "없음"} good={falseUsers.length === 0} />
            <ResultCard label="∃ 증인" value={trueUsers.length > 0 ? trueUsers.join(", ") : "없음"} good={trueUsers.length > 0} />
            <div
              className={`min-h-[104px] rounded-md border p-3 text-sm font-bold leading-6 ${
                statement.value ? "border-teal-200 bg-teal-50 text-teal-900" : "border-rose-200 bg-rose-50 text-rose-900"
              }`}
            >
              <p className="font-black">{statement.equivalent ? `동치: ${statement.equivalent}` : statement.label}</p>
              <p className="mt-1">{statement.note}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EquivalenceRelationPlayground() {
  const items = [1, 2, 3, 4, 5, 6];
  const [rule, setRule] = useState<"mod2" | "mod3" | "custom">("mod2");
  const [customGroups, setCustomGroups] = useState<Record<number, "A" | "B" | "C">>({
    1: "A",
    2: "B",
    3: "A",
    4: "B",
    5: "A",
    6: "B",
  });
  const groupOf = (item: number): "A" | "B" | "C" => {
    if (rule === "mod2") return item % 2 === 1 ? "A" : "B";
    if (rule === "mod3") return item % 3 === 1 ? "A" : item % 3 === 2 ? "B" : "C";
    return customGroups[item];
  };
  const setGroup = (item: number, group: "A" | "B" | "C") => {
    setRule("custom");
    setCustomGroups((current) => ({ ...current, [item]: group }));
  };
  const groups = {
    A: items.filter((item) => groupOf(item) === "A"),
    B: items.filter((item) => groupOf(item) === "B"),
    C: items.filter((item) => groupOf(item) === "C"),
  };
  const groupLabels: Record<typeof rule, Record<"A" | "B" | "C", string>> = {
    mod2: {
      A: "홀수",
      B: "짝수",
      C: "사용 안 함",
    },
    mod3: {
      A: "나머지 1",
      B: "나머지 2",
      C: "나머지 0",
    },
    custom: {
      A: "A 그룹",
      B: "B 그룹",
      C: "C 그룹",
    },
  };
  const assignedCount = Object.values(groups).reduce((count, groupItems) => count + groupItems.length, 0);
  const coversAll = assignedCount === items.length;
  const noOverlap = new Set(Object.values(groups).flat()).size === assignedCount;
  const exactlyOneGroup = coversAll && noOverlap;
  const nonEmptyGroups = Object.entries(groups).filter(([, groupItems]) => groupItems.length > 0);
  const validPartition = exactlyOneGroup;

  return (
    <section aria-label="동치관계 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">동치류/분할 빌더</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          동치관계는 원소를 겹치지 않는 동치류로 나눕니다.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <ToggleButton active={rule === "mod2"} onClick={() => setRule("mod2")}>2로 나눈 나머지</ToggleButton>
        <ToggleButton active={rule === "mod3"} onClick={() => setRule("mod3")}>3으로 나눈 나머지</ToggleButton>
        <ToggleButton active={rule === "custom"} onClick={() => setRule("custom")}>직접 그룹</ToggleButton>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="min-h-[250px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">원소 배정</p>
          <div className="mt-3 grid gap-2">
            {items.map((item) => (
              <div key={item} className="grid grid-cols-[2rem_1fr] items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2">
                <span className="text-center text-sm font-black text-slate-950">{item}</span>
                <div className="grid grid-cols-3 gap-1">
                  {(["A", "B", "C"] as const).map((group) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setGroup(item, group)}
                      className={`rounded border px-2 py-1 text-xs font-black ${
                        groupOf(item) === group ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-[250px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">동치류와 분할</p>
          <div className="mt-3 grid gap-2">
            {(["A", "B", "C"] as const).map((group) => (
              <div
                key={group}
                className="min-h-[74px] rounded-md border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-xs font-black text-slate-500">{groupLabels[rule][group]}</p>
                <p className="mt-1 text-sm font-black text-slate-950">
                  {groups[group].length > 0 ? `{${groups[group].join(", ")}}` : "비어 있음"}
                </p>
              </div>
            ))}
            <ResultCard label="정확히 한 그룹" value={exactlyOneGroup ? "모든 원소가 정확히 한 그룹에 속합니다." : "중복되거나 빠진 원소가 있습니다."} good={exactlyOneGroup} />
            <ResultCard label="겹치지 않음" value={noOverlap ? "비어 있지 않은 그룹끼리 겹치지 않습니다." : "두 그룹에 동시에 들어간 원소가 있습니다."} good={noOverlap} />
            <ResultCard label="빠짐없이 덮음" value={coversAll ? "전체 원소를 빠짐없이 덮습니다." : "덮지 못한 원소가 있습니다."} good={coversAll} />
            <div
              className={`min-h-[96px] rounded-md border p-3 text-sm font-bold leading-6 ${
                validPartition ? "border-teal-200 bg-teal-50 text-teal-900" : "border-rose-200 bg-rose-50 text-rose-900"
              }`}
            >
              <p className="font-black">{validPartition ? "동치관계입니다." : "분할이 아닙니다."}</p>
              <p className="mt-1">
                {validPartition
                  ? `같은 그룹에 속한다는 관계는 반사성, 대칭성, 추이성을 만족합니다. 동치류: ${nonEmptyGroups.map(([group, groupItems]) => `${groupLabels[rule][group as "A" | "B" | "C"]}={${groupItems.join(", ")}}`).join(" / ")}`
                  : "동치류가 되려면 전체 원소가 겹치지 않는 그룹들로 나뉘어야 합니다."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PartialOrderPlayground() {
  const tasks = ["design", "api", "build", "test", "deploy"];
  const edgeOptions = [
    ["design", "build"],
    ["api", "build"],
    ["build", "test"],
    ["test", "deploy"],
    ["api", "test"],
    ["deploy", "build"],
  ] as const;
  const nodePositions: Record<string, { x: number; y: number }> = {
    design: { x: 56, y: 56 },
    api: { x: 56, y: 142 },
    build: { x: 168, y: 98 },
    test: { x: 280, y: 98 },
    deploy: { x: 392, y: 98 },
  };
  const [edges, setEdges] = useState<Set<string>>(() => new Set(["design->build", "api->build", "build->test", "test->deploy"]));
  const edgeKey = (left: string, right: string) => `${left}->${right}`;
  const hasEdge = (left: string, right: string) => edges.has(edgeKey(left, right));
  const toggleEdge = (left: string, right: string) => {
    setEdges((current) => {
      const next = new Set(current);
      const key = edgeKey(left, right);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const adjacency = tasks.reduce<Record<string, string[]>>((graph, task) => {
    graph[task] = [];
    return graph;
  }, {});
  edges.forEach((edge) => {
    const [left, right] = edge.split("->");
    if (left && right) adjacency[left].push(right);
  });
  const reachable = (left: string, right: string) => {
    if (left === right) return true;
    const stack = [...adjacency[left]];
    const seen = new Set<string>();
    while (stack.length > 0) {
      const task = stack.pop();
      if (!task) continue;
      if (task === right) return true;
      if (seen.has(task)) continue;
      seen.add(task);
      stack.push(...adjacency[task]);
    }
    return false;
  };
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const hasCycleFrom = (task: string): boolean => {
    if (visiting.has(task)) return true;
    if (visited.has(task)) return false;
    visiting.add(task);
    for (const next of adjacency[task]) {
      if (hasCycleFrom(next)) return true;
    }
    visiting.delete(task);
    visited.add(task);
    return false;
  };
  const hasCycle = tasks.some((task) => hasCycleFrom(task));
  const pairs = tasks.flatMap((left, leftIndex) => tasks.slice(leftIndex + 1).map((right) => [left, right] as const));
  const comparablePairs = pairs.filter(([left, right]) => reachable(left, right) || reachable(right, left));
  const incomparablePairs = pairs.filter(([left, right]) => !reachable(left, right) && !reachable(right, left));
  const comparableText =
    comparablePairs
      .slice(0, 3)
      .map(([left, right]) => (reachable(left, right) ? `${left} ≤ ${right}` : `${right} ≤ ${left}`))
      .join(", ") || "없음";
  const designApiIncomparable = !reachable("design", "api") && !reachable("api", "design");
  const incomparableText = designApiIncomparable
    ? "design과 api"
    : incomparablePairs
        .slice(0, 3)
        .map(([left, right]) => `${left}와 ${right}`)
        .join(", ") || "없음";
  const edgeText = Array.from(edges)
    .sort()
    .map((edge) => edge.replace("->", " → "))
    .join(", ");

  return (
    <section aria-label="부분순서관계 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">부분순서 의존성 실험</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          작업 의존성을 직접 켜고 끄며 비교 가능성과 사이클을 확인합니다.
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="min-h-[360px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">선택된 의존성 그래프</p>
          <div className="mt-3 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
            <svg viewBox="0 0 448 196" role="img" aria-label="작업 의존성 그래프" className="h-auto w-full">
              <defs>
                <marker id="partial-order-arrow" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
                  <path d="M0,1 L7,4 L0,7" fill="none" stroke="#0f766e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
                </marker>
              </defs>
              {edgeOptions.map(([left, right]) => {
                if (!hasEdge(left, right)) return null;
                const start = nodePositions[left];
                const end = nodePositions[right];
                return (
                  <line
                    key={edgeKey(left, right)}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="#0f766e"
                    strokeWidth="3"
                    markerEnd="url(#partial-order-arrow)"
                  />
                );
              })}
              {tasks.map((task) => {
                const point = nodePositions[task];
                return (
                  <g key={task}>
                    <circle cx={point.x} cy={point.y} r="25" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
                    <text x={point.x} y={point.y + 4} textAnchor="middle" className="fill-slate-950 text-[12px] font-black">
                      {task}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {edgeOptions.map(([left, right]) => (
              <button
                key={edgeKey(left, right)}
                type="button"
                onClick={() => toggleEdge(left, right)}
                className={`min-h-10 rounded-md border px-2 py-2 text-sm font-black ${
                  hasEdge(left, right)
                    ? "border-teal-600 bg-teal-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {left} → {right}
              </button>
            ))}
          </div>
          <p className="mt-3 min-h-[58px] rounded-md bg-slate-50 p-3 text-sm font-bold leading-6 text-slate-700">
            선택한 의존성: {edgeText || "없음"}
          </p>
        </div>

        <div className="min-h-[360px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">순서 판정</p>
          <div className="mt-3 grid gap-2">
            <ResultCard label="사이클 없음" value={hasCycle ? "실패" : "통과"} good={!hasCycle} />
            <ResultCard label="도달 가능성 관계" value="계산됨" good />
            <ResultCard
              label="비교 가능 예시"
              value={comparableText}
              good={!hasCycle && comparablePairs.length > 0}
            />
            <ResultCard
              label="비교 불가능 예시"
              value={incomparableText}
              good={!hasCycle}
            />
            <div
              className={`min-h-[92px] rounded-md border p-3 text-sm font-bold leading-6 ${
                hasCycle ? "border-rose-200 bg-rose-50 text-rose-900" : "border-teal-200 bg-teal-50 text-teal-900"
              }`}
            >
              <p className="font-black">{hasCycle ? "부분순서가 아닙니다." : "부분순서로 볼 수 있습니다."}</p>
              <p className="mt-1">{hasCycle ? "사이클이 생기면 서로 먼저 와야 하는 모순이 생깁니다." : "사이클이 없으면 도달 가능성으로 작업 선후관계를 볼 수 있습니다."}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function RecurrencePlayground() {
  const [start, setStart] = useState(1);
  const [step, setStep] = useState(3);
  const [n, setN] = useState(5);
  const [guess, setGuess] = useState(12);
  const sequence = Array.from({ length: n }, (_, index) => start + index * step);
  const sumSteps = Array.from({ length: n }, (_, index) => index + 1);
  const sum = sumSteps.reduce((total, value) => total + value, 0);
  const guessCorrect = guess === sum;

  return (
    <section aria-label="점화식 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">점화식 펼치기 실험</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          시작값과 규칙을 바꾸며 이전 항에서 다음 항이 만들어지는 흐름을 봅니다.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="mt-4 grid min-h-[246px] gap-3 rounded-lg border border-slate-200 bg-white p-4 lg:mt-4">
          <p className="text-sm font-bold text-slate-500">규칙 조정</p>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            시작값 a1: {start}
            <input type="range" min="0" max="5" value={start} onChange={(event) => setStart(Number(event.target.value))} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            더하는 값: {step}
            <input type="range" min="1" max="5" value={step} onChange={(event) => setStep(Number(event.target.value))} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            n: {n}
            <input type="range" min="3" max="8" value={n} onChange={(event) => setN(Number(event.target.value))} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            내가 예상한 T(n): {guess}
            <input type="range" min="3" max="40" value={guess} onChange={(event) => setGuess(Number(event.target.value))} />
          </label>
        </div>

        <div className="mt-4 min-h-[246px] rounded-lg border border-slate-200 bg-white p-4 lg:mt-4">
          <p className="text-sm font-bold text-slate-500">펼친 결과</p>
          <div className="mt-3 grid gap-2">
          <ResultCard label="a_n = a_{n-1} + d" value={sequence.join(", ")} />
          <ResultCard label="T(n)=T(n-1)+n 펼치기" value={`${sumSteps.join(" + ")} = ${sum}`} />
          <div
            className={`min-h-[104px] rounded-md border p-3 text-sm font-bold leading-6 ${
              guessCorrect ? "border-teal-200 bg-teal-50 text-teal-900" : "border-rose-200 bg-rose-50 text-rose-900"
            }`}
          >
            <p className="font-black">{guessCorrect ? "예상이 맞습니다." : "예상이 다릅니다."}</p>
            <p className="mt-1">
              {guessCorrect
                ? "펼친 합과 예상값이 같습니다."
                : `현재 T(${n})은 ${sumSteps.join(" + ")}라서 ${sum}입니다.`}
            </p>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function InclusionExclusionPlayground() {
  const leftTag = "개발자";
  const [rightTag, setRightTag] = useState<"디자이너" | "기획자">("디자이너");
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const people = [
    { name: "민준", tags: ["개발자"] },
    { name: "서연", tags: ["디자이너"] },
    { name: "지우", tags: ["개발자", "디자이너"] },
    { name: "도윤", tags: ["기획자"] },
    { name: "하린", tags: ["개발자", "기획자"] },
    { name: "유나", tags: ["디자이너", "기획자"] },
  ];
  const chooseRightTag = (tag: "디자이너" | "기획자") => {
    setRightTag(tag);
    setSelectedPeople([]);
  };
  const togglePerson = (name: string) => {
    setSelectedPeople((current) => (current.includes(name) ? current.filter((person) => person !== name) : [...current, name]));
  };
  const left = people.filter((person) => person.tags.includes(leftTag)).map((person) => person.name);
  const right = people.filter((person) => person.tags.includes(rightTag)).map((person) => person.name);
  const both = people.filter((person) => person.tags.includes(leftTag) && person.tags.includes(rightTag)).map((person) => person.name);
  const union = people.filter((person) => person.tags.includes(leftTag) || person.tags.includes(rightTag)).map((person) => person.name);
  const selectedSet = new Set(selectedPeople);
  const answerCorrect = selectedPeople.length === union.length && union.every((person) => selectedSet.has(person));
  const hasSelection = selectedPeople.length > 0;

  return (
    <section aria-label="포함배제 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">겹친 원소 세기 실험</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          두 조건 중 하나라도 만족하는 사람을 직접 골라 봅니다.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <ToggleButton active={rightTag === "디자이너"} onClick={() => chooseRightTag("디자이너")}>B = 디자이너</ToggleButton>
        <ToggleButton active={rightTag === "기획자"} onClick={() => chooseRightTag("기획자")}>B = 기획자</ToggleButton>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-h-[264px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">A = {leftTag}, B = {rightTag}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
          {people.map((person) => {
            const inLeft = person.tags.includes(leftTag);
            const inRight = person.tags.includes(rightTag);
            const inBoth = inLeft && inRight;
            const selected = selectedSet.has(person.name);
            return (
              <button
                key={person.name}
                type="button"
                onClick={() => togglePerson(person.name)}
                className={`min-h-[116px] rounded-md border p-3 text-left transition ${
                  selected ? "border-slate-950 bg-slate-950 text-white" : inBoth ? "border-teal-300 bg-teal-50" : "border-slate-200 bg-white text-slate-950"
                }`}
              >
                <p className={`text-sm font-black ${selected ? "text-white" : "text-slate-950"}`}>{person.name}</p>
                <div className="mt-2 flex min-h-6 flex-wrap gap-1">
                  {inLeft ? <span className={`rounded border px-2 py-0.5 text-xs font-black ${selected ? "border-white/40 text-white" : "border-slate-200 text-slate-700"}`}>A</span> : null}
                  {inRight ? <span className={`rounded border px-2 py-0.5 text-xs font-black ${selected ? "border-white/40 text-white" : "border-slate-200 text-slate-700"}`}>B</span> : null}
                  {!inLeft && !inRight ? <span className={`text-xs font-bold ${selected ? "text-white/70" : "text-slate-500"}`}>해당 없음</span> : null}
                </div>
                <p className={`mt-2 text-xs font-bold ${selected ? "text-white/75" : inBoth ? "text-teal-800" : "text-slate-500"}`}>
                  {selected ? "선택됨" : "선택 안 됨"} · {inBoth ? "단순 합에서 2회" : inLeft || inRight ? "단순 합에서 1회" : "단순 합에서 0회"}
                </p>
              </button>
            );
          })}
          </div>
        </div>

        <div className="min-h-[264px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">계산</p>
          <div className="mt-3 grid gap-2">
          <ResultCard label="|A|" value={`${left.length}명`} />
          <ResultCard label="|B|" value={`${right.length}명`} />
          <ResultCard label="단순 합 |A| + |B|" value={`${left.length} + ${right.length} = ${left.length + right.length}명`} />
          <ResultCard label="중복된 사람 |A ∩ B|" value={`${both.length}명: ${both.join(", ") || "없음"}`} />
          <ResultCard
            label="|A ∪ B| = |A| + |B| - |A ∩ B|"
            value={`${left.length} + ${right.length} - ${both.length} = ${union.length}명`}
            good={answerCorrect}
          />
          <div
            className={`min-h-[96px] rounded-md border p-3 text-sm font-bold leading-6 ${
              answerCorrect
                ? "border-teal-200 bg-teal-50 text-teal-900"
                : hasSelection
                  ? "border-rose-200 bg-rose-50 text-rose-900"
                  : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            <p className="font-black">{answerCorrect ? "합집합을 정확히 골랐습니다." : hasSelection ? "선택이 아직 다릅니다." : "사람을 선택해 보세요."}</p>
            <p className="mt-1">
              두 조건에 모두 속한 사람은 단순 합에서 두 번 세어지므로 한 번 빼야 합니다.
            </p>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PigeonholePlayground() {
  const [items, setItems] = useState(10);
  const [boxes, setBoxes] = useState(3);
  const [distribution, setDistribution] = useState<number[]>(() => Array.from({ length: 3 }, () => 0));
  useEffect(() => {
    setDistribution(Array.from({ length: boxes }, () => 0));
  }, [items, boxes]);
  const guaranteed = Math.ceil(items / boxes);
  const placed = distribution.reduce((total, count) => total + count, 0);
  const remaining = items - placed;
  const maxInBox = Math.max(...distribution);
  const completed = remaining === 0;
  const guaranteedConfirmed = completed && maxInBox >= guaranteed;
  const addToBox = (boxIndex: number) => {
    if (remaining <= 0) return;
    setDistribution((current) => current.map((count, index) => (index === boxIndex ? count + 1 : count)));
  };
  const removeFromBox = (boxIndex: number) => {
    if (distribution[boxIndex] <= 0) return;
    setDistribution((current) => current.map((count, index) => (index === boxIndex ? count - 1 : count)));
  };
  const spreadEvenly = () => {
    setDistribution(Array.from({ length: boxes }, (_, index) => Math.floor(items / boxes) + (index < items % boxes ? 1 : 0)));
  };
  const resetDistribution = () => {
    setDistribution(Array.from({ length: boxes }, () => 0));
  };

  const verdict = (() => {
    if (!completed) return `${remaining}개를 더 배치해야 최종 판정을 볼 수 있습니다.`;
    if (guaranteedConfirmed) return `보장 확인: 가장 많이 들어간 상자는 ${maxInBox}개이고, 보장값 ${guaranteed} 이상입니다.`;
    return "배치가 완료되었지만 보장값 판정이 맞지 않습니다.";
  })();

  return (
    <section aria-label="비둘기집 원리 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">상자 배치 실험</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          공을 상자에 직접 넣고 빼며 최소 보장값을 확인합니다.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="mt-4 grid min-h-[250px] gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">개수 설정</p>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            대상 개수: {items}
            <input type="range" min="4" max="16" value={items} onChange={(event) => setItems(Number(event.target.value))} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            상자 개수: {boxes}
            <input type="range" min="2" max="6" value={boxes} onChange={(event) => setBoxes(Number(event.target.value))} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={spreadEvenly}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-800 hover:bg-slate-100"
            >
              골고루 배치
            </button>
            <button
              type="button"
              onClick={resetDistribution}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-800 hover:bg-slate-100"
            >
              초기화
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ResultCard label="총 대상" value={`${items}개`} />
            <ResultCard label="상자" value={`${boxes}개`} />
            <ResultCard label="남은 대상" value={`${remaining}개`} good={remaining === 0} />
            <ResultCard label="보장값" value={`ceil(${items} / ${boxes}) = ${guaranteed}`} />
          </div>
        </div>

        <div className="mt-4 min-h-[250px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">상자 상태</p>
          <div className="mt-3 grid min-h-[244px] grid-cols-3 content-start gap-2">
            {distribution.map((count, index) => (
              <div
                key={index}
                className={`h-[118px] rounded-md border p-2 text-center ${
                  completed && count === maxInBox ? "border-teal-300 bg-teal-50" : "border-slate-200 bg-white"
                }`}
              >
                <p className="text-xs font-black text-slate-500">상자 {index + 1}</p>
                <div className="mt-2 flex h-14 flex-wrap content-end justify-center gap-1 overflow-hidden">
                  {Array.from({ length: count }).map((_, ball) => (
                    <span key={ball} className="h-2.5 w-2.5 rounded-full bg-teal-600" />
                  ))}
                </div>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={count <= 0}
                    onClick={() => removeFromBox(index)}
                    className="px-1 text-base font-black leading-none text-slate-500 hover:text-slate-950 disabled:cursor-not-allowed disabled:text-slate-300"
                    aria-label={`상자 ${index + 1}에서 하나 빼기`}
                  >
                    -
                  </button>
                  <p className="min-w-8 text-sm font-black text-slate-950">{count}개</p>
                  <button
                    type="button"
                    disabled={remaining <= 0}
                    onClick={() => addToBox(index)}
                    className="px-1 text-base font-black leading-none text-slate-500 hover:text-slate-950 disabled:cursor-not-allowed disabled:text-slate-300"
                    aria-label={`상자 ${index + 1}에 하나 넣기`}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-2">
            <ResultCard label="현재 최댓값" value={`${maxInBox}개`} good={completed ? maxInBox >= guaranteed : true} />
            <div
              className={`min-h-[104px] rounded-md border p-3 text-sm font-bold leading-6 ${
                guaranteedConfirmed
                  ? "border-teal-200 bg-teal-50 text-teal-900"
                  : completed
                    ? "border-rose-200 bg-rose-50 text-rose-900"
                    : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              <p className="font-black">{guaranteedConfirmed ? "보장 확인" : completed ? "최종 판정" : "배치 중"}</p>
              <p className="mt-1">{verdict}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TreePlayground() {
  const nodes = ["A", "B", "C", "D", "E"];
  const possibleEdges: Array<[string, string]> = [
    ["A", "B"],
    ["A", "C"],
    ["B", "D"],
    ["B", "E"],
    ["C", "D"],
    ["D", "E"],
  ];
  const [edges, setEdges] = useState<Set<string>>(() => new Set(["A-B", "A-C", "B-D", "B-E"]));
  const [traversal, setTraversal] = useState<"preorder" | "inorder" | "postorder">("preorder");
  const nodePositions: Record<string, { x: number; y: number }> = {
    A: { x: 160, y: 42 },
    B: { x: 82, y: 122 },
    C: { x: 238, y: 122 },
    D: { x: 82, y: 204 },
    E: { x: 238, y: 204 },
  };
  const edgeKey = (left: string, right: string) => `${left}-${right}`;
  const hasEdge = (left: string, right: string) => edges.has(edgeKey(left, right));
  const toggleEdge = (left: string, right: string) => {
    setEdges((current) => {
      const next = new Set(current);
      const key = edgeKey(left, right);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const adjacency = Object.fromEntries(nodes.map((node) => [node, [] as string[]])) as Record<string, string[]>;
  possibleEdges.forEach(([left, right]) => {
    if (!hasEdge(left, right)) return;
    adjacency[left].push(right);
    adjacency[right].push(left);
  });
  Object.values(adjacency).forEach((neighbors) => neighbors.sort());
  const visited = new Set<string>();
  const stack = ["A"];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node || visited.has(node)) continue;
    visited.add(node);
    stack.push(...adjacency[node]);
  }
  const connected = visited.size === nodes.length;
  const cycleVisited = new Set<string>();
  const hasCycleFrom = (node: string, parent: string | null): boolean => {
    cycleVisited.add(node);
    for (const neighbor of adjacency[node]) {
      if (!cycleVisited.has(neighbor)) {
        if (hasCycleFrom(neighbor, node)) return true;
      } else if (neighbor !== parent) {
        return true;
      }
    }
    return false;
  };
  const hasCycle = nodes.some((node) => !cycleVisited.has(node) && hasCycleFrom(node, null));
  const hasTreeEdgeCount = edges.size === nodes.length - 1;
  const isTree = connected && !hasCycle && hasTreeEdgeCount;
  const childrenOf = (node: string, parent: string | null): string[] => adjacency[node].filter((child) => child !== parent).sort();
  const preorder = (node: string, parent: string | null): string[] => [
    node,
    ...childrenOf(node, parent).flatMap((child) => preorder(child, node)),
  ];
  const postorder = (node: string, parent: string | null): string[] => [
    ...childrenOf(node, parent).flatMap((child) => postorder(child, node)),
    node,
  ];
  const inorder = (node: string, parent: string | null): string[] => {
    const children = childrenOf(node, parent);
    const [firstChild, ...restChildren] = children;
    return [
      ...(firstChild ? inorder(firstChild, node) : []),
      node,
      ...restChildren.flatMap((child) => inorder(child, node)),
    ];
  };
  const traversalOrders: Record<typeof traversal, string[]> = {
    preorder: isTree ? preorder("A", null) : [],
    inorder: isTree ? inorder("A", null) : [],
    postorder: isTree ? postorder("A", null) : [],
  };

  return (
    <section aria-label="트리 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">트리 구성과 순회 실험</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          간선을 직접 켜고 끄며 그래프가 트리인지 판정합니다.
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="min-h-[260px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">그래프 구성</p>
          <svg viewBox="0 0 320 246" role="img" aria-label="선택한 간선으로 만든 그래프" className="mt-3 h-auto w-full rounded-md bg-slate-50">
            {possibleEdges.filter(([left, right]) => hasEdge(left, right)).map(([left, right]) => {
              const from = nodePositions[left];
              const to = nodePositions[right];

              return (
                <line
                  key={`${left}-${right}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  className="stroke-teal-600"
                  strokeWidth={4}
                  strokeLinecap="round"
                />
              );
            })}
            {nodes.map((node) => {
              const position = nodePositions[node];

              return (
                <g key={node}>
                  <circle cx={position.x} cy={position.y} r="19" className="fill-white stroke-slate-950" strokeWidth="2" />
                  <text x={position.x} y={position.y + 5} textAnchor="middle" className="fill-slate-950 text-sm font-black">
                    {node}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {possibleEdges.map(([left, right]) => (
              <button
                key={`${left}-${right}`}
                type="button"
                onClick={() => toggleEdge(left, right)}
                className={`min-h-10 rounded-md border px-3 py-2 text-sm font-black ${
                  hasEdge(left, right)
                    ? "border-teal-600 bg-teal-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {left} - {right}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[260px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">트리 판정</p>
          <div className="mt-3 grid gap-2">
          <ResultCard label="노드 수" value={`${nodes.length}개`} />
          <ResultCard label="간선 수" value={`${edges.size}개`} good={hasTreeEdgeCount} />
          <ResultCard label="연결성" value={connected ? "통과: 모든 노드가 연결됩니다." : "실패: 연결되지 않은 노드가 있습니다."} good={connected} />
          <ResultCard label="사이클 없음" value={!hasCycle ? "통과: 사이클이 없습니다." : "실패: 사이클이 생겼습니다."} good={!hasCycle} />
          <ResultCard label="간선 수 n - 1" value={hasTreeEdgeCount ? `통과: ${nodes.length} - 1 = ${edges.size}` : `실패: ${nodes.length} - 1이어야 합니다.`} good={hasTreeEdgeCount} />
          <ResultCard label="결론" value={isTree ? "트리입니다." : "트리 아님"} good={isTree} />
          <div className="grid grid-cols-3 gap-2">
            <ToggleButton active={traversal === "preorder"} onClick={() => setTraversal("preorder")}>전위</ToggleButton>
            <ToggleButton active={traversal === "inorder"} onClick={() => setTraversal("inorder")}>중위</ToggleButton>
            <ToggleButton active={traversal === "postorder"} onClick={() => setTraversal("postorder")}>후위</ToggleButton>
          </div>
          {isTree ? (
            <ResultCard label="방문 순서" value={traversalOrders[traversal].join(" → ")} />
          ) : (
            <ResultCard label="방문 순서" value="트리가 아니므로 순회를 멈춥니다." good={false} />
          )}
          </div>
        </div>
      </div>
    </section>
  );
}
