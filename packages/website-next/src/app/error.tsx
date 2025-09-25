'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div className="-mt-15 min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 via-blue-100 to-blue-200 dark:from-[#23232b] dark:via-[#23232b] dark:to-[#1a1a22] animate-fade-in ">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-blue-300 dark:to-cyan-300 mb-2">出错了</h2>
            <p className="mb-4 text-base text-gray-700 dark:text-gray-300 animate-fade-in-slow">{error.message}</p>
            <button
                onClick={() => reset()}
                className="cursor-pointer px-4 py-2 rounded bg-white/80 dark:bg-[#23232b]/80 text-blue-600 dark:text-cyan-300 font-semibold shadow hover:bg-white dark:hover:bg-[#23232b] transition-colors animate-bounce"
            >
                重试
            </button>
        </div>
    );
}