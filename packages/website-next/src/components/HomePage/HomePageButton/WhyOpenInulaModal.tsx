"use client";
import React, { useEffect, useState } from "react";

export const WhyOpenInulaModal = () => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const show = () => setOpen(true);
        window.addEventListener("show-why-openinula-modal", show);
        return () => window.removeEventListener("show-why-openinula-modal", show);
    }, []);

    if (!open) return null;

    // 遮罩点击关闭，卡片内容阻止冒泡
    const handleMaskClick = () => setOpen(false);
    const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10" onClick={handleMaskClick}>
            <div className="bg-white rounded-2xl shadow-2xl p-0 max-w-7xl w-full relative flex flex-col items-center border border-gray-200" onClick={stopPropagation}>
                <div className="w-full aspect-video rounded-2xl overflow-hidden">
                    <video
                        src="https://openinula-website.obs.ap-southeast-1.myhuaweicloud.com/video/inula_intro.mp4"
                        controls
                        autoPlay
                        className="w-full h-full bg-black"
                    />
                </div>
                <div className="w-full text-center text-sm text-gray-500 py-3 border-t border-gray-100">
                    OpenInula 介绍视频
                </div>
            </div>
        </div>
    );
}; 