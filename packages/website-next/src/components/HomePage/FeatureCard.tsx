export default function FeatureCard() {
  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-22">
      <div className="rounded-xl border border-gray-200 shadow-sm p-7 flex flex-col items-start transition hover:shadow-lg hover:border-[#7ED6DF] bg-white bg-gradient-to-br from-[#F5F7FA] to-white dark:bg-neutral-900 dark:bg-none">
        <div className="font-bold text-lg mb-2 text-gray-800 dark:text-white">响应式 API</div>
        <div className="text-gray-600 dark:text-gray-200 text-base">
          openInula提供响应式API 2.0，相比传统虚拟DOM方式，提升渲染效率30%以上。
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 shadow-sm p-7 flex flex-col items-start transition hover:shadow-lg hover:border-[#A5A6F6] bg-white bg-gradient-to-br from-white to-[#E5F0FF] dark:bg-neutral-900 dark:bg-none">
        <div className="font-bold text-lg mb-2 text-gray-800 dark:text-white">兼容React API</div>
        <div className="text-gray-600 dark:text-gray-200 text-base">
          完全兼容React API，支持React应用无缝切换至openInula。
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 shadow-sm p-7 flex flex-col items-start transition hover:shadow-lg hover:border-[#6EE7B7] bg-white bg-gradient-to-br from-[#E6FCED] to-white dark:bg-neutral-900 dark:bg-none">
        <div className="font-bold text-lg mb-2 text-gray-800 dark:text-white">核心组件</div>
        <div className="text-gray-600 dark:text-gray-200 text-base">
          包含6大常用功能组件，帮助开发者高效构筑基于openInula的前端产品。
        </div>
      </div>
    </div>
  );
} 