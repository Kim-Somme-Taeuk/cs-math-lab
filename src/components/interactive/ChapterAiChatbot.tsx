"use client";

import katex from "katex";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  aiChatBaseBlockMs,
  aiChatClientBlockCountStorageKey,
  aiChatClientBlockedUntilStorageKey,
  aiChatClientUsageStorageKey,
  aiChatMaxRequestsPerWindow,
  aiChatWindowMs,
  nextAiChatBlockMs,
  type AiChatMessage,
  type AiChatResponsePayload,
} from "@/lib/aiChat";

type LocalUsage = {
  timestamps: number[];
};

type MessagePart = {
  type: "text" | "math";
  value: string;
  displayMode?: boolean;
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function formatWait(milliseconds: number) {
  return `${Math.max(1, Math.ceil(milliseconds / 1000))}초`;
}

function checkLocalRateLimit(now = Date.now()) {
  const blockedUntil = Number(window.localStorage.getItem(aiChatClientBlockedUntilStorageKey) ?? 0);

  if (blockedUntil > now) {
    return { allowed: false, waitMs: blockedUntil - now };
  }

  const usage = readJson<LocalUsage>(aiChatClientUsageStorageKey, { timestamps: [] });
  const timestamps = usage.timestamps.filter((timestamp) => now - timestamp < aiChatWindowMs);

  if (timestamps.length >= aiChatMaxRequestsPerWindow) {
    const previousBlockCount = Number(window.localStorage.getItem(aiChatClientBlockCountStorageKey) ?? 0);
    const waitMs = nextAiChatBlockMs(previousBlockCount);
    const nextBlockedUntil = now + waitMs;
    window.localStorage.setItem(aiChatClientBlockedUntilStorageKey, String(nextBlockedUntil));
    window.localStorage.setItem(aiChatClientBlockCountStorageKey, String(previousBlockCount + 1));
    window.localStorage.setItem(aiChatClientUsageStorageKey, JSON.stringify({ timestamps: [] }));
    return { allowed: false, waitMs };
  }

  window.localStorage.setItem(aiChatClientUsageStorageKey, JSON.stringify({ timestamps: [...timestamps, now] }));
  return { allowed: true, waitMs: 0 };
}

function isEscaped(text: string, index: number) {
  let slashCount = 0;

  for (let cursor = index - 1; cursor >= 0 && text[cursor] === "\\"; cursor -= 1) {
    slashCount += 1;
  }

  return slashCount % 2 === 1;
}

function findNextMathStart(text: string, from: number): { index: number; delimiter: "$" | "$$"; displayMode: boolean } | null {
  for (let index = from; index < text.length; index += 1) {
    if (text[index] !== "$" || isEscaped(text, index)) continue;

    return {
      index,
      delimiter: text.startsWith("$$", index) ? "$$" : "$",
      displayMode: text.startsWith("$$", index),
    };
  }

  return null;
}

function findClosingDelimiter(text: string, delimiter: "$" | "$$", from: number) {
  for (let index = from; index < text.length; index += 1) {
    if (!text.startsWith(delimiter, index) || isEscaped(text, index)) continue;

    return index;
  }

  return -1;
}

function parseMathParts(text: string) {
  const parts: MessagePart[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const start = findNextMathStart(text, cursor);

    if (!start) {
      parts.push({ type: "text", value: text.slice(cursor) });
      break;
    }

    const mathStart = start.index + start.delimiter.length;
    const end = findClosingDelimiter(text, start.delimiter, mathStart);

    if (end < 0) {
      parts.push({ type: "text", value: text.slice(cursor) });
      break;
    }

    const math = text.slice(mathStart, end).trim();

    if (!math) {
      parts.push({ type: "text", value: text.slice(cursor, end + start.delimiter.length) });
      cursor = end + start.delimiter.length;
      continue;
    }

    if (start.index > cursor) {
      parts.push({ type: "text", value: text.slice(cursor, start.index) });
    }

    parts.push({ type: "math", value: math, displayMode: start.displayMode });
    cursor = end + start.delimiter.length;
  }

  return parts;
}

function MathText({ source, displayMode = false }: { source: string; displayMode?: boolean }) {
  const html = useMemo(
    () =>
      katex.renderToString(source, {
        displayMode,
        strict: false,
        throwOnError: false,
      }),
    [displayMode, source],
  );

  if (displayMode) {
    return <span className="my-2 block overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return <span className="inline-block align-baseline" dangerouslySetInnerHTML={{ __html: html }} />;
}

function AssistantMessageContent({ content }: { content: string }) {
  const parts = useMemo(() => parseMathParts(content), [content]);

  return parts.map((part, index) => {
    if (part.type === "text") return <span key={`text-${index}`}>{part.value}</span>;

    return <MathText key={`math-${index}-${part.value}`} source={part.value} displayMode={part.displayMode} />;
  });
}

function ChatIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-7 w-7">
      <circle cx="24" cy="24" r="18" fill="currentColor" opacity="0.12" />
      <path
        d="M16 18.5C16 15.5 18.5 13 21.5 13H27C30 13 32.5 15.5 32.5 18.5V23C32.5 26 30 28.5 27 28.5H23L17.5 33V28.1C16.6 27.1 16 25.8 16 24.4V18.5Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.8"
      />
      <path d="M20.5 21.5H28" stroke="currentColor" strokeLinecap="round" strokeWidth="2.6" />
      <path d="M20.5 25H25" stroke="currentColor" strokeLinecap="round" strokeWidth="2.6" />
      <path d="M34.5 12.5L36 16L39.5 17.5L36 19L34.5 22.5L33 19L29.5 17.5L33 16L34.5 12.5Z" fill="currentColor" />
    </svg>
  );
}

