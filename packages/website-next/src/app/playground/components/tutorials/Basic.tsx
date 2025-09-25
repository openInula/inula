import { ChevronRight } from "lucide-react";

export default function Basic() {
  return (
    <div className="h-screen  bg-white dark:bg-[#141418]">
      {/* 内容区域 */}
      <div className="px-6 py-8 max-w-4xl">
        {/* 介绍部分 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            什么是 OpenInula？
          </h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              欢迎来到 OpenInula 教程！本教程将教你创建高性能 Web
              应用程序所需的一切。 openInula 2版本是一个现代化的 JavaScript UI
              开发库
            </p>
            <ul className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <li>无 API 哲学：只用 JSX + 原生 JS</li>
              <li>编译优先：大部分逻辑编译期完成</li>
              <li>响应式：自动追踪依赖，极致性能</li>
            </ul>
          </div>
        </div>

        {/* 快速开始 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            快速开始
          </h2>
          <div className="bg-gray-50 dark:bg-[#141418] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              在右侧的代码编辑器中，你可以看到最基本的 OpenInula 组件示例。
              尝试修改代码，看看实时效果！
            </p>
            <p className="leading-7 text-gray-700 dark:text-gray-300">
              本教程中的每节课都包含一个简单的场景，详细说明了如何利用特性实现该场景。您可以随时点击“解决方案”按钮查看完整解决方案，或点击“重置”重新开始练习。代码编辑器内配备了控制台和输出选项卡，方便您查看结果。如果您对
              OpenInula
              的代码生成过程感兴趣，可以切换到Output以及Sourcemap，查看编译后的代码。
              祝您学习愉快！
            </p>
          </div>
        </div>

        {/* 下一步 */}
        <div className="bg-blue-50 dark:bg-[#141418] border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            准备好开始了吗？
          </h3>
          <p className="text-blue-800 dark:text-blue-200 mb-4">
            现在你已经了解了 OpenInula
            的基础概念，可以开始探索右侧的交互式代码示例了。
            尝试修改代码，看看会发生什么！
          </p>
          <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
            <ChevronRight size={16} className="mr-1" />
            <span>继续学习下一个教程：组件</span>
          </div>
        </div>
      </div>
    </div>
  );
}
