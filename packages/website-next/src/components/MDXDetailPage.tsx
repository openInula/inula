import React from "react";
import { compileMdx } from "nextra/compile";
import { MDXRemote } from "nextra/mdx-remote";

interface MDXDetailPageProps {
  mdContent: string;
  header?: React.ReactNode;
  backHref?: string;
}

export default async function MDXDetailPage({ mdContent, header, backHref }: MDXDetailPageProps) {
  const compiled = await compileMdx(mdContent);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center py-8 px-2">
      <article className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 p-6 md:p-10 mb-8 border border-gray-100 dark:border-gray-700">
        {header}
        <div className="prose prose-sm max-w-none dark:prose-invert prose-gray dark:prose-gray-300">
          <MDXRemote compiledSource={compiled} />
        </div>
      </article>
      {backHref && (
        <a href={backHref} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm transition-colors">← 返回</a>
      )}
    </div>
  );
}


