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
    description: "알고리즘, 그래프, 정수론처럼 전공 과목과 직접 맞닿는 주제로 확장할 예정입니다.",
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
      description: "변화율과 누적량을 코드, 그래프, 최적화 감각과 연결할 예정입니다.",
      chapters: plannedChapters("calculus", 1, [
        "함수와 그래프",
        "입력과 출력",
        "증가와 감소",
        "평균 변화율",
        "극한의 직관",
        "연속의 의미",
        "기울기와 접선",
        "미분의 직관",
      ]),
    },
    {
      level: 2,
      title: "Level 2. 미분과 적분",
      description: "도함수, 미분 공식, 최적화, 적분과 누적량으로 확장할 예정입니다.",
      chapters: plannedChapters("calculus", 2, [
        "도함수",
        "기본 미분 공식",
        "합성함수와 연쇄법칙",
        "곱의 미분과 몫의 미분",
        "최댓값과 최솟값",
        "최적화 문제",
        "적분의 직관",
        "정적분과 누적량",
        "미적분의 기본정리",
      ]),
    },
    {
      level: 3,
      title: "Level 3. 다변수와 최적화",
      description: "다변수 변화율과 최적화, 역전파, 수치 계산으로 확장할 예정입니다.",
      chapters: plannedChapters("calculus", 3, [
        "다변수 함수",
        "편미분",
        "그래디언트",
        "방향도함수",
        "경사하강법",
        "손실함수의 의미",
        "체인룰과 역전파 맛보기",
        "테일러 근사",
        "수치미분과 수치적분",
      ]),
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
    status: "planned",
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
