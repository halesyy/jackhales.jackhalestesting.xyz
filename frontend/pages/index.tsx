import Head from "next/head";

import { MarkdownContent } from "../components/MarkdownContent";
import { SiteShell } from "../components/SiteShell";
import staticPages from "../content/static-pages.json";

export default function HomePage() {
  return (
    <SiteShell>
      <Head>
        <title>Jack Hales</title>
        <meta name="description" content="Jack Hales is an Australian software engineer who loves working with data creatively." />
      </Head>
      <MarkdownContent markdown={staticPages.home.markdown} />
    </SiteShell>
  );
}

