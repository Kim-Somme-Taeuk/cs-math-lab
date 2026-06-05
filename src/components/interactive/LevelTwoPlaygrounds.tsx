"use client";

import { useState } from "react";
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
  const [ruleKey, setRuleKey] = useState<"deMorganAnd" | "deMorganOr" | "implication" | "contrapositive">("deMorganAnd");
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

      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
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
          <p className="mt-3 flex min-h-[72px] items-center rounded-md bg-slate-50 p-3 text-sm font-bold leading-6 text-slate-700">
            {rule.explanation}
          </p>
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

const predicateUsers = [
  { name: "Alice", active: true, admin: false },
  { name: "Bob", active: true, admin: true },
  { name: "Chris", active: false, admin: false },
];

export function PredicateLogicPlayground() {
  const [inactiveChris, setInactiveChris] = useState(true);
  const users = predicateUsers.map((user) => (user.name === "Chris" ? { ...user, active: !inactiveChris } : user));
  const allActive = users.every((user) => user.active);
  const someAdmin = users.some((user) => user.admin);
  const inactiveUsers = users.filter((user) => !user.active);

  return (
    <section aria-label="술어 논리 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">수량자 조건 판별기</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          사용자 목록을 바꾸며 모든 조건과 존재 조건이 어떻게 달라지는지 확인합니다.
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="min-h-[250px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">정의역: users</p>
          <div className="mt-3 grid gap-2">
            {users.map((user) => (
              <div key={user.name} className="flex min-h-[58px] items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                <div>
                  <p className="text-sm font-black text-slate-950">{user.name}</p>
                  <p className="text-xs font-bold text-slate-500">
                    active {user.active ? "참" : "거짓"} · admin {user.admin ? "참" : "거짓"}
                  </p>
                </div>
                {user.name === "Chris" ? (
                  <button
                    type="button"
                    onClick={() => setInactiveChris((value) => !value)}
                    className={`shrink-0 rounded-md border px-3 py-2 text-sm font-black ${
                      user.active ? "border-teal-600 bg-teal-50 text-teal-800" : "border-rose-300 bg-rose-50 text-rose-700"
                    }`}
                  >
                    Chris {user.active ? "참" : "거짓"}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-[250px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">판정</p>
          <div className="mt-3 grid gap-2">
            <ResultCard
              label="∀ user Active(user)"
              value={allActive ? "모든 사용자가 활성 상태입니다." : `${inactiveUsers.map((user) => user.name).join(", ")}가 반례입니다.`}
              good={allActive}
            />
          <ResultCard label="∃ user Admin(user)" value={someAdmin ? "관리자인 사용자가 적어도 한 명 있습니다." : "관리자인 사용자가 없습니다."} good={someAdmin} />
          <ResultCard label="¬∀ user Active(user)" value={allActive ? "활성 상태가 아닌 사용자가 없습니다." : "활성 상태가 아닌 사용자가 존재합니다."} good={!allActive} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function EquivalenceRelationPlayground() {
  const [mode, setMode] = useState<"parity" | "chain">("parity");
  const items = [1, 2, 3, 4];
  const sameGroup = (left: number, right: number) => {
    if (mode === "parity") return left % 2 === right % 2;
    return Math.abs(left - right) <= 1;
  };
  const groups = mode === "parity" ? ["{1, 3}", "{2, 4}"] : ["그룹으로 안정적으로 나뉘지 않음"];

  return (
    <section aria-label="동치관계 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">동치류 묶음 판별기</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          관계 규칙을 바꾸며 반사성, 대칭성, 추이성이 함께 성립하는지 봅니다.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <ToggleButton active={mode === "parity"} onClick={() => setMode("parity")}>같은 나머지</ToggleButton>
        <ToggleButton active={mode === "chain"} onClick={() => setMode("chain")}>차이가 1 이하</ToggleButton>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="min-h-[250px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">관계표</p>
          <div className="mt-3 grid grid-cols-4 overflow-hidden rounded-md border border-slate-200">
          {items.flatMap((left) =>
            items.map((right) => (
              <div
                key={`${left}-${right}`}
                className={`min-h-10 border border-slate-100 p-2 text-center text-sm font-black ${
                  sameGroup(left, right) ? "bg-teal-600 text-white" : "bg-white text-slate-500"
                }`}
              >
                ({left},{right})
              </div>
            )),
          )}
          </div>
        </div>

        <div className="min-h-[250px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">성질 판정</p>
          <div className="mt-3 grid gap-2">
          <ResultCard label="반사성" value="각 원소가 자기 자신과 연결됩니다." />
          <ResultCard label="대칭성" value="선택된 칸이 대각선 기준으로 짝을 이룹니다." />
          <ResultCard
            label="추이성"
            value={mode === "parity" ? "같은 그룹 안에서 이어진 관계가 유지됩니다." : "(1,2), (2,3)은 있지만 (1,3)이 빠져 깨집니다."}
            good={mode === "parity"}
          />
            <p className="min-h-[44px] rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700">동치류: {groups.join(" / ")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PartialOrderPlayground() {
  const [showApi, setShowApi] = useState(true);
  const dependencies: Record<string, string[]> = {
    build: showApi ? ["design", "api"] : ["design"],
    deploy: ["build"],
  };
  const mustBefore = (left: string, right: string) => {
    const stack = [...(dependencies[right] ?? [])];
    const seen = new Set<string>();
    while (stack.length > 0) {
      const task = stack.pop();
      if (!task) continue;
      if (task === left) return true;
      if (seen.has(task)) continue;
      seen.add(task);
      stack.push(...(dependencies[task] ?? []));
    }
    return left === right;
  };
  const incomparable = showApi ? "design과 api는 서로 비교할 필요가 없습니다." : "현재는 design -> build -> deploy로 한 줄에 가깝습니다.";
  const comparePairs: Array<[string, string]> = showApi
    ? [
        ["design", "build"],
        ["api", "build"],
        ["design", "deploy"],
        ["api", "deploy"],
        ["design", "api"],
        ["build", "deploy"],
      ]
    : [
        ["design", "build"],
        ["build", "deploy"],
        ["design", "deploy"],
        ["deploy", "design"],
      ];

  return (
    <section aria-label="부분순서관계 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">작업 의존성 순서 판별기</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          독립 작업을 넣고 빼며 비교 가능한 작업과 비교 불가능한 작업을 구분합니다.
        </p>
      </div>

      <div className="mt-4">
        <ToggleButton active={showApi} onClick={() => setShowApi((value) => !value)}>api 작업 {showApi ? "포함" : "제외"}</ToggleButton>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="min-h-[248px] rounded-lg border border-slate-200 bg-white p-4 text-center">
          <p className="text-left text-sm font-bold text-slate-500">의존성 도식</p>
          <div className="flex justify-center gap-2">
            <span className="rounded-md bg-white px-3 py-2 text-sm font-black text-slate-950 shadow-sm">design</span>
            {showApi ? <span className="rounded-md bg-white px-3 py-2 text-sm font-black text-slate-950 shadow-sm">api</span> : null}
          </div>
          <p className="py-2 text-xl font-black text-teal-700">↓</p>
          <span className="rounded-md bg-teal-600 px-3 py-2 text-sm font-black text-white shadow-sm">build</span>
          <p className="py-2 text-xl font-black text-teal-700">↓</p>
          <span className="rounded-md bg-slate-950 px-3 py-2 text-sm font-black text-white shadow-sm">deploy</span>
          <p className="mt-3 min-h-10 rounded-md bg-slate-50 p-2 text-sm font-bold leading-6 text-slate-700">{incomparable}</p>
        </div>

        <div className="min-h-[248px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">순서 판정</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {comparePairs.map(([left, right]) => (
              <ResultCard key={`${left}-${right}`} label={`${left} ≤ ${right}`} value={mustBefore(left, right) ? "성립" : "비교 불가"} good={mustBefore(left, right)} />
            ))}
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
  const sequence = Array.from({ length: n }, (_, index) => start + index * step);
  const sumSteps = Array.from({ length: n }, (_, index) => index + 1);
  const sum = sumSteps.reduce((total, value) => total + value, 0);

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
        </div>

        <div className="mt-4 min-h-[246px] rounded-lg border border-slate-200 bg-white p-4 lg:mt-4">
          <p className="text-sm font-bold text-slate-500">펼친 결과</p>
          <div className="mt-3 grid gap-2">
          <ResultCard label="a_n = a_{n-1} + d" value={sequence.join(", ")} />
          <ResultCard label="T(n)=T(n-1)+n 펼치기" value={`${sumSteps.join(" + ")} = ${sum}`} />
          <p className="min-h-[58px] rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-bold leading-6 text-slate-700">
            점화식은 이전 값에서 다음 값을 만드는 규칙이고, 펼치면 반복문 실행 횟수나 합으로 읽을 수 있습니다.
          </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function InclusionExclusionPlayground() {
  const [designer, setDesigner] = useState(true);
  const people = [
    { name: "민준", tags: ["개발자"] },
    { name: "서연", tags: ["디자이너"] },
    { name: "지우", tags: ["개발자", "디자이너"] },
    { name: "도윤", tags: ["기획자"] },
    { name: "하린", tags: ["개발자", "기획자"] },
    { name: "유나", tags: ["디자이너", "기획자"] },
  ];
  const leftTag = "개발자";
  const rightTag = designer ? "디자이너" : "기획자";
  const left = people.filter((person) => person.tags.includes(leftTag));
  const right = people.filter((person) => person.tags.includes(rightTag));
  const both = people.filter((person) => person.tags.includes(leftTag) && person.tags.includes(rightTag));
  const union = people.filter((person) => person.tags.includes(leftTag) || person.tags.includes(rightTag));

  return (
    <section aria-label="포함배제 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">겹친 태그 세기 실험</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          두 조건을 만족하는 사람을 합칠 때 겹치는 사람을 왜 한 번 빼야 하는지 확인합니다.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <ToggleButton active={designer} onClick={() => setDesigner(true)}>개발자 ∪ 디자이너</ToggleButton>
        <ToggleButton active={!designer} onClick={() => setDesigner(false)}>개발자 ∪ 기획자</ToggleButton>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-h-[264px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">사람 카드</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
          {people.map((person) => {
            const inUnion = union.includes(person);
            const inBoth = both.includes(person);
            return (
              <div key={person.name} className={`rounded-md border p-3 ${inBoth ? "border-teal-400 bg-teal-100" : inUnion ? "border-teal-200 bg-teal-50" : "border-slate-200 bg-white"}`}>
                <p className="text-sm font-black text-slate-950">{person.name}</p>
                <p className="text-xs font-bold text-slate-500">{person.tags.join(", ")}</p>
              </div>
            );
          })}
          </div>
        </div>

        <div className="min-h-[264px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">계산</p>
          <div className="mt-3 grid gap-2">
          <ResultCard label="|A|" value={`${left.length}명`} />
          <ResultCard label="|B|" value={`${right.length}명`} />
          <ResultCard label="겹친 사람 |A ∩ B|" value={`${both.length}명: ${both.map((person) => person.name).join(", ") || "없음"}`} />
          <ResultCard label="|A ∪ B| = |A| + |B| - |A ∩ B|" value={`${left.length} + ${right.length} - ${both.length} = ${union.length}명`} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function PigeonholePlayground() {
  const [items, setItems] = useState(10);
  const [boxes, setBoxes] = useState(3);
  const guaranteed = Math.ceil(items / boxes);
  const distribution = Array.from({ length: boxes }, (_, index) => Math.floor(items / boxes) + (index < items % boxes ? 1 : 0));

  return (
    <section aria-label="비둘기집 원리 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">최소 보장 개수 실험</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          대상과 상자 개수를 바꾸며 적어도 한 상자에 몇 개 이상 들어가는지 봅니다.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="mt-4 grid min-h-[250px] gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">개수 조정</p>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            대상 개수: {items}
            <input type="range" min="4" max="16" value={items} onChange={(event) => setItems(Number(event.target.value))} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            상자 개수: {boxes}
            <input type="range" min="2" max="6" value={boxes} onChange={(event) => setBoxes(Number(event.target.value))} />
          </label>
          <ResultCard label="보장" value={`적어도 한 상자에는 ${guaranteed}개 이상 들어갑니다.`} />
        </div>

        <div className="mt-4 min-h-[250px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">가능한 배치 예시</p>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {distribution.map((count, index) => (
            <div key={index} className={`rounded-md border p-2 text-center ${count === guaranteed ? "border-teal-300 bg-teal-50" : "border-slate-200 bg-white"}`}>
              <p className="text-xs font-black text-slate-500">상자 {index + 1}</p>
              <div className="mt-2 flex min-h-16 flex-wrap content-end justify-center gap-1">
                {Array.from({ length: count }).map((_, ball) => (
                  <span key={ball} className="h-2.5 w-2.5 rounded-full bg-teal-600" />
                ))}
              </div>
              <p className="mt-2 text-sm font-black text-slate-950">{count}개</p>
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TreePlayground() {
  const [extraEdge, setExtraEdge] = useState<"none" | "cycle" | "disconnected">("none");
  const isTree = extraEdge === "none";
  const preorder = ["A", "B", "D", "E", "C"];
  const inorder = ["D", "B", "E", "A", "C"];
  const postorder = ["D", "E", "B", "C", "A"];

  return (
    <section aria-label="트리 실험" className="mt-3 mb-7 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div>
        <h3 className="m-0 text-lg font-black text-slate-950">트리 조건과 순회 실험</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          사이클이나 끊어진 연결을 추가하며 트리 조건과 순회 결과를 비교합니다.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <ToggleButton active={extraEdge === "none"} onClick={() => setExtraEdge("none")}>기본 트리</ToggleButton>
        <ToggleButton active={extraEdge === "cycle"} onClick={() => setExtraEdge("cycle")}>사이클 추가</ToggleButton>
        <ToggleButton active={extraEdge === "disconnected"} onClick={() => setExtraEdge("disconnected")}>연결 끊기</ToggleButton>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="min-h-[260px] rounded-lg border border-slate-200 bg-white p-4 text-center">
          <p className="text-left text-sm font-bold text-slate-500">구조</p>
          <div className="mx-auto grid max-w-xs grid-cols-4 gap-2 text-sm font-black">
            <span className="col-span-4 mx-auto rounded-md bg-slate-950 px-3 py-2 text-white">A</span>
            <span className="col-span-2 mx-auto rounded-md bg-teal-600 px-3 py-2 text-white">B</span>
            <span className={`col-span-2 mx-auto rounded-md px-3 py-2 text-white ${extraEdge === "disconnected" ? "bg-slate-300" : "bg-teal-600"}`}>C</span>
            <span className="mx-auto rounded-md bg-white px-3 py-2 text-slate-950 shadow-sm">D</span>
            <span className="mx-auto rounded-md bg-white px-3 py-2 text-slate-950 shadow-sm">E</span>
            {extraEdge === "cycle" ? <span className="col-span-2 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-rose-700">E → A 사이클</span> : null}
          </div>
        </div>

        <div className="min-h-[260px] rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">판정과 순회</p>
          <div className="mt-3 grid gap-2">
          <ResultCard label="트리 판정" value={isTree ? "연결되어 있고 사이클이 없습니다." : extraEdge === "cycle" ? "사이클이 생겨 트리가 아닙니다." : "연결이 끊겨 하나의 트리가 아닙니다."} good={isTree} />
          {isTree ? (
            <>
              <ResultCard label="전위 순회" value={preorder.join(" → ")} />
              <ResultCard label="중위 순회" value={inorder.join(" → ")} />
              <ResultCard label="후위 순회" value={postorder.join(" → ")} />
            </>
          ) : (
            <ResultCard label="순회" value="트리가 아니므로 기본 트리에서만 확인합니다." good={false} />
          )}
          </div>
        </div>
      </div>
    </section>
  );
}
