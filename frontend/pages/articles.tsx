import Head from "next/head";
import Link from "next/link";

import { SiteShell } from "../components/SiteShell";
import { formatDate } from "../lib/date";
import { fetchArticles } from "../lib/api";
import type { articleSummary } from "../lib/types";

type articlesPageProps = {
  articles: articleSummary[];
};

export async function getServerSideProps() {
  const articles = await fetchArticles();
  return { props: { articles } };
}

export default function ArticlesPage({ articles }: articlesPageProps) {
  return (
    <SiteShell>
      <Head>
        <title>Articles - Jack Hales</title>
      </Head>
      <div className="space-y-5">
        {articles.map((article) => (
          <Link key={article.slug} href={`/article/${article.slug}`} className="block border-b border-neutral-200 pb-5 no-underline hover:border-neutral-950">
            <div className="text-xs uppercase tracking-wide text-neutral-500">{formatDate(article.publishedAt)}</div>
            <h1 className="mt-1 text-xl font-semibold leading-snug">{article.title}</h1>
            <p className="mt-2 text-sm leading-6 text-neutral-700">{article.summary}</p>
          </Link>
        ))}
      </div>
    </SiteShell>
  );
}
