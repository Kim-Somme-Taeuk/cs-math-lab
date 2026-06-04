import type { ComponentType } from "react";

export const chapterContentLoaders: Record<string, () => Promise<{ default: ComponentType }>> = {
  logic: () => import("@/content/discrete-math/level-1/logic.mdx"),
  conditionals: () => import("@/content/discrete-math/level-1/conditionals.mdx"),
  sets: () => import("@/content/discrete-math/level-1/sets.mdx"),
  functions: () => import("@/content/discrete-math/level-1/functions.mdx"),
  relations: () => import("@/content/discrete-math/level-1/relations.mdx"),
  induction: () => import("@/content/discrete-math/level-1/induction.mdx"),
  counting: () => import("@/content/discrete-math/level-1/counting.mdx"),
  graphs: () => import("@/content/discrete-math/level-1/graphs.mdx"),
  "logical-equivalence": () => import("@/content/discrete-math/level-2/logical-equivalence.mdx"),
  "predicate-logic": () => import("@/content/discrete-math/level-2/predicate-logic.mdx"),
  "proof-techniques": () => import("@/content/discrete-math/level-2/proof-techniques.mdx"),
  "equivalence-relations": () => import("@/content/discrete-math/level-2/equivalence-relations.mdx"),
  "partial-orders": () => import("@/content/discrete-math/level-2/partial-orders.mdx"),
  "inclusion-exclusion": () => import("@/content/discrete-math/level-2/inclusion-exclusion.mdx"),
  "pigeonhole-principle": () => import("@/content/discrete-math/level-2/pigeonhole-principle.mdx"),
  recurrences: () => import("@/content/discrete-math/level-2/recurrences.mdx"),
  trees: () => import("@/content/discrete-math/level-2/trees.mdx"),
};
