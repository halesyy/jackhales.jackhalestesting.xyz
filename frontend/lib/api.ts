import type { articleDetail, articleSummary } from "./types";

export function apiBaseUrl(): string {
  if (typeof window === "undefined") {
    return process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchArticles(): Promise<articleSummary[]> {
  const response = await fetch(`${apiBaseUrl()}/articles`, { credentials: "include" });
  return parseJson<articleSummary[]>(response);
}

export async function fetchArticle(slug: string): Promise<articleDetail> {
  const response = await fetch(`${apiBaseUrl()}/articles/${slug}`, { credentials: "include" });
  return parseJson<articleDetail>(response);
}

export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    credentials: "include",
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  return parseJson<T>(response);
}

