"use client"

import { Meteors } from "@/components/magicui/meteors";
import { WhyOpenInulaButton } from "@/components/HomePage/HomePageButton/WhyOpenInulaButton";
import { WhyOpenInulaModal } from "@/components/HomePage/HomePageButton/WhyOpenInulaModal";
import { AuroraText } from "@/components/magicui/aurora-text";
import { useState } from "react";

export default function MeteorDemo() {
    const [copied, setCopied] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText("npx create-inula my-app");
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                setIsHovered(false);
            }, 2000);
        } catch (err) {
            console.error("复制失败:", err);
        }
    };

    return (
        <div className="flex h-[530px] w-full  flex-col gap-20 items-center justify-center overflow-hidden rounded-lg mb-40">
            <Meteors number={55} minDuration={3} maxDuration={13}/>
            {/*<span className="top-25 text-center text-7xl font-semibold text-transparent pointer-events-none whitespace-pre-wrap bg-[linear-gradient(160deg,_white,_#60a5fa)] bg-clip-text drop-shadow-sm">
                OpenInula
            </span>*/}
            {/* AuroraText 极光渐变文本 */}
            <AuroraText colors={["white", "#60a5fa"]} className="text-center text-7xl font-semibold pointer-events-none whitespace-pre-wrap drop-shadow-sm mt-30">
                OpenInula
            </AuroraText>
            <div className="ext-center text-[#666666] text-4xl font-normal opacity-95 tracking-[0.08rem]">
                构建用户界面的
                <div className="inline mx-1 font-bold text-[#3b82f6] drop-shadow-2xl">
                    响应式
                </div>
                JavaScript库
            </div>
            {/* 按钮区域 */}
            <div className="flex flex-col items-center gap-4">
                <div className="flex flex-row gap-8 justify-center">
                    {/* Why OpenInula 按钮 */}
                    <WhyOpenInulaButton />
                    {/* Get Started 按钮 */}
                    <a href="/docs/introduction">
                        <button className="cursor-pointer px-6 py-2 rounded-lg bg-gradient-to-r from-pink-300 to-blue-400 text-white font-semibold shadow hover:from-pink-600 hover:to-blue-600 transition-colors flex items-center gap-1">
                            Get Started
                            <span className="text-lg font-bold align-middle leading-5">
                            ›
                        </span>
                        </button>
                    </a>
                    {/* Install 按钮 */}
                    <a href="/docs/quick-start">
                        <button className="cursor-pointer px-6 py-2 rounded-lg border border-[#3b82f6] text-[#3b82f6] font-semibold bg-white hover:bg-[#eff6ff] transition-colors">
                            Install
                        </button>
                    </a>
                </div>
                <button
                    className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors select-none relative text-sm"
                    onClick={handleCopy}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => !copied && setIsHovered(false)}
                    title="点击复制命令">

                    npx create-inula my-app

                    {/* 复制图标 - 悬浮时显示 */}
                    {isHovered && !copied && (
                        <svg
                            data-testid="geist-icon"
                            height="16"
                            strokeLinejoin="round"
                            viewBox="0 0 16 16"
                            width="16"
                            data-open="true"
                            style={{ color: "currentcolor" }}
                            className="animate-fade-in-bitslow absolute -right-6 top-1/2 transform -translate-y-1/2"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M2.75 0.5C1.7835 0.5 1 1.2835 1 2.25V9.75C1 10.7165 1.7835 11.5 2.75 11.5H3.75H4.5V10H3.75H2.75C2.61193 10 2.5 9.88807 2.5 9.75V2.25C2.5 2.11193 2.61193 2 2.75 2H8.25C8.38807 2 8.5 2.11193 8.5 2.25V3H10V2.25C10 1.2835 9.2165 0.5 8.25 0.5H2.75ZM7.75 4.5C6.7835 4.5 6 5.2835 6 6.25V13.75C6 14.7165 6.7835 15.5 7.75 15.5H13.25C14.2165 15.5 15 14.7165 15 13.75V6.25C15 5.2835 14.2165 4.5 13.25 4.5H7.75ZM7.5 6.25C7.5 6.11193 7.61193 6 7.75 6H13.25C13.3881 6 13.5 6.11193 13.5 6.25V13.75C13.5 13.8881 13.3881 14 13.25 14H7.75C7.61193 14 7.5 13.8881 7.5 13.75V6.25Z"
                                fill="currentColor"
                            />
                        </svg>
                    )}

                    {/* 成功勾号 - 复制后显示 */}
                    {copied && (
                        <svg
                            data-testid="geist-icon"
                            height="16"
                            strokeLinejoin="round"
                            viewBox="0 0 16 16"
                            width="16"
                            data-open="false"
                            style={{ color: "#10b981" }}
                            className="animate-fade-in-fast absolute -right-6 top-1/2 transform -translate-y-1/2"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M15.5607 3.99999L15.0303 4.53032L6.23744 13.3232C5.55403 14.0066 4.44599 14.0066 3.76257 13.3232L4.2929 12.7929L3.76257 13.3232L0.969676 10.5303L0.439346 9.99999L1.50001 8.93933L2.03034 9.46966L4.82323 12.2626C4.92086 12.3602 5.07915 12.3602 5.17678 12.2626L13.9697 3.46966L14.5 2.93933L15.5607 3.99999Z"
                                fill="currentColor"
                            />
                        </svg>
                    )}
                </button>
            </div>
            <WhyOpenInulaModal />
        </div>
    );
}