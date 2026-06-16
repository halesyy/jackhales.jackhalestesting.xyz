import Head from "next/head";

import { MarkdownContent } from "../components/MarkdownContent";
import { SiteShell } from "../components/SiteShell";
import staticPages from "../content/static-pages.json";

export default function OmanPage() {
  return (
    <SiteShell>
      <Head>
        <title>Oman Travel Tips | Western Travel Advice</title>
      </Head>
      <MarkdownContent markdown={staticPages.oman.markdown} />
    </SiteShell>
  );
}

