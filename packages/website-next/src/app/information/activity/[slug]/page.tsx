import React from "react";
import MDXDetailPage from "@/components/MDXDetailPage";

const DOC_BASE =
  "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/doc/";
const ACTIVITY_API =
  "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/data/activityData.json";

interface ActivityParams {
  slug: string;
}

interface ActivityItem {
  key: string | number;
}

async function fetchActivityMd(slug: string) {
  const url = `${DOC_BASE}activity${slug}.md`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return res.text();
}

async function fetchActivityItem(slug: string) {
  const res = await fetch(ACTIVITY_API, { cache: "no-store" });
  if (!res.ok) return null;
  const list = await res.json();
  return list.find((a: ActivityItem) => String(a.key) === String(slug)) || null;
}

export default async function ActivityPage({
  params,
}: {
  params: Promise<ActivityParams>;
}) {
  const resolvedParams = await params;
  const mdContent = await fetchActivityMd(resolvedParams.slug);

  if (!mdContent) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
        活动正文加载失败
      </div>
    );
  }

  return <MDXDetailPage mdContent={mdContent} backHref="/information" />;
}
