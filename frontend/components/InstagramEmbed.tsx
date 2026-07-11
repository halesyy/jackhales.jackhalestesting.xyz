import { ExternalLink, Instagram } from "lucide-react";

type instagramEmbedProps = {
  postUrl: string;
  title: string;
};

export function InstagramEmbed({ postUrl, title }: instagramEmbedProps) {
  const embedUrl = `${postUrl.replace(/\/$/, "")}/embed`;

  return (
    <aside className="instagram-embed" aria-label={title}>
      <div className="instagram-embed-header">
        <span><Instagram size={18} /> Instagram</span>
        <a href={postUrl} target="_blank" rel="noreferrer">
          Open post <ExternalLink size={14} />
        </a>
      </div>
      <iframe src={embedUrl} title={title} loading="lazy" scrolling="no" />
      <noscript>
        <a href={postUrl} target="_blank" rel="noreferrer">View this post on Instagram</a>
      </noscript>
    </aside>
  );
}
