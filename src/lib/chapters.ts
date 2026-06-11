export type ChapterStatus = "ready" | "draft" | "planned";
export type RoadmapLevelId = 1 | 2 | 3;
export type MathSubjectId = "discrete-math" | "linear-algebra" | "calculus" | "probability-statistics";
export type LearningTrackTag =
  | "cs-foundation"
  | "coding-test"
  | "ai-ml"
  | "data-analysis"
  | "graphics"
  | "practice"
  | "code";

export type Chapter = {
  slug: string;
  conceptId?: string;
  order: number;
  level: RoadmapLevelId;
  subjectId?: MathSubjectId;
  title: string;
  shortTitle: string;
  description: string;
  csConnection: string;
  status: ChapterStatus;
  prerequisites?: string[];
  conceptTags?: string[];
  trackTags?: LearningTrackTag[];
  studyMinutes?: {
    low: number;
    high: number;
  };
};

export type RoadmapLevel = {
  level: RoadmapLevelId;
  title: string;
  description: string;
  chapters: Chapter[];
};

export type RoadmapSubject = {
  id: MathSubjectId;
  title: string;
  description: string;
  status: "active" | "planned";
  levels: RoadmapLevel[];
};

type LearningMeta = Pick<Chapter, "subjectId" | "conceptId" | "prerequisites" | "conceptTags" | "trackTags">;

// 초심자가 본문, 예시, 인터랙티브 실험, 종합 점검을 처음 한 번 완주하는 기준입니다.
const beginnerStudyMinutesBySlug: Record<string, NonNullable<Chapter["studyMinutes"]>> = {
  logic: { low: 25, high: 35 },
  conditionals: { low: 20, high: 30 },
  sets: { low: 25, high: 35 },
  functions: { low: 30, high: 40 },
  relations: { low: 25, high: 30 },
  induction: { low: 30, high: 40 },
  counting: { low: 20, high: 25 },
  graphs: { low: 20, high: 25 },
  "proof-techniques": { low: 35, high: 45 },
  "logical-equivalence": { low: 30, high: 40 },
  "predicate-logic": { low: 30, high: 40 },
  "equivalence-relations": { low: 20, high: 30 },
  "partial-orders": { low: 20, high: 30 },
  "inclusion-exclusion": { low: 20, high: 30 },
  "pigeonhole-principle": { low: 15, high: 20 },
  recurrences: { low: 30, high: 40 },
  trees: { low: 20, high: 30 },
  "asymptotic-analysis": { low: 40, high: 55 },
  "recursion-recurrences": { low: 40, high: 55 },
  "discrete-probability": { low: 35, high: 50 },
  "number-theory": { low: 30, high: 40 },
  "modular-arithmetic": { low: 30, high: 40 },
  "euclidean-algorithm": { low: 25, high: 30 },
  "boolean-algebra": { low: 25, high: 30 },
  "dag-topological-sort": { low: 25, high: 30 },
  "shortest-paths": { low: 25, high: 30 },
  vectors: { low: 15, high: 20 },
  "vector-operations": { low: 20, high: 25 },
  "dot-product": { low: 20, high: 25 },
  matrices: { low: 15, high: 20 },
  "matrix-multiplication": { low: 25, high: 35 },
  "linear-transformations": { low: 25, high: 35 },
  "basis-dimension": { low: 30, high: 35 },
  "inverse-matrices": { low: 30, high: 40 },
  "eigenvectors-intro": { low: 30, high: 40 },
  "linear-combination-span": { low: 25, high: 35 },
  "linear-independence": { low: 25, high: 35 },
  subspaces: { low: 30, high: 40 },
  determinants: { low: 30, high: 40 },
  "rank-column-space": { low: 30, high: 40 },
  "linear-systems": { low: 30, high: 40 },
  "orthogonality-projection": { low: 30, high: 40 },
  "least-squares": { low: 35, high: 45 },
  "eigen-diagonalization": { low: 35, high: 50 },
  "coordinate-systems-transform-matrices": { low: 30, high: 40 },
  "affine-transformations-homogeneous-coordinates": { low: 30, high: 40 },
  "rotations-2d-3d": { low: 30, high: 40 },
  "graphics-pipeline-intro": { low: 30, high: 40 },
  "pca-dimensionality-reduction": { low: 35, high: 45 },
  "svd-intuition": { low: 35, high: 50 },
  "matrix-factorization-numerical-stability": { low: 35, high: 45 },
  "gradient-jacobian-intro": { low: 35, high: 45 },
  "neural-network-linear-layers": { low: 35, high: 45 },
  "calculus-functions-graphs": { low: 15, high: 20 },
  "rate-of-change": { low: 20, high: 30 },
  limits: { low: 30, high: 40 },
  continuity: { low: 20, high: 30 },
  "meaning-of-derivative": { low: 30, high: 40 },
  "basic-derivative-rules": { low: 25, high: 30 },
  "derivative-graph-reading": { low: 25, high: 35 },
  "optimization-intro": { low: 25, high: 35 },
  "numerical-derivative": { low: 25, high: 35 },
  "meaning-of-integral": { low: 30, high: 40 },
  "riemann-sums": { low: 30, high: 40 },
  "basic-integral-rules": { low: 25, high: 35 },
  "fundamental-theorem-calculus": { low: 35, high: 45 },
  "area-accumulation": { low: 25, high: 35 },
  "multivariable-functions": { low: 30, high: 40 },
  "partial-derivatives": { low: 30, high: 40 },
  gradient: { low: 35, high: 45 },
  "chain-rule": { low: 35, high: 45 },
  "optimization-problems": { low: 30, high: 40 },
  "gradient-descent": { low: 35, high: 45 },
  "learning-rate": { low: 25, high: 35 },
  "loss-functions": { low: 30, high: 40 },
  "autodiff-intro": { low: 40, high: 55 },
  "numerical-integration": { low: 30, high: 40 },
  "differential-equations-intro": { low: 35, high: 45 },
  "euler-method-simulation": { low: 35, high: 45 },
  "calculus-in-machine-learning": { low: 40, high: 55 },
};

