import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PlaygroundItem, PlaygroundSidebarProps } from "../../../../index";

export default function PlaygroundSidebar({
  playgroundData,
  selectedItem,
  isCollapsed,
  onToggleCollapse,
}: Readonly<PlaygroundSidebarProps>) {
  // 按类别分组数据
  const groupedData = playgroundData.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PlaygroundItem[]>);

  // 获取所有类别
  const categories = Object.keys(groupedData);

  return (
    <aside
      className={`h-[calc(100vh-4rem)] flex flex-col bg-white/90 dark:bg-[#141418] border-r border-gray-100 dark:border-gray-800 shadow-sm py-6 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h3 className="text-base font-bold text-gray-700 dark:text-foreground">
              教程目录
            </h3>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1e] transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
        </div>
        {!isCollapsed && (
          <span className="text-xs text-gray-500 dark:text-muted-foreground bg-gray-100 dark:bg-[#1a1a1e] px-2 py-1 rounded-full">
            {playgroundData.length} 个示例
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-scroll px-4 space-y-4">
        {categories.map((category, categoryIndex) => (
          <div key={category} className="space-y-2">
            {/* 类别标签 */}
            {!isCollapsed && (
              <div className="space-y-2 truncate">
                <h4 className="text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                  {category}
                </h4>
                <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
              </div>
            )}

            {/* 该类别下的所有项目（支持子分类） */}
            <div className="space-y-2">
              {(() => {
                const items = groupedData[category];
                const hasSubcategory = items.some((i) => i.subcategory);
                if (!hasSubcategory) {
                  return items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/playground/${item.slug || ""}`}
                      className={`block cursor-pointer rounded-lg p-3 transition-all duration-200 border ${
                        selectedItem?.id === item.id
                          ? " border-blue-200 dark:border-blue-700"
                          : " border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#1a1a1e]"
                      }`}
                    >
                      {!isCollapsed ? (
                        <>
                          <div className="flex items-start justify-between mb-2">
                            <h4
                              className={`font-medium text-sm ${
                                selectedItem?.id === item.id
                                  ? "text-blue-700 dark:text-blue-300"
                                  : "text-gray-700 dark:text-foreground"
                              }`}
                            >
                              {item.title}
                            </h4>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        </>
                      ) : (
                        <div className="flex justify-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        </div>
                      )}
                    </Link>
                  ));
                }

                // 有子分类时，按子分类分组
                const subGrouped = items.reduce(
                  (acc: Record<string, PlaygroundItem[]>, cur) => {
                    const key = cur.subcategory || "其他";
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(cur);
                    return acc;
                  },
                  {}
                );

                const subKeys = Object.keys(subGrouped);
                return subKeys.map((sub) => (
                  <div key={sub} className="space-y-2">
                    {!isCollapsed && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-1 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
                        <h5 className="text-[11px] font-medium text-gray-500 dark:text-muted-foreground tracking-wide">
                          {sub}
                        </h5>
                      </div>
                    )}
                    {subGrouped[sub].map((item) => (
                      <Link
                        key={item.id}
                        href={`/playground/${item.slug || ""}`}
                        className={`block cursor-pointer rounded-lg p-3 transition-all duration-200 border ${
                          selectedItem?.id === item.id
                            ? " border-blue-200 dark:border-blue-700"
                            : " border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#1a1a1e]"
                        }`}
                      >
                        {!isCollapsed ? (
                          <>
                            <div className="flex items-start justify-between mb-2">
                              <h4
                                className={`font-medium text-sm ${
                                  selectedItem?.id === item.id
                                    ? "text-blue-700 dark:text-blue-300"
                                    : "text-gray-700 dark:text-foreground"
                                }`}
                              >
                                {item.title}
                              </h4>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-muted-foreground leading-relaxed">
                              {item.description}
                            </p>
                          </>
                        ) : (
                          <div className="flex justify-center">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                ));
              })()}
            </div>

            {/* 类别之间的分割线（除了最后一个类别） */}
            {!isCollapsed && categoryIndex < categories.length - 1 && (
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-4"></div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
