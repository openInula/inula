import React from "react";

interface CodeCardProps {
  title: string;
  subtitle?: string;
  code: string;
}

export default function CodeCard({ title, subtitle, code }: CodeCardProps) {
  return (
    <div className="bg-gray-50 dark:bg-[#141418] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-3">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {title}
        </span>
        {subtitle ? (
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            {subtitle}
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
