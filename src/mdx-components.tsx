import type { ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import ConditionalPlayground from "@/components/interactive/ConditionalPlayground";
import CountingPlayground from "@/components/interactive/CountingPlayground";
import CounterexamplePlayground from "@/components/interactive/CounterexamplePlayground";
import FunctionMappingPlayground from "@/components/interactive/FunctionMappingPlayground";
import GeneratedReviewQuiz from "@/components/interactive/GeneratedReviewQuiz";
import GraphTraversalPlayground from "@/components/interactive/GraphTraversalPlayground";
import InductionVisualizer from "@/components/interactive/InductionVisualizer";
import LogicalEquivalencePlayground from "@/components/interactive/LogicalEquivalencePlayground";
import {
  EquivalenceRelationPlayground,
  InclusionExclusionPlayground,
  PartialOrderPlayground,
  PigeonholePlayground,
  PredicateLogicPlayground,
  RecurrencePlayground,
  TreePlayground,
} from "@/components/interactive/LevelTwoPlaygrounds";
import MultipleChoiceQuiz from "@/components/interactive/MultipleChoiceQuiz";
import RelationPlayground from "@/components/interactive/RelationPlayground";
import RecurrenceTracePlayground from "@/components/interactive/RecurrenceTracePlayground";
import TruthTablePlayground from "@/components/interactive/TruthTablePlayground";
import SetVennPlayground from "@/components/interactive/SetVennPlayground";
import UnderstandingCheck from "@/components/interactive/UnderstandingCheck";

// MDX headings are plain text, while chapter sidebars link to stable ids.
// Keep this map in sync when changing section titles in chapter .mdx files.
const headingIds: Record<string, string> = {
  "왜 배우나": "why",
  "먼저 감 잡기": "intuition",
  "핵심 정의": "definition",
  "자주 헷갈리는 지점": "pitfalls",
  "직접 실험하기": "practice",
  "직접 판별하기": "practice",
  "코드로 읽기": "code",
  "전공에서 만나는 장면": "cs-context",
  "종합 점검": "review",
  "다음으로": "next",
};

function textFromNode(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(textFromNode).join("");
  }

  return "";
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children }) => {
      const text = textFromNode(children);
      return <h2 id={headingIds[text]}>{children}</h2>;
    },
    // Components listed here are available as JSX tags inside chapter MDX,
    // for example <TruthTablePlayground /> in logic.mdx.
    ConditionalPlayground,
    CountingPlayground,
    CounterexamplePlayground,
    FunctionMappingPlayground,
    GeneratedReviewQuiz,
    GraphTraversalPlayground,
    InductionVisualizer,
    EquivalenceRelationPlayground,
    InclusionExclusionPlayground,
    LogicalEquivalencePlayground,
    PartialOrderPlayground,
    PigeonholePlayground,
    PredicateLogicPlayground,
    RecurrencePlayground,
    TreePlayground,
    MultipleChoiceQuiz,
    RelationPlayground,
    RecurrenceTracePlayground,
    TruthTablePlayground,
    SetVennPlayground,
    UnderstandingCheck,
    ...components,
  };
}
