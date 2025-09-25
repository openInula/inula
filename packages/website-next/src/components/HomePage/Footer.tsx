"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface Partner {
  name: string;
  logo: string;
  url: string;
}

export default function Footer() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/data/partnerData.json');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPartners(data);
      } catch (err) {
        console.error('获取合作伙伴数据失败:', err);
        // 设置默认数据作为后备
        setPartners([
          { name: "openAtom", logo: "logo.openEuler.svg", url: "https://www.openatom.org/" },
          { name: "openEuler", logo: "logo.openEuler.svg", url: "https://www.openeuler.org/zh/" },
          { name: "openHarmony", logo: "logo.openHarmony.png", url: "https://www.openharmony.cn/" },
          { name: "openTiny", logo: "logo.openTiny.svg", url: "https://opentiny.design/" },
          { name: "Taro", logo: "logo.Taro.png", url: "https://taro.zone/" },
          { name: "Alita", logo: "logo.Alita.png", url: "https://alitajs.com/" },
          { name: "openHiTLS", logo: "logo.openHiTLS.png", url: "https://openhitls.net/zh/" },
          { name: "openFuyao", logo: "logo.openFuyao.png", url: "https://www.openFuyao.cn/zh/" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  return (
    <footer className="w-full bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-t border-gray-200/80 dark:border-gray-700/80 py-14 px-4 pt-24">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-stretch gap-10">
        {/* 合作伙伴大字区 */}
        <div className="flex flex-col justify-start items-center md:w-1/3 w-full translate-y-8">
          <span className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100 tracking-widest text-left select-none">
            合作伙伴
          </span>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
            openInula致力于与各行业合作伙伴携手，打造开源共建共赢的前端生态体系
          </p>
        </div>
        {/* 合作伙伴卡片区 */}
        <div className="flex flex-row flex-wrap gap-6 items-center justify-center md:w-2/3">
          {loading ? (
            <div className="flex items-center justify-center w-full py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
            </div>
          ) : (
            partners.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white/80 rounded-2xl shadow-lg border border-gray-100/60 dark:border-gray-700/60 px-7 py-5 flex flex-col items-center hover:scale-105 hover:shadow-blue-500/50 dark:hover:shadow-blue-400/50 hover:shadow-lg transition-all duration-300 min-w-[120px] min-h-[80px]"
              >
                <Image
                  src={"https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/img/" + p.logo}
                  alt={p.name}
                  width={160}
                  height={130}
                  className="h-8 w-auto mb-2 object-contain"
                  style={{ filter: "grayscale(0.2)" }}
                  onError={(e) => {
                    // 如果图片加载失败，隐藏图片元素
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </a>
            ))
          )}
        </div>
      </div>

      {/* 底部链接图标 */}
      <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-gray-200/60 dark:border-gray-700/60 flex justify-between">
        <div className="flex justify-left items-center gap-6 pl-15">
          <a
            href="https://gitee.com/openinula"
            target="_blank"
            rel="noopener noreferrer"
            className="group hover:scale-110 transition-transform duration-200"
          >
            <Image
              src="/footerIcon.gitee.png"
              alt="Gitee"
              width={24}
              height={24}
              className="opacity-70 group-hover:opacity-100 transition-opacity"
            />
          </a>
          <a
            href="https://space.bilibili.com/3537117686794734"
            target="_blank"
            rel="noopener noreferrer"
            className="group hover:scale-110 transition-transform duration-200"
          >
            <Image
              src="/footerIcon.bilibili.png"
              alt="Bilibili"
              width={32}
              height={32}
              className="opacity-70 group-hover:opacity-100 transition-opacity"
            />
          </a>
          <button
            type="button"
            aria-label="展示二维码"
            onClick={() => setShowQr(true)}
            className="group hover:scale-110 transition-transform duration-200 focus:outline-none cursor-pointer"
          >
            <Image
              src="/footerIcon.qrcode.png"
              alt="二维码"
              width={24}
              height={24}
              className="opacity-70 group-hover:opacity-100 object-contain transition-opacity"
            />
          </button>
        </div>
        <div className="flex justify-between items-center gap-6 text-gray-500 dark:text-gray-400">
          <a href={"/privacy"} className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">隐私政策</a>
          <a href={"/laws"} className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">法律说明</a>
        </div>
        {/* 二维码弹窗 */}
        {showQr && (
          <button className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowQr(false)}>
            <button className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <Image
                src="/qrcode.inula.jpg"
                alt="扫码关注"
                width={330}
                height={330}
                className="mx-auto rounded-lg"
              />
              <div className="text-center text-gray-600 dark:text-gray-300 mt-2 text-sm">扫码关注 inula 社区</div>
            </button>
          </button>
        )}
      </div>
    </footer>
  );
}