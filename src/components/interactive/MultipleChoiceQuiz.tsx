"use client";

import { useId, useMemo, useState } from "react";
import { useChapterSlug } from "@/components/interactive/ChapterSlugProvider";
import { buildFallbackExplanation, type AiExplanationResponsePayload } from "@/lib/aiExplanation";
import { getCurrentChapterSlug, getQuestionId, saveExplanationFeedback, saveQuizRecord } from "@/lib/learningRecords";
import { getConceptIdForChapter, getConceptTagsForChapter } from "@/lib/personalization";
import { normalizeReviewQuestions } from "@/lib/reviewQuestions";

export type QuizQuestion = {
  questionId?: string;
  conceptId?: string;
  prompt: string;
  choices: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  simpleExplanation?: string;
  conceptTags?: string[];
  questionType?: string;
  reasonTags?: string[];
};

function renderInlineCode(text: string) {
  return text.split(/(`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>;
    }

    return part;
  });
}

export default function MultipleChoiceQuiz({ questions, title = "연습 문제" }: { questions: QuizQuestion[]; title?: string }) {
  const quizId = useId();
  const providedSlug = useChapterSlug();
  const slug = providedSlug ?? getCurrentChapterSlug() ?? "unknown";
  const normalizedQuestions = useMemo(
    () => normalizeReviewQuestions(slug, title, questions),
    [questions, slug, title],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [visibleExplanations, setVisibleExplanations] = useState<Record<number, boolean>>({});
  const [aiExplanations, setAiExplanations] = useState<Record<number, string>>({});
  const [explanationLoading, setExplanationLoading] = useState<Record<number, boolean>>({});
  const [explanationFeedback, setExplanationFeedback] = useState<Record<number, "understood" | "confused">>({});
  const currentQuestion = normalizedQuestions[currentIndex];
  const selected = answers[currentIndex];
  const isCorrect = selected === currentQuestion.correctIndex;
  const answeredCount = normalizedQuestions.filter((_, index) => answers[index] !== undefined).length;
  const paged = normalizedQuestions.length > 1;

  const score = useMemo(
    () =>
      normalizedQuestions.reduce((total, question, index) => {
        return total + (answers[index] === question.correctIndex ? 1 : 0);
      }, 0),
    [answers, normalizedQuestions],
  );

  const allAnswered = normalizedQuestions.every((_, index) => answers[index] !== undefined);
  const chapterConceptId = getConceptIdForChapter(slug);
  const fallbackConcepts = getConceptTagsForChapter(slug);
  const currentConceptId = currentQuestion.conceptId ?? chapterConceptId;
  const currentConcept = (currentQuestion.conceptTags ?? fallbackConcepts)[0] ?? "문제 해설";
  const currentQuestionId = getQuestionId(slug, title, currentQuestion, currentIndex);
  const explanationVisible = visibleExplanations[currentIndex] ?? false;
  const currentFeedback = explanationFeedback[currentIndex];
  const reviewHref = title === "종합 점검" ? "#review" : "#definition";

  function saveCurrentExplanationFeedback(status: "understood" | "confused") {
    setExplanationFeedback((current) => ({ ...current, [currentIndex]: status }));
    saveExplanationFeedback({
      slug,
      conceptId: currentConceptId,
      questionId: currentQuestionId,
      concept: currentConcept,
      status,
    });
  }

  async function toggleExplanation() {
    if (explanationVisible) {
      setVisibleExplanations((current) => ({ ...current, [currentIndex]: false }));
      return;
    }

    setVisibleExplanations((current) => ({ ...current, [currentIndex]: true }));

    if (selected === undefined || aiExplanations[currentIndex]) return;

    const payload = {
      slug,
      title,
      prompt: currentQuestion.prompt,
      choices: currentQuestion.choices,
      selectedIndex: selected,
      correctIndex: currentQuestion.correctIndex,
      explanation: currentQuestion.explanation,
      conceptTags: currentQuestion.conceptTags ?? fallbackConcepts,
      questionType: currentQuestion.questionType,
      reasonTags: currentQuestion.reasonTags ?? [],
    };

    setExplanationLoading((current) => ({ ...current, [currentIndex]: true }));

    try {
      const response = await fetch("/api/ai/explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("AI explanation request failed.");

      const result = (await response.json()) as AiExplanationResponsePayload;
      setAiExplanations((current) => ({
        ...current,
        [currentIndex]: result.explanation || buildFallbackExplanation(payload),
      }));
    } catch {
      setAiExplanations((current) => ({
        ...current,
        [currentIndex]: buildFallbackExplanation(payload),
      }));
    } finally {
      setExplanationLoading((current) => ({ ...current, [currentIndex]: false }));
    }
  }

  return (
    <section aria-label="문제 풀기" className="mt-3 mb-6 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="m-0 text-lg font-black text-slate-950">{title}</h3>
        </div>
        {paged || submitted ? (
          <p className="rounded-md bg-white px-3 py-2 text-sm font-black text-slate-950">
            {submitted ? `${score} / ${normalizedQuestions.length} 정답` : `${answeredCount} / ${normalizedQuestions.length} 응답`}
          </p>
        ) : null}
      </div>

      {paged ? (
        <div className="mt-4 grid grid-cols-5 gap-1.5 sm:flex" aria-label="문제 진행 상황">
          {normalizedQuestions.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`flex h-9 min-w-8 flex-1 items-center justify-center rounded-md text-xs font-black ${
                index === currentIndex ? "bg-slate-950" : answers[index] !== undefined ? "bg-teal-500" : "bg-slate-200"
              } ${index === currentIndex ? "text-white" : answers[index] !== undefined ? "text-white" : "text-slate-600"} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500`}
              aria-label={`문제 ${index + 1}로 이동`}
              aria-current={index === currentIndex ? "step" : undefined}
            >
              {index + 1}
            </button>
          ))}
        </div>
      ) : null}

      <fieldset className="mt-4 rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
        <legend className="px-1 text-sm font-bold text-slate-500">{paged ? `문제 ${currentIndex + 1} / ${normalizedQuestions.length}` : "문제"}</legend>
        <p className="mt-2 font-bold leading-7 text-slate-950">{renderInlineCode(currentQuestion.prompt)}</p>
        <div className="mt-3 grid gap-2 sm:mt-4">
          {currentQuestion.choices.map((choice, choiceIndex) => {
            const checked = selected === choiceIndex;

            return (
              <label
                key={choice}
                className={`flex cursor-pointer items-start gap-3 rounded-md border p-2.5 text-sm leading-6 sm:p-3 ${
                  checked
                    ? "border-slate-950 bg-slate-50 text-slate-950"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                <input
                  type="radio"
                  name={`${quizId}-quiz-${currentIndex}`}
                  checked={checked}
                  onChange={() => {
                    setSubmitted(false);
                    setVisibleExplanations({});
                    setAiExplanations({});
                    setExplanationLoading({});
                    setAnswers((current) => ({ ...current, [currentIndex]: choiceIndex }));
                  }}
                  className="mt-1 h-4 w-4 accent-slate-950"
                />
                <span>{renderInlineCode(choice)}</span>
              </label>
            );
          })}
        </div>
        {submitted ? (
          <div
            className={`mt-3 rounded-md border p-3 text-sm leading-6 ${
              isCorrect ? "bg-teal-50 text-teal-900" : "bg-rose-50 text-rose-900"
            }`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-black">{isCorrect ? "맞았습니다." : "틀렸습니다."}</p>
              <button
                type="button"
                onClick={toggleExplanation}
                className="rounded-md bg-white px-3 py-2 text-sm font-black text-slate-800 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              >
                {explanationVisible ? "해설 닫기" : "해설 보기"}
              </button>
            </div>
            {explanationVisible ? (
              <div className="mt-3 rounded-md bg-white p-3 text-slate-800">
                <p className="font-bold">
                  정답은 {renderInlineCode(currentQuestion.choices[currentQuestion.correctIndex])}입니다.
                </p>
                {!isCorrect && selected !== undefined ? (
                  <p className="mt-2 text-slate-600">
                    선택한 답 {renderInlineCode(currentQuestion.choices[selected])}에서 헷갈린 지점을 기준으로 보면 됩니다.
                  </p>
                ) : null}
                <p className="mt-2">
                  {explanationLoading[currentIndex]
                    ? "선택한 답을 기준으로 해설을 만드는 중입니다."
                    : renderInlineCode(aiExplanations[currentIndex] ?? currentQuestion.explanation)}
                </p>
                {!isCorrect ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={reviewHref}
                      className="rounded-md bg-slate-950 px-3 py-2 text-sm font-black text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                    >
                      관련 설명 다시 보기
                    </a>
                    <a
                      href="#practice"
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                    >
                      실험으로 확인
                    </a>
                  </div>
                ) : null}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => saveCurrentExplanationFeedback("understood")}
                    className={`rounded-md border px-3 py-2 text-sm font-black ${
                      currentFeedback === "understood"
                        ? "border-teal-600 bg-teal-50 text-teal-800"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500`}
                  >
                    이해했음
                  </button>
                  <button
                    type="button"
                    onClick={() => saveCurrentExplanationFeedback("confused")}
                    className={`rounded-md border px-3 py-2 text-sm font-black ${
                      currentFeedback === "confused"
                        ? "border-amber-500 bg-amber-50 text-amber-800"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500`}
                  >
                    아직 어려움
                  </button>
                </div>
                {currentFeedback === "confused" ? (
                  <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm font-bold leading-6 text-amber-900">
                    더 쉽게 보면, 문제에서 요구하는 개념 하나를 먼저 잡고 선택지를 지워 나가면 됩니다.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </fieldset>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {paged ? (
          <div className="grid grid-cols-2 gap-2 sm:w-auto">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((current) => Math.max(0, current - 1))}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              이전
            </button>
            <button
              type="button"
              disabled={currentIndex === normalizedQuestions.length - 1}
              onClick={() => setCurrentIndex((current) => Math.min(normalizedQuestions.length - 1, current + 1))}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              다음
            </button>
          </div>
        ) : null}
        <button
          type="button"
          disabled={!allAnswered}
          onClick={() => {
            setSubmitted(true);
            setVisibleExplanations({});
            saveQuizRecord({ slug, title, questions: normalizedQuestions, answers });
          }}
          className="rounded-md bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          채점하기
        </button>
      </div>
      {!allAnswered ? (
        <p className="mt-2 text-sm text-slate-500">모든 문제를 선택하면 채점할 수 있습니다.</p>
      ) : null}
    </section>
  );
}
