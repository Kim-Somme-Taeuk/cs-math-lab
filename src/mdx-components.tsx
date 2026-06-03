import type { MDXComponents } from "mdx/types";
import ConditionalPlayground from "@/components/interactive/ConditionalPlayground";
import CountingPlayground from "@/components/interactive/CountingPlayground";
import FunctionMappingPlayground from "@/components/interactive/FunctionMappingPlayground";
import GraphTraversalPlayground from "@/components/interactive/GraphTraversalPlayground";
import InductionVisualizer from "@/components/interactive/InductionVisualizer";
import MultipleChoiceQuiz from "@/components/interactive/MultipleChoiceQuiz";
import TruthTablePlayground from "@/components/interactive/TruthTablePlayground";
import SetVennPlayground from "@/components/interactive/SetVennPlayground";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ConditionalPlayground,
    CountingPlayground,
    FunctionMappingPlayground,
    GraphTraversalPlayground,
    InductionVisualizer,
    MultipleChoiceQuiz,
    TruthTablePlayground,
    SetVennPlayground,
    ...components,
  };
}
