import Link from "next/link";
import type { ReactNode } from "react";

type siteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: siteShellProps) {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 pb-8 pt-8 text-center sm:pt-12">
        <Link href="/" aria-label="Home">
          <img src="/jack-hales-picture-harbour.jpg" width={112} height={112} className="h-28 w-28 rounded-full object-cover shadow-sm" alt="Jack Hales Picture" />
        </Link>
        <div className="mt-4 text-lg font-semibold">Jack Hales</div>
        <a className="mt-1 text-sm text-neutral-600" href="https://dataology.com.au" target="_blank" rel="noreferrer">
          Dataology
        </a>
        <a className="text-sm text-neutral-600" href="mailto:me@jackhales.com">
          me@jackhales.com
        </a>
        <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-y border-neutral-200 py-3 text-sm text-neutral-700">
          <Link href="/articles">Articles</Link>
          <span className="text-neutral-300">/</span>
          <Link href="/background-and-experience">Background & Experience</Link>
          <span className="text-neutral-300">/</span>
          <Link href="/machine-learning">Machine Learning</Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-3xl px-5 pb-16">{children}</main>
    </div>
  );
}

