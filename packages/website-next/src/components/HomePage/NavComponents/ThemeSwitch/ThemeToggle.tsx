"use client";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // 设置cookie的辅助函数
  const setCookie = (name: string, value: string, days = 365) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  useEffect(() => {
    // 检查初始主题
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      // 同时保存到cookie和localStorage
      setCookie("theme", "dark");
      try {
        localStorage.setItem("theme", "dark");
      } catch {
        // localStorage不可用时忽略错误
      }
    } else {
      document.documentElement.classList.remove("dark");
      // 同时保存到cookie和localStorage
      setCookie("theme", "light");
      try {
        localStorage.setItem("theme", "light");
      } catch {
        // localStorage不可用时忽略错误
      }
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 transition-all duration-300 group shadow-sm hover:shadow-md"
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
    >
      <div className="relative w-5 h-5 overflow-hidden">
        <Sun
          className={`absolute inset-0 w-5 h-5 transition-all duration-500 ease-in-out ${
            isDark
              ? "rotate-180 scale-0 opacity-0 text-amber-500"
              : "rotate-0 scale-100 opacity-100 text-amber-500"
          }`}
        />
        <Moon
          className={`absolute inset-0 w-5 h-5 transition-all duration-500 ease-in-out ${
            isDark
              ? "rotate-0 scale-100 opacity-100 text-slate-400"
              : "-rotate-180 scale-0 opacity-0 text-slate-400"
          }`}
        />
      </div>

      {/* 悬停时的光晕效果 */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-all duration-300" />

      {/* 点击时的波纹效果 */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/20 to-blue-400/20 opacity-0 group-active:opacity-100 transition-opacity duration-150" />
    </button>
  );
}
