import Head from "next/head";

import { MarkdownContent } from "../components/MarkdownContent";
import { SiteShell } from "../components/SiteShell";
import staticPages from "../content/static-pages.json";

export default function BackgroundPage() {
  return (
    <SiteShell>
      <Head>
        <title>Background and Experience | Jack Hales</title>
        <meta name="description" content="Jack Hales' background and experience in software development, trading, and platform integrations." />
      </Head>
      <MarkdownContent markdown={staticPages.backgroundAndExperience.markdown} />
    </SiteShell>
  );
}

