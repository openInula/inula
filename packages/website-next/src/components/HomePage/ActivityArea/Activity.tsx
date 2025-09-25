import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { ActivityProps, NewsItem, ActivityItem } from "@/../index";

export default function Activity({}: ActivityProps) {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [activityList, setActivityList] = useState<ActivityItem[]>([]);
  const [activeTab, setActiveTab] = useState<"news" | "activity">("news");

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(
      "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/data/newsData.json"
    )
      .then((res) => res.json())
      .then((res) =>
        res.sort(
          (a: NewsItem, b: NewsItem) =>
            new Date(b.time).getTime() - new Date(a.time).getTime()
        )
      )
      .then((res) => setNewsList(res.slice(0, 3)));
    fetch(
      "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/data/activityData.json"
    )
      .then((res) => res.json())
      .then((res) =>
        res.sort(
          (a: ActivityItem, b: ActivityItem) =>
            new Date(b.beginTime).getTime() - new Date(a.beginTime).getTime()
        )
      )
      .then((res) => setActivityList(res.slice(0, 3)));
  }, []);

  const renderNewsItem = (item: NewsItem) => (
    <div
      key={item.key}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col"
    >
      <div className="aspect-video overflow-hidden">
        <Image
          src={`https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/img/${item.img}`}
          alt={item.title}
          width={500}
          height={500}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
          {item.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {item.introduce}
        </p>
        <div className="mt-auto flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {item.time}
          </span>
          <Link
            href={"/information"}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
          >
            阅读更多 →
          </Link>
        </div>
      </div>
    </div>
  );

  const renderActivityItem = (item: ActivityItem) => (
    <div
      key={item.key}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col"
    >
      <div className="aspect-video overflow-hidden">
        <Image
          src={`https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/img/${item.img}`}
          alt={item.name}
          width={500}
          height={500}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {item.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {item.introduce}
        </p>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="mr-2">📅</span>
            <span>
              {item.beginTime} - {item.endTime}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="mr-2">📍</span>
            <span>{item.type}</span>
          </div>
        </div>
        <div className="mt-auto relative">
          <Link
            href={"/information"}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
          >
            了解更多 →
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      {/* Tab 切换 */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
          <button
            onClick={() => setActiveTab("news")}
            className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
              activeTab === "news"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            新闻资讯
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
              activeTab === "activity"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            活动动态
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="min-h-[400px]">
        {activeTab === "news" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsList.map(renderNewsItem)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activityList.map(renderActivityItem)}
          </div>
        )}
      </div>
    </div>
  );
}