export default function ChapterAiChatbot({ slug, chapterTitle }: { slug: string; chapterTitle: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const visibleMessages = useMemo(() => messages.slice(-6), [messages]);

  useEffect(() => {
    if (!open) return;

    transcriptEndRef.current?.scrollIntoView?.({ block: "end" });
  }, [loading, messages, open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = input.trim();
    if (!content || loading) return;

    const localRate = checkLocalRateLimit();
    if (!localRate.allowed) {
      setBlockedMessage(`질문이 너무 많습니다. ${formatWait(localRate.waitMs)} 후 다시 시도하세요.`);
      return;
    }

    const userMessage: AiChatMessage = { role: "user", content };
    const nextMessages: AiChatMessage[] = [...messages, userMessage].slice(-8);
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setBlockedMessage(null);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, messages: nextMessages }),
      });

      if (response.status === 429) {
        const data = (await response.json()) as { retryAfterSeconds?: number };
        const seconds = data.retryAfterSeconds ?? Math.ceil(aiChatBaseBlockMs / 1000);
        const blockedUntil = Date.now() + seconds * 1000;
        window.localStorage.setItem(aiChatClientBlockedUntilStorageKey, String(blockedUntil));
        setBlockedMessage(`질문이 너무 많습니다. ${seconds}초 후 다시 시도하세요.`);
        setMessages(nextMessages);
        return;
      }

      if (!response.ok) {
        setMessages([...nextMessages, { role: "assistant", content: "현재 챕터 자료를 불러오지 못했습니다. 잠시 후 다시 시도하세요." }]);
        return;
      }

      const data = (await response.json()) as AiChatResponsePayload;
      setMessages([...nextMessages, { role: "assistant", content: data.answer }]);
    } catch {
      setMessages([...nextMessages, { role: "assistant", content: "네트워크 문제로 답변을 가져오지 못했습니다." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="fixed bottom-4 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg shadow-slate-900/25 ring-1 ring-white/60 hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 lg:bottom-6 lg:right-6 lg:h-12 lg:w-12"
        aria-label={open ? "AI 챗봇 닫기" : "AI 챗봇 열기"}
        aria-expanded={open}
      >
        <ChatIcon />
      </button>

      {open ? (
        <section
          aria-label="AI 챗봇"
          className="fixed bottom-20 right-4 z-50 flex max-h-[min(38rem,calc(100vh-7rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-900/25 lg:bottom-20 lg:right-6"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div className="min-w-0">
              <h2 className="text-sm font-black text-slate-950">AI 챗봇</h2>
              <p className="truncate text-xs font-semibold text-slate-500">{chapterTitle} 자료 기준</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xl font-black text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              aria-label="AI 챗봇 닫기"
            >
              ×
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {visibleMessages.length === 0 ? (
              <p className="rounded-md border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-600">
                이 챕터 안의 개념, 예시, 종합 점검을 기준으로만 답합니다.
              </p>
            ) : null}
            {visibleMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
                className={`whitespace-pre-wrap rounded-md border p-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "ml-8 border-teal-200 bg-teal-50 text-slate-900"
                    : "mr-8 border-slate-200 bg-white text-slate-700"
                }`}
              >
                {message.role === "assistant" ? <AssistantMessageContent content={message.content} /> : message.content}
              </div>
            ))}
            {loading ? (
              <p className="mr-8 rounded-md border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-500">
                답변 생성 중...
              </p>
            ) : null}
            <div ref={transcriptEndRef} />
          </div>

          <form onSubmit={submit} className="border-t border-slate-200 bg-white p-3">
            {blockedMessage ? (
              <p className="mb-2 rounded-md bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">{blockedMessage}</p>
            ) : null}
            <label className="sr-only" htmlFor="chapter-ai-chat-input">
              AI 챗봇 질문
            </label>
            <textarea
              id="chapter-ai-chat-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;

                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }}
              maxLength={700}
              rows={3}
              className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm leading-6 outline-none focus:border-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              placeholder="이 챕터에서 헷갈리는 점을 질문하세요."
            />
            <button
              type="submit"
              disabled={loading || input.trim().length === 0}
              className="mt-2 w-full rounded-md bg-slate-950 px-3 py-2 text-sm font-black text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              질문 보내기
            </button>
          </form>
        </section>
      ) : null}
    </>
  );
}
