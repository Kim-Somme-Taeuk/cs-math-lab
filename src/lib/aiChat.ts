import { containsPromptInjectionText, unsafeAiRequestAnswer } from "@/lib/aiSafety";

export const aiChatFallbackAnswer =
  "현재 챕터 자료 안에서 바로 확인되는 내용만 답할 수 있습니다. 질문을 챕터의 개념, 예시, 종합 점검과 연결해 다시 물어보세요.";
export const aiChatOutOfScopeAnswer =
  "이 챕터의 CS 수학 학습 범위를 벗어난 질문에는 답할 수 없습니다. 챕터의 개념, 예시, 종합 점검과 연결해서 다시 질문해 주세요.";
export const aiChatUnsafeRequestAnswer = unsafeAiRequestAnswer;

export const aiChatClientUsageStorageKey = "cs-math-lab:ai-chat-usage";
export const aiChatClientBlockedUntilStorageKey = "cs-math-lab:ai-chat-blocked-until";
export const aiChatClientBlockCountStorageKey = "cs-math-lab:ai-chat-block-count";
export const aiChatWindowMs = 60_000;
export const aiChatBaseBlockMs = 120_000;
export const aiChatMaxBlockMs = 1_800_000;
export const aiChatMaxRequestsPerWindow = 5;

export type AiChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AiChatRequestPayload = {
  slug: string;
  messages: AiChatMessage[];
};

export type AiChatResponsePayload = {
  answer: string;
  source: "ai" | "fallback";
};

export type AiChatScopeMaterial = {
  chapter: {
    title: string;
    description: string;
    csConnection: string;
    conceptTags: string[];
  };
  content: string;
};

