import { ArrowLeft, Clock3, FilePenLine, Files, FileText, LogOut, Plus } from "lucide-react";
import Head from "next/head";
import { useEffect, useState } from "react";

import { ArticleForm, type articlePayload } from "../components/ArticleForm";
import { SiteShell } from "../components/SiteShell";
import { adminFetch } from "../lib/api";
import { formatDate } from "../lib/date";
import type { adminStatus, articleDetail, articleSummary } from "../lib/types";

type adminView = "library" | "new" | "edit";

export default function AdminPage() {
  const [status, setStatus] = useState<adminStatus | null>(null);
  const [pin, setPin] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [articles, setArticles] = useState<articleSummary[]>([]);
  const [editing, setEditing] = useState<articleDetail | undefined>();
  const [view, setView] = useState<adminView>("library");
  const [message, setMessage] = useState("");
  const [loadingArticle, setLoadingArticle] = useState(false);

  async function loadArticles() {
    const nextArticles = await adminFetch<articleSummary[]>("/admin/articles");
    setArticles(nextArticles);
    setLoggedIn(true);
  }

  useEffect(() => {
    let active = true;

    async function restoreAdmin() {
      try {
        const nextStatus = await adminFetch<adminStatus>("/admin/status");
        if (!active) return;
        setStatus(nextStatus);

        if (nextStatus.allowedIp && nextStatus.hasPin) {
          try {
            const nextArticles = await adminFetch<articleSummary[]>("/admin/articles");
            if (!active) return;
            setArticles(nextArticles);
            setLoggedIn(true);
          } catch {
            // A PIN exists but the browser has no active session yet.
          }
        }
      } catch {
        if (active) setStatus({ hasPin: true, allowedIp: false });
      }
    }

    restoreAdmin();
    return () => {
      active = false;
    };
  }, []);

  async function submitPin() {
    const endpoint = status?.hasPin ? "/admin/login" : "/admin/bootstrap";
    await adminFetch(endpoint, { method: "POST", body: JSON.stringify({ pin }) });
    setMessage("");
    setPin("");
    await loadArticles();
    setView("library");
  }

  async function editArticle(slug: string) {
    setLoadingArticle(true);
    setMessage("");
    try {
      const article = await adminFetch<articleDetail>(`/admin/articles/${slug}`);
      setEditing(article);
      setView("edit");
    } finally {
      setLoadingArticle(false);
    }
  }

  function newArticle() {
    setEditing(undefined);
    setMessage("");
    setView("new");
  }

  function showLibrary() {
    setEditing(undefined);
    setMessage("");
    setView("library");
  }

  async function saveArticle(payload: articlePayload) {
    if (view === "edit" && editing) {
      const saved = await adminFetch<articleDetail>(`/admin/articles/${editing.slug}`, { method: "PUT", body: JSON.stringify(payload) });
      setEditing(saved);
      setMessage(saved.status === "published" ? "Published article updated." : "Draft updated.");
    } else {
      const saved = await adminFetch<articleDetail>("/admin/articles", { method: "POST", body: JSON.stringify(payload) });
      setEditing(saved);
      setView("edit");
      setMessage(saved.status === "published" ? "Article published." : "Draft created.");
    }
    await loadArticles();
  }

  async function logout() {
    await adminFetch("/admin/logout", { method: "POST" });
    setLoggedIn(false);
    setArticles([]);
    setEditing(undefined);
    setView("library");
  }

  if (!status) {
    return (
      <SiteShell>
        <div className="admin-loading card"><span /> Connecting to the publishing workspace…</div>
      </SiteShell>
    );
  }

  if (!status.allowedIp) {
    return (
      <SiteShell>
        <Head><title>Admin — Jack Hales</title></Head>
        <div className="card p-6 text-sm text-neutral-700">Admin is not available from this IP.</div>
      </SiteShell>
    );
  }

  if (!loggedIn) {
    return (
      <SiteShell>
        <Head><title>Admin — Jack Hales</title></Head>
        <div className="admin-login card">
          <span className="icon-tile icon-blue"><FilePenLine size={21} /></span>
          <p className="eyebrow">Publishing workspace</p>
          <h1>{status.hasPin ? "Welcome back." : "Create your editor PIN."}</h1>
          <p>{status.hasPin ? "Enter your PIN to manage articles and drafts." : "Use at least six characters. This PIN protects the article editor."}</p>
          <label>
            <span>PIN</span>
            <input type="password" autoComplete="current-password" value={pin} onChange={(event) => setPin(event.target.value)} onKeyDown={(event) => event.key === "Enter" && submitPin().catch((error) => setMessage(error.message))} />
          </label>
          <button className="button button-dark" disabled={pin.length < 6} onClick={() => submitPin().catch((error) => setMessage(error.message))}>
            {status.hasPin ? "Open workspace" : "Save PIN"}
          </button>
          {message ? <p className="admin-error">{message}</p> : null}
        </div>
      </SiteShell>
    );
  }

  const publishedCount = articles.filter((article) => article.status === "published").length;
  const draftCount = articles.length - publishedCount;

  return (
    <SiteShell>
      <Head><title>Publishing workspace — Jack Hales</title></Head>

      <section className="admin-workspace">
        <header className="admin-heading">
          <div>
            <p className="eyebrow">Publishing workspace</p>
            <h1>{view === "library" ? "Article library" : view === "new" ? "New article" : "Edit article"}</h1>
            <p>{view === "library" ? "Review published work, continue a draft or start something new." : view === "new" ? "Start with a title—the slug will follow automatically." : `Updating ${editing?.title || "article"}.`}</p>
          </div>
          <div className="admin-heading-actions">
            {view === "library" ? (
              <button className="button button-dark" onClick={newArticle}><Plus size={16} /> New article</button>
            ) : (
              <button className="button button-outline" onClick={showLibrary}><ArrowLeft size={16} /> Article library</button>
            )}
            <button className="button button-outline" onClick={logout}><LogOut size={16} /> Logout</button>
          </div>
        </header>

        {view === "library" ? (
          <>
            <div className="admin-stats">
              <div className="admin-stat card"><span className="icon-tile icon-blue"><Files size={19} /></span><div><strong>{articles.length}</strong><small>Total articles</small></div></div>
              <div className="admin-stat card"><span className="icon-tile icon-mint"><FileText size={19} /></span><div><strong>{publishedCount}</strong><small>Published</small></div></div>
              <div className="admin-stat card"><span className="icon-tile icon-peach"><FilePenLine size={19} /></span><div><strong>{draftCount}</strong><small>Drafts</small></div></div>
            </div>

            <div className="article-library card">
              <div className="article-library-heading"><div><h2>All articles</h2><p>Newest publication date first</p></div><span>{loadingArticle ? "Opening article…" : `${articles.length} entries`}</span></div>
              <div className="article-library-list">
                {articles.map((article) => (
                  <button key={article.slug} className="admin-article-row" disabled={loadingArticle} onClick={() => editArticle(article.slug).catch((error) => setMessage(error.message))}>
                    <span className={`article-status article-status-${article.status}`}>{article.status}</span>
                    <span className="admin-article-main"><strong>{article.title}</strong><small>{article.summary || "No summary yet."}</small></span>
                    <span className="admin-article-date"><Clock3 size={13} /> {formatDate(article.publishedAt)}</span>
                    <span className="admin-edit-label">Edit <FilePenLine size={14} /></span>
                  </button>
                ))}
                {!articles.length ? <div className="admin-empty"><FileText size={24} /><p>No articles yet.</p><button className="button button-dark" onClick={newArticle}>Create the first article</button></div> : null}
              </div>
            </div>
            {message ? <div className="admin-toast">{message}</div> : null}
          </>
        ) : (
          <div className="article-editor-shell card">
            {message ? <div className="admin-success">{message}</div> : null}
            <ArticleForm key={editing?.id || "new"} article={editing} mode={view === "new" ? "create" : "edit"} onSubmit={saveArticle} onCancel={showLibrary} />
          </div>
        )}
      </section>
    </SiteShell>
  );
}
