'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function ContactPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        {/* 页面标题 */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            联系我们
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            了解 openInula 项目理念，与我们建立联系
          </p>
        </div>

        <div className="space-y-20">
          {/* 项目理念板块 */}
          <section className={`relative transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                  项目理念
                </h2>
                
                <div>
                  {/* 左上角图片 */}
                  <div className="top-12 left-12 z-10 absolute">
                    <div className="rounded-2xl">
                      <Image
                        src="/favicon.ico"
                        alt="OpenInula Logo"
                        width={50}
                        height={50}
                        className=" object-cover transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 opacity-0  transition-opacity duration-300" />
                    </div>
                  </div>

                  {/* 居中内容 */}
                  <div className="max-w-4xl mx-auto space-y-8">
                    {/* 项目介绍 */}
                    <div className="space-y-4">
                      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        项目介绍
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                        openInula是一款用于构建用户界面的JavaScript库，提供响应式API并完全兼容现有React生态，凭借高性能、易用性以及对React生态的兼容，帮助开发者简单高效构建高质量的前端项目。此外，openInula涵盖了一系列核心组件，包含状态管理器、路由、国际化、请求组件等；并提供应用脚手架等开发工具，以便开发者更高效地管理和维护基于openInula的前端产品。我们期待openInula能提升现代Web前端开发体验，为全球开发者提供全新选择。
                      </p>
                    </div>

                    {/* 历史发展 */}
                    <div className="space-y-4">
                      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        历史发展
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-300">
                              <span className="font-semibold text-gray-900 dark:text-white">2023年7月</span> - openInula在全球开源技术峰会首秀。
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4">
                          <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-300">
                              <span className="font-semibold text-gray-900 dark:text-white">2023年9月22日</span> - 项目首发开源。开源后命名为openInula。
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4">
                          <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-300">
                              <span className="font-semibold text-gray-900 dark:text-white">组织仓库</span>
                            </p>
                            <a 
                              href="https://gitee.com/openinula" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                            >
                              openInula仓库地址：https://gitee.com/openinula
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 联系我们板块 */}
          <section className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
                  联系我们
                </h2>
                
                <div className="space-y-12">
                  {/* 上方地图 */}
                  <div className="flex justify-center">
                    <div className="relative group max-w-4xl">
                      <div className="relative overflow-hidden rounded-2xl shadow-lg">
                        <Image
                          src="/ContactUsPage/map.png"
                          alt="联系我们地图"
                          width={800}
                          height={600}
                          className="w-[800px] h-auto transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                  </div>

                  {/* 下方联系方式 */}
                  <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* 邮箱联系 */}
                    <div className="group p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-0.5">
                            邮箱联系
                          </h3>
                          <a 
                            href="mailto:team@inulajs.org"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 text-base"
                          >
                            team@inulajs.org
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* 微信公众号 */}
                    <div className="group p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-0.5">
                            微信公众号
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            扫描二维码关注我们
                          </p>
                        </div>
                        <div className="relative group/qr">
                          <Image
                            src="/ContactUsPage/img.png"
                            alt="微信公众号二维码"
                            width={60}
                            height={60}
                            className="rounded-lg transition-transform duration-300 group-hover/qr:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover/qr:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">扫码关注</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