const maxSlugLength = 120;
const maxMessages = 8;
const maxMessageLength = 700;
const maxSerializedLength = 7000;
const maxAnswerLength = 900;
const mathScopeKeywords = [
  "수학",
  "증명",
  "정의",
  "개념",
  "예시",
  "문제",
  "풀이",
  "해설",
  "정답",
  "공식",
  "계산",
  "방향",
  "원소",
  "논리",
  "명제",
  "조건",
  "진리표",
  "집합",
  "부분집합",
  "함수",
  "관계",
  "그래프",
  "트리",
  "경우의 수",
  "순열",
  "조합",
  "귀납",
  "재귀",
  "행렬",
  "벡터",
  "미분",
  "적분",
  "확률",
  "알고리즘",
  "코드",
  "python",
  "set",
  "function",
  "matrix",
  "vector",
  "graph",
  "proof",
  "logic",
];
const ambiguousFollowUpPattern = /^(이거|이게|그럼|왜|어떻게|다시|예시|풀이|해설|좀 더|무슨 뜻|설명)/;
const offTopicIntentPatterns = [
  /오늘.*(날씨|기온|비|눈)/,
  /(날씨|기온|미세먼지|강수|태풍).*(알려|어때|예보)/,
  /(뉴스|속보|최신|실시간).*(알려|요약|검색)/,
  /(주식|코인|환율|부동산|투자).*(추천|전망|가격|시세|사도|팔아)/,
  /(맛집|여행|호텔|항공권|데이트|메뉴).*(추천|알려|찾아)/,
  /(의학|진단|처방|약|증상|병원|법률|소송|계약).*(조언|상담|추천|판단)/,
  /(연예인|아이돌|영화|드라마|노래|가사|스포츠|경기).*(추천|알려|요약)/,
  /(대통령|선거|정당|정치|정책).*(의견|추천|누구|어때)/,
  /(터미널|쉘|파일|서버|데이터베이스|환경변수).*(실행|읽어|열어|삭제|수정|접속)/,
  /(weather|news|stock|crypto|exchange rate|restaurant|hotel|flight|movie|lyrics|sports|election|politics)/i,
];
const stopwords = new Set([
  "그리고",
  "그러면",
  "하지만",
  "합니다",
  "있는",
  "없는",
  "무엇",
  "뭐야",
  "어떤",
  "대한",
  "관련",
  "설명",
  "예시",
  "문제",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAiChatMessage(value: unknown): value is AiChatMessage {
  if (!isRecord(value)) return false;

  return (
    (value.role === "user" || value.role === "assistant") &&
    typeof value.content === "string" &&
    value.content.trim().length > 0 &&
    value.content.length <= maxMessageLength
  );
}

export function validateAiChatPayload(value: unknown): value is AiChatRequestPayload {
  if (!isRecord(value)) return false;

  const serialized = JSON.stringify(value);

  return (
    serialized.length <= maxSerializedLength &&
    typeof value.slug === "string" &&
    value.slug.length > 0 &&
    value.slug.length <= maxSlugLength &&
    /^[a-z0-9-]+$/.test(value.slug) &&
    Array.isArray(value.messages) &&
    value.messages.length > 0 &&
    value.messages.length <= maxMessages &&
    value.messages.every(isAiChatMessage) &&
    value.messages[value.messages.length - 1]?.role === "user"
  );
}

export function normalizeAiChatAnswer(value: unknown) {
  if (typeof value !== "string") return aiChatFallbackAnswer;

  const text = value.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  if (!text) return aiChatFallbackAnswer;

  return text.length > maxAnswerLength ? `${text.slice(0, maxAnswerLength - 3)}...` : text;
}

export function nextAiChatBlockMs(previousBlockCount: number) {
  const safeCount = Math.max(0, Math.floor(previousBlockCount));
  return Math.min(aiChatBaseBlockMs * 2 ** safeCount, aiChatMaxBlockMs);
}

function normalizedText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function tokens(value: string) {
  return Array.from(value.toLowerCase().matchAll(/[a-z0-9가-힣]{2,}/g), (match) => match[0]).filter(
    (token) => !stopwords.has(token),
  );
}

export function isAiChatInScope(messages: AiChatMessage[], material: AiChatScopeMaterial): boolean {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const question = normalizedText(lastUserMessage);

  if (!question) return false;

  const materialText = normalizedText(
    [
      material.chapter.title,
      material.chapter.description,
      material.chapter.csConnection,
      ...material.chapter.conceptTags,
      material.content.slice(0, 6000),
    ].join(" "),
  );
  const chapterTerms = tokens(
    [material.chapter.title, material.chapter.description, material.chapter.csConnection, ...material.chapter.conceptTags].join(" "),
  );
  const questionTokens = tokens(question);
  const hasMathKeyword = mathScopeKeywords.some((keyword) => question.includes(keyword));
  const matchesChapterTerm = chapterTerms.some((token) => question.includes(token));
  const matchesMaterialTerm = questionTokens.some((token) => token.length >= 3 && materialText.includes(token));
  const hasPriorContext =
    messages.length > 1 &&
    messages
      .slice(0, -1)
      .some((message) => message.role === "user" && isAiChatInScope([message], material));

  if (hasMathKeyword || matchesChapterTerm || matchesMaterialTerm) return true;

  return hasPriorContext && ambiguousFollowUpPattern.test(question);
}

export function isPromptInjectionAttempt(messages: AiChatMessage[]) {
  return messages.some((message) => message.role === "user" && containsPromptInjectionText(message.content));
}

export function isOffTopicAiChatRequest(messages: AiChatMessage[]) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const text = normalizedText(latestUserMessage);

  return offTopicIntentPatterns.some((pattern) => pattern.test(text));
}

export function trustedUserMessagesForAi(messages: AiChatMessage[]) {
  return messages
    .filter(
      (message) =>
        message.role === "user" &&
        !containsPromptInjectionText(message.content) &&
        !isOffTopicAiChatRequest([message]),
    )
    .slice(-4)
    .map((message) => ({ role: "user" as const, content: message.content }));
}