const learningMetaBySlug: Record<string, LearningMeta> = {
  logic: {
    subjectId: "discrete-math",
    prerequisites: [],
    conceptTags: ["명제", "논리 연산", "조건식"],
    trackTags: ["cs-foundation", "coding-test", "code"],
  },
  conditionals: {
    subjectId: "discrete-math",
    prerequisites: ["logic"],
    conceptTags: ["조건문", "대우", "진리표"],
    trackTags: ["cs-foundation", "coding-test", "code"],
  },
  sets: {
    subjectId: "discrete-math",
    prerequisites: ["logic"],
    conceptTags: ["집합", "부분집합", "집합 연산"],
    trackTags: ["cs-foundation", "data-analysis", "practice"],
  },
  functions: {
    subjectId: "discrete-math",
    prerequisites: ["sets"],
    conceptTags: ["함수", "정의역", "대응"],
    trackTags: ["cs-foundation", "ai-ml", "code"],
  },
  relations: {
    subjectId: "discrete-math",
    prerequisites: ["sets"],
    conceptTags: ["관계", "반사성", "대칭성", "추이성"],
    trackTags: ["cs-foundation", "data-analysis"],
  },
  induction: {
    subjectId: "discrete-math",
    prerequisites: ["conditionals"],
    conceptTags: ["귀납법", "기저 사례", "재귀"],
    trackTags: ["cs-foundation", "coding-test", "practice"],
  },
  counting: {
    subjectId: "discrete-math",
    prerequisites: ["sets"],
    conceptTags: ["경우의 수", "순열", "조합"],
    trackTags: ["coding-test", "data-analysis", "practice"],
  },
  graphs: {
    subjectId: "discrete-math",
    prerequisites: ["relations"],
    conceptTags: ["그래프", "DFS", "BFS"],
    trackTags: ["cs-foundation", "coding-test", "practice"],
  },
  "proof-techniques": {
    subjectId: "discrete-math",
    prerequisites: ["logic", "conditionals"],
    conceptTags: ["증명", "대우", "반례", "모순"],
    trackTags: ["cs-foundation", "coding-test", "practice"],
  },
  "logical-equivalence": {
    subjectId: "discrete-math",
    prerequisites: ["logic"],
    conceptTags: ["논리적 동치", "드모르간 법칙"],
    trackTags: ["cs-foundation", "coding-test", "code"],
  },
  "predicate-logic": {
    subjectId: "discrete-math",
    prerequisites: ["logic", "sets"],
    conceptTags: ["술어 논리", "전칭", "존재"],
    trackTags: ["cs-foundation", "code"],
  },
  "equivalence-relations": {
    subjectId: "discrete-math",
    prerequisites: ["relations"],
    conceptTags: ["동치관계", "분할"],
    trackTags: ["cs-foundation", "data-analysis"],
  },
  "partial-orders": {
    subjectId: "discrete-math",
    prerequisites: ["relations"],
    conceptTags: ["부분순서", "의존성"],
    trackTags: ["cs-foundation", "coding-test"],
  },
  recurrences: {
    subjectId: "discrete-math",
    prerequisites: ["induction"],
    conceptTags: ["점화식", "재귀"],
    trackTags: ["coding-test", "practice"],
  },
  "inclusion-exclusion": {
    subjectId: "discrete-math",
    prerequisites: ["counting", "sets"],
    conceptTags: ["포함배제", "중복 세기"],
    trackTags: ["coding-test", "data-analysis", "practice"],
  },
  "pigeonhole-principle": {
    subjectId: "discrete-math",
    prerequisites: ["counting"],
    conceptTags: ["비둘기집 원리", "충돌"],
    trackTags: ["coding-test", "practice"],
  },
  trees: {
    subjectId: "discrete-math",
    prerequisites: ["graphs"],
    conceptTags: ["트리", "재귀 구조"],
    trackTags: ["cs-foundation", "coding-test", "practice"],
  },
  "asymptotic-analysis": {
    subjectId: "discrete-math",
    prerequisites: ["recurrences", "graphs"],
    conceptTags: ["점근 표기", "알고리즘 분석", "성능"],
    trackTags: ["cs-foundation", "coding-test", "practice"],
  },
  "recursion-recurrences": {
    subjectId: "discrete-math",
    prerequisites: ["recurrences", "induction"],
    conceptTags: ["재귀", "점화식", "분할 정복"],
    trackTags: ["coding-test", "practice", "code"],
  },
  "discrete-probability": {
    subjectId: "discrete-math",
    prerequisites: ["counting"],
    conceptTags: ["이산확률", "사건", "경우의 수"],
    trackTags: ["cs-foundation", "data-analysis", "practice"],
  },
  "number-theory": {
    subjectId: "discrete-math",
    prerequisites: ["sets"],
    conceptTags: ["정수론", "약수", "배수"],
    trackTags: ["cs-foundation", "coding-test"],
  },
  "modular-arithmetic": {
    subjectId: "discrete-math",
    prerequisites: ["number-theory"],
    conceptTags: ["모듈러 연산", "나머지", "순환"],
    trackTags: ["coding-test", "code"],
  },
  "euclidean-algorithm": {
    subjectId: "discrete-math",
    prerequisites: ["number-theory", "modular-arithmetic"],
    conceptTags: ["유클리드 호제법", "최대공약수"],
    trackTags: ["coding-test", "practice", "code"],
  },
  "boolean-algebra": {
    subjectId: "discrete-math",
    prerequisites: ["logic", "logical-equivalence"],
    conceptTags: ["부울 대수", "논리 연산", "조건식 최적화"],
    trackTags: ["cs-foundation", "code"],
  },
  "dag-topological-sort": {
    subjectId: "discrete-math",
    prerequisites: ["graphs", "partial-orders"],
    conceptTags: ["DAG", "위상 정렬", "의존성"],
    trackTags: ["cs-foundation", "coding-test", "practice"],
  },
  "shortest-paths": {
    subjectId: "discrete-math",
    prerequisites: ["graphs"],
    conceptTags: ["최단 경로", "그래프", "비용"],
    trackTags: ["coding-test", "practice"],
  },
  vectors: {
    subjectId: "linear-algebra",
    prerequisites: [],
    conceptTags: ["벡터", "좌표", "특징 벡터"],
    trackTags: ["cs-foundation", "ai-ml", "graphics"],
  },
  "vector-operations": {
    subjectId: "linear-algebra",
    prerequisites: ["vectors"],
    conceptTags: ["벡터 덧셈", "스칼라 곱", "선형결합"],
    trackTags: ["cs-foundation", "code", "graphics"],
  },
  "dot-product": {
    subjectId: "linear-algebra",
    prerequisites: ["vectors", "vector-operations"],
    conceptTags: ["내적", "직교", "코사인 유사도"],
    trackTags: ["ai-ml", "data-analysis", "code"],
  },
  matrices: {
    subjectId: "linear-algebra",
    prerequisites: ["vectors"],
    conceptTags: ["행렬", "행", "열"],
    trackTags: ["cs-foundation", "data-analysis", "graphics"],
  },
  "matrix-multiplication": {
    subjectId: "linear-algebra",
    prerequisites: ["matrices", "dot-product"],
    conceptTags: ["행렬 곱셈", "행렬-벡터 곱", "차원"],
    trackTags: ["cs-foundation", "code", "graphics"],
  },
  "linear-transformations": {
    subjectId: "linear-algebra",
    prerequisites: ["matrix-multiplication"],
    conceptTags: ["선형변환", "회전", "스케일"],
    trackTags: ["graphics", "ai-ml", "code"],
  },
  "basis-dimension": {
    subjectId: "linear-algebra",
    prerequisites: ["vectors", "linear-transformations"],
    conceptTags: ["기저", "차원", "좌표"],
    trackTags: ["cs-foundation", "graphics"],
  },
  "inverse-matrices": {
    subjectId: "linear-algebra",
    prerequisites: ["matrix-multiplication", "linear-transformations"],
    conceptTags: ["역행렬", "되돌리기", "정보 손실"],
    trackTags: ["cs-foundation", "graphics", "code"],
  },
  "eigenvectors-intro": {
    subjectId: "linear-algebra",
    prerequisites: ["linear-transformations", "matrix-multiplication"],
    conceptTags: ["고유값", "고유벡터", "변환"],
    trackTags: ["ai-ml", "graphics", "data-analysis"],
  },
  "linear-combination-span": {
    subjectId: "linear-algebra",
    prerequisites: ["vectors", "vector-operations", "basis-dimension"],
    conceptTags: ["선형결합", "span", "좌표 표현"],
    trackTags: ["cs-foundation", "ai-ml", "graphics"],
  },
  "linear-independence": {
    subjectId: "linear-algebra",
    prerequisites: ["linear-combination-span"],
    conceptTags: ["선형독립", "선형종속", "중복 정보"],
    trackTags: ["cs-foundation", "data-analysis", "ai-ml"],
  },
  subspaces: {
    subjectId: "linear-algebra",
    prerequisites: ["linear-independence"],
    conceptTags: ["부분공간", "닫힘", "영벡터"],
    trackTags: ["cs-foundation", "code"],
  },
  determinants: {
    subjectId: "linear-algebra",
    prerequisites: ["matrices", "linear-transformations", "inverse-matrices"],
    conceptTags: ["행렬식", "면적 스케일", "정보 손실"],
    trackTags: ["graphics", "cs-foundation"],
  },
  "rank-column-space": {
    subjectId: "linear-algebra",
    prerequisites: ["linear-combination-span", "linear-independence", "matrices"],
    conceptTags: ["랭크", "열공간", "독립 방향"],
    trackTags: ["cs-foundation", "data-analysis", "ai-ml"],
  },
  "linear-systems": {
    subjectId: "linear-algebra",
    prerequisites: ["rank-column-space", "matrix-multiplication"],
    conceptTags: ["선형시스템", "Ax=b", "해 존재"],
    trackTags: ["cs-foundation", "code", "data-analysis"],
  },
  "orthogonality-projection": {
    subjectId: "linear-algebra",
    prerequisites: ["dot-product", "linear-systems"],
    conceptTags: ["직교성", "정사영", "오차 벡터"],
    trackTags: ["ai-ml", "graphics", "data-analysis"],
  },
  "least-squares": {
    subjectId: "linear-algebra",
    prerequisites: ["orthogonality-projection", "linear-systems"],
    conceptTags: ["최소제곱", "회귀", "오차"],
    trackTags: ["ai-ml", "data-analysis", "practice"],
  },
  "eigen-diagonalization": {
    subjectId: "linear-algebra",
    prerequisites: ["eigenvectors-intro", "linear-transformations"],
    conceptTags: ["고유값", "대각화", "반복 변환"],
    trackTags: ["ai-ml", "data-analysis", "graphics"],
  },
  "coordinate-systems-transform-matrices": {
    subjectId: "linear-algebra",
    prerequisites: ["basis-dimension", "linear-transformations"],
    conceptTags: ["좌표계", "변환 행렬", "기저"],
    trackTags: ["graphics", "code", "cs-foundation"],
  },
  "affine-transformations-homogeneous-coordinates": {
    subjectId: "linear-algebra",
    prerequisites: ["matrix-multiplication", "linear-transformations"],
    conceptTags: ["아핀 변환", "동차좌표", "이동"],
    trackTags: ["graphics", "code"],
  },
  "rotations-2d-3d": {
    subjectId: "linear-algebra",
    prerequisites: ["linear-transformations", "affine-transformations-homogeneous-coordinates"],
    conceptTags: ["회전 행렬", "오일러 각", "쿼터니언"],
    trackTags: ["graphics", "code"],
  },
  "graphics-pipeline-intro": {
    subjectId: "linear-algebra",
    prerequisites: ["coordinate-systems-transform-matrices", "affine-transformations-homogeneous-coordinates", "rotations-2d-3d"],
    conceptTags: ["그래픽스 파이프라인", "카메라", "투영"],
    trackTags: ["graphics", "code"],
  },
  "pca-dimensionality-reduction": {
    subjectId: "linear-algebra",
    prerequisites: ["eigen-diagonalization", "least-squares"],
    conceptTags: ["PCA", "차원 축소", "분산"],
    trackTags: ["ai-ml", "data-analysis"],
  },
  "svd-intuition": {
    subjectId: "linear-algebra",
    prerequisites: ["pca-dimensionality-reduction", "rank-column-space"],
    conceptTags: ["SVD", "특이값", "저랭크 근사"],
    trackTags: ["ai-ml", "data-analysis", "graphics"],
  },
  "matrix-factorization-numerical-stability": {
    subjectId: "linear-algebra",
    prerequisites: ["linear-systems", "least-squares"],
    conceptTags: ["행렬 분해", "수치 안정성", "조건수"],
    trackTags: ["cs-foundation", "data-analysis", "code"],
  },
  "gradient-jacobian-intro": {
    subjectId: "linear-algebra",
    prerequisites: ["linear-transformations", "matrix-multiplication"],
    conceptTags: ["그래디언트", "야코비안", "국소 선형화"],
    trackTags: ["ai-ml", "graphics", "code"],
  },
  "neural-network-linear-layers": {
    subjectId: "linear-algebra",
    prerequisites: ["matrix-multiplication", "gradient-jacobian-intro"],
    conceptTags: ["선형 계층", "가중치 행렬", "배치 행렬곱"],
    trackTags: ["ai-ml", "code"],
  },
  "calculus-functions-graphs": {
    subjectId: "calculus",
    prerequisites: [],
    conceptTags: ["함수", "그래프", "입출력"],
    trackTags: ["cs-foundation", "graphics", "code"],
  },
  "rate-of-change": {
    subjectId: "calculus",
    prerequisites: ["calculus-functions-graphs"],
    conceptTags: ["변화량", "평균 변화율", "기울기"],
    trackTags: ["cs-foundation", "data-analysis", "code"],
  },
  limits: {
    subjectId: "calculus",
    prerequisites: ["rate-of-change"],
    conceptTags: ["극한", "좌극한", "우극한"],
    trackTags: ["cs-foundation", "ai-ml", "practice"],
  },
  continuity: {
    subjectId: "calculus",
    prerequisites: ["limits"],
    conceptTags: ["연속성", "불연속", "그래프"],
    trackTags: ["graphics", "cs-foundation", "practice"],
  },
  "meaning-of-derivative": {
    subjectId: "calculus",
    prerequisites: ["rate-of-change", "limits"],
    conceptTags: ["순간 변화율", "접선", "미분"],
    trackTags: ["ai-ml", "graphics", "cs-foundation"],
  },
  "basic-derivative-rules": {
    subjectId: "calculus",
    prerequisites: ["meaning-of-derivative"],
    conceptTags: ["미분 규칙", "거듭제곱", "다항함수"],
    trackTags: ["cs-foundation", "practice", "code"],
  },
  "derivative-graph-reading": {
    subjectId: "calculus",
    prerequisites: ["meaning-of-derivative", "basic-derivative-rules"],
    conceptTags: ["도함수", "증가 감소", "극값"],
    trackTags: ["graphics", "data-analysis", "practice"],
  },
  "optimization-intro": {
    subjectId: "calculus",
    prerequisites: ["derivative-graph-reading"],
    conceptTags: ["최적화", "최솟값", "손실 함수"],
    trackTags: ["ai-ml", "data-analysis", "practice"],
  },
  "numerical-derivative": {
    subjectId: "calculus",
    prerequisites: ["meaning-of-derivative", "basic-derivative-rules"],
    conceptTags: ["수치미분", "전진 차분", "중앙 차분"],
    trackTags: ["ai-ml", "code", "practice"],
  },
  "meaning-of-integral": {
    subjectId: "calculus",
    prerequisites: ["meaning-of-derivative", "derivative-graph-reading"],
    conceptTags: ["적분", "누적량", "총량"],
    trackTags: ["cs-foundation", "data-analysis", "practice"],
  },
  "riemann-sums": {
    subjectId: "calculus",
    prerequisites: ["meaning-of-integral"],
    conceptTags: ["리만 합", "근사", "수치적분"],
    trackTags: ["cs-foundation", "code", "practice"],
  },
  "basic-integral-rules": {
    subjectId: "calculus",
    prerequisites: ["meaning-of-integral", "basic-derivative-rules"],
    conceptTags: ["적분 규칙", "부정적분", "적분상수"],
    trackTags: ["cs-foundation", "practice"],
  },
  "fundamental-theorem-calculus": {
    subjectId: "calculus",
    prerequisites: ["meaning-of-integral", "basic-integral-rules"],
    conceptTags: ["미적분의 기본정리", "누적 함수", "원시함수"],
    trackTags: ["cs-foundation", "practice"],
  },
  "area-accumulation": {
    subjectId: "calculus",
    prerequisites: ["meaning-of-integral", "fundamental-theorem-calculus"],
    conceptTags: ["넓이", "누적량", "정적분"],
    trackTags: ["data-analysis", "code", "practice"],
  },
  "multivariable-functions": {
    subjectId: "calculus",
    prerequisites: ["calculus-functions-graphs", "area-accumulation"],
    conceptTags: ["다변수 함수", "입력 변수", "등고선"],
    trackTags: ["ai-ml", "graphics", "cs-foundation"],
  },
  "partial-derivatives": {
    subjectId: "calculus",
    prerequisites: ["multivariable-functions", "meaning-of-derivative"],
    conceptTags: ["편미분", "변수 고정", "방향 변화율"],
    trackTags: ["ai-ml", "graphics", "practice"],
  },
  gradient: {
    subjectId: "calculus",
    prerequisites: ["partial-derivatives", "vectors"],
    conceptTags: ["그래디언트", "벡터", "가장 빠른 증가 방향"],
    trackTags: ["ai-ml", "graphics", "code"],
  },
  "chain-rule": {
    subjectId: "calculus",
    prerequisites: ["basic-derivative-rules", "gradient"],
    conceptTags: ["연쇄법칙", "합성함수", "계산 그래프"],
    trackTags: ["ai-ml", "code", "practice"],
  },
  "optimization-problems": {
    subjectId: "calculus",
    prerequisites: ["optimization-intro", "gradient"],
    conceptTags: ["최적화", "목적 함수", "후보점"],
    trackTags: ["ai-ml", "data-analysis", "practice"],
  },
  "gradient-descent": {
    subjectId: "calculus",
    prerequisites: ["gradient", "optimization-problems"],
    conceptTags: ["경사하강법", "그래디언트", "업데이트"],
    trackTags: ["ai-ml", "code", "practice"],
  },
  "learning-rate": {
    subjectId: "calculus",
    prerequisites: ["gradient-descent"],
    conceptTags: ["학습률", "발산", "수렴"],
    trackTags: ["ai-ml", "practice", "code"],
  },
  "loss-functions": {
    subjectId: "calculus",
    prerequisites: ["optimization-problems", "learning-rate"],
    conceptTags: ["손실 함수", "MSE", "모델 파라미터"],
    trackTags: ["ai-ml", "data-analysis", "code"],
  },
  "autodiff-intro": {
    subjectId: "calculus",
    prerequisites: ["chain-rule", "loss-functions"],
    conceptTags: ["자동미분", "계산 그래프", "연쇄법칙"],
    trackTags: ["ai-ml", "code"],
  },
  "numerical-integration": {
    subjectId: "calculus",
    prerequisites: ["riemann-sums", "area-accumulation"],
    conceptTags: ["수치적분", "사다리꼴 방법", "근사 오차"],
    trackTags: ["cs-foundation", "data-analysis", "code"],
  },
  "differential-equations-intro": {
    subjectId: "calculus",
    prerequisites: ["meaning-of-derivative", "numerical-integration"],
    conceptTags: ["미분방정식", "변화율", "상태"],
    trackTags: ["cs-foundation", "graphics", "practice"],
  },
  "euler-method-simulation": {
    subjectId: "calculus",
    prerequisites: ["differential-equations-intro", "numerical-integration"],
    conceptTags: ["오일러 방법", "시뮬레이션", "dt"],
    trackTags: ["graphics", "code", "practice"],
  },
  "calculus-in-machine-learning": {
    subjectId: "calculus",
    prerequisites: ["loss-functions", "autodiff-intro", "gradient-descent"],
    conceptTags: ["머신러닝", "손실 최소화", "역전파"],
    trackTags: ["ai-ml", "code"],
  },
};

