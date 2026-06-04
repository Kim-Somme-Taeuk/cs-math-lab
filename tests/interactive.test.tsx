import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ConditionalPlayground from "../src/components/interactive/ConditionalPlayground";
import CountingPlayground from "../src/components/interactive/CountingPlayground";
import MultipleChoiceQuiz from "../src/components/interactive/MultipleChoiceQuiz";
import SetVennPlayground from "../src/components/interactive/SetVennPlayground";
import TruthTablePlayground from "../src/components/interactive/TruthTablePlayground";
import { buildAiLearningContext } from "../src/lib/aiLearningContext";
import { normalizeCoachMemo, validateAiCoachPayload } from "../src/lib/aiCoach";
import { chapters, roadmapSubjects } from "../src/lib/chapters";
import { generateSetReviewQuestions } from "../src/lib/generatedReview";
import { evaluateLogic } from "../src/lib/logic";
import { getLearningInsights, getRecommendedChapters, quizResultsStorageKey } from "../src/lib/personalization";
import { evaluateSetOperation } from "../src/lib/setUtils";

describe("logic helpers", () => {
  it("evaluates implication and biconditional truth values correctly", () => {
    expect(evaluateLogic({ p: true, q: true }).implication).toBe(true);
    expect(evaluateLogic({ p: true, q: false }).implication).toBe(false);
    expect(evaluateLogic({ p: false, q: true }).implication).toBe(true);
    expect(evaluateLogic({ p: false, q: false }).implication).toBe(true);
    expect(evaluateLogic({ p: true, q: true }).biconditional).toBe(true);
    expect(evaluateLogic({ p: true, q: false }).biconditional).toBe(false);
  });
});

