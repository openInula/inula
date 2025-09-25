import React from "react";
import Link from "next/link";
import Image from "next/image";
import { compileMdx } from "nextra/compile";
import { MDXRemote } from "nextra/mdx-remote";

const BLOG_API =
  "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/data/blogData.json";
const MD_BASE =
  "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/doc/";

async function getBlogData() {
  const res = await fetch(BLOG_API, { cache: "no-store" });
  if (!res.ok) throw new Error("无法获取博客数据");
  return res.json();
}

async function getBlogMd(slug: string) {
  const url = `${MD_BASE}blog.${slug}.md`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return res.text();
}

// 你可以在这里自定义 mdx 组件
const components = {
  // 例如：MyComponent: () => <div>My Component</div>,
};

interface BlogParams {
  slug: string;
}

interface BlogData {
  key: string | number;
  title: string;
  author: string;
  time: string;
  type: string;
  img?: string;
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<BlogParams>;
}) {
  const resolvedParams = await params;
  const blogs = await getBlogData();
  const blog = blogs.find(
    (b: BlogData) => String(b.key) === resolvedParams.slug
  );
  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
        未找到对应博客
      </div>
    );
  }
  const mdContent = await getBlogMd(resolvedParams.slug);
  if (!mdContent) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
        博客正文加载失败
      </div>
    );
  }
  // 编译 mdx 内容
  const compiled = await compileMdx(mdContent);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center py-8 px-2">
      <article className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 p-6 md:p-10 mb-8 border border-gray-100 dark:border-gray-700">
        {/* 封面图 */}
        {blog.img && (
          <Image
            src={blog.img}
            alt={blog.title}
            width={800}
            height={256}
            className="w-full h-64 object-cover rounded-lg mb-6 shadow dark:shadow-gray-900/20"
          />
        )}
        {/* 标题 */}
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
          {blog.title}
        </h1>
        {/* 作者/时间/类型 */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
          <span>作者：{blog.author}</span>
          <span>发表于：{blog.time}</span>
          <span className="inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-blue-100 dark:border-blue-800">
            {blog.type}
          </span>
        </div>
        {/* 正文 */}
        <div className="prose prose-sm max-w-none dark:prose-invert prose-gray dark:prose-gray-300">
          <MDXRemote compiledSource={compiled} components={components} />
        </div>
      </article>
      <Link
        href="/blog"
        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm transition-colors"
      >
        ← 返回博客列表
      </Link>
    </div>
  );
}
