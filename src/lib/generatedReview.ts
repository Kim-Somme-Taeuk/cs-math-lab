import type { QuizQuestion } from "@/components/interactive/MultipleChoiceQuiz";

type SetReviewKind = "union" | "intersection" | "difference" | "complement" | "subset" | "order" | "pythonUnion" | "pythonIntersection";

const setReviewKinds: SetReviewKind[] = [
  "union",
  "intersection",
  "difference",
  "complement",
  "subset",
  "order",
  "pythonUnion",
  "pythonIntersection",
];

function uniqueSorted(values: number[]) {
  return Array.from(new Set(values)).sort((left, right) => left - right);
}

function formatSet(values: number[]) {
  return `{ ${values.join(", ")} }`;
}

function rotateChoices(correct: string, distractors: string[], seed: number): [string, string, string, string] {
  const uniqueChoices = [correct, ...distractors.filter((choice) => choice !== correct)].slice(0, 4);
  const offset = seed % uniqueChoices.length;
  return [...uniqueChoices.slice(offset), ...uniqueChoices.slice(0, offset)] as [string, string, string, string];
}

function questionFromChoices(
  prompt: string,
  correct: string,
  distractors: string[],
  explanation: string,
  seed: number,
  questionType: string,
  conceptTags: string[],
  reasonTags: string[],
): QuizQuestion {
  const choices = rotateChoices(correct, distractors, seed);

  return {
    prompt,
    choices,
    correctIndex: choices.indexOf(correct),
    explanation,
    questionType,
    conceptTags,
    reasonTags,
  };
}

function buildSets(kindIndex: number, variant: number) {
  const base = 1 + ((kindIndex + variant) % 3);
  const shared = base + 2;
  const a = uniqueSorted([base, base + 1, shared]);
  const b = uniqueSorted([shared, base + 3, base + 4]);
  const universe = uniqueSorted([base, base + 1, shared, base + 3, base + 4, base + 5]);

  return { a, b, universe };
}

function generateSetReviewQuestion(kind: SetReviewKind, kindIndex: number, variant: number): QuizQuestion {
  const { a, b, universe } = buildSets(kindIndex, variant);
  const union = uniqueSorted([...a, ...b]);
  const intersection = a.filter((value) => b.includes(value));
  const difference = a.filter((value) => !b.includes(value));
  const complement = universe.filter((value) => !a.includes(value));
  const seed = kindIndex + variant;

  if (kind === "union") {
    return questionFromChoices(
      `A = ${formatSet(a)}, B = ${formatSet(b)}일 때 A ∪ B는?`,
      formatSet(union),
      [formatSet(intersection), formatSet(difference), formatSet(complement)],
      "합집합은 A 또는 B에 들어 있는 원소를 모두 모읍니다.",
      seed,
      "union",
      ["집합 연산", "합집합"],
      ["합집합과 교집합 혼동"],
    );
  }

  if (kind === "intersection") {
    return questionFromChoices(
      `A = ${formatSet(a)}, B = ${formatSet(b)}일 때 A ∩ B는?`,
      formatSet(intersection),
      [formatSet(union), formatSet(difference), formatSet(b.filter((value) => !a.includes(value)))],
      "교집합은 A와 B에 동시에 들어 있는 원소만 남깁니다.",
      seed,
      "intersection",
      ["집합 연산", "교집합"],
      ["공통 원소만 남기는 조건 혼동"],
    );
  }

  if (kind === "difference") {
    return questionFromChoices(
      `A = ${formatSet(a)}, B = ${formatSet(b)}일 때 A - B는?`,
      formatSet(difference),
      [formatSet(b.filter((value) => !a.includes(value))), formatSet(intersection), formatSet(union)],
      "A - B는 A에는 있지만 B에는 없는 원소입니다.",
      seed,
      "difference",
      ["집합 연산", "차집합"],
      ["차집합 방향 혼동"],
    );
  }

  if (kind === "complement") {
    return questionFromChoices(
      `전체집합 U = ${formatSet(universe)}, A = ${formatSet(a)}일 때 A의 여집합은?`,
      formatSet(complement),
      [formatSet(a), formatSet(intersection), formatSet(union)],
      "여집합은 전체집합 U에서 A에 들어 있지 않은 원소입니다.",
      seed,
      "complement",
      ["집합 연산", "여집합"],
      ["전체집합 기준 누락"],
    );
  }

  if (kind === "subset") {
    const subset = variant % 2 === 0 ? [a[0], a[1]] : [a[0], b[1]];
    const correct = subset.every((value) => a.includes(value))
      ? `맞다. ${formatSet(subset)}의 모든 원소가 A에 있다.`
      : `아니다. ${subset.find((value) => !a.includes(value))}이 A에 없다.`;

    return questionFromChoices(
      `A = ${formatSet(a)}일 때 ${formatSet(subset)}가 A의 부분집합인지 판단하면?`,
      correct,
      [
        "맞다. 원소 개수가 더 적으면 항상 부분집합이다.",
        "아니다. 순서가 다르기 때문이다.",
        "판단하려면 합집합을 먼저 구해야 한다.",
      ],
      "부분집합이 되려면 왼쪽 집합의 모든 원소가 오른쪽 집합에 있어야 합니다.",
      seed,
      "subset",
      ["부분집합"],
      ["부분집합 조건 오해"],
    );
  }

  if (kind === "order") {
    const reversed = [...a].reverse();
    return questionFromChoices(
      `${formatSet(a)}와 ${formatSet(reversed)}를 집합으로 볼 때 올바른 설명은?`,
      "같은 원소를 가지므로 같은 집합으로 볼 수 있다.",
      [
        "순서가 다르므로 반드시 다른 집합이다.",
        "원소가 숫자이면 집합으로 볼 수 없다.",
        "중복이 없으면 집합이 아니다.",
      ],
      "집합은 순서를 보지 않고 어떤 원소가 들어 있는지를 봅니다.",
      seed,
      "set-order",
      ["집합", "순서 무시"],
      ["집합에서 순서가 중요하다고 오해"],
    );
  }

  if (kind === "pythonUnion") {
    return questionFromChoices(
      `Python에서 a = ${formatSet(a)}, b = ${formatSet(b)}라고 볼 때 a | b와 가장 가까운 연산은?`,
      "합집합",
      ["교집합", "차집합", "여집합"],
      "`a | b`는 두 set의 원소를 모두 모으는 합집합 연산입니다.",
      seed,
      "python-union",
      ["Python set", "합집합"],
      ["Python set 연산자 의미 혼동"],
    );
  }

  return questionFromChoices(
    `Python에서 a = ${formatSet(a)}, b = ${formatSet(b)}라고 볼 때 a & b와 가장 가까운 연산은?`,
    "교집합",
    ["합집합", "A의 여집합", "B - A"],
    "`a & b`는 두 set에 공통으로 들어 있는 원소만 남기는 교집합 연산입니다.",
    seed,
    "python-intersection",
    ["Python set", "교집합"],
    ["Python set 연산자 의미 혼동"],
  );
}

export function generateSetReviewQuestions(variants: number[] = []) {
  return setReviewKinds.map((kind, index) => generateSetReviewQuestion(kind, index, variants[index] ?? 0));
}
