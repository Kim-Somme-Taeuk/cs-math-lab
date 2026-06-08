import Link from "next/link";

export default function NextChapterButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800 sm:w-auto"
      href={href}
    >
      {label}
    </Link>
  );
}