function withChapterDefaults(chapters: Chapter[]) {
  return chapters.map((chapter) => ({
    ...chapter,
    conceptId: chapter.conceptId ?? `chapter:${chapter.slug}`,
  }));
}

function withLearningMeta(chapters: Chapter[]) {
  return withChapterDefaults(chapters.map((chapter) => ({
    ...chapter,
    ...learningMetaBySlug[chapter.slug],
    conceptId: learningMetaBySlug[chapter.slug]?.conceptId ?? chapter.conceptId ?? `chapter:${chapter.slug}`,
    studyMinutes: chapter.studyMinutes ?? beginnerStudyMinutesBySlug[chapter.slug],
  })));
}

export function getChapterConceptId(slug: string) {
  return getChapter(slug)?.conceptId ?? `chapter:${slug}`;
}

const discreteMathLevel1Chapters: Chapter[] = withLearningMeta([
  {
    slug: "logic",
    order: 1,
    level: 1,
    title: "명제와 논리",
    shortTitle: "논리",
    description: "참과 거짓으로 판단할 수 있는 문장과 기본 논리 연산을 배웁니다.",
    csConnection: "조건문, 불리언 타입, 필터링 로직",
    status: "ready",
  },
  {
    slug: "conditionals",
    order: 2,
    level: 1,
    title: "조건문과 진리표",
    shortTitle: "조건문",
    description: "P -> Q 형태의 조건문과 진리표를 코드 흐름과 연결합니다.",
    csConnection: "if문, 사전조건, 테스트 케이스",
    status: "ready",
  },
  {
    slug: "sets",
    order: 3,
    level: 1,
    title: "집합과 집합 연산",
    shortTitle: "집합",
    description: "원소, 부분집합, 합집합, 교집합, 차집합을 시각적으로 익힙니다.",
    csConnection: "자료구조, 데이터 필터링, SQL 조건",
    status: "ready",
  },
  {
    slug: "functions",
    order: 4,
    level: 1,
    title: "함수",
    shortTitle: "함수",
    description: "입력과 출력의 대응을 수학과 프로그래밍 관점에서 봅니다.",
    csConnection: "함수 호출, 해시, 변환 파이프라인",
    status: "ready",
  },
  {
    slug: "relations",
    order: 5,
    level: 1,
    title: "관계",
    shortTitle: "관계",
    description: "두 집합 사이의 연결과 반사성, 대칭성, 추이성을 배웁니다.",
    csConnection: "그래프, 데이터베이스 관계, 동치 관계",
    status: "ready",
  },
  {
    slug: "induction",
    order: 6,
    level: 1,
    title: "수학적 귀납법",
    shortTitle: "귀납법",
    description: "기저 사례와 귀납 단계를 재귀와 알고리즘 증명으로 연결합니다.",
    csConnection: "재귀 함수, 루프 불변식, 알고리즘 정확성",
    status: "ready",
  },
  {
    slug: "counting",
    order: 7,
    level: 1,
    title: "경우의 수",
    shortTitle: "경우의 수",
    description: "순열과 조합을 구분하고 선택 문제의 구조를 파악합니다.",
    csConnection: "브루트포스, 조합 탐색, 확률 기초",
    status: "ready",
  },
  {
    slug: "graphs",
    order: 8,
    level: 1,
    title: "그래프 기초",
    shortTitle: "그래프",
    description: "정점과 간선, 탐색 순서를 자료구조 관점에서 이해합니다.",
    csConnection: "DFS, BFS, 네트워크, 의존성 그래프",
    status: "ready",
  },
]);

