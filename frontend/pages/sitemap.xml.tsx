import type { GetServerSideProps } from "next";

import { apiBaseUrl } from "../lib/api";

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const response = await fetch(`${apiBaseUrl()}/sitemap`);
  const { urls } = (await response.json()) as { urls: string[] };
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${url}</loc></url>`)
    .join("\n")}\n</urlset>`;
  res.setHeader("content-type", "application/xml");
  res.write(xml);
  res.end();
  return { props: {} };
};

export default function Sitemap() {
  return null;
}

