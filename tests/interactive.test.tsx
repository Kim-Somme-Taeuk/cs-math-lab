import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ConditionalPlayground from "../src/components/interactive/ConditionalPlayground";
import CountingPlayground from "../src/components/interactive/CountingPlayground";
import CounterexamplePlayground from "../src/components/interactive/CounterexamplePlayground";
import MultipleChoiceQuiz from "../src/components/interactive/MultipleChoiceQuiz";
import SetVennPlayground from "../src/components/interactive/SetVennPlayground";
import TruthTablePlayground from "../src/components/interactive/TruthTablePlayground";
import { buildAiLearningContext } from "../src/lib/aiLearningContext";
import { normalizeCoachMemo, validateAiCoachPayload } from "../src/lib/aiCoach";
import { chapters, getChapterNavigation, getReadyChaptersInSameLevel, roadmapSubjects } from "../src/lib/chapters";
import { generateSetReviewQuestions } from "../src/lib/generatedReview";
import { evaluateLogic } from "../src/lib/logic";
import {
  conceptMasteryStorageKey,
  getLearningInsights,
  getRecommendedChapters,
  questionAttemptsStorageKey,
  quizResultsStorageKey,
} from "../src/lib/personalization";
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
    expect(firstAttempt[0].questionId).toBe("sets:review:union:0");
    expect(firstAttempt[0].conceptId).toBe("chapter:sets");
    expect(firstAttempt[0].questionType).toBe("union");
    expect(firstAttempt[0].conceptTags).toContain("합집합");
    expect(firstAttempt[0].reasonTags).toContain("합집합과 교집합 혼동");
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

describe("CounterexamplePlayground", () => {
  it("marks an ascending multi-item list as a counterexample", async () => {
    const user = userEvent.setup();
    render(<CounterexamplePlayground />);

    const playground = screen.getByRole("region", { name: "반례 찾기 실험" });
    expect(within(playground).getByText("[1, 2, 3]은 조건은 만족하지만 결론이 깨지므로 반례입니다.")).toBeInTheDocument();

    await user.click(within(playground).getByRole("button", { name: "길이 0" }));
    expect(within(playground).getByText("빈 리스트는 이번 주장의 대상인 비어 있지 않은 리스트가 아니므로 반례로 쓰지 않습니다.")).toBeInTheDocument();

    await user.click(within(playground).getByRole("button", { name: "길이 3" }));
    await user.clear(within(playground).getByLabelText("1번째"));
    await user.type(within(playground).getByLabelText("1번째"), "3");
    await user.clear(within(playground).getByLabelText("2번째"));
    await user.type(within(playground).getByLabelText("2번째"), "2");
    await user.clear(within(playground).getByLabelText("3번째"));
    await user.type(within(playground).getByLabelText("3번째"), "1");
    expect(within(playground).getByText("[3, 2, 1]은 오름차순 정렬 조건을 만족하지 않으므로 반례가 아닙니다.")).toBeInTheDocument();
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
    expect(within(quiz).getByText("맞았습니다.")).toBeInTheDocument();
    expect(within(quiz).queryByText("조건문은 P가 참이고 Q가 거짓일 때만 거짓입니다.")).not.toBeInTheDocument();
    await user.click(within(quiz).getByRole("button", { name: "해설 보기" }));
    expect(within(quiz).getByText("조건문은 P가 참이고 Q가 거짓일 때만 거짓입니다.")).toBeInTheDocument();
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
            reasonTags: ["합집합과 교집합 혼동"],
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
      { missedConcepts: string[]; missedQuestionTypes: string[]; missedReasonTags: string[] }
    >;
    const result = Object.values(stored)[0];

    expect(result.missedConcepts).toEqual(["합집합"]);
    expect(result.missedQuestionTypes).toEqual(["union"]);
    expect(result.missedReasonTags).toEqual(["합집합과 교집합 혼동"]);

    const attempts = JSON.parse(window.localStorage.getItem(questionAttemptsStorageKey) ?? "{}") as Record<
      string,
      { conceptId: string; questionId: string; isCorrect: boolean; concepts: string[]; selectedChoice: string }
    >;
    const mastery = JSON.parse(window.localStorage.getItem(conceptMasteryStorageKey) ?? "{}") as Record<
      string,
      { conceptId: string; attempts: number; correct: number; masteryScore: number }
    >;

    expect(Object.values(attempts)).toHaveLength(2);
    expect(Object.values(attempts)[0]).toMatchObject({
      conceptId: "chapter:sets",
      isCorrect: false,
      concepts: ["합집합"],
      selectedChoice: "교집합",
    });
    expect(Object.values(attempts)[0].questionId).toContain("sets:");
    expect(mastery["chapter:sets:합집합"]).toMatchObject({ conceptId: "chapter:sets", attempts: 1, correct: 0, masteryScore: 0 });
    expect(mastery["chapter:sets:교집합"]).toMatchObject({ conceptId: "chapter:sets", attempts: 1, correct: 1, masteryScore: 1 });
  });
});

