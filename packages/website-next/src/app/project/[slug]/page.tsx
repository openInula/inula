import React from "react";
import Link from "next/link";
import Image from "next/image";

interface Course {
  img: string;
  index: number;
  title: string;
  introduce: string;
  time: number;
  label: string;
  name: string;
  avatar: string;
  url: string;
}

const IMG_BASE =
  "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/img/";
const AVATAR_BASE =
  "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/img/";

async function getCourseData(): Promise<Course[]> {
  const res = await fetch(
    "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/data/courseData.json",
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("无法获取课程数据");
  return res.json();
}

function getFullImgUrl(img: string) {
  if (!img) return "";
  if (img.startsWith("http")) return img;
  return IMG_BASE + img;
}
function getFullAvatarUrl(avatar: string) {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
  return AVATAR_BASE + avatar;
}

interface ProjectParams {
  slug: string;
}

export default async function Page({
  params,
}: {
  params: Promise<ProjectParams>;
}) {
  const resolvedParams = await params;
  const courses = await getCourseData();
  const courseIndex = courses.findIndex(
    (c) => String(c.index) === resolvedParams.slug
  );
  const course = courses[courseIndex];

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl text-gray-500 dark:text-muted-foreground bg-gray-50 dark:bg-[#141418]">
        未找到对应课程
      </div>
    );
  }

  const avatarUrl = getFullAvatarUrl(course.avatar);
  const imgUrl = getFullImgUrl(course.img);
  const videoUrl = course.url;
  const timeStr = course.time ? `${course.time}分钟` : "";

  // 上一个/下一个课程
  const prevCourse = courseIndex > 0 ? courses[courseIndex - 1] : null;
  const nextCourse =
    courseIndex < courses.length - 1 ? courses[courseIndex + 1] : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#141418] flex">
      {/* 侧边栏 */}
      <aside className="hidden md:flex flex-col w-64 bg-white/90 dark:bg-card/80 border-r border-gray-100 dark:border-gray-800 shadow-sm py-6 px-3 gap-2 sticky top-0 h-screen rounded-2xl">
        <h3 className="text-base font-bold text-gray-700 dark:text-foreground mb-3 pl-2">
          课程列表
        </h3>
        <div className="flex-1 overflow-y-auto pr-2">
          {courses.map((item) => (
            <Link
              key={item.index}
              href={`/project/${item.index}`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 mb-1 transition hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
                item.index === course.index
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold"
                  : "text-gray-700 dark:text-foreground"
              }`}
            >
              <Image
                src={getFullImgUrl(item.img)}
                alt={item.title}
                width={32}
                height={32}
                className="w-8 h-8 rounded object-cover border"
              />
              <span className="truncate text-sm">{item.title}</span>
            </Link>
          ))}
        </div>
      </aside>
      {/* 主内容区 */}
      <main className="flex-1 flex flex-col items-center justify-start py-8 px-2 md:px-8">
        <div className="w-full max-w-2xl bg-white dark:bg-card rounded-xl shadow p-4 md:p-6">
          {/* 标题与标签 */}
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-block bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {course.label}
            </span>
            <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-foreground flex-1">
              {course.title}
            </h2>
          </div>
          {/* 讲师与时间 */}
          <div className="flex items-center gap-3 mb-3">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={course.name}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full border border-blue-100 dark:border-blue-900 shadow"
              />
            ) : (
              <span className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-100 dark:border-gray-800">
                <svg
                  viewBox="64 64 896 896"
                  focusable="false"
                  data-icon="user"
                  width="20"
                  height="20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 008-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"></path>
                </svg>
              </span>
            )}
            <span className="text-sm text-gray-700 dark:text-foreground font-medium mr-2">
              {course.name}
            </span>
            <span className="text-xs text-gray-400 dark:text-muted-foreground">
              {timeStr}
            </span>
          </div>
          {/* 简介 */}
          <div className="text-gray-600 dark:text-muted-foreground text-sm mb-3 leading-relaxed">
            {course.introduce}
          </div>
          {/* 视频 */}
          <div className="w-full aspect-video bg-gray-200 dark:bg-gray-800/60 rounded-lg overflow-hidden shadow mb-2">
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-cover"
              poster={imgUrl}
            >
              您的浏览器不支持 video 标签。
            </video>
          </div>
        </div>
        {/* 底部大卡片式切换，连在一起且高度缩小 */}
        <div className="w-full max-w-2xl flex gap-0 mt-5 select-none">
          {prevCourse && (
            <Link
              href={`/project/${prevCourse.index}`}
              className={`flex-1 group relative overflow-hidden shadow hover:shadow-lg transition-all bg-gray-100 dark:bg-gray-800/80 h-24 flex items-end ${
                !nextCourse ? "rounded-2xl" : "rounded-l-2xl"
              }`}
            >
              <Image
                src={getFullImgUrl(prevCourse.img)}
                alt={prevCourse.title}
                width={400}
                height={96}
                className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform transition-filter duration-300 group-hover:scale-105 group-hover:brightness-110 group-hover:contrast-110 group-hover:saturate-110"
              />
              <div className="absolute inset-0 bg-gray-700/30 dark:bg-gray-900/40" />
              <div className="relative z-10 p-3">
                <div className="text-xs text-white/80 mb-0.5">上一个课程</div>
                <div className="text-white text-sm font-bold drop-shadow line-clamp-1">
                  {prevCourse.title}
                </div>
                <div className="text-xs text-white/70 mt-0.5">
                  主讲人: {prevCourse.name}
                </div>
              </div>
            </Link>
          )}
          {nextCourse && (
            <Link
              href={`/project/${nextCourse.index}`}
              className={`flex-1 group relative overflow-hidden shadow hover:shadow-lg transition-all bg-gray-100 dark:bg-gray-800/80 h-24 flex items-end text-right ${
                !prevCourse ? "rounded-2xl" : "rounded-r-2xl"
              }`}
            >
              <Image
                src={getFullImgUrl(nextCourse.img)}
                alt={nextCourse.title}
                width={400}
                height={96}
                className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform transition-filter duration-300 group-hover:scale-105 group-hover:brightness-110 group-hover:contrast-110 group-hover:saturate-110"
              />
              <div className="absolute inset-0 bg-gray-700/30 dark:bg-gray-900/40" />
              <div className="relative z-10 p-3 w-full">
                <div className="text-xs text-white/80 mb-0.5 text-right">
                  下一个课程
                </div>
                <div className="text-white text-sm font-bold drop-shadow line-clamp-1">
                  {nextCourse.title}
                </div>
                <div className="text-xs text-white/70 mt-0.5 text-right">
                  主讲人: {nextCourse.name}
                </div>
              </div>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
