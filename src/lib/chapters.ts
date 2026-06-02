export type ChapterStatus = "ready" | "draft";

export type Chapter = {
  slug: string;
  order: number;
  title: string;
  shortTitle: string;
  description: string;
  csConnection: string;
  status: ChapterStatus;
};

export const chapters: Chapter[] = [
  {
    slug: "logic",
    order: 1,
    title: "명제와 논리",
    shortTitle: "논리",
    description: "참과 거짓으로 판단할 수 있는 문장과 기본 논리 연산을 배웁니다.",
    csConnection: "조건문, 불리언 타입, 필터링 로직",
    status: "ready",
  },
  {
    slug: "conditionals",
    order: 2,
    title: "조건문과 진리표",
    shortTitle: "조건문",
    description: "P -> Q 형태의 조건문과 진리표를 코드 흐름과 연결합니다.",
    csConnection: "if문, 사전조건, 테스트 케이스",
    status: "ready",
  },
  {
    slug: "sets",
    order: 3,
    title: "집합과 집합 연산",
    shortTitle: "집합",
    description: "원소, 부분집합, 합집합, 교집합, 차집합을 시각적으로 익힙니다.",
    csConnection: "자료구조, 데이터 필터링, SQL 조건",
    status: "ready",
  },
  {
    slug: "functions",
    order: 4,
    title: "함수",
    shortTitle: "함수",
    description: "입력과 출력의 대응을 수학과 프로그래밍 관점에서 봅니다.",
    csConnection: "함수 호출, 해시, 변환 파이프라인",
    status: "draft",
  },
  {
    slug: "relations",
    order: 5,
    title: "관계",
    shortTitle: "관계",
    description: "두 집합 사이의 연결과 반사성, 대칭성, 추이성을 배웁니다.",
    csConnection: "그래프, 데이터베이스 관계, 동치 관계",
    status: "draft",
  },
  {
    slug: "induction",
    order: 6,
    title: "수학적 귀납법",
    shortTitle: "귀납법",
    description: "기저 사례와 귀납 단계를 재귀와 알고리즘 증명으로 연결합니다.",
    csConnection: "재귀 함수, 루프 불변식, 알고리즘 정확성",
    status: "draft",
  },
  {
    slug: "counting",
    order: 7,
    title: "경우의 수",
    shortTitle: "경우의 수",
    description: "순열과 조합을 구분하고 선택 문제의 구조를 파악합니다.",
    csConnection: "브루트포스, 조합 탐색, 확률 기초",
    status: "draft",
  },
  {
    slug: "graphs",
    order: 8,
    title: "그래프 기초",
    shortTitle: "그래프",
    description: "정점과 간선, 탐색 순서를 자료구조 관점에서 이해합니다.",
    csConnection: "DFS, BFS, 네트워크, 의존성 그래프",
    status: "draft",
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
