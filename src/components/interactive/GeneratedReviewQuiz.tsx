"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { generateSetReviewQuestions, setReviewTemplates } from "@/lib/generatedReview";
import { getQuestionId, saveExplanationFeedback, saveQuizRecord } from "@/lib/learningRecords";
import {
  conceptMasteryStorageKey,
  getConceptIdForChapter,
  questionAttemptsStorageKey,
  quizResultsStorageKey,
  understandingChecksStorageKey,
  type ConceptMastery,
  type QuestionAttempt,
  type QuizResult,
  type UnderstandingCheckResult,
} from "@/lib/personalization";
import {
  buildReviewWeaknessProfile,
  compactTemplatesForAi,
  mergeAiReviewPlan,
  rankReviewTemplates,
  sanitizeReviewPlanResponse,
  type PlannedReviewTemplate,
} from "@/lib/reviewPlan";
import { normalizeReviewQuestions } from "@/lib/reviewQuestions";

function renderInlineCode(text: string) {
  return text.split(/(`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>;
    }

    return part;
  });
}

function readStoredValues<TValue>(key: string): TValue[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = JSON.parse(window.localStorage.getItem(key) ?? "{}") as Record<string, TValue>;
    return Object.values(stored);
  } catch {
    return [];
  }
}

function buildLocalPlan() {
  const weakness = buildReviewWeaknessProfile({
    chapterSlug: "sets",
    quizResults: readStoredValues<QuizResult>(quizResultsStorageKey),
    questionAttempts: readStoredValues<QuestionAttempt>(questionAttemptsStorageKey),
    conceptMastery: readStoredValues<ConceptMastery>(conceptMasteryStorageKey),
    understandingChecks: readStoredValues<UnderstandingCheckResult>(understandingChecksStorageKey),
  });

  return {
    weakness,
    plan: rankReviewTemplates(setReviewTemplates, weakness),
  };
}

export default function GeneratedReviewQuiz({ chapter }: { chapter: "sets" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [variants, setVariants] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [visibleExplanations, setVisibleExplanations] = useState<Record<number, boolean>>({});
  const [explanationFeedback, setExplanationFeedback] = useState<Record<number, "understood" | "confused">>({});
  const localPlan = useMemo(() => buildLocalPlan(), []);
  const [plannedTemplates, setPlannedTemplates] = useState<PlannedReviewTemplate[]>(localPlan.plan);
  const answeredRef = useRef(answers);
  answeredRef.current = answers;

  useEffect(() => {
    if (chapter !== "sets") return;

    const controller = new AbortController();

    async function loadAiPlan() {
      try {
        const response = await fetch("/api/ai/review-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chapterSlug: "sets",
            weakness: localPlan.weakness,
            templates: compactTemplatesForAi(localPlan.plan.map((item) => item.template)),
          }),
          signal: controller.signal,
        });

        if (!response.ok || Object.keys(answeredRef.current).length > 0) return;

        const aiPlan = sanitizeReviewPlanResponse(await response.json(), setReviewTemplates);
        const nextPlan = mergeAiReviewPlan(localPlan.plan, aiPlan);

        setPlannedTemplates(nextPlan);
        setCurrentIndex((current) => Math.min(current, nextPlan.length - 1));
      } catch {
        // The local code-ranked plan is the primary path.
      }
    }

    void loadAiPlan();

    return () => controller.abort();
  }, [chapter, localPlan]);

  const questions = useMemo(() => {
    if (chapter === "sets") return generateSetReviewQuestions(variants, plannedTemplates.map((item) => item.template.id));
    return [];
  }, [chapter, plannedTemplates, variants]);
  const normalizedQuestions = useMemo(() => normalizeReviewQuestions(chapter, "종합 점검", questions), [chapter, questions]);
  const currentQuestion = normalizedQuestions[currentIndex];
  const currentPlan = plannedTemplates[currentIndex];
  const selected = answers[currentIndex];
  const isCorrect = selected === currentQuestion.correctIndex;
  const answeredCount = normalizedQuestions.filter((_, index) => answers[index] !== undefined).length;
  const score = normalizedQuestions.reduce((total, question, index) => {
    return total + (answers[index] === question.correctIndex ? 1 : 0);
  }, 0);
  const allAnswered = normalizedQuestions.every((_, index) => answers[index] !== undefined);
  const slug = "sets";
  const chapterConceptId = getConceptIdForChapter(slug);
  const currentQuestionId = getQuestionId(slug, "종합 점검", currentQuestion, currentIndex);
  const explanationVisible = visibleExplanations[currentIndex] ?? false;
  const currentFeedback = explanationFeedback[currentIndex];
  const currentConcept = currentQuestion.conceptTags?.[0] ?? "종합 점검";

  function retryCurrentQuestion() {
    setVariants((current) => {
      const next = [...current];
      const templateIndex = currentPlan?.template.variantSeed ?? currentIndex;
      next[templateIndex] = (next[templateIndex] ?? 0) + 1;
      return next;
    });
    setAnswers((current) => {
      const next = { ...current };
      delete next[currentIndex];
      return next;
    });
    setSubmitted(false);
    setVisibleExplanations((current) => ({ ...current, [currentIndex]: false }));
    setExplanationFeedback((current) => {
      const next = { ...current };
      delete next[currentIndex];
      return next;
    });
  }

  function saveCurrentExplanationFeedback(status: "understood" | "confused") {
    setExplanationFeedback((current) => ({ ...current, [currentIndex]: status }));
    saveExplanationFeedback({
      slug,
      conceptId: currentQuestion.conceptId ?? chapterConceptId,
      questionId: currentQuestionId,
      concept: currentConcept,
      status,
    });
  }

  return (
    <section aria-label="문제 풀기" className="mt-3 mb-6 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="m-0 text-lg font-black text-slate-950">종합 점검</h3>
        </div>
        <p className="rounded-md bg-white px-3 py-2 text-sm font-black text-slate-950">
          {submitted ? `${score} / ${normalizedQuestions.length} 정답` : `${answeredCount} / ${normalizedQuestions.length} 응답`}
        </p>
      </div>

      <div className="mt-4 flex gap-1.5" aria-label="문제 진행 상황">
        {normalizedQuestions.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentIndex(index)}
            className={`h-2 flex-1 rounded-full ${
              index === currentIndex ? "bg-slate-950" : answers[index] !== undefined ? "bg-teal-500" : "bg-slate-200"
            }`}
            aria-label={`문제 ${index + 1}로 이동`}
          />
        ))}
      </div>

      <fieldset className="mt-4 rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
        <legend className="px-1 text-sm font-bold text-slate-500">문제 {currentIndex + 1} / {normalizedQuestions.length}</legend>
        {currentPlan ? (
          <p className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-sm font-bold leading-6 text-slate-700">
            {renderInlineCode(currentPlan.reason)}
          </p>
        ) : null}
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
                  name={`generated-review-${currentIndex}`}
                  checked={checked}
                  onChange={() => {
                    setSubmitted(false);
                    setVisibleExplanations({});
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
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setVisibleExplanations((current) => ({ ...current, [currentIndex]: !explanationVisible }))}
                  className="rounded-md bg-white px-3 py-2 text-sm font-black text-slate-800 hover:bg-slate-100"
                >
                  {explanationVisible ? "해설 닫기" : "해설 보기"}
                </button>
                {!isCorrect ? (
                  <button
                    type="button"
                    onClick={retryCurrentQuestion}
                    className="rounded-md bg-white px-3 py-2 text-sm font-black text-rose-900 hover:bg-rose-100"
                  >
                    비슷한 문제 다시 풀기
                  </button>
                ) : null}
              </div>
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
                <p className="mt-2">{renderInlineCode(currentQuestion.explanation)}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => saveCurrentExplanationFeedback("understood")}
                    className={`rounded-md border px-3 py-2 text-sm font-black ${
                      currentFeedback === "understood"
                        ? "border-teal-600 bg-teal-50 text-teal-800"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
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
                    }`}
                  >
                    아직 어려움
                  </button>
                </div>
                {currentFeedback === "confused" ? (
                  <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm font-bold leading-6 text-amber-900">
                    더 쉽게 보면, 집합 기호 하나를 먼저 말로 바꾼 뒤 원소를 하나씩 검사하면 됩니다.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </fieldset>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-2 sm:w-auto">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((current) => Math.max(0, current - 1))}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            이전
          </button>
          <button
            type="button"
            disabled={currentIndex === normalizedQuestions.length - 1}
            onClick={() => setCurrentIndex((current) => Math.min(normalizedQuestions.length - 1, current + 1))}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            다음
          </button>
        </div>
        <button
          type="button"
          disabled={!allAnswered}
          onClick={() => {
            setSubmitted(true);
            saveQuizRecord({ slug, title: "종합 점검", questions: normalizedQuestions, answers });
          }}
          className="rounded-md bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
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
