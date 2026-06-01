import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
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
  it("updates the selected truth values and implication explanation", async () => {
    const user = userEvent.setup();
    render(<TruthTablePlayground />);

    const playground = screen.getByRole("region", { name: "진리표 실험" });
    expect(within(playground).getByText(/현재 조건문/)).toHaveTextContent("거짓");

    await user.click(within(playground).getByRole("button", { name: /명제 Q/ }));

    expect(within(playground).getByText(/현재 조건문/)).toHaveTextContent("참");
  });
});

describe("SetVennPlayground", () => {
  it("updates results when the learner changes operations", async () => {
    const user = userEvent.setup();
    render(<SetVennPlayground />);

    const playground = screen.getByRole("region", { name: "집합 연산 실험" });
    expect(within(playground).getByText("결과 = { 1, 2, 3, 4, 5 }")).toBeInTheDocument();

    await user.click(within(playground).getByRole("button", { name: "A ∩ B" }));
    expect(within(playground).getByText("결과 = { 3 }")).toBeInTheDocument();

    await user.click(within(playground).getByRole("button", { name: "A - B" }));
    expect(within(playground).getByText("결과 = { 1, 2 }")).toBeInTheDocument();

    await user.click(within(playground).getByRole("button", { name: "Aᶜ" }));
    expect(within(playground).getByText("결과 = { 4, 5, 6 }")).toBeInTheDocument();
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

    const quiz = screen.getByRole("region", { name: "손풀이 문제" });
    expect(within(quiz).getByRole("button", { name: "채점하기" })).toBeDisabled();

    await user.click(within(quiz).getByLabelText("{ 3 }"));
    await user.click(within(quiz).getByLabelText("거짓"));
    await user.click(within(quiz).getByRole("button", { name: "채점하기" }));

    expect(within(quiz).getByText("2 / 2 정답")).toBeInTheDocument();
    expect(within(quiz).getAllByText("정답입니다.")).toHaveLength(2);
  });
});
