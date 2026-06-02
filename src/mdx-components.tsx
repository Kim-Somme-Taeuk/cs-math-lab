import type { MDXComponents } from "mdx/types";
import ConditionalPlayground from "@/components/interactive/ConditionalPlayground";
import FunctionMappingPlayground from "@/components/interactive/FunctionMappingPlayground";
import MultipleChoiceQuiz from "@/components/interactive/MultipleChoiceQuiz";
import TruthTablePlayground from "@/components/interactive/TruthTablePlayground";
import SetVennPlayground from "@/components/interactive/SetVennPlayground";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ConditionalPlayground,
    FunctionMappingPlayground,
    MultipleChoiceQuiz,
    TruthTablePlayground,
    SetVennPlayground,
    ...components,
  };
}