describe("set helpers", () => {
  it("calculates union, intersection, difference, and complement correctly", () => {
    const a = ["1", "2", "3"];
    const b = ["3", "4", "5"];

    expect(evaluateSetOperation("union", a, b)).toEqual(["1", "2", "3", "4", "5"]);
    expect(evaluateSetOperation("intersection", a, b)).toEqual(["3"]);
    expect(evaluateSetOperation("difference", a, b)).toEqual(["1", "2"]);
    expect(evaluateSetOperation("complement", a, b)).toEqual(["4", "5", "6"]);
  });

  it("generates set review variants without changing the tested concept", () => {
    const firstAttempt = generateSetReviewQuestions();
    const secondAttempt = generateSetReviewQuestions([1]);

    expect(firstAttempt).toHaveLength(8);
    expect(firstAttempt[0].prompt).toContain("A ∪ B");
    expect(firstAttempt[0].questionType).toBe("union");
    expect(firstAttempt[0].conceptTags).toContain("합집합");
    expect(secondAttempt[0].prompt).toContain("A ∪ B");
    expect(secondAttempt[0].prompt).not.toBe(firstAttempt[0].prompt);
    expect(firstAttempt[0].choices[firstAttempt[0].correctIndex]).toMatch(/^\{ /);
  });
});

describe("TruthTablePlayground", () => {
  it("updates basic logic operations", async () => {
    const user = userEvent.setup();
    render(<TruthTablePlayground />);

    const playground = screen.getByRole("region", { name: "진리표 실험" });
    expect(within(playground).getAllByText("최종 결과: 거짓")[0]).toBeInTheDocument();
    await user.click(within(playground).getAllByRole("button", { name: "P OR NOT Q" })[0]);
    expect(within(playground).getAllByText(/P가 참이므로 OR 결과가 참/)[0]).toBeInTheDocument();

    await user.click(within(playground).getByRole("button", { name: /명제 Q/ }));
    await user.click(within(playground).getAllByRole("button", { name: "P AND Q" })[0]);
    expect(within(playground).getAllByText("최종 결과: 참")[0]).toBeInTheDocument();
  });
});

describe("ConditionalPlayground", () => {
  it("updates the implication explanation", async () => {
    const user = userEvent.setup();
    render(<ConditionalPlayground />);

    const playground = screen.getByRole("region", { name: "조건문 실험" });
    expect(within(playground).getByText(/P가 참인데 Q가 거짓/)).toBeInTheDocument();
    expect(within(playground).getAllByText("P 참, Q 거짓")[0]).toBeInTheDocument();

    await user.click(within(playground).getByRole("button", { name: /결론 Q/ }));

    expect(within(playground).getByText(/약속이 지켜졌으므로/)).toBeInTheDocument();
  });
});

describe("SetVennPlayground", () => {
  it("updates results when the learner changes operations", async () => {
    const user = userEvent.setup();
    render(<SetVennPlayground />);

    const playground = screen.getByRole("region", { name: "집합 연산 실험" });
    expect(within(playground).getByText("결과 = { 2, 4, 5, 6 }")).toBeInTheDocument();

    await user.click(within(playground).getByRole("button", { name: "A ∩ B" }));
    expect(within(playground).getByText("결과 = { 4, 6 }")).toBeInTheDocument();

    await user.click(within(playground).getByRole("button", { name: "A - B" }));
    expect(within(playground).getByText("결과 = { 2 }")).toBeInTheDocument();

    await user.click(within(playground).getAllByRole("button", { name: "소수" })[0]);
    expect(within(playground).getByText("결과 = { 2, 3 }")).toBeInTheDocument();
  });
});

describe("CountingPlayground", () => {
  it("keeps unordered results readable without summary placeholders", async () => {
    const user = userEvent.setup();
    render(<CountingPlayground />);

    const playground = screen.getByRole("region", { name: "경우의 수 실험" });
    await user.click(within(playground).getByRole("button", { name: "5개" }));
    await user.click(within(playground).getByRole("button", { name: "순서 고려" }));

    expect(within(playground).getByText("전체 10개")).toBeInTheDocument();
    expect(within(playground).getByText("{A,B}")).toBeInTheDocument();
    expect(within(playground).queryByText(/\+\d+개/)).not.toBeInTheDocument();
  });
});

describe("MultipleChoiceQuiz", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("requires all answers and scores submitted choices", async () => {
    const user = userEvent.setup();
    render(
      <MultipleChoiceQuiz
        questions={[
          {
            prompt: "A ∩ B는 무엇인가?",
            choices: ["{ 1, 2 }", "{ 3 }", "{ 4, 5 }", "{ 6 }"],
            correctIndex: 1,
            explanation: "교집합은 두 집합에 모두 있는 원소입니다.",
          },
          {
            prompt: "P가 참이고 Q가 거짓일 때 P -> Q는?",
            choices: ["참", "거짓", "항상 알 수 없음", "P만 보면 참"],
            correctIndex: 1,
            explanation: "조건문은 P가 참이고 Q가 거짓일 때만 거짓입니다.",
          },
        ]}
      />,
    );

    const quiz = screen.getByRole("region", { name: "문제 풀기" });
    expect(within(quiz).getByRole("button", { name: "채점하기" })).toBeDisabled();

    await user.click(within(quiz).getByLabelText("{ 3 }"));
    await user.click(within(quiz).getByRole("button", { name: "다음" }));
    await user.click(within(quiz).getByLabelText("거짓"));
    await user.click(within(quiz).getByRole("button", { name: "채점하기" }));

    expect(within(quiz).getByText("2 / 2 정답")).toBeInTheDocument();
    expect(within(quiz).getByText("정답입니다.")).toBeInTheDocument();
  });

  it("stores missed concepts and question types from wrong answers", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("location", new URL("http://localhost:3001/chapters/sets"));
    render(
      <MultipleChoiceQuiz
        questions={[
          {
            prompt: "A ∪ B는 무엇인가?",
            choices: ["합집합", "교집합", "차집합", "여집합"],
            correctIndex: 0,
            explanation: "합집합은 두 집합의 원소를 모두 모읍니다.",
            conceptTags: ["합집합"],
            questionType: "union",
          },
          {
            prompt: "A ∩ B는 무엇인가?",
            choices: ["합집합", "교집합", "차집합", "여집합"],
            correctIndex: 1,
            explanation: "교집합은 공통 원소만 남깁니다.",
            conceptTags: ["교집합"],
            questionType: "intersection",
          },
        ]}
      />,
    );

    const quiz = screen.getByRole("region", { name: "문제 풀기" });
    await user.click(within(quiz).getByLabelText("교집합"));
    await user.click(within(quiz).getByRole("button", { name: "다음" }));
    await user.click(within(quiz).getByLabelText("교집합"));
    await user.click(within(quiz).getByRole("button", { name: "채점하기" }));

    const stored = JSON.parse(window.localStorage.getItem(quizResultsStorageKey) ?? "{}") as Record<
      string,
      { missedConcepts: string[]; missedQuestionTypes: string[] }
    >;
    const result = Object.values(stored)[0];

    expect(result.missedConcepts).toEqual(["합집합"]);
    expect(result.missedQuestionTypes).toEqual(["union"]);
  });
});

