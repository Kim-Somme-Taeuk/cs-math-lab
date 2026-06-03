export type ChapterStatus = "ready" | "draft" | "planned";
export type RoadmapLevelId = 1 | 2 | 3;
export type MathSubjectId = "discrete-math" | "linear-algebra" | "calculus" | "probability-statistics";

export type Chapter = {
  slug: string;
  order: number;
  level: RoadmapLevelId;
  title: string;
  shortTitle: string;
  description: string;
  csConnection: string;
  status: ChapterStatus;
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

export const chapters: Chapter[] = [
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
];

const level2Chapters: Chapter[] = [
  {
    slug: "proof-techniques",
    order: 1,
    level: 2,
    title: "증명 기법",
    shortTitle: "증명",
    description: "직접 증명, 대우 증명, 모순 증명의 기본 구조를 다룹니다.",
    csConnection: "알고리즘 정확성, 명세 검증",
    status: "planned",
  },
  {
    slug: "logical-equivalence",
    order: 2,
    level: 2,
    title: "논리적 동치와 드모르간 법칙",
    shortTitle: "논리적 동치",
    description: "논리식을 같은 의미의 다른 형태로 바꾸는 규칙을 익힙니다.",
    csConnection: "조건식 단순화, 불리언 리팩터링",
    status: "planned",
  },
  {
    slug: "predicate-logic",
    order: 3,
    level: 2,
    title: "술어 논리",
    shortTitle: "술어 논리",
    description: "모든, 어떤 같은 수량 표현을 논리식으로 다룹니다.",
    csConnection: "반복 조건, 쿼리 조건, 타입 제약",
    status: "planned",
  },
  {
    slug: "equivalence-relations",
    order: 4,
    level: 2,
    title: "동치관계",
    shortTitle: "동치관계",
    description: "같다고 묶을 수 있는 관계와 분할의 의미를 봅니다.",
    csConnection: "분류, 캐시 키, 유니온 파인드",
    status: "planned",
  },
  {
    slug: "partial-orders",
    order: 5,
    level: 2,
    title: "부분순서관계",
    shortTitle: "부분순서",
    description: "항상 일렬로 비교되지는 않는 순서 구조를 배웁니다.",
    csConnection: "의존성, 작업 순서, 버전 비교",
    status: "planned",
  },
  {
    slug: "recurrences",
    order: 6,
    level: 2,
    title: "점화식",
    shortTitle: "점화식",
    description: "이전 값으로 다음 값을 정의하는 식을 이해합니다.",
    csConnection: "재귀 알고리즘, 동적 계획법",
    status: "planned",
  },
  {
    slug: "inclusion-exclusion",
    order: 7,
    level: 2,
    title: "포함배제 원리",
    shortTitle: "포함배제",
    description: "겹치는 경우를 중복 없이 세는 방법을 배웁니다.",
    csConnection: "필터 조합, 집계 로직",
    status: "planned",
  },
  {
    slug: "pigeonhole-principle",
    order: 8,
    level: 2,
    title: "비둘기집 원리",
    shortTitle: "비둘기집",
    description: "공간보다 대상이 많을 때 반드시 생기는 충돌을 다룹니다.",
    csConnection: "해시 충돌, 하한 증명",
    status: "planned",
  },
  {
    slug: "trees",
    order: 9,
    level: 2,
    title: "트리",
    shortTitle: "트리",
    description: "사이클이 없는 연결 그래프와 계층 구조를 봅니다.",
    csConnection: "파일 시스템, DOM, 탐색 트리",
    status: "planned",
  },
];

const level3Chapters: Chapter[] = [
  {
    slug: "asymptotic-analysis",
    order: 1,
    level: 3,
    title: "알고리즘 분석과 점근 표기",
    shortTitle: "점근 표기",
    description: "입력 크기에 따른 실행 시간 증가를 큰 흐름으로 비교합니다.",
    csConnection: "Big-O, 성능 분석",
    status: "planned",
  },
  {
    slug: "recursion-recurrences",
    order: 2,
    level: 3,
    title: "재귀와 점화식 풀이",
    shortTitle: "재귀 점화식",
    description: "재귀 코드의 실행 구조를 점화식으로 해석합니다.",
    csConnection: "분할 정복, 재귀 성능",
    status: "planned",
  },
  {
    slug: "discrete-probability",
    order: 3,
    level: 3,
    title: "이산확률",
    shortTitle: "이산확률",
    description: "셀 수 있는 사건의 가능성을 경우의 수와 연결합니다.",
    csConnection: "랜덤 알고리즘, 테스트 샘플링",
    status: "planned",
  },
  {
    slug: "number-theory",
    order: 4,
    level: 3,
    title: "정수론 기초",
    shortTitle: "정수론",
    description: "약수, 배수, 나눗셈 구조를 컴퓨팅 관점에서 봅니다.",
    csConnection: "암호, 해싱, 난수",
    status: "planned",
  },
  {
    slug: "modular-arithmetic",
    order: 5,
    level: 3,
    title: "모듈러 연산",
    shortTitle: "모듈러",
    description: "나머지로 수를 분류하고 순환 구조를 이해합니다.",
    csConnection: "배열 인덱스, 시계산, 해시 버킷",
    status: "planned",
  },
  {
    slug: "euclidean-algorithm",
    order: 6,
    level: 3,
    title: "유클리드 호제법",
    shortTitle: "호제법",
    description: "최대공약수를 빠르게 구하는 반복 구조를 배웁니다.",
    csConnection: "정수 알고리즘, 암호 기초",
    status: "planned",
  },
  {
    slug: "boolean-algebra",
    order: 7,
    level: 3,
    title: "부울 대수",
    shortTitle: "부울 대수",
    description: "논리 연산을 대수적 규칙으로 정리합니다.",
    csConnection: "디지털 논리, 조건식 최적화",
    status: "planned",
  },
  {
    slug: "dag-topological-sort",
    order: 8,
    level: 3,
    title: "DAG와 위상 정렬",
    shortTitle: "위상 정렬",
    description: "방향 비순환 그래프에서 가능한 실행 순서를 찾습니다.",
    csConnection: "빌드 시스템, 작업 스케줄링",
    status: "planned",
  },
  {
    slug: "shortest-paths",
    order: 9,
    level: 3,
    title: "최단 경로 개념",
    shortTitle: "최단 경로",
    description: "그래프에서 비용이 가장 작은 이동 경로의 의미를 봅니다.",
    csConnection: "라우팅, 추천, 경로 탐색",
    status: "planned",
  },
];

export const roadmapLevels: RoadmapLevel[] = [
  {
    level: 1,
    title: "Level 1. 입문",
    description: "현재 MVP 범위입니다. 컴공 전공 학습에 필요한 이산수학 첫 도구를 다룹니다.",
    chapters,
  },
  {
    level: 2,
    title: "Level 2. 핵심 확장",
    description: "입문 이후 증명, 논리, 관계, 세기 원리를 더 깊게 확장할 예정입니다.",
    chapters: level2Chapters,
  },
  {
    level: 3,
    title: "Level 3. 컴공 응용",
    description: "알고리즘, 그래프, 정수론처럼 전공 과목과 직접 맞닿는 주제로 확장할 예정입니다.",
    chapters: level3Chapters,
  },
];

function plannedChapters(subjectId: MathSubjectId, level: RoadmapLevelId, titles: string[]): Chapter[] {
  return titles.map((title, index) => ({
    slug: `${subjectId}-level-${level}-${index + 1}`,
    order: index + 1,
    level,
    title,
    shortTitle: title,
    description: `${title}을 컴공 맥락과 연결해 다룰 예정입니다.`,
    csConnection: "전공 기초, 모델링, 문제 해결",
    status: "planned",
  }));
}

const plannedSubjectLevels = {
  linearAlgebra: [
    {
      level: 1,
      title: "Level 1. 벡터와 행렬 입문",
      description: "벡터, 행렬, 선형변환을 컴공 맥락에서 다루는 입문 범위입니다.",
      chapters: plannedChapters("linear-algebra", 1, [
        "벡터란 무엇인가",
        "벡터 덧셈과 스칼라배",
        "좌표와 차원",
        "내적과 유사도",
        "행렬이란 무엇인가",
        "행렬 덧셈과 스칼라배",
        "행렬곱의 의미",
        "연립일차방정식",
      ]),
    },
    {
      level: 2,
      title: "Level 2. 선형공간과 변환",
      description: "기저, 차원, 고유값처럼 선형대수의 핵심 도구로 확장할 예정입니다.",
      chapters: plannedChapters("linear-algebra", 2, [
        "선형결합",
        "Span",
        "선형독립과 선형종속",
        "기저와 차원",
        "선형변환",
        "행렬과 선형변환",
        "역행렬",
        "행렬식",
        "랭크",
      ]),
    },
    {
      level: 3,
      title: "Level 3. 응용과 고급 개념",
      description: "고유값, 정사영, 최소제곱, 선형 모델처럼 응용 주제로 확장할 예정입니다.",
      chapters: plannedChapters("linear-algebra", 3, [
        "고유값과 고유벡터",
        "대각화",
        "직교성과 정사영",
        "최소제곱법",
        "공분산 행렬",
        "PCA 맛보기",
        "그래픽스에서의 행렬 변환",
        "머신러닝에서의 선형 모델",
        "신경망에서의 행렬 연산",
      ]),
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
    levels: roadmapLevels,
  },
  {
    id: "linear-algebra",
    title: "선형대수",
    description: "벡터와 행렬을 중심으로 데이터 표현, 그래픽스, 머신러닝의 기반을 다룹니다.",
    status: "planned",
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
  return chapters.find((chapter) => chapter.slug === slug);
}

export function getReadyChapters() {
  return chapters.filter((chapter) => chapter.status === "ready");
}

export function getChapterNavigation(slug: string) {
  const readyChapters = getReadyChapters();
  const index = readyChapters.findIndex((chapter) => chapter.slug === slug);
  return {
    previous: index > 0 ? readyChapters[index - 1] : null,
    next: index >= 0 && index < readyChapters.length - 1 ? readyChapters[index + 1] : null,
  };
}
