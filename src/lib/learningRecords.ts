import type { QuizQuestion } from "@/components/interactive/MultipleChoiceQuiz";
import {
  conceptMasteryStorageKey,
  explanationFeedbackStorageKey,
  getConceptIdForChapter,
  getConceptTagsForChapter,
  questionAttemptsStorageKey,
  quizResultsStorageKey,
  type ConceptMastery,
  type ExplanationFeedback,
  type QuestionAttempt,
} from "@/lib/personalization";

type SaveQuizRecordInput = {
  slug: string;
  title: string;
  questions: QuizQuestion[];
  answers: Record<number, number>;
};

function readStoredRecord<TValue>(key: string, fallback: TValue): TValue {
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? JSON.stringify(fallback)) as TValue;
  } catch {
    return fallback;
  }
}

function writeStoredRecord(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getCurrentChapterSlug() {
  if (typeof window === "undefined") return null;

  return window.location.pathname.match(/^\/chapters\/([^/]+)/)?.[1] ?? null;
}

export function getQuestionId(slug: string, title: string, question: QuizQuestion, index: number) {
  if (question.questionId) return question.questionId;

  return `${slug}:${title}:${question.questionType ?? "question"}:${index}:${question.prompt.slice(0, 36)}`;
}

// Persist one quiz submission as three learning signals:
// quiz summary, per-question attempts, and concept-level mastery.
export function saveQuizRecord({ slug, title, questions, answers }: SaveQuizRecordInput) {
  const chapterConceptId = getConceptIdForChapter(slug);
  const fallbackConcepts = getConceptTagsForChapter(slug);
  const conceptIds = Array.from(new Set(questions.map((question) => question.conceptId ?? chapterConceptId)));
  const now = new Date().toISOString();
  const score = questions.reduce((total, question, index) => {
    return total + (answers[index] === question.correctIndex ? 1 : 0);
  }, 0);
  const missedQuestions = questions.filter((question, index) => answers[index] !== question.correctIndex);
  const missedConcepts = Array.from(
    new Set(missedQuestions.flatMap((question) => question.conceptTags ?? fallbackConcepts)),
  );
  const missedQuestionTypes = Array.from(
    new Set(missedQuestions.map((question) => question.questionType).filter((type): type is string => Boolean(type))),
  );
  const missedReasonTags = Array.from(new Set(missedQuestions.flatMap((question) => question.reasonTags ?? [])));
  const resultKey = `${slug}:${title}:${questions[0]?.prompt.slice(0, 32) ?? "quiz"}`;
  const quizResults = readStoredRecord<Record<string, unknown>>(quizResultsStorageKey, {});

  writeStoredRecord(quizResultsStorageKey, {
    ...quizResults,
    [resultKey]: {
      slug,
      conceptId: chapterConceptId,
      title,
      score,
      total: questions.length,
      concepts: fallbackConcepts,
      conceptIds,
      missedConcepts,
      missedQuestionTypes,
      missedReasonTags,
      updatedAt: now,
    },
  });

  const attempts = readStoredRecord<Record<string, QuestionAttempt>>(questionAttemptsStorageKey, {});
  const nextAttempts = { ...attempts };

  questions.forEach((question, index) => {
    const selectedIndex = answers[index];
    if (selectedIndex === undefined) return;

    const concepts = question.conceptTags ?? fallbackConcepts;
    const conceptId = question.conceptId ?? chapterConceptId;
    const questionId = getQuestionId(slug, title, question, index);
    nextAttempts[`${questionId}:${now}`] = {
      id: `${questionId}:${now}`,
      slug,
      conceptId,
      title,
      questionId,
      prompt: question.prompt,
      selectedChoice: question.choices[selectedIndex],
      correctChoice: question.choices[question.correctIndex],
      selectedIndex,
      correctIndex: question.correctIndex,
      isCorrect: selectedIndex === question.correctIndex,
      concepts,
      questionType: question.questionType,
      reasonTags: question.reasonTags ?? [],
      createdAt: now,
    };
  });

  writeStoredRecord(questionAttemptsStorageKey, nextAttempts);
  updateConceptMastery(Object.values(nextAttempts));

  return { score, total: questions.length };
}

function updateConceptMastery(attempts: QuestionAttempt[]) {
  const grouped = new Map<string, { conceptId: string; concept: string; attempts: number; correct: number }>();

  attempts.forEach((attempt) => {
    attempt.concepts.forEach((concept) => {
      const key = `${attempt.conceptId}:${concept}`;
      const current = grouped.get(key) ?? { conceptId: attempt.conceptId, concept, attempts: 0, correct: 0 };
      current.attempts += 1;
      current.correct += attempt.isCorrect ? 1 : 0;
      grouped.set(key, current);
    });
  });

  const now = new Date().toISOString();
  const mastery: Record<string, ConceptMastery> = {};
  grouped.forEach((value, key) => {
    mastery[key] = {
      conceptId: value.conceptId,
      concept: value.concept,
      attempts: value.attempts,
      correct: value.correct,
      masteryScore: value.attempts > 0 ? Number((value.correct / value.attempts).toFixed(2)) : 0,
      updatedAt: now,
    };
  });

  writeStoredRecord(conceptMasteryStorageKey, mastery);
}

export function saveExplanationFeedback({
  slug,
  conceptId,
  questionId,
  concept,
  status,
}: Omit<ExplanationFeedback, "updatedAt" | "conceptId"> & { conceptId?: string }) {
  const feedback = readStoredRecord<Record<string, ExplanationFeedback>>(explanationFeedbackStorageKey, {});
  const resolvedConceptId = conceptId ?? getConceptIdForChapter(slug);

  writeStoredRecord(explanationFeedbackStorageKey, {
    ...feedback,
    [`${questionId}:${resolvedConceptId}:${concept}`]: {
      slug,
      conceptId: resolvedConceptId,
      questionId,
      concept,
      status,
      updatedAt: new Date().toISOString(),
    },
  });
}
