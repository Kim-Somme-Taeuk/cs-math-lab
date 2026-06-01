import type { MDXComponents } from "mdx/types";
import MultipleChoiceQuiz from "@/components/interactive/MultipleChoiceQuiz";
import TruthTablePlayground from "@/components/interactive/TruthTablePlayground";
import SetVennPlayground from "@/components/interactive/SetVennPlayground";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    MultipleChoiceQuiz,
    TruthTablePlayground,
    SetVennPlayground,
    ...components,
  };
}
