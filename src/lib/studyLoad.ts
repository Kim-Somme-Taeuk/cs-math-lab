import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Chapter } from "@/lib/chapters";

export type StudyLoadEstimate = {
  label: string;
  minutes: {
    low: number;
    high: number;
  } | null;
  basis: {
    textCharacters: number;
    quizQuestions: number;
    playgrounds: number;
    checks: number;
    codeBlocks: number;
    formulas: number;
  } | null;
};

function chapterPath(chapter: Chapter) {
  if (!chapter.subjectId) return null;

  return join(process.cwd(), "src", "content", chapter.subjectId, `level-${chapter.level}`, `${chapter.slug}.mdx`);
}

function chapterSource(chapter: Chapter) {
  const path = chapterPath(chapter);

  if (!path || !existsSync(path)) return null;

  return readFileSync(path, "utf8");
}

function countMatches(source: string, pattern: RegExp) {
  return source.match(pattern)?.length ?? 0;
}

function textCharacterCount(source: string) {
  const withoutCodeBlocks = source.replace(/```[\s\S]*?```/g, " ");
  const withoutJsxBlocks = withoutCodeBlocks.replace(/<MultipleChoiceQuiz[\s\S]*?\/>/g, " ").replace(/<GeneratedReviewQuiz[\s\S]*?\/>/g, " ");
  const text = withoutJsxBlocks
    .replace(/<[^>]+>/g, " ")
    .replace(/\{[\s\S]*?\}/g, " ")
    .replace(/[#*_`|>-]/g, " ")
    .replace(/\s+/g, " ");

  return (text.match(/[가-힣A-Za-z0-9]/g) ?? []).length;
}

function roundDownToFive(value: number) {
  return Math.max(15, Math.floor(value / 5) * 5);
}

function roundUpToFive(value: number) {
  return Math.max(20, Math.ceil(value / 5) * 5);
}

export function getStudyLoadEstimate(chapter: Chapter): StudyLoadEstimate {
  const source = chapterSource(chapter);

  if (!source) {
    if (chapter.studyMinutes) {
      return {
        label: `초보자 기준 ${chapter.studyMinutes.low}-${chapter.studyMinutes.high}분`,
        minutes: chapter.studyMinutes,
        basis: null,
      };
    }

    return {
      label: "콘텐츠 확정 후 산정",
      minutes: null,
      basis: null,
    };
  }

  const textCharacters = textCharacterCount(source);
  const generatedReviewQuestions = countMatches(source, /<GeneratedReviewQuiz\b/g) * 10;
  const explicitQuestions = countMatches(source, /\bprompt\s*:/g);
  const quizQuestions = explicitQuestions + generatedReviewQuestions;
  const playgrounds = countMatches(source, /<[A-Z][A-Za-z0-9]*Playground\b/g);
  const checks = countMatches(source, /<UnderstandingCheck\b/g);
  const codeBlocks = Math.floor(countMatches(source, /```/g) / 2);
  const formulas = countMatches(source, /\$[^$\n]+\$/g) + countMatches(source, /\\\(|\\\[/g);

  const readingMinutes = textCharacters / 350;
  const quizMinutes = quizQuestions * 1.5;
  const playgroundMinutes = playgrounds * 5;
  const checkMinutes = checks * 2;
  const codeMinutes = codeBlocks * 2;
  const formulaMinutes = Math.min(12, formulas * 0.75);
  const prerequisiteBuffer = chapter.level === 1 ? 5 : chapter.level === 2 ? 10 : 15;
  const total = 5 + readingMinutes + quizMinutes + playgroundMinutes + checkMinutes + codeMinutes + formulaMinutes + prerequisiteBuffer;
  const low = chapter.studyMinutes?.low ?? roundDownToFive(total * 0.9);
  const high = chapter.studyMinutes?.high ?? roundUpToFive(total * 1.2);

  return {
    label: `초보자 기준 ${low}-${high}분`,
    minutes: { low, high },
    basis: {
      textCharacters,
      quizQuestions,
      playgrounds,
      checks,
      codeBlocks,
      formulas,
    },
  };
}
