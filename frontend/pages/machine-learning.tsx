import Head from "next/head";

import { MarkdownContent } from "../components/MarkdownContent";
import { SiteShell } from "../components/SiteShell";
import staticPages from "../content/static-pages.json";

export default function MachineLearningPage() {
  return (
    <SiteShell>
      <Head>
        <title>Machine Learning - Jack Hales</title>
        <meta name="description" content="Machine Learning models and algorithms I've worked with and learned about." />
      </Head>
      <MarkdownContent markdown={staticPages.machineLearning.markdown} />
    </SiteShell>
  );
}

