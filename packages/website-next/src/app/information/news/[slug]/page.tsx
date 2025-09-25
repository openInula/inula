import React from "react";
import MDXDetailPage from "@/components/MDXDetailPage";

const DOC_BASE =
  "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/doc/";
const NEWS_API =
  "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/data/newsData.json";

interface NewsParams {
  slug: string;
}

interface NewsItem {
  key: string | number;
}

async function fetchNewsMd(slug: string) {
  const url = `${DOC_BASE}news${slug}.md`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return res.text();
}

async function fetchNewsItem(slug: string) {
  const res = await fetch(NEWS_API, { cache: "no-store" });
  if (!res.ok) return null;
  const list = await res.json();
  return list.find((n: NewsItem) => String(n.key) === String(slug)) || null;
}

export default async function NewsPage({
  params,
}: {
  params: Promise<NewsParams>;
}) {
  const resolvedParams = await params;
  const mdContent = await fetchNewsMd(resolvedParams.slug);

  if (!mdContent) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
        博客正文加载失败
      </div>
    );
  }

  return <MDXDetailPage mdContent={mdContent} backHref="/information" />;
}
