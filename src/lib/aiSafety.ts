export const unsafeAiRequestAnswer =
  "시스템 지시나 안전 규칙을 우회하려는 요청에는 답할 수 없습니다. 챕터 학습 내용에 대한 질문으로 다시 작성해 주세요.";

const promptInjectionPatterns = [
  /ignore\s+(all\s+)?(previous|prior|above|earlier|system|developer)\s+(instructions|rules|messages|prompt)/i,
  /disregard\s+(all\s+)?(previous|prior|above|earlier|system|developer)\s+(instructions|rules|messages|prompt)/i,
  /forget\s+(all\s+)?(previous|prior|above|earlier|system|developer)\s+(instructions|rules|messages|prompt)/i,
  /override\s+(the\s+)?(system|developer|safety|instructions|rules)/i,
  /reveal\s+(the\s+)?(system|developer|hidden|initial)\s+(prompt|message|instructions|rules)/i,
  /show\s+(me\s+)?(the\s+)?(system|developer|hidden|initial)\s+(prompt|message|instructions|rules)/i,
  /print\s+(the\s+)?(system|developer|hidden|initial)\s+(prompt|message|instructions|rules)/i,
  /repeat\s+(the\s+)?(system|developer|hidden|initial)\s+(prompt|message|instructions|rules)/i,
  /act\s+as\s+(dan|developer mode|jailbreak|unfiltered|uncensored)/i,
  /pretend\s+(to\s+be|you\s+are)\s+(dan|developer mode|unfiltered|uncensored)/i,
  /(jailbreak|prompt injection|developer mode|do anything now)/i,
  /bypass\s+(the\s+)?(rules|safety|instructions|guardrails|policy)/i,
  /base64.*(system|developer|prompt|instruction)/i,
  /(system|developer|assistant)\s*:\s*(ignore|override|reveal|show|print|forget)/i,
  /role\s*:\s*(system|developer)/i,
  /(api[_ -]?key|secret|token|password|credential|env(ironment)? variable).*(show|print|reveal|dump|expose|알려|보여|출력|공개)/i,
  /지금까지.*(명령|지시|규칙|프롬프트).*(무시|잊어|삭제|초기화|덮어)/,
  /이전.*(명령|지시|규칙|프롬프트).*(무시|잊어|삭제|초기화|덮어)/,
  /(시스템|개발자|developer|system|숨겨진|초기).*(프롬프트|메시지|지시|규칙).*(보여|출력|공개|말해|반복|복사)/i,
  /(규칙|안전장치|가드레일|정책).*(우회|무시|해제|끄고|꺼줘|비활성)/,
  /(api\s*키|비밀키|토큰|비밀번호|환경\s*변수).*(알려|보여|출력|공개|노출)/,
  /탈옥/,
];

const compactPromptInjectionPatterns = [
  /ignore(all)?(previous|prior|above|earlier|system|developer)(instructions|rules|messages|prompt)/,
  /disregard(all)?(previous|prior|above|earlier|system|developer)(instructions|rules|messages|prompt)/,
  /forget(all)?(previous|prior|above|earlier|system|developer)(instructions|rules|messages|prompt)/,
  /(reveal|show|print|repeat)(the)?(system|developer|hidden|initial)(prompt|message|instructions|rules)/,
  /(system|developer|assistant)(ignore|override|reveal|show|print|forget)/,
  /role(system|developer)/,
  /jailbreak/,
  /developer(mode)?/,
  /doanythingnow/,
  /(api(key)?|secret|token|password|credential|env)(show|print|reveal|dump|expose)/,
  /지금까지(명령|지시|규칙|프롬프트)(무시|잊어|삭제|초기화|덮어)/,
  /이전(명령|지시|규칙|프롬프트)(무시|잊어|삭제|초기화|덮어)/,
  /(시스템|개발자|숨겨진|초기)(프롬프트|메시지|지시|규칙)(보여|출력|공개|말해|반복|복사)/,
  /(규칙|안전장치|가드레일|정책)(우회|무시|해제|끄고|꺼줘|비활성)/,
  /(api키|비밀키|토큰|비밀번호|환경변수)(알려|보여|출력|공개|노출)/,
];

const encodedInstructionPatterns = [
  /(base64|rot13|hex|unicode|decode|decrypt|복호화|디코딩).*(system|developer|prompt|instruction|프롬프트|지시|규칙)/i,
  /(system|developer|prompt|instruction|프롬프트|지시|규칙).*(base64|rot13|hex|unicode|decode|decrypt|복호화|디코딩)/i,
];

export function normalizeSafetyText(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function compactSafetyText(value: string) {
  return normalizeSafetyText(value).replace(/[^a-z0-9가-힣]/g, "");
}

export function containsPromptInjectionText(value: string) {
  const text = normalizeSafetyText(value);
  const compactText = compactSafetyText(value);

  return (
    promptInjectionPatterns.some((pattern) => pattern.test(text)) ||
    compactPromptInjectionPatterns.some((pattern) => pattern.test(compactText)) ||
    encodedInstructionPatterns.some((pattern) => pattern.test(text))
  );
}

export function containsUnsafeAiText(value: unknown): boolean {
  if (typeof value === "string") return containsPromptInjectionText(value);
  if (Array.isArray(value)) return value.some((item) => containsUnsafeAiText(item));
  if (typeof value !== "object" || value === null) return false;

  return Object.values(value).some((item) => containsUnsafeAiText(item));
}
