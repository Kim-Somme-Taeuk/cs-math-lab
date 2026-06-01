"use client";

import { useMemo, useState } from "react";

export type QuizQuestion = {
  prompt: string;
  choices: [string, string, string, string];
  correctIndex: number;
  explanation: string;
};

export default function MultipleChoiceQuiz({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(
    () =>
      questions.reduce((total, question, index) => {
        return total + (answers[index] === question.correctIndex ? 1 : 0);
      }, 0),
    [answers, questions],
  );

  const allAnswered = questions.every((_, index) => answers[index] !== undefined);

  return (
    <section aria-label="문제 풀기" className="my-6 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="m-0 text-lg font-black text-slate-950">문제 풀기</h3>
          <p className="mt-1 text-sm text-slate-600">
            답을 고른 뒤 채점하면 바로 해설을 확인할 수 있습니다.
          </p>
        </div>
        {submitted ? (
          <p className="rounded-md bg-white px-3 py-2 text-sm font-black text-slate-950">
            {score} / {questions.length} 정답
          </p>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4">
        {questions.map((question, questionIndex) => {
          const selected = answers[questionIndex];
          const isCorrect = selected === question.correctIndex;

          return (
            <fieldset key={question.prompt} className="rounded-lg border border-slate-200 bg-white p-4">
              <legend className="px-1 text-sm font-bold text-slate-500">
                문제 {questionIndex + 1}
              </legend>
              <p className="mt-2 font-bold leading-7 text-slate-950">{question.prompt}</p>
              <div className="mt-4 grid gap-2">
                {question.choices.map((choice, choiceIndex) => {
                  const checked = selected === choiceIndex;
                  const showCorrect = submitted && choiceIndex === question.correctIndex;
                  const showWrong = submitted && checked && !isCorrect;

                  return (
                    <label
                      key={choice}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm leading-6 ${
                        showCorrect
                          ? "border-teal-500 bg-teal-50 text-teal-950"
                          : showWrong
                            ? "border-rose-400 bg-rose-50 text-rose-950"
                            : checked
                              ? "border-slate-950 bg-slate-50 text-slate-950"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`quiz-${questionIndex}`}
                        checked={checked}
                        onChange={() => {
                          setSubmitted(false);
                          setAnswers((current) => ({ ...current, [questionIndex]: choiceIndex }));
                        }}
                        className="mt-1 h-4 w-4 accent-slate-950"
                      />
                      <span>{choice}</span>
                    </label>
                  );
                })}
              </div>
              {submitted ? (
                <p
                  className={`mt-3 rounded-md p-3 text-sm leading-6 ${
                    isCorrect ? "bg-teal-50 text-teal-900" : "bg-rose-50 text-rose-900"
                  }`}
                >
                  <strong>{isCorrect ? "정답입니다." : "다시 확인해 보세요."}</strong>{" "}
                  {question.explanation}
                </p>
              ) : null}
            </fieldset>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!allAnswered}
        onClick={() => setSubmitted(true)}
        className="mt-5 rounded-md bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        채점하기
      </button>
      {!allAnswered ? (
        <p className="mt-2 text-sm text-slate-500">모든 문제를 선택하면 채점할 수 있습니다.</p>
      ) : null}
    </section>
  );
}