const discreteMathLevel2Chapters: Chapter[] = withLearningMeta([
  {
    slug: "proof-techniques",
    order: 1,
    level: 2,
    title: "증명 기법",
    shortTitle: "증명",
    description: "직접 증명, 대우 증명, 모순 증명의 기본 구조를 다룹니다.",
    csConnection: "알고리즘 정확성, 명세 검증",
    status: "ready",
  },
  {
    slug: "logical-equivalence",
    order: 2,
    level: 2,
    title: "논리적 동치와 드모르간 법칙",
    shortTitle: "논리적 동치",
    description: "논리식을 같은 의미의 다른 형태로 바꾸는 규칙을 익힙니다.",
    csConnection: "조건식 단순화, 불리언 리팩터링",
    status: "ready",
  },
  {
    slug: "predicate-logic",
    order: 3,
    level: 2,
    title: "술어 논리",
    shortTitle: "술어 논리",
    description: "모든, 어떤 같은 수량 표현을 논리식으로 다룹니다.",
    csConnection: "반복 조건, 쿼리 조건, 타입 제약",
    status: "ready",
  },
  {
    slug: "equivalence-relations",
    order: 4,
    level: 2,
    title: "동치관계",
    shortTitle: "동치관계",
    description: "같다고 묶을 수 있는 관계와 분할의 의미를 봅니다.",
    csConnection: "분류, 캐시 키, 유니온 파인드",
    status: "ready",
  },
  {
    slug: "partial-orders",
    order: 5,
    level: 2,
    title: "부분순서관계",
    shortTitle: "부분순서",
    description: "항상 일렬로 비교되지는 않는 순서 구조를 배웁니다.",
    csConnection: "의존성, 작업 순서, 버전 비교",
    status: "ready",
  },
  {
    slug: "inclusion-exclusion",
    order: 6,
    level: 2,
    title: "포함배제 원리",
    shortTitle: "포함배제",
    description: "겹치는 경우를 중복 없이 세는 방법을 배웁니다.",
    csConnection: "필터 조합, 집계 로직",
    status: "ready",
  },
  {
    slug: "pigeonhole-principle",
    order: 7,
    level: 2,
    title: "비둘기집 원리",
    shortTitle: "비둘기집",
    description: "공간보다 대상이 많을 때 반드시 생기는 충돌을 다룹니다.",
    csConnection: "해시 충돌, 하한 증명",
    status: "ready",
  },
  {
    slug: "recurrences",
    order: 8,
    level: 2,
    title: "점화식",
    shortTitle: "점화식",
    description: "이전 값으로 다음 값을 정의하는 식을 이해합니다.",
    csConnection: "재귀 알고리즘, 동적 계획법",
    status: "ready",
  },
  {
    slug: "trees",
    order: 9,
    level: 2,
    title: "트리",
    shortTitle: "트리",
    description: "사이클이 없는 연결 그래프와 계층 구조를 봅니다.",
    csConnection: "파일 시스템, DOM, 탐색 트리",
    status: "ready",
  },
]);

