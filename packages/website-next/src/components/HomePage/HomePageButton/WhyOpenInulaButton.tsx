import React from "react";

export const WhyOpenInulaButton = () => {
    // 触发自定义事件，通知弹窗显示
    const handleClick = () => {
        window.dispatchEvent(new CustomEvent("show-why-openinula-modal"));
    };
    return (
        <button
            className="cursor-pointer px-6 py-2 rounded-lg bg-[#f1f5f9] text-[#3b82f6] font-semibold border border-[#3b82f6] hover:bg-[#e0e7ef] transition-colors shadow"
            onClick={handleClick}
        >
            Why Inula?
        </button>
    );
}; 