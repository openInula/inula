import React from "react";

interface BlogPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function BlogPagination({ page, totalPages, total, onPrev, onNext }: BlogPaginationProps) {
  return (
    <div className="flex items-center justify-between mt-10 select-none">
      <span className="text-sm text-gray-400 dark:text-gray-500">
        共 {total} 条，{page}/{totalPages || 1} 页
      </span>
      <div className="flex gap-2">
        <button
          className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          onClick={onPrev}
          disabled={page === 1}
        >上一页</button>
        <button
          className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          onClick={onNext}
          disabled={page === totalPages || totalPages === 0}
        >下一页</button>
      </div>
    </div>
  );
} 