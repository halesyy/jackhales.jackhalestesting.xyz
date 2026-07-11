import Head from "next/head";

import { InstagramEmbed } from "../components/InstagramEmbed";
import { MarkdownContent } from "../components/MarkdownContent";
import { Reveal } from "../components/Motion";
import { SiteShell } from "../components/SiteShell";
import staticPages from "../content/static-pages.json";

export default function OmanPage() {
  const brokenInstagramEmbed = "\n\n> [\n> \n> View post on Instagram\n> \n> ](https://www.instagram.com/p/C8eQVlTgaS_/)";
  const markdown = staticPages.oman.markdown.replace(/^# .*\n+/, "").replace(brokenInstagramEmbed, "");

  return (
    <SiteShell>
      <Head>
        <title>Exploring Oman — Jack Hales</title>
        <meta name="description" content="A practical three-day Oman itinerary and travel notes from Muscat, Nizwa and the mountains." />
      </Head>
      <Reveal className="article-hero travel-hero">
        <p className="eyebrow">Travel field notes · Oman</p>
        <h1>A software engineer&apos;s guide to exploring Oman.</h1>
        <p className="article-deck">A practical three-day itinerary through Muscat, Nizwa and the mountains—with the places, people and small details that made the trip memorable.</p>
      </Reveal>
      <Reveal className="article-paper card" delay={0.1}>
        <MarkdownContent markdown={markdown} />
        <InstagramEmbed postUrl="https://www.instagram.com/p/C8eQVlTgaS_/" title="Jack Hales with Oman Tours" />
      </Reveal>
    </SiteShell>
  );
}