const discreteMathLevel3Chapters: Chapter[] = withLearningMeta([
  {
    slug: "asymptotic-analysis",
    order: 1,
    level: 3,
    title: "점근적 분석",
    shortTitle: "점근 분석",
    description: "입력 크기에 따른 실행 시간 증가를 Big-O 관점으로 비교합니다.",
    csConnection: "Big-O, 성능 분석",
    status: "ready",
  },
  {
    slug: "recursion-recurrences",
    order: 2,
    level: 3,
    title: "재귀와 점화식 심화",
    shortTitle: "재귀 점화식",
    description: "재귀 코드의 실행 구조를 점화식으로 해석합니다.",
    csConnection: "분할 정복, 재귀 성능",
    status: "ready",
  },
  {
    slug: "discrete-probability",
    order: 3,
    level: 3,
    title: "이산확률",
    shortTitle: "이산확률",
    description: "셀 수 있는 사건의 가능성을 경우의 수와 연결합니다.",
    csConnection: "랜덤 알고리즘, 테스트 샘플링",
    status: "ready",
  },
  {
    slug: "number-theory",
    order: 4,
    level: 3,
    title: "정수론 기초",
    shortTitle: "정수론",
    description: "약수, 배수, 나눗셈 구조를 컴퓨팅 관점에서 봅니다.",
    csConnection: "암호, 해싱, 난수",
    status: "ready",
  },
  {
    slug: "modular-arithmetic",
    order: 5,
    level: 3,
    title: "모듈러 연산",
    shortTitle: "모듈러",
    description: "나머지로 수를 분류하고 순환 구조를 이해합니다.",
    csConnection: "배열 인덱스, 시계산, 해시 버킷",
    status: "ready",
  },
  {
    slug: "euclidean-algorithm",
    order: 6,
    level: 3,
    title: "유클리드 알고리즘",
    shortTitle: "유클리드",
    description: "최대공약수를 빠르게 구하는 반복 구조를 배웁니다.",
    csConnection: "정수 알고리즘, 암호 기초",
    status: "ready",
  },
  {
    slug: "boolean-algebra",
    order: 7,
    level: 3,
    title: "부울 대수",
    shortTitle: "부울 대수",
    description: "논리 연산을 대수적 규칙으로 정리합니다.",
    csConnection: "디지털 논리, 조건식 최적화",
    status: "ready",
  },
  {
    slug: "dag-topological-sort",
    order: 8,
    level: 3,
    title: "DAG와 위상 정렬",
    shortTitle: "위상 정렬",
    description: "방향 비순환 그래프에서 가능한 실행 순서를 찾습니다.",
    csConnection: "빌드 시스템, 작업 스케줄링",
    status: "ready",
  },
  {
    slug: "shortest-paths",
    order: 9,
    level: 3,
    title: "최단 경로 개념",
    shortTitle: "최단 경로",
    description: "그래프에서 비용이 가장 작은 이동 경로의 의미를 봅니다.",
    csConnection: "라우팅, 추천, 경로 탐색",
    status: "ready",
  },
]);

const linearAlgebraLevel1Chapters: Chapter[] = withLearningMeta([
  {
    slug: "vectors",
    order: 1,
    level: 1,
    title: "벡터",
    shortTitle: "벡터",
    description: "숫자 묶음과 방향이 있는 값으로서의 벡터를 배웁니다.",
    csConnection: "좌표, 특징 벡터, 임베딩",
    status: "ready",
  },
  {
    slug: "vector-operations",
    order: 2,
    level: 1,
    title: "벡터 연산",
    shortTitle: "벡터 연산",
    description: "벡터 덧셈, 스칼라 곱, 선형결합을 코드 배열 연산처럼 읽습니다.",
    csConnection: "배열 연산, 이동, 가중합",
    status: "ready",
  },
  {
    slug: "dot-product",
    order: 3,
    level: 1,
    title: "내적",
    shortTitle: "내적",
    description: "두 벡터의 방향이 얼마나 비슷한지 내적으로 읽습니다.",
    csConnection: "검색, 추천, 임베딩 유사도",
    status: "ready",
  },
  {
    slug: "matrices",
    order: 4,
    level: 1,
    title: "행렬",
    shortTitle: "행렬",
    description: "숫자 표와 데이터 변환 규칙으로 행렬을 봅니다.",
    csConnection: "표 데이터, 이미지, 그래픽스",
    status: "ready",
  },
  {
    slug: "matrix-multiplication",
    order: 5,
    level: 1,
    title: "행렬 곱셈",
    shortTitle: "행렬 곱셈",
    description: "행렬-벡터 곱과 행렬-행렬 곱을 변환의 적용과 합성으로 읽습니다.",
    csConnection: "변환 합성, 레이어 계산",
    status: "ready",
  },
  {
    slug: "linear-transformations",
    order: 6,
    level: 1,
    title: "선형변환",
    shortTitle: "선형변환",
    description: "벡터를 다른 벡터로 보내는 규칙을 행렬과 연결합니다.",
    csConnection: "게임 좌표, 그래픽스 변환",
    status: "ready",
  },
  {
    slug: "basis-dimension",
    order: 7,
    level: 1,
    title: "기저와 차원",
    shortTitle: "기저와 차원",
    description: "공간을 만드는 기준 벡터와 필요한 방향의 수를 이해합니다.",
    csConnection: "좌표 표현, 데이터 차원",
    status: "ready",
  },
  {
    slug: "inverse-matrices",
    order: 8,
    level: 1,
    title: "역행렬",
    shortTitle: "역행렬",
    description: "변환을 되돌릴 수 있는지 역행렬 관점으로 봅니다.",
    csConnection: "좌표 복원, 그래픽스 역변환",
    status: "ready",
  },
  {
    slug: "eigenvectors-intro",
    order: 9,
    level: 1,
    title: "고유값과 고유벡터 맛보기",
    shortTitle: "고유벡터",
    description: "변환해도 방향이 유지되는 벡터와 크기 변화 감각을 봅니다.",
    csConnection: "PCA, 안정 상태, 그래픽스",
    status: "ready",
  },
]);

