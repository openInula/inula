import Link from "next/link";
import Image from "next/image";

const courses = [
  {
    id: 1,
    label: "openInula",
    img: "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/img/course.inula.1.png",
    title: "openInula基础01-整体介绍",
    desc: "一款支持响应式渲染的前端框架，在无缝支持React生态的基础上，新增了高性能响应式渲染API。",
    time: "9 min",
    teacher: "陈超涛",
    avatar:
      "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/img/avatar1.png",
  },
  {
    id: 5,
    label: "openInula",
    img: "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/img/course.inula.2.png",
    title: "openInula基础02-传统API",
    desc: "openInula的传统Hooks API，基于虚拟DOM技术。使用传统 API 可以无缝将 React 项目切换至 openInula",
    time: "14 min",
    teacher: "王瑜",
    avatar: null,
  },
  {
    id: 6,
    label: "openInula",
    img: "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/img/course.inula.3.png",
    title: "openInula基础03-请求组件",
    desc: "inula-request 是 openInula 生态组件，涵盖常见的网络请求方式，并提供动态轮询钩子函数给用户更便捷的定制化请求体验。",
    time: "14 min",
    teacher: "涂旭辉",
    avatar: null,
  },
  {
    id: 7,
    label: "openInula",
    img: "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/img/course.inula.4.png",
    title: "openInula课程04-国际化组件",
    desc: "inula-intl 是基于 openInula 生态组件，其主要提供了国际化功能，涵盖了基本的国际化组件和钩子函数，便于用户在构建国际化能力时方便操作。",
    time: "9 min",
    teacher: "王瑜",
    avatar: null,
  },
  {
    id: 8,
    label: "openInula",
    img: "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/img/course.inula.5.png",
    title: "openInula课程05-路由",
    desc: "inula-router 为 openInula 提供前端路由的能力，是构建大型应用必要组件，各类BrowserRouter、Switch、Route等组件与函数API。",
    time: "8 min",
    teacher: "黄轩",
    avatar: null,
  },
  {
    id: 2,
    label: "低代码",
    img: "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/img/project2.jpg",
    title: "低代码的前世今生",
    desc: "LowCode-Engine是阿里前端委员会与钉钉宜搭的联合杰作，使用这款引擎，用户可以便捷地定制出符合自己业务需求地低代码平台。",
    time: "13 min",
    teacher: "刘菊萍",
    avatar:
      "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/img/avatar2.png",
  },
  {
    id: 3,
    label: "Taro",
    img: "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/img/project3.jpg",
    title: "Taro框架设计原理与演进",
    desc: "Taro是一款开源的跨平台框架解决方案，支持React、Vue等流行框架来开发微信小程序、H5、RN等应用。",
    time: "22 min",
    teacher: "陈嘉健",
    avatar:
      "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/img/avatar3.png",
  },
  {
    id: 4,
    label: "ice.js",
    img: "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/img/project4.jpg",
    title: "体验优先的ice.js研发框架",
    desc: "飞冰是基于React打造的前端开源解决方案，围绕应用研发框架构建了全面的基础功能。",
    time: "32 min",
    teacher: "夏温武",
    avatar:
      "https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/img/avatar4.png",
  },
];