describe("personalized recommendations", () => {
  it("keeps chapter navigation within the current subject level", () => {
    expect(getReadyChaptersInSameLevel("graphs").map((chapter) => chapter.slug)).toEqual([
      "logic",
      "conditionals",
      "sets",
      "functions",
      "relations",
      "induction",
      "counting",
      "graphs",
    ]);
    expect(getChapterNavigation("graphs").next).toBeNull();
    expect(getReadyChaptersInSameLevel("proof-techniques").map((chapter) => chapter.slug)).toEqual([
      "proof-techniques",
      "logical-equivalence",
      "predicate-logic",
      "equivalence-relations",
      "partial-orders",
      "inclusion-exclusion",
      "pigeonhole-principle",
      "recurrences",
      "trees",
    ]);
    expect(getChapterNavigation("proof-techniques").previous).toBeNull();
    expect(getChapterNavigation("proof-techniques").next?.slug).toBe("logical-equivalence");
  });

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

  it("keeps personalized course recommendations aligned with the Level 2 order", () => {
    const discreteMath = roadmapSubjects.find((subject) => subject.id === "discrete-math");
    const readyChapters = discreteMath?.levels
      .flatMap((level) => level.chapters)
      .filter((chapter) => chapter.status === "ready") ?? chapters;

    const recommended = getRecommendedChapters(
      {
        goal: "course",
        level: "some-discrete",
        style: "short",
      },
      readyChapters,
    ).map((chapter) => chapter.slug);

    expect(recommended.slice(8, 17)).toEqual([
      "proof-techniques",
      "logical-equivalence",
      "predicate-logic",
      "equivalence-relations",
      "partial-orders",
      "inclusion-exclusion",
      "pigeonhole-principle",
      "recurrences",
      "trees",
    ]);
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
          conceptId: "chapter:conditionals",
          title: "연습 문제",
          score: 1,
          total: 3,
          concepts: ["조건문", "대우"],
          missedConcepts: ["대우"],
          missedQuestionTypes: ["contrapositive"],
          missedReasonTags: ["대우와 역 혼동"],
          updatedAt: "2026-06-04T00:00:00.000Z",
        },
      ],
    );

    expect(insights.weakConcepts).toEqual(["대우"]);
    expect(insights.weakQuestionTypes).toEqual(["contrapositive"]);
    expect(insights.weakReasonTags).toEqual(["대우와 역 혼동"]);
    expect(insights.reviewReasons[0]).toContain("대우와 역 혼동");
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
        conceptId: "chapter:proof-techniques",
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
          conceptId: "chapter:sets",
          title: "종합 점검",
          score: 3,
          total: 8,
          concepts: ["집합"],
          missedConcepts: ["차집합"],
          missedQuestionTypes: ["difference"],
          missedReasonTags: ["차집합 방향 혼동"],
          updatedAt: "2026-06-04T00:00:00.000Z",
        },
      ],
      conceptMastery: [
        {
          conceptId: "chapter:sets",
          concept: "차집합",
          attempts: 3,
          correct: 1,
          masteryScore: 0.33,
          updatedAt: "2026-06-04T00:00:00.000Z",
        },
      ],
    });

    expect(context.profile).toContain("코테");
    expect(context.weakConcepts).toEqual(["차집합"]);
    expect(context.weakQuestionTypes).toEqual(["difference"]);
    expect(context.weakReasonTags).toEqual(["차집합 방향 혼동"]);
    expect(context.conceptMastery).toEqual([
      { conceptId: "chapter:sets", concept: "차집합", masteryScore: 0.33, attempts: 3 },
    ]);
    expect(context.reviewReasons[0]).toContain("차집합 방향 혼동");
    expect(context.nextChapterReason).toContain("차집합");
    expect(context.chapterCatalog[0]).toMatchObject({
      slug: "logic",
      conceptId: "chapter:logic",
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
        weakReasonTags: [],
        conceptMastery: [],
        reviewReasons: [],
        nextChapterReason: null,
        recentAttempts: [],
        chapterCatalog: [],
      },
    };

    expect(validateAiCoachPayload(oversizedPayload)).toBe(false);
    expect(normalizeCoachMemo("첫 줄\n\n둘째 줄")).toBe("첫 줄 둘째 줄");
  });
});
