import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

type markdownContentProps = {
  markdown: string;
};

function localizeArticleLink(href?: string): string | undefined {
  if (!href) return href;
  return href.replace(/^https?:\/\/(?:www\.)?jackhales\.com(?=\/|$)/i, "") || "/";
}

const components: Components = {
  a: ({ href, children, ...props }) => {
    const localizedHref = localizeArticleLink(href);
    const external = localizedHref?.startsWith("http");
    return (
      <a href={localizedHref} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} {...props}>
        {children}
      </a>
    );
  },
  img: ({ alt, ...props }) => (
    <img alt={alt || ""} loading="lazy" decoding="async" {...props} />
  ),
};

export function MarkdownContent({ markdown }: markdownContentProps) {
  return (
    <article className="prose">
      <ReactMarkdown components={components} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
