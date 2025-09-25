"use client"

import {useEffect, useState} from "react";
import Image from "next/image";
import LoadMoreSection from "./LoadMoreSection";
import { ActivityItem, NewsItem } from "@/../index";
import Link from "next/link";

export default function InformationPage() {
    const [newsList, setNewsList] = useState<NewsItem[]>([]);
    const [activityList, setActivityList] = useState<ActivityItem[]>([]);
    

    useEffect(() => {
        window.scrollTo(0, 0);
        fetch('https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/data/newsData.json')
            .then(res => res.json())
            .then(res => res.sort((a: NewsItem, b: NewsItem) => new Date(b.time).getTime() - new Date(a.time).getTime()))
            .then(res => setNewsList(res));
        fetch('https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/data/activityData.json')
            .then(res => res.json())
            .then(res => res.sort((a: ActivityItem, b: ActivityItem) => new Date(b.beginTime).getTime() - new Date(a.beginTime).getTime()))
            .then(res => setActivityList(res));
    }, []);
    console.log(newsList, activityList);

    const renderNewsItem = (item: NewsItem) => (
        <Link href={`/information/news/${item.key}`} key={item.key} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full flex">
            <div className="aspect-video overflow-hidden">
                <Image
                    src={`https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/img/${item.img}`}
                    alt={item.title}
                    width={200}
                    height={200}
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
                </div>
            </div>
        </Link>
    );

    const renderActivityItem = (item: ActivityItem) => (
        <Link href={`/information/activity/${item.key}`} key={item.key} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full flex">
            <div className="aspect-video overflow-hidden">
                <Image
                    src={`https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/img/${item.img}`}
                    alt={item.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
            </div>
            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                    {item.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {item.introduce}
                </p>
                <div className="mt-auto flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>{item.beginTime} - {item.endTime}</span>
                    <span>{item.type}</span>
                </div>
            </div>
        </Link>
    );

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="max-w-6xl px-4 py-10 flex flex-col gap-10">
                <LoadMoreSection
                    title="新闻资讯"
                    items={newsList}
                    renderItem={renderNewsItem}
                    initialCount={4}
                    step={6}
                />

                <LoadMoreSection
                    title="活动动态"
                    items={activityList}
                    renderItem={renderActivityItem}
                    initialCount={4}
                    step={6}
                />
            </div>
        </div>
    );
}