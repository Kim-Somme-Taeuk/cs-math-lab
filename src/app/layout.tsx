import type { Metadata } from "next";
import Link from "next/link";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "CS Math Lab",
  description: "컴공생을 위한 인터랙티브 이산수학 학습 실험실",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen bg-slate-50 text-slate-950">
          <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
              <Link href="/" className="text-lg font-bold tracking-tight">
                CS Math Lab
              </Link>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/roadmap">
                  로드맵
                </Link>
                <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/chapters/logic">
                  시작하기
                </Link>
              </div>
            </nav>
          </header>
          {children}
          <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <p>CS Math Lab</p>
              <p>수학 때문에 전공이 막히는 컴공생을 위한 학습 사이트</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