const linearAlgebraLevel2Chapters: Chapter[] = withLearningMeta([
  {
    slug: "linear-combination-span",
    order: 1,
    level: 2,
    title: "선형결합과 span",
    shortTitle: "선형결합",
    description: "벡터들을 스칼라배해 더해서 만들 수 있는 영역을 봅니다.",
    csConnection: "특징 벡터 조합, 좌표 표현",
    status: "ready",
  },
  {
    slug: "linear-independence",
    order: 2,
    level: 2,
    title: "선형독립과 선형종속",
    shortTitle: "선형독립",
    description: "새 방향 정보와 중복된 정보를 구분합니다.",
    csConnection: "feature 중복, 차원 축소",
    status: "ready",
  },
  {
    slug: "subspaces",
    order: 3,
    level: 2,
    title: "부분공간",
    shortTitle: "부분공간",
    description: "큰 공간 안에서 벡터 연산에 대해 닫혀 있는 작은 공간을 봅니다.",
    csConnection: "해공간, 열공간, 상태 집합",
    status: "ready",
  },
  {
    slug: "determinants",
    order: 4,
    level: 2,
    title: "행렬식",
    shortTitle: "행렬식",
    description: "변환이 면적과 부피를 어떻게 바꾸는지 행렬식으로 읽습니다.",
    csConnection: "정보 손실, 역행렬 판단, 그래픽스",
    status: "ready",
  },
  {
    slug: "rank-column-space",
    order: 5,
    level: 2,
    title: "랭크와 열공간",
    shortTitle: "랭크",
    description: "행렬의 열벡터가 실제로 만드는 독립 방향의 수를 봅니다.",
    csConnection: "정보 손실, 차원 축소, 해 존재성",
    status: "ready",
  },
  {
    slug: "linear-systems",
    order: 6,
    level: 2,
    title: "선형시스템",
    shortTitle: "선형시스템",
    description: "Ax = b를 열공간 안에서 목표 벡터를 만드는 문제로 읽습니다.",
    csConnection: "연립방정식, 모델 파라미터, 제약 조건",
    status: "ready",
  },
  {
    slug: "orthogonality-projection",
    order: 7,
    level: 2,
    title: "직교성과 정사영",
    shortTitle: "정사영",
    description: "직교와 그림자 관점으로 가장 가까운 방향을 찾습니다.",
    csConnection: "추천, 검색, 그래픽스, ML",
    status: "ready",
  },
  {
    slug: "least-squares",
    order: 8,
    level: 2,
    title: "최소제곱",
    shortTitle: "최소제곱",
    description: "정확히 풀 수 없는 문제에서 오차 제곱합이 가장 작은 해를 찾습니다.",
    csConnection: "회귀, 모델 피팅, 데이터 근사",
    status: "ready",
  },
  {
    slug: "eigen-diagonalization",
    order: 9,
    level: 2,
    title: "고유값과 대각화",
    shortTitle: "대각화",
    description: "변환의 핵심 방향과 축 방향 스케일 해석을 봅니다.",
    csConnection: "PCA, 반복 변환, 안정 상태",
    status: "ready",
  },
]);

const linearAlgebraLevel3Chapters: Chapter[] = withLearningMeta([
  {
    slug: "coordinate-systems-transform-matrices",
    order: 1,
    level: 3,
    title: "좌표계와 변환 행렬",
    shortTitle: "좌표계",
    description: "로컬 좌표와 월드 좌표를 기준 벡터 변화로 해석합니다.",
    csConnection: "게임 오브젝트, 카메라, 월드 변환",
    status: "ready",
  },
  {
    slug: "affine-transformations-homogeneous-coordinates",
    order: 2,
    level: 3,
    title: "아핀 변환과 동차좌표",
    shortTitle: "동차좌표",
    description: "이동, 회전, 스케일을 하나의 행렬 곱 흐름으로 묶습니다.",
    csConnection: "2D/3D transform, scene graph",
    status: "ready",
  },
  {
    slug: "rotations-2d-3d",
    order: 3,
    level: 3,
    title: "2D/3D 회전",
    shortTitle: "회전",
    description: "회전 행렬, 축 회전, 오일러 각의 감각과 한계를 봅니다.",
    csConnection: "게임 카메라, 캐릭터 방향",
    status: "ready",
  },
  {
    slug: "graphics-pipeline-intro",
    order: 4,
    level: 3,
    title: "그래픽스 파이프라인 맛보기",
    shortTitle: "그래픽스 파이프라인",
    description: "모델 공간에서 화면까지 좌표가 변환되는 흐름을 봅니다.",
    csConnection: "vertex shader, 카메라, 투영",
    status: "ready",
  },
  {
    slug: "pca-dimensionality-reduction",
    order: 5,
    level: 3,
    title: "PCA와 차원 축소",
    shortTitle: "PCA",
    description: "데이터가 가장 많이 퍼지는 방향을 찾아 낮은 차원으로 압축합니다.",
    csConnection: "임베딩, 시각화, 노이즈 제거",
    status: "ready",
  },
  {
    slug: "svd-intuition",
    order: 6,
    level: 3,
    title: "SVD 맛보기",
    shortTitle: "SVD",
    description: "행렬을 방향과 강도의 분해로 읽고 저랭크 근사를 봅니다.",
    csConnection: "이미지 압축, 추천 시스템",
    status: "ready",
  },
  {
    slug: "matrix-factorization-numerical-stability",
    order: 7,
    level: 3,
    title: "행렬 분해와 수치 안정성",
    shortTitle: "수치 안정성",
    description: "역행렬을 직접 쓰지 않는 이유와 안정적인 계산 감각을 봅니다.",
    csConnection: "수치계산, 선형시스템, 최적화",
    status: "ready",
  },
  {
    slug: "gradient-jacobian-intro",
    order: 8,
    level: 3,
    title: "그래디언트와 야코비안 맛보기",
    shortTitle: "야코비안",
    description: "여러 변수 함수의 변화 방향과 국소 선형 근사를 봅니다.",
    csConnection: "최적화, 물리 시뮬레이션, ML",
    status: "ready",
  },
  {
    slug: "neural-network-linear-layers",
    order: 9,
    level: 3,
    title: "신경망의 선형 계층",
    shortTitle: "선형 계층",
    description: "y = Wx + b를 특징 공간 변환과 배치 행렬곱으로 읽습니다.",
    csConnection: "임베딩, 분류기, MLP",
    status: "ready",
  },
]);

