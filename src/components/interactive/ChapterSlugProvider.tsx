"use client";

import { createContext, type ReactNode, useContext } from "react";

const ChapterSlugContext = createContext<string | null>(null);

export function ChapterSlugProvider({ slug, children }: { slug: string; children: ReactNode }) {
  return <ChapterSlugContext.Provider value={slug}>{children}</ChapterSlugContext.Provider>;
}

export function useChapterSlug() {
  return useContext(ChapterSlugContext);
}