export default function ProjectList() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#141418] dark:to-[#23232a] py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-extrabold mb-10 text-gray-800 dark:text-foreground tracking-tight">
          课程列表
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Link
              href={`/project/${course.id}`}
              key={course.id}
              className="group block rounded-2xl bg-white dark:bg-card shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-800 overflow-hidden relative hover:-translate-y-1 focus:ring-2 focus:ring-blue-400"
            >
              <div className="flex flex-col h-full">
                <div className="relative">
                  <Image
                    src={course.img}
                    alt={course.title}
                    width={400}
                    height={225}
                    className="w-full aspect-[16/9] object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full shadow-sm courseTopLabel">
                    {course.label}
                  </span>
                </div>
                <div className="flex-1 flex flex-col px-5 pt-4 pb-2">
                  <p className="text-lg font-semibold mb-1 text-gray-900 dark:text-foreground courseBottomTitle line-clamp-2">
                    {course.title}
                  </p>
                  <p className="text-gray-500 dark:text-muted-foreground text-sm mb-3 courseBottomText line-clamp-2">
                    {course.desc}
                  </p>
                </div>
                <div className="flex items-center justify-between px-5 pb-4 pt-2 courseDetail border-t border-gray-50 dark:border-gray-800 mt-auto">
                  <div className="flex items-center detailLeft">
                    <span className="inline-block w-6 h-6 mr-1">
                      <Image
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAvdJREFUSEvFlU+I1VUUxz/n6vCSJlBI3u9ex2kWszDBNtEfaGEFRaRghSHawkIqaKNkkmIagagLLTJcFIEuFEIx+kOoCFpUC6FIRBqKoSD73XMh2gRTzEyvE3d4I29+895vpBB/mwv3d879nHvuOd8j3OBPbvD51AIGBwcXTU5OrjKz1SLyCDDfObdSRH5ptVrvmdll59yRGOPVXoH2ArgQwivAHjPrA74GvgWeBC6Oj49vajQa54G7gT9E5MUY4wfdIN0Afd77k8AaEbkIbI0xZgDe+8/zqqoP5jWE8ICZvZ1BZvZOSmkL8E8naBagffhaM9uWUjoI2LRDFdDenxdC2GVmrwMfquraTp8ZgKIoNorIURHZHGM8VL1yD8CUmfd+O7BPRJ6PMb4/7XsN0Gw2b3XO/QR8p6qPdctnHaAN+QZYoqpLgb/z3jVAURQvichhYLmqjvwXQLPZXO2c+9TM1qWUTswAeO8/Axar6r29Sm6uG+SAvfcJOKOqG6uAX4FTqrr5fwDyW5wC7lTV5VXAX8BBVX1tDsACVb2vxuYt4FlVXVQF5IZ5N8a4rZdzCOFVM9sP7FXVnT3eKZf2JlVdWAXkh80VtKFOn7z3e4EdInKgWzAhhBNmllO0ogo4LiIPxRiXdDZKjyj3ADvN7LmU0tEOm/ne+9+Ak6r6QhXwDHDMzB5PKZ2uu0VbJp4Qke/Lsvxx2jaEsMHMjpvZwymlCzMAAwMDC1qtVk7T76p6T1VTrgN4u5ldAa62/adcZkiF9/5R4CzwpqpunevQ6f/Dw8ONsbGxcyJyP5DTPCWOswB5w3ufqyPn+JCqvgy06kAhhKVm9jGwQkSejjF+1GnfdR4URbFbRN4AfjCzXf39/Z+Mjo6OV0B9RVGsF5EpUTSzNSmlL6rB9JxoRVGsyn2RxQv4E/gSGBGRLGLLzGwlcFvufufclrIssxLM+mpH5tDQ0C0TExNP5coSkbvM7A6gAfwMfOWcO1yW5aW6FN7coX+9VVRn9y8qf0soaRLoYAAAAABJRU5ErkJggg=="
                        alt="time icon"
                        width={24}
                        height={24}
                        className="w-6 h-6 detailLeftImg"
                      />
                    </span>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground detailLeftTime">
                      {course.time}
                    </p>
                  </div>
                  <div className="flex items-center detailRight">
                    <p className="text-xs text-gray-700 dark:text-foreground font-medium mr-2 detailRightName">
                      {course.teacher}
                    </p>
                    {course.avatar ? (
                      <span className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-100 dark:border-blue-900 shadow-sm inline-block">
                        <Image
                          src={course.avatar}
                          alt="avatar"
                          width={40}
                          height={40}
                          className="w-10 h-10 object-cover"
                        />
                      </span>
                    ) : (
                      <span className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400 border-2 border-gray-100 dark:border-gray-800">
                        <svg
                          viewBox="64 64 896 896"
                          focusable="false"
                          data-icon="user"
                          width="22"
                          height="22"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 008-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"></path>
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
