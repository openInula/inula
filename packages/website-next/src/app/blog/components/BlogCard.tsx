import Link from "next/link";
import { MagicCard } from "@/components/magicui/magic-card";
import React from "react";

type BlogItem = {
  key: number;
  img?: string;
  title: string;
  time: string;
  author: string;
  type: string;
  tags?: string[];
};

interface BlogCardProps {
  blog: BlogItem;
  theme: string | undefined;
}

export default function BlogCard({ blog, theme }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${blog.key}`}
      className="block group focus:outline-none"
      style={{ display: 'block' }}
    >
      <MagicCard
        gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
        className="rounded-2xl bg-white dark:bg-gray-800 shadow hover:shadow-lg transition border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 p-0"
      >
        <div className="p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            {blog.img ? (
              <img src={blog.img} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-700" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-300 dark:text-gray-500 text-xl font-bold select-none">B</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-base font-medium text-gray-900 dark:text-gray-100 truncate transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:font-semibold">{blog.title}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500 dark:text-gray-400">{blog.author || "-"}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{blog.type}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {/* 标签区，预留 */}
            <span className="inline-block text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 rounded px-2 py-0.5">标签</span>
            {/* 时间 */}
            <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{blog.time}</span>
          </div>
        </div>
      </MagicCard>
    </Link>
  );
} 