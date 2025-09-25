import React from "react";
import { Select } from "antd";

interface BlogFilterBarProps {
  type: string;
  onTypeChange: (value: string) => void;
  keyword: string;
  onKeywordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearKeyword: () => void;
  typeOptions: { label: string; value: string }[];
}

export default function BlogFilterBar({
  type,
  onTypeChange,
  keyword,
  onKeywordChange,
  onClearKeyword,
  typeOptions,
}: Readonly<BlogFilterBarProps>) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 justify-between">
      {/* 类型筛选 */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500 dark:text-gray-400 text-sm">类型</span>
        <Select
          className="appearance-none border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 focus:outline-none transition text-gray-900 dark:text-gray-100"
          value={type}
          options={typeOptions}
          onChange={onTypeChange}
          style={{ minWidth: 120 }}
        />
      </div>
      {/* 搜索栏 */}
      <div className="relative flex-1 max-w-md mx-auto md:mx-0">
        <input
          className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 focus:outline-none transition pr-8 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="搜索话题关键字..."
          value={keyword}
          onChange={onKeywordChange}
        />
        {keyword && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-lg font-bold transition-colors"
            onClick={onClearKeyword}
            aria-label="清除关键词"
            type="button"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
} 