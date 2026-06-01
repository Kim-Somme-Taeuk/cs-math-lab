import type { ComponentType } from "react";

export const chapterContentLoaders: Record<string, () => Promise<{ default: ComponentType }>> = {
  logic: () => import("@/content/discrete-math/logic.mdx"),
  conditionals: () => import("@/content/discrete-math/conditionals.mdx"),
  sets: () => import("@/content/discrete-math/sets.mdx"),
  functions: () => import("@/content/discrete-math/functions.mdx"),
  relations: () => import("@/content/discrete-math/relations.mdx"),
  induction: () => import("@/content/discrete-math/induction.mdx"),
  counting: () => import("@/content/discrete-math/counting.mdx"),
  graphs: () => import("@/content/discrete-math/graphs.mdx"),
};
