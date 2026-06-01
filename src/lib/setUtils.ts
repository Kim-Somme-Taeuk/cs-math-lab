export type SetOperation = "union" | "intersection" | "difference" | "complement";

export const universe = ["1", "2", "3", "4", "5", "6"];

export function union(a: string[], b: string[]) {
  return Array.from(new Set([...a, ...b])).sort();
}

export function intersection(a: string[], b: string[]) {
  return universe.filter((item) => a.includes(item) && b.includes(item));
}

export function difference(a: string[], b: string[]) {
  return universe.filter((item) => a.includes(item) && !b.includes(item));
}

export function complement(a: string[]) {
  return universe.filter((item) => !a.includes(item));
}

export function evaluateSetOperation(operation: SetOperation, a: string[], b: string[]) {
  switch (operation) {
    case "union":
      return union(a, b);
    case "intersection":
      return intersection(a, b);
    case "difference":
      return difference(a, b);
    case "complement":
      return complement(a);
  }
}
