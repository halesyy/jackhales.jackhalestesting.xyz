import Head from "next/head";
import Link from "next/link";

import { MarkdownContent } from "../../components/MarkdownContent";
import { SiteShell } from "../../components/SiteShell";
import { fetchArticle } from "../../lib/api";
import { formatDate } from "../../lib/date";
import type { articleDetail } from "../../lib/types";

type articlePageProps = {
  article: articleDetail;
};

export async function getServerSideProps({ params }: { params: { slug: string } }) {
  try {
    const article = await fetchArticle(params.slug);
    return { props: { article } };
  } catch {
    return { notFound: true };
  }
}

export default function ArticlePage({ article }: articlePageProps) {
  return (
    <SiteShell>
      <Head>
        <title>{article.title} - Jack Hales</title>
        <meta name="description" content={article.summary} />
      </Head>
      <Link href="/articles" className="text-sm text-neutral-600">
        ← Articles
      </Link>
      <header className="mt-5 border-b border-neutral-200 pb-6">
        <h1 className="text-3xl font-semibold leading-tight">{article.title}</h1>
        {article.summary ? <p className="mt-3 text-base leading-7 text-neutral-700">{article.summary}</p> : null}
        <p className="mt-4 text-sm text-neutral-500">By Jack Hales | {formatDate(article.publishedAt)}</p>
      </header>
      <div className="mt-8">
        <MarkdownContent markdown={article.bodyMarkdown} />
      </div>
    </SiteShell>
  );
}
