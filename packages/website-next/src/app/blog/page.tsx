"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import BlogFilterBar from "./components/BlogFilterBar";
import BlogList from "./components/BlogList";
import BlogPagination from "./components/BlogPagination";
import { MagicCard } from "@/components/magicui/magic-card";

const BLOG_API = "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/data/blogData.json";
const PAGE_SIZE = 10;
const TYPE_OPTIONS = [
  { label: "全部", value: "" },
  { label: "编程语言", value: "编程语言" },
  { label: "技术分享", value: "技术分享" },
  { label: "官方文档", value: "官方文档" },
  { label: "会议纪要", value: "会议纪要" },
];

type BlogItem = {
  key: number;
  img?: string;
  title: string;
  time: string;
  author: string;
  type: string;
  tags?: string[];
};

export default function BlogOverview() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(BLOG_API)
      .then((res) => res.json())
      .then((data) => {
        setBlogs(data);
        setLoading(false);
      });
  }, []);

  // 过滤和搜索
  const filteredBlogs = useMemo(() => {
    let result = blogs;
    if (type) {
      result = result.filter((item) => item.type === type);
    }
    if (keyword.trim()) {
      result = result.filter((item) => item.title.includes(keyword.trim()));
    }
    // 按时间逆序排列，若时间相同则按 key 降序排列
    result = result.slice().sort((a, b) => {
      const timeCompare = b.time.localeCompare(a.time);
      if (timeCompare !== 0) return timeCompare;
      return b.key - a.key;
    });
    return result;
  }, [blogs, type, keyword]);

  // 分页
  const total = filteredBlogs.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pagedBlogs = filteredBlogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleClearKeyword() {
    setKeyword("");
  }

  function handleTypeChange(value: string) {
    setType(value);
    setPage(1);
  }

  function handleKeywordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setKeyword(e.target.value);
    setPage(1);
  }

  function handlePrevPage() {
    setPage((p) => Math.max(1, p - 1));
  }
  function handleNextPage() {
    setPage((p) => Math.min(totalPages, p + 1));
  }
  const { theme } = useTheme();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-8 tracking-tight text-center select-none">博客概览</h1>
      {/* 控件区 */}
      <BlogFilterBar
        type={type}
        onTypeChange={handleTypeChange}
        keyword={keyword}
        onKeywordChange={handleKeywordChange}
        onClearKeyword={handleClearKeyword}
        typeOptions={TYPE_OPTIONS}
      />
      {/* 列表区 */}
      {
        (() => {
          let renderListContent;
          if (loading) {
            renderListContent = (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <MagicCard key={i+1} className="rounded-2xl bg-white dark:bg-gray-800 shadow hover:shadow-lg transition border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600">
                    <div className="animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-700 h-36" />
                  </MagicCard>
                ))}
              </div>
            );
          } else if (pagedBlogs.length === 0) {
            renderListContent = (
              <div className="col-span-full text-center text-gray-400 dark:text-gray-500 py-12 text-lg">暂无数据</div>
            );
          } else {
            renderListContent = <BlogList blogs={pagedBlogs} theme={theme} />;
          }
          return renderListContent;
        })()
      }
      {/* 分页 */}
      <BlogPagination
        page={page}
        totalPages={totalPages}
        total={total}
        onPrev={handlePrevPage}
        onNext={handleNextPage}
      />
    </div>
  );
}