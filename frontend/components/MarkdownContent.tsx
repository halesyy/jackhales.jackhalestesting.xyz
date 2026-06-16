import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

type markdownContentProps = {
  markdown: string;
};

export function MarkdownContent({ markdown }: markdownContentProps) {
  return (
    <article className="prose prose-neutral max-w-none prose-a:text-blue-700 prose-img:rounded-sm prose-img:border prose-img:border-neutral-200">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {markdown}
      </ReactMarkdown>
    </article>
  );
}

