"use client";

import dynamic from "next/dynamic";

const Main = dynamic(() => import("@/components/HomePage/Main"))
const ApiComparison = dynamic(() => import("@/components/HomePage/ApiComparison"))
const FeatureCard = dynamic(() => import("@/components/HomePage/FeatureCard"))
const PerformanceComparison = dynamic(() => import("@/components/HomePage/PerformanceComparison"))
const Activity = dynamic(() => import("@/components/HomePage/ActivityArea/Activity"))

export default function Home() {
  return (
      <div className="relative pb-10">
          {/* 局部渐变背景 */}
          <div className="absolute h-full inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-900/20 dark:via-transparent dark:to-purple-900/20 pointer-events-none"></div>
          <Main />
          <FeatureCard />
          <PerformanceComparison />
          <ApiComparison />
          <Activity />
      </div>
  );
}