const calculusLevel1Chapters: Chapter[] = withLearningMeta([
  {
    slug: "calculus-functions-graphs",
    order: 1,
    level: 1,
    title: "함수와 그래프",
    shortTitle: "함수와 그래프",
    description: "입력을 출력으로 보내는 규칙과 그래프를 입출력 관계로 읽습니다.",
    csConnection: "함수 호출, 데이터 변환, 그래픽스",
    status: "ready",
  },
  {
    slug: "rate-of-change",
    order: 2,
    level: 1,
    title: "변화율",
    shortTitle: "변화율",
    description: "입력이 변할 때 출력이 얼마나 변하는지 평균 변화율과 기울기로 봅니다.",
    csConnection: "속도, 성능 변화, 데이터 추세",
    status: "ready",
  },
  {
    slug: "limits",
    order: 3,
    level: 1,
    title: "극한",
    shortTitle: "극한",
    description: "입력이 어떤 값에 가까워질 때 함수값이 어디로 향하는지 봅니다.",
    csConnection: "근사, 경계 동작, 미분 준비",
    status: "ready",
  },
  {
    slug: "continuity",
    order: 4,
    level: 1,
    title: "연속성",
    shortTitle: "연속성",
    description: "함수값과 주변 흐름이 끊기지 않고 이어지는 감각을 익힙니다.",
    csConnection: "애니메이션, 시뮬레이션, 상태 변화",
    status: "ready",
  },
  {
    slug: "meaning-of-derivative",
    order: 5,
    level: 1,
    title: "미분의 의미",
    shortTitle: "미분 의미",
    description: "평균 변화율에서 순간 변화율과 접선의 기울기로 넘어갑니다.",
    csConnection: "속도, 손실 변화, 최적화",
    status: "ready",
  },
  {
    slug: "basic-derivative-rules",
    order: 6,
    level: 1,
    title: "기본 미분 규칙",
    shortTitle: "미분 규칙",
    description: "상수, 거듭제곱, 상수배, 합의 미분을 간단한 다항함수로 익힙니다.",
    csConnection: "기울기 계산, 모델 업데이트",
    status: "ready",
  },
  {
    slug: "derivative-graph-reading",
    order: 7,
    level: 1,
    title: "도함수와 그래프 해석",
    shortTitle: "그래프 해석",
    description: "도함수의 부호와 크기로 그래프의 증가, 감소, 느려짐을 읽습니다.",
    csConnection: "성능 추세, 센서 데이터, 최적화",
    status: "ready",
  },
  {
    slug: "optimization-intro",
    order: 8,
    level: 1,
    title: "최적화 맛보기",
    shortTitle: "최적화",
    description: "함수값을 가장 작거나 크게 만드는 입력을 도함수 관점으로 찾습니다.",
    csConnection: "손실 함수, 비용 최소화, 게임 밸런스",
    status: "ready",
  },
  {
    slug: "numerical-derivative",
    order: 9,
    level: 1,
    title: "수치미분",
    shortTitle: "수치미분",
    description: "작은 변화량으로 기울기를 근사하고 h 선택의 감각을 봅니다.",
    csConnection: "수치 계산, 자동미분, 경사하강법",
    status: "ready",
  },
]);

const calculusLevel2Chapters: Chapter[] = withLearningMeta([
  {
    slug: "meaning-of-integral",
    order: 1,
    level: 2,
    title: "적분의 의미",
    shortTitle: "적분 의미",
    description: "작은 변화량을 쌓아 총량으로 읽는 적분의 기본 감각을 익힙니다.",
    csConnection: "거리, 누적 비용, 총 손실",
    status: "ready",
  },
  {
    slug: "riemann-sums",
    order: 2,
    level: 2,
    title: "리만 합",
    shortTitle: "리만 합",
    description: "구간을 작은 조각으로 나누어 넓이와 누적량을 근사하는 법을 봅니다.",
    csConnection: "수치적분, 샘플링, 근사 계산",
    status: "ready",
  },
  {
    slug: "basic-integral-rules",
    order: 3,
    level: 2,
    title: "기본 적분 규칙",
    shortTitle: "적분 규칙",
    description: "상수, 거듭제곱, 상수배, 합의 적분을 누적량 관점으로 정리합니다.",
    csConnection: "누적 비용 모델링, 간단한 계산",
    status: "ready",
  },
  {
    slug: "fundamental-theorem-calculus",
    order: 4,
    level: 2,
    title: "미적분의 기본정리",
    shortTitle: "기본정리",
    description: "미분과 적분이 서로 연결되어 누적량 계산을 단순하게 만드는 감각을 봅니다.",
    csConnection: "누적 함수, 변화율 추적, 시뮬레이션",
    status: "ready",
  },
  {
    slug: "area-accumulation",
    order: 5,
    level: 2,
    title: "넓이와 누적량",
    shortTitle: "넓이와 누적",
    description: "그래프 아래 넓이를 거리, 비용, 사용량 같은 누적값으로 해석합니다.",
    csConnection: "로그 집계, 비용 합산, 이동 거리",
    status: "ready",
  },
  {
    slug: "multivariable-functions",
    order: 6,
    level: 2,
    title: "다변수 함수",
    shortTitle: "다변수 함수",
    description: "입력이 여러 개인 함수와 등고선 감각을 컴공 사례로 연결합니다.",
    csConnection: "손실 함수, 픽셀 좌표, 게임 위치",
    status: "ready",
  },
  {
    slug: "partial-derivatives",
    order: 7,
    level: 2,
    title: "편미분",
    shortTitle: "편미분",
    description: "한 변수만 움직이고 나머지를 고정한 변화율로 다변수 함수를 읽습니다.",
    csConnection: "특징 영향도, 파라미터 튜닝",
    status: "ready",
  },
  {
    slug: "gradient",
    order: 8,
    level: 2,
    title: "그래디언트",
    shortTitle: "그래디언트",
    description: "편미분을 모은 벡터가 함수값 증가 방향을 알려 주는 감각을 봅니다.",
    csConnection: "경사하강법, 손실 최소화, 벡터",
    status: "ready",
  },
  {
    slug: "chain-rule",
    order: 9,
    level: 2,
    title: "연쇄법칙",
    shortTitle: "연쇄법칙",
    description: "함수 안에 함수가 들어간 구조의 변화율을 계산 그래프 관점으로 읽습니다.",
    csConnection: "자동미분, 역전파, 파이프라인",
    status: "ready",
  },
]);

const calculusLevel3Chapters: Chapter[] = withLearningMeta([
  {
    slug: "optimization-problems",
    order: 1,
    level: 3,
    title: "최적화 문제",
    shortTitle: "최적화 문제",
    description: "목적 함수를 정하고 더 좋은 입력을 찾는 문제를 컴공 맥락으로 읽습니다.",
    csConnection: "손실 최소화, 비용 최소화, 게임 밸런스",
    status: "ready",
  },
  {
    slug: "gradient-descent",
    order: 2,
    level: 3,
    title: "경사하강법",
    shortTitle: "경사하강법",
    description: "그래디언트의 반대 방향으로 이동해 함수값을 줄이는 기본 업데이트를 봅니다.",
    csConnection: "모델 학습, 최적화 루프",
    status: "ready",
  },
  {
    slug: "learning-rate",
    order: 3,
    level: 3,
    title: "학습률",
    shortTitle: "학습률",
    description: "업데이트 한 번에 얼마나 움직일지 정하는 값과 안정성의 관계를 봅니다.",
    csConnection: "학습 안정성, 튜닝, 발산",
    status: "ready",
  },
  {
    slug: "loss-functions",
    order: 4,
    level: 3,
    title: "손실 함수",
    shortTitle: "손실 함수",
    description: "예측이 얼마나 틀렸는지 숫자로 만들고 파라미터 업데이트와 연결합니다.",
    csConnection: "MSE, 모델 평가, 학습 목표",
    status: "ready",
  },
  {
    slug: "autodiff-intro",
    order: 5,
    level: 3,
    title: "자동미분 맛보기",
    shortTitle: "자동미분",
    description: "계산 그래프와 연쇄법칙으로 코드가 변화율을 추적하는 감각을 봅니다.",
    csConnection: "역전파, 딥러닝 프레임워크",
    status: "ready",
  },
  {
    slug: "numerical-integration",
    order: 6,
    level: 3,
    title: "수치적분",
    shortTitle: "수치적분",
    description: "원시함수를 몰라도 직사각형과 사다리꼴로 누적량을 근사하는 법을 봅니다.",
    csConnection: "센서 데이터, 누적 비용, 물리 계산",
    status: "ready",
  },
  {
    slug: "differential-equations-intro",
    order: 7,
    level: 3,
    title: "미분방정식 맛보기",
    shortTitle: "미분방정식",
    description: "현재 상태가 변화율을 정하는 식을 시뮬레이션 관점으로 읽습니다.",
    csConnection: "위치-속도, 냉각, 감쇠",
    status: "ready",
  },
  {
    slug: "euler-method-simulation",
    order: 8,
    level: 3,
    title: "시뮬레이션과 오일러 방법",
    shortTitle: "오일러 방법",
    description: "변화율로 다음 상태를 조금씩 예측하는 가장 단순한 수치 시뮬레이션을 봅니다.",
    csConnection: "게임 물리, 입자 이동, 애니메이션",
    status: "ready",
  },
  {
    slug: "calculus-in-machine-learning",
    order: 9,
    level: 3,
    title: "머신러닝에서의 미적분",
    shortTitle: "ML 미적분",
    description: "모델 출력, 손실, 그래디언트, 파라미터 업데이트의 전체 흐름을 연결합니다.",
    csConnection: "y = Wx + b, 손실 최소화, 역전파",
    status: "ready",
  },
]);

