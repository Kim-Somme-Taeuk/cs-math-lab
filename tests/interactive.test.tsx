import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ConditionalPlayground from "../src/components/interactive/ConditionalPlayground";
import CountingPlayground from "../src/components/interactive/CountingPlayground";
import MultipleChoiceQuiz from "../src/components/interactive/MultipleChoiceQuiz";
import SetVennPlayground from "../src/components/interactive/SetVennPlayground";
import TruthTablePlayground from "../src/components/interactive/TruthTablePlayground";
import { evaluateLogic } from "../src/lib/logic";
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
});
