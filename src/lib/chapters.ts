export type ChapterStatus = "ready" | "draft" | "planned";
export type RoadmapLevelId = 1 | 2 | 3;

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
    status: "draft",
  },
  {
    slug: "induction",
    order: 6,
    level: 1,
    title: "수학적 귀납법",
    shortTitle: "귀납법",
    description: "기저 사례와 귀납 단계를 재귀와 알고리즘 증명으로 연결합니다.",
    csConnection: "재귀 함수, 루프 불변식, 알고리즘 정확성",
    status: "draft",
  },
  {
    slug: "counting",
    order: 7,
    level: 1,
    title: "경우의 수",
    shortTitle: "경우의 수",
    description: "순열과 조합을 구분하고 선택 문제의 구조를 파악합니다.",
    csConnection: "브루트포스, 조합 탐색, 확률 기초",
    status: "draft",
  },
  {
    slug: "graphs",
    order: 8,
    level: 1,
    title: "그래프 기초",
    shortTitle: "그래프",
    description: "정점과 간선, 탐색 순서를 자료구조 관점에서 이해합니다.",
    csConnection: "DFS, BFS, 네트워크, 의존성 그래프",
    status: "draft",
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
    title: "Level 1. 이산수학 입문",
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
