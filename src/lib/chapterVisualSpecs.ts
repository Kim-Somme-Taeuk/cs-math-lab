export type ChapterVisualKind =
  | "logic"
  | "flow"
  | "venn"
  | "mapping"
  | "grid"
  | "steps"
  | "cards"
  | "network"
  | "overlap"
  | "boxes"
  | "sequence"
  | "tree"
  | "bars"
  | "number-line"
  | "circuit"
  | "path"
  | "vector"
  | "matrix"
  | "transform"
  | "scatter"
  | "curve"
  | "limit"
  | "area"
  | "field"
  | "optimization"
  | "computation";

export type ChapterVisualSpec = {
  kind: ChapterVisualKind;
  title: string;
  tokens: string[];
};

export const chapterVisualSpecs: Record<string, ChapterVisualSpec> = {
  logic: { kind: "logic", title: "AND / OR", tokens: ["P", "∧", "Q"] },
  conditionals: { kind: "flow", title: "if P then Q", tokens: ["P", "→", "Q"] },
  sets: { kind: "venn", title: "A ∪ B", tokens: ["A", "B", "∩"] },
  functions: { kind: "mapping", title: "input -> output", tokens: ["x", "f", "y"] },
  relations: { kind: "grid", title: "관계 행렬", tokens: ["R", "aRb", "bRc"] },
  induction: { kind: "steps", title: "기저 -> n+1", tokens: ["1", "n", "n+1"] },
  counting: { kind: "cards", title: "선택 경우", tokens: ["A", "B", "C"] },
  graphs: { kind: "network", title: "정점과 간선", tokens: ["V", "E", "BFS"] },
  "proof-techniques": { kind: "flow", title: "증명 구조", tokens: ["가정", "논리", "결론"] },
  "logical-equivalence": { kind: "logic", title: "동치 변환", tokens: ["P", "≡", "Q"] },
  "predicate-logic": { kind: "grid", title: "∀ / ∃", tokens: ["∀x", "P(x)", "∃x"] },
  "equivalence-relations": { kind: "overlap", title: "분할", tokens: ["반사", "대칭", "추이"] },
  "partial-orders": { kind: "tree", title: "비교 가능성", tokens: ["≤", "위", "아래"] },
  "inclusion-exclusion": { kind: "venn", title: "|A∪B|", tokens: ["A", "B", "-겹침"] },
  "pigeonhole-principle": { kind: "boxes", title: "충돌 보장", tokens: ["대상", "상자", "충돌"] },
  recurrences: { kind: "sequence", title: "a(n)", tokens: ["a₁", "a₂", "aₙ"] },
  trees: { kind: "tree", title: "부모-자식", tokens: ["root", "leaf", "path"] },
  "asymptotic-analysis": { kind: "bars", title: "Big-O 성장", tokens: ["n", "n²", "2ⁿ"] },
  "recursion-recurrences": { kind: "tree", title: "재귀 호출", tokens: ["T(n)", "T(n/2)", "+n"] },
  "discrete-probability": { kind: "cards", title: "사건 확률", tokens: ["Ω", "A", "P(A)"] },
  "number-theory": { kind: "number-line", title: "약수와 배수", tokens: ["2", "4", "8"] },
  "modular-arithmetic": { kind: "number-line", title: "mod 순환", tokens: ["0", "1", "2"] },
  "euclidean-algorithm": { kind: "flow", title: "gcd 반복", tokens: ["a", "b", "r"] },
  "boolean-algebra": { kind: "circuit", title: "부울 회로", tokens: ["0", "AND", "1"] },
  "dag-topological-sort": { kind: "network", title: "DAG 순서", tokens: ["A", "B", "C"] },
  "shortest-paths": { kind: "path", title: "최소 비용", tokens: ["s", "3", "t"] },
  vectors: { kind: "vector", title: "방향과 크기", tokens: ["x", "y", "→"] },
  "vector-operations": { kind: "vector", title: "v + w", tokens: ["v", "+", "w"] },
  "dot-product": { kind: "vector", title: "방향 유사도", tokens: ["u", "·", "v"] },
  matrices: { kind: "matrix", title: "행과 열", tokens: ["row", "col", "A"] },
  "matrix-multiplication": { kind: "matrix", title: "합성 곱", tokens: ["A", "B", "AB"] },
  "linear-transformations": { kind: "transform", title: "공간 변환", tokens: ["x", "A", "Ax"] },
  "basis-dimension": { kind: "vector", title: "기저 방향", tokens: ["e₁", "e₂", "dim"] },
  "inverse-matrices": { kind: "transform", title: "되돌리기", tokens: ["A", "A⁻¹", "I"] },
  "eigenvectors-intro": { kind: "vector", title: "방향 유지", tokens: ["Av", "=", "λv"] },
  "linear-combination-span": { kind: "vector", title: "span 영역", tokens: ["a·u", "+", "b·v"] },
  "linear-independence": { kind: "vector", title: "중복 방향", tokens: ["독립", "종속", "rank"] },
  subspaces: { kind: "overlap", title: "닫힌 공간", tokens: ["0", "u+v", "cu"] },
  determinants: { kind: "transform", title: "면적 스케일", tokens: ["det", "area", "0?"] },
  "rank-column-space": { kind: "matrix", title: "열공간", tokens: ["col", "rank", "span"] },
  "linear-systems": { kind: "matrix", title: "Ax=b", tokens: ["A", "x", "b"] },
  "orthogonality-projection": { kind: "vector", title: "정사영", tokens: ["⊥", "proj", "err"] },
  "least-squares": { kind: "scatter", title: "오차 최소", tokens: ["data", "line", "loss"] },
  "eigen-diagonalization": { kind: "matrix", title: "대각화", tokens: ["P", "D", "P⁻¹"] },
  "coordinate-systems-transform-matrices": { kind: "transform", title: "좌표계 전환", tokens: ["local", "world", "M"] },
  "affine-transformations-homogeneous-coordinates": { kind: "transform", title: "이동 포함", tokens: ["x", "1", "T"] },
  "rotations-2d-3d": { kind: "transform", title: "회전", tokens: ["θ", "R", "axis"] },
  "graphics-pipeline-intro": { kind: "flow", title: "그래픽스 파이프라인", tokens: ["model", "view", "screen"] },
  "pca-dimensionality-reduction": { kind: "scatter", title: "주성분 축", tokens: ["PC1", "PC2", "↓dim"] },
  "svd-intuition": { kind: "matrix", title: "UΣVᵀ", tokens: ["U", "Σ", "Vᵀ"] },
  "matrix-factorization-numerical-stability": { kind: "matrix", title: "안정 분해", tokens: ["LU", "QR", "cond"] },
  "gradient-jacobian-intro": { kind: "field", title: "국소 변화", tokens: ["∇f", "J", "dx"] },
  "neural-network-linear-layers": { kind: "computation", title: "Wx+b", tokens: ["x", "W", "y"] },
  "calculus-functions-graphs": { kind: "curve", title: "입출력 그래프", tokens: ["x", "f(x)", "y"] },
  "rate-of-change": { kind: "curve", title: "평균 변화율", tokens: ["Δx", "Δy", "slope"] },
  limits: { kind: "limit", title: "가까워짐", tokens: ["x", "→", "a"] },
  continuity: { kind: "curve", title: "끊김 없음", tokens: ["left", "f(a)", "right"] },
  "meaning-of-derivative": { kind: "curve", title: "순간 기울기", tokens: ["dy", "/", "dx"] },
  "basic-derivative-rules": { kind: "flow", title: "미분 규칙", tokens: ["xⁿ", "→", "nxⁿ⁻¹"] },
  "derivative-graph-reading": { kind: "curve", title: "증가/감소", tokens: ["f'", "+", "-"] },
  "optimization-intro": { kind: "optimization", title: "최솟값 탐색", tokens: ["min", "f'(x)=0", "x*"] },
  "numerical-derivative": { kind: "limit", title: "작은 h", tokens: ["h", "Δf/h", "≈"] },
  "meaning-of-integral": { kind: "area", title: "누적량", tokens: ["∫", "sum", "area"] },
  "riemann-sums": { kind: "area", title: "조각 합", tokens: ["Δx", "rect", "Σ"] },
  "basic-integral-rules": { kind: "flow", title: "적분 규칙", tokens: ["xⁿ", "→", "xⁿ⁺¹"] },
  "fundamental-theorem-calculus": { kind: "flow", title: "미분-적분 연결", tokens: ["F'", "=", "f"] },
  "area-accumulation": { kind: "area", title: "넓이 누적", tokens: ["area", "cost", "total"] },
  "multivariable-functions": { kind: "field", title: "여러 입력", tokens: ["x", "y", "z"] },
  "partial-derivatives": { kind: "field", title: "한 축만 변화", tokens: ["∂/∂x", "hold y", "slope"] },
  gradient: { kind: "field", title: "최대 증가 방향", tokens: ["∇", "↑", "fast"] },
  "chain-rule": { kind: "computation", title: "연쇄 변화율", tokens: ["x", "g", "f"] },
  "optimization-problems": { kind: "optimization", title: "목적 함수", tokens: ["objective", "constraint", "best"] },
  "gradient-descent": { kind: "optimization", title: "내려가기", tokens: ["x", "-η∇", "loss"] },
  "learning-rate": { kind: "optimization", title: "스텝 크기", tokens: ["η small", "η big", "stable"] },
  "loss-functions": { kind: "curve", title: "오차 점수", tokens: ["ŷ", "y", "loss"] },
  "autodiff-intro": { kind: "computation", title: "계산 그래프", tokens: ["forward", "grad", "back"] },
  "numerical-integration": { kind: "area", title: "수치 누적", tokens: ["rect", "trap", "≈"] },
  "differential-equations-intro": { kind: "field", title: "상태 변화율", tokens: ["state", "rate", "next"] },
  "euler-method-simulation": { kind: "steps", title: "오일러 스텝", tokens: ["y₀", "h·f", "y₁"] },
  "calculus-in-machine-learning": { kind: "computation", title: "학습 전체 흐름", tokens: ["model", "loss", "grad"] },
};

export function getChapterVisualSpec(slug: string) {
  return chapterVisualSpecs[slug] ?? null;
}
