"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    // 添加类名来隐藏页脚
    document.body.classList.add('hide-footer');
    
    // 组件卸载时移除类名
    return () => {
      document.body.classList.remove('hide-footer');
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#141418] animate-fade-in -mt-30">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-blue-400 mb-4">404 - 未找到页面</h1>
      <p className="mb-8 text-base text-muted-foreground animate-fade-in-slow">你访问的页面不存在或已被移除。</p>
      <Link href="/">
        <button className="cursor-pointer px-6 py-2 rounded-lg bg-blue-400 text-white font-semibold shadow hover:from-pink-600 hover:to-blue-600 transition-colors">
          返回首页
        </button>
      </Link>
    </div>
  );
}
