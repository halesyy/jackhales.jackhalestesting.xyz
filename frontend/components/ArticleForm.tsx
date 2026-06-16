import { Bold, Code2, Heading1, Italic, Save, Send } from "lucide-react";
import { useMemo, useState } from "react";

import type { articleDetail } from "../lib/types";

type articleFormProps = {
  article?: articleDetail;
  onSubmit: (article: articlePayload) => Promise<void>;
};

export type articlePayload = {
  title: string;
  slug: string;
  summary: string;
  bodyMarkdown: string;
  publishedAt: string;
  status: "draft" | "published";
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isoFromInput(value: string): string {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

export function ArticleForm({ article, onSubmit }: articleFormProps) {
  const [title, setTitle] = useState(article?.title || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [summary, setSummary] = useState(article?.summary || "");
  const [bodyMarkdown, setBodyMarkdown] = useState(article?.bodyMarkdown || "");
  const [publishedAt, setPublishedAt] = useState(article?.publishedAt.slice(0, 10) || new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<"draft" | "published">(article?.status || "draft");
  const [saving, setSaving] = useState(false);

  const computedSlug = useMemo(() => slug || slugify(title), [slug, title]);

  function insertToken(before: string, after = "") {
    const textarea = document.querySelector<HTMLTextAreaElement>("#bodyMarkdown");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = bodyMarkdown.slice(start, end);
    const next = `${bodyMarkdown.slice(0, start)}${before}${selected}${after}${bodyMarkdown.slice(end)}`;
    setBodyMarkdown(next);
    requestAnimationFrame(() => textarea.focus());
  }

  async function submit(nextStatus?: "draft" | "published") {
    setSaving(true);
    try {
      await onSubmit({
        title,
        slug: computedSlug,
        summary,
        bodyMarkdown,
        publishedAt: isoFromInput(publishedAt),
        status: nextStatus || status,
      });
      setStatus(nextStatus || status);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Title
          <input className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-base outline-none focus:border-neutral-950" value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="text-sm font-medium">
          Slug
          <input className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-base outline-none focus:border-neutral-950" value={computedSlug} onChange={(event) => setSlug(slugify(event.target.value))} />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Summary
        <textarea className="mt-1 min-h-20 w-full border border-neutral-300 bg-white px-3 py-2 text-base outline-none focus:border-neutral-950" value={summary} onChange={(event) => setSummary(event.target.value)} />
      </label>
      <div className="flex flex-wrap items-center gap-2 border border-neutral-200 bg-white p-2">
        <button type="button" title="Heading" className="border border-neutral-200 p-2 hover:bg-neutral-100" onClick={() => insertToken("\n## ")}>
          <Heading1 size={18} />
        </button>
        <button type="button" title="Bold" className="border border-neutral-200 p-2 hover:bg-neutral-100" onClick={() => insertToken("**", "**")}>
          <Bold size={18} />
        </button>
        <button type="button" title="Italic" className="border border-neutral-200 p-2 hover:bg-neutral-100" onClick={() => insertToken("_", "_")}>
          <Italic size={18} />
        </button>
        <button type="button" title="HTML embed" className="border border-neutral-200 p-2 hover:bg-neutral-100" onClick={() => insertToken("\n<div>\n", "\n</div>\n")}>
          <Code2 size={18} />
        </button>
      </div>
      <label className="block text-sm font-medium">
        Body
        <textarea id="bodyMarkdown" className="mt-1 min-h-[360px] w-full border border-neutral-300 bg-white px-3 py-2 font-mono text-sm leading-6 outline-none focus:border-neutral-950" value={bodyMarkdown} onChange={(event) => setBodyMarkdown(event.target.value)} />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-sm font-medium">
          Date
          <input type="date" className="ml-3 border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-neutral-950" value={publishedAt} onChange={(event) => setPublishedAt(event.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={status === "published"} onChange={(event) => setStatus(event.target.checked ? "published" : "draft")} />
          Published
        </label>
        <div className="flex gap-2">
          <button type="button" className="inline-flex items-center gap-2 border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-100 disabled:opacity-50" disabled={saving} onClick={() => submit("draft")}>
            <Save size={16} /> Save
          </button>
          <button type="button" className="inline-flex items-center gap-2 bg-neutral-950 px-3 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-50" disabled={saving} onClick={() => submit("published")}>
            <Send size={16} /> Publish
          </button>
        </div>
      </div>
    </div>
  );
}

