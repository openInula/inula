"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import PlaygroundSidebar from "../components/PlaygroundSidebar";
import PlaygroundContent from "../components/PlaygroundContent";
import TeachContent from "../components/TeachContent";
import { PlaygroundItem } from "../../../../index";
import { playgroundData } from "../data/playgroundData";

export default function PlaygroundSlugPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<PlaygroundItem | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const slug = params.slug as string;
    const item = playgroundData.find((item) => item.slug === slug);

    if (item) {
      setSelectedItem(item);
    } else {
      // 如果找不到对应的项目，重定向到第一个教程
      router.push("/playground/basic");
    }
  }, [params.slug, router]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  return (
    <div className="bg-gray-50 dark:bg-[#141418] flex">
      <div className="">
        <PlaygroundSidebar
          playgroundData={playgroundData}
          selectedItem={selectedItem}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex h-full">
          <TeachContent data={selectedItem?.content} />
          <PlaygroundContent selectedItem={selectedItem} />
        </div>
      </div>
    </div>
  );
}