export const discreteMathLevels: RoadmapLevel[] = [
  {
    level: 1,
    title: "Level 1. 입문",
    description: "현재 MVP 범위입니다. 컴공 전공 학습에 필요한 이산수학 첫 도구를 다룹니다.",
    chapters: discreteMathLevel1Chapters,
  },
  {
    level: 2,
    title: "Level 2. 핵심 확장",
    description: "입문 이후 증명, 논리, 관계, 세기 원리를 더 깊게 확장합니다.",
    chapters: discreteMathLevel2Chapters,
  },
  {
    level: 3,
    title: "Level 3. 컴공 응용",
    description: "알고리즘, 그래프, 정수론처럼 전공 과목과 직접 맞닿는 주제로 확장합니다.",
    chapters: discreteMathLevel3Chapters,
  },
];

function plannedChapters(subjectId: MathSubjectId, level: RoadmapLevelId, titles: string[]): Chapter[] {
  return withChapterDefaults(titles.map((title, index) => ({
    slug: `${subjectId}-level-${level}-${index + 1}`,
    order: index + 1,
    level,
    subjectId,
    title,
    shortTitle: title,
    description: `${title}을 컴공 맥락과 연결해 다룰 예정입니다.`,
    csConnection: "전공 기초, 모델링, 문제 해결",
    status: "planned",
  })));
}

const plannedSubjectLevels = {
  linearAlgebra: [
    {
      level: 1,
      title: "Level 1. 벡터와 행렬 입문",
      description: "벡터, 행렬, 선형변환을 컴공 맥락에서 다루는 입문 범위입니다.",
      chapters: linearAlgebraLevel1Chapters,
    },
    {
      level: 2,
      title: "Level 2. 선형공간과 변환",
      description: "공간 해석, 선형시스템, 정사영, 랭크, 최소제곱으로 확장합니다.",
      chapters: linearAlgebraLevel2Chapters,
    },
    {
      level: 3,
      title: "Level 3. 컴공 응용",
      description: "그래픽스, 데이터 분석, 머신러닝, 수치계산에서 선형대수를 모델링 도구로 사용합니다.",
      chapters: linearAlgebraLevel3Chapters,
    },
  ],
  calculus: [
    {
      level: 1,
      title: "Level 1. 함수와 변화율",
      description: "함수, 변화율, 극한, 미분의 기본 감각을 코드, 그래프, 최적화와 연결합니다.",
      chapters: calculusLevel1Chapters,
    },
    {
      level: 2,
      title: "Level 2. 누적량과 다변수 변화율",
      description: "적분과 누적량에서 다변수 함수, 편미분, 그래디언트, 연쇄법칙으로 확장합니다.",
      chapters: calculusLevel2Chapters,
    },
    {
      level: 3,
      title: "Level 3. 최적화와 수치 시뮬레이션",
      description: "그래디언트 기반 최적화, 수치계산, 자동미분, 시뮬레이션, 머신러닝 응용으로 확장합니다.",
      chapters: calculusLevel3Chapters,
    },
  ],
  probabilityStatistics: [
    {
      level: 1,
      title: "Level 1. 확률 기초",
      description: "불확실한 사건과 데이터를 해석하는 기본 언어를 다룰 예정입니다.",
      chapters: plannedChapters("probability-statistics", 1, [
        "사건과 표본공간",
        "확률의 의미",
        "경우의 수와 확률",
        "여사건",
        "합사건과 곱사건",
        "조건부확률",
        "독립",
        "베이즈 정리 맛보기",
      ]),
    },
    {
      level: 2,
      title: "Level 2. 확률변수와 분포",
      description: "확률변수, 기대값, 분산, 대표 분포와 샘플링으로 확장할 예정입니다.",
      chapters: plannedChapters("probability-statistics", 2, [
        "확률변수",
        "이산확률변수",
        "기대값",
        "분산과 표준편차",
        "베르누이 분포",
        "이항분포",
        "정규분포의 직관",
        "확률분포 시각화",
        "샘플링과 난수",
      ]),
    },
    {
      level: 3,
      title: "Level 3. 통계 추론과 데이터 해석",
      description: "표본, 추정, 검정, 상관과 회귀, 모델 평가로 확장할 예정입니다.",
      chapters: plannedChapters("probability-statistics", 3, [
        "모집단과 표본",
        "표본평균",
        "표본분산",
        "추정의 의미",
        "신뢰구간 맛보기",
        "가설검정 맛보기",
        "상관관계",
        "회귀분석 맛보기",
        "모델 평가와 오차",
      ]),
    },
  ],
} satisfies Record<string, RoadmapLevel[]>;

export const roadmapSubjects: RoadmapSubject[] = [
  {
    id: "discrete-math",
    title: "이산수학",
    description: "논리, 집합, 함수, 관계, 그래프처럼 컴공 기초와 직접 맞닿는 수학입니다.",
    status: "active",
    levels: discreteMathLevels,
  },
  {
    id: "linear-algebra",
    title: "선형대수",
    description: "벡터와 행렬을 중심으로 데이터 표현, 그래픽스, 머신러닝의 기반을 다룹니다.",
    status: "active",
    levels: plannedSubjectLevels.linearAlgebra,
  },
  {
    id: "calculus",
    title: "미적분",
    description: "변화율, 누적, 최적화 개념을 알고리즘과 모델 학습 맥락에 연결합니다.",
    status: "active",
    levels: plannedSubjectLevels.calculus,
  },
  {
    id: "probability-statistics",
    title: "확률통계",
    description: "불확실성, 데이터 해석, 실험 판단에 필요한 확률과 통계 기초를 다룹니다.",
    status: "planned",
    levels: plannedSubjectLevels.probabilityStatistics,
  },
];

export function getChapter(slug: string) {
  return roadmapSubjects
    .flatMap((subject) => subject.levels)
    .flatMap((level) => level.chapters)
    .find((chapter) => chapter.slug === slug);
}

export function getReadyChapters() {
  return roadmapSubjects
    .flatMap((subject) => subject.levels)
    .flatMap((level) => level.chapters)
    .filter((chapter) => chapter.status === "ready");
}

export function getChaptersBySubjectAndLevel(subjectId: MathSubjectId, level: RoadmapLevelId) {
  return roadmapSubjects
    .find((subject) => subject.id === subjectId)
    ?.levels.find((roadmapLevel) => roadmapLevel.level === level)
    ?.chapters ?? [];
}

export function getReadyChaptersBySubjectAndLevel(subjectId: MathSubjectId, level: RoadmapLevelId) {
  return getChaptersBySubjectAndLevel(subjectId, level).filter((chapter) => chapter.status === "ready");
}

export function getReadyChaptersInSameLevel(slug: string) {
  const currentChapter = getChapter(slug);

  if (!currentChapter) return [];

  return roadmapSubjects
    .flatMap((subject) => subject.levels)
    .flatMap((level) => level.chapters)
    .filter(
      (chapter) =>
        chapter.status === "ready" &&
        chapter.subjectId === currentChapter.subjectId &&
        chapter.level === currentChapter.level,
    );
}

export function getChapterNavigation(slug: string) {
  const readyChapters = getReadyChaptersInSameLevel(slug);
  const index = readyChapters.findIndex((chapter) => chapter.slug === slug);
  return {
    previous: index > 0 ? readyChapters[index - 1] : null,
    next: index >= 0 && index < readyChapters.length - 1 ? readyChapters[index + 1] : null,
  };
}