describe("personalized recommendations", () => {
  it("prioritizes code-oriented foundation chapters from ready content", () => {
    const discreteMath = roadmapSubjects.find((subject) => subject.id === "discrete-math");
    const readyChapters = discreteMath?.levels
      .flatMap((level) => level.chapters)
      .filter((chapter) => chapter.status === "ready") ?? chapters;

    const recommended = getRecommendedChapters(
      {
        goal: "foundation",
        level: "beginner",
        style: "code",
      },
      readyChapters,
    );

    expect(recommended.map((chapter) => chapter.slug).slice(0, 4)).toEqual([
      "logic",
      "conditionals",
      "sets",
      "functions",
    ]);
    expect(recommended[0].conceptTags).toContain("명제");
    expect(recommended[0].trackTags).toContain("cs-foundation");
  });

  it("summarizes weak concepts from low quiz scores", () => {
    const discreteMath = roadmapSubjects.find((subject) => subject.id === "discrete-math");
    const readyChapters = discreteMath?.levels
      .flatMap((level) => level.chapters)
      .filter((chapter) => chapter.status === "ready") ?? chapters;

    const insights = getLearningInsights(
      {
        goal: "course",
        level: "beginner",
        style: "practice",
      },
      readyChapters,
      ["logic"],
      [
        {
          slug: "conditionals",
          title: "연습 문제",
          score: 1,
          total: 3,
          concepts: ["조건문", "대우"],
          missedConcepts: ["대우"],
          missedQuestionTypes: ["contrapositive"],
          updatedAt: "2026-06-04T00:00:00.000Z",
        },
      ],
    );

    expect(insights.weakConcepts).toEqual(["대우"]);
    expect(insights.weakQuestionTypes).toEqual(["contrapositive"]);
    expect(insights.reviewChapters.map((chapter) => chapter.slug)).toEqual(["conditionals"]);
    expect(insights.coachMessage).toContain("대우");
  });

  it("uses self-reported confusion as a weak concept signal", () => {
    const discreteMath = roadmapSubjects.find((subject) => subject.id === "discrete-math");
    const readyChapters = discreteMath?.levels
      .flatMap((level) => level.chapters)
      .filter((chapter) => chapter.status === "ready") ?? chapters;

    const insights = getLearningInsights(null, readyChapters, [], [], [
      {
        slug: "proof-techniques",
        concept: "대우 증명",
        status: "confused",
        updatedAt: "2026-06-04T00:00:00.000Z",
      },
    ]);

    expect(insights.weakConcepts).toContain("대우 증명");
    expect(insights.reviewChapters.map((chapter) => chapter.slug)).toContain("proof-techniques");
  });

  it("builds a compact AI learning context without user-identifying data", () => {
    const discreteMath = roadmapSubjects.find((subject) => subject.id === "discrete-math");
    const readyChapters = discreteMath?.levels
      .flatMap((level) => level.chapters)
      .filter((chapter) => chapter.status === "ready") ?? chapters;

    const context = buildAiLearningContext({
      profile: {
        goal: "coding-test",
        level: "beginner",
        style: "practice",
      },
      readyChapters,
      completedSlugs: ["logic"],
      quizResults: [
        {
          slug: "sets",
          title: "종합 점검",
          score: 3,
          total: 8,
          concepts: ["집합"],
          missedConcepts: ["차집합"],
          missedQuestionTypes: ["difference"],
          updatedAt: "2026-06-04T00:00:00.000Z",
        },
      ],
    });

    expect(context.profile).toContain("코테");
    expect(context.weakConcepts).toEqual(["차집합"]);
    expect(context.weakQuestionTypes).toEqual(["difference"]);
    expect(context.chapterCatalog[0]).toMatchObject({
      slug: "logic",
      subjectId: "discrete-math",
      prerequisites: [],
    });
    expect(validateAiCoachPayload({ context })).toBe(true);
  });

  it("rejects oversized AI coach payloads and normalizes memo text", () => {
    const oversizedPayload = {
      context: {
        profile: "코테",
        completedSlugs: [],
        nextChapterSlug: null,
        reviewChapterSlugs: [],
        weakConcepts: ["x".repeat(121)],
        weakQuestionTypes: [],
        recentAttempts: [],
        chapterCatalog: [],
      },
    };

    expect(validateAiCoachPayload(oversizedPayload)).toBe(false);
    expect(normalizeCoachMemo("첫 줄\n\n둘째 줄")).toBe("첫 줄 둘째 줄");
  });
});
