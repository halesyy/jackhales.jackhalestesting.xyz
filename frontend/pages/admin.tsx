import { LogOut, Plus } from "lucide-react";
import Head from "next/head";
import { useEffect, useState } from "react";

import { ArticleForm, type articlePayload } from "../components/ArticleForm";
import { SiteShell } from "../components/SiteShell";
import { adminFetch } from "../lib/api";
import type { adminStatus, articleDetail, articleSummary } from "../lib/types";

export default function AdminPage() {
  const [status, setStatus] = useState<adminStatus | null>(null);
  const [pin, setPin] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [articles, setArticles] = useState<articleSummary[]>([]);
  const [editing, setEditing] = useState<articleDetail | undefined>();
  const [message, setMessage] = useState("");

  async function loadStatus() {
    setStatus(await adminFetch<adminStatus>("/admin/status"));
  }

  async function loadArticles() {
    const nextArticles = await adminFetch<articleSummary[]>("/admin/articles");
    setArticles(nextArticles);
    setLoggedIn(true);
  }

  useEffect(() => {
    loadStatus().catch(() => setStatus({ hasPin: true, allowedIp: false }));
  }, []);

  async function submitPin() {
    const endpoint = status?.hasPin ? "/admin/login" : "/admin/bootstrap";
    await adminFetch(endpoint, { method: "POST", body: JSON.stringify({ pin }) });
    setMessage("");
    await loadStatus();
    await loadArticles();
  }

  async function editArticle(slug: string) {
    setEditing(await adminFetch<articleDetail>(`/admin/articles/${slug}`));
  }

  async function saveArticle(payload: articlePayload) {
    if (editing) {
      const saved = await adminFetch<articleDetail>(`/admin/articles/${editing.slug}`, { method: "PUT", body: JSON.stringify(payload) });
      setEditing(saved);
    } else {
      const saved = await adminFetch<articleDetail>("/admin/articles", { method: "POST", body: JSON.stringify(payload) });
      setEditing(saved);
    }
    setMessage("Saved");
    await loadArticles();
  }

  async function logout() {
    await adminFetch("/admin/logout", { method: "POST" });
    setLoggedIn(false);
    setArticles([]);
  }

  if (!status) {
    return (
      <SiteShell>
        <div className="text-sm text-neutral-500">Loading</div>
      </SiteShell>
    );
  }

  if (!status.allowedIp) {
    return (
      <SiteShell>
        <Head>
          <title>Admin - Jack Hales</title>
        </Head>
        <div className="border border-neutral-200 bg-white p-5 text-sm text-neutral-700">Admin is not available from this IP.</div>
      </SiteShell>
    );
  }

  if (!loggedIn) {
    return (
      <SiteShell>
        <Head>
          <title>Admin - Jack Hales</title>
        </Head>
        <div className="mx-auto max-w-sm border border-neutral-200 bg-white p-5">
          <h1 className="text-xl font-semibold">{status.hasPin ? "Admin" : "Create PIN"}</h1>
          <input type="password" className="mt-4 w-full border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-950" value={pin} onChange={(event) => setPin(event.target.value)} />
          <button className="mt-3 w-full bg-neutral-950 px-3 py-2 text-white hover:bg-neutral-800" onClick={() => submitPin().catch((error) => setMessage(error.message))}>
            {status.hasPin ? "Unlock" : "Save PIN"}
          </button>
          {message ? <p className="mt-3 text-sm text-red-700">{message}</p> : null}
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <Head>
        <title>Admin - Jack Hales</title>
      </Head>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Articles</h1>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-100" onClick={() => setEditing(undefined)}>
            <Plus size={16} /> New
          </button>
          <button className="inline-flex items-center gap-2 border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-100" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-2">
          {articles.map((article) => (
            <button key={article.slug} className="block w-full border border-neutral-200 bg-white px-3 py-2 text-left text-sm hover:border-neutral-950" onClick={() => editArticle(article.slug)}>
              <span className="block font-medium">{article.title}</span>
              <span className="text-xs text-neutral-500">{article.status}</span>
            </button>
          ))}
        </aside>
        <section className="border border-neutral-200 bg-white p-4">
          {message ? <div className="mb-4 text-sm text-green-700">{message}</div> : null}
          <ArticleForm key={editing?.slug || "new"} article={editing} onSubmit={saveArticle} />
        </section>
      </div>
    </SiteShell>
  );
}

