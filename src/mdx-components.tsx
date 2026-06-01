import type { MDXComponents } from "mdx/types";
import TruthTablePlayground from "@/components/interactive/TruthTablePlayground";
import SetVennPlayground from "@/components/interactive/SetVennPlayground";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    TruthTablePlayground,
    SetVennPlayground,
    ...components,
  };
}
