"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import DropdownMenu from "./NavComponents/DropdownMenu";
import ThemeToggle from "@/components/HomePage/NavComponents/ThemeSwitch/ThemeToggle";

// 懒加载搜索组件
const CustomSearch = dynamic(
  () => import("@/components/HomePage/NavComponents/CustomSearch"),
  {
    loading: () => <p>Loading...</p>,
  }
);

const navItems = [
  { name: "首页", href: "/" },
  {
    name: "教程",
    href: "/docs", // 默认跳转到响应式API
    dropdown: [
      { name: "响应式API", href: "/docs" },
      { name: "传统API", href: "/docs/conventional/UserInstruction" },
      { name: "交互式教程", href: "/playground/basic" },
    ],
  },
  { name: "API文档", href: "/api" },
  { name: "示例", href: "/examples" },
  {
    name: "生态系统",
    href: "/resources",
    dropdown: [
      { name: "官方组件", href: "/api" },
      { name: "课程", href: "/project" },
    ],
  },
  { name: "资讯", href: "/information" },
  { name: "博客", href: "/blog" },
  {
    name: "关于",
    href: "/about",
    dropdown: [
      { name: "贡献", href: "/contribute" },
      { name: "隐私政策", href: "/privacy" },
      { name: "联系我们", href: "/contact" },
    ],
  },
];

export default function Nav() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    updateDarkMode(); // 初始化一次

    const observer = new MutationObserver(() => {
      updateDarkMode();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"], // 只观察 class 属性
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full h-16 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 shadow-sm xl:pl-28 tracking-wide transition-all duration-300">
      <div className="flex items-center justify-between h-full px-8">
        {/* 左侧：Logo 和导航项 */}
        <div className="flex items-center gap-8">
          <div className="mr-10">
            <Link href="/">
              <Image
                src={isDark ? "/navlogowhite.png" : "/navlogo.png"}
                alt="logo"
                width={125}
                height={64}
                className="scale-120"
                priority // 优先加载logo
              />
            </Link>
          </div>

          <ul className="flex gap-8 m-0 list-none text-sm items-center">
            {navItems.map((item) => (
              <li
                key={item.href}
                className="pt-1 relative"
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {item.dropdown ? (
                  <DropdownMenu
                    name={item.name}
                    href={item.href}
                    dropdown={item.dropdown}
                    isActive={pathname === item.href}
                    isHovered={hoveredItem === item.href}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                  />
                ) : (
                  <a
                    href={item.href}
                    className={`no-underline truncate whitespace-nowrap px-1 py-1 rounded-md transition-colors duration-200 ${
                      pathname === item.href
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {item.name}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* 右侧：搜索栏和主题切换 */}
        <div className="flex items-center gap-4">
          <CustomSearch />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
