import { ChevronRight } from "lucide-react";

export default function WatchTutorial() {
  return (
    <>
      <div className="px-6 py-8 max-w-4xl">
        {/* 介绍部分 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            监听系统（watch）
          </h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              OpenInula 2提供了 watch
              方法，用于监听状态或计算值的变化，并在变化时执行副作用逻辑。这是处理数据请求、日志记录、定时器等副作用操作的核心工具。
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              与传统的 useEffect 不同，watch
              会自动追踪其回调中用到的所有状态和计算值，只要依赖发生变化，回调就会重新执行。这种自动依赖追踪让副作用管理变得简单而可靠。
            </p>
          </div>
        </div>

        {/* 基本用法 */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            基本用法
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            使用{" "}
            <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              watch
            </code>
            监听回调中用到的依赖，一旦变化即触发副作用。
          </p>
          <div className="bg-gray-50 dark:bg-[#141418] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-4">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                最简示例
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                自动依赖追踪，无需依赖数组
              </span>
            </div>
            <div className="p-4">
              <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                <code>{`import { watch } from 'openinula';

watch(() => {
  // 在这里编写副作用逻辑，例如：
  // console.log('依赖变化了');
});`}</code>
              </pre>
            </div>
          </div>
          <ul className="space-y-1 mb-6">
            <li className="flex items-start text-sm text-gray-600 dark:text-gray-300">
              <ChevronRight className="mt-0.5 mr-2 h-4 w-4 text-gray-400" />
              回调中用到的状态/计算值会被自动收集为依赖
            </li>
            <li className="flex items-start text-sm text-gray-600 dark:text-gray-300">
              <ChevronRight className="mt-0.5 mr-2 h-4 w-4 text-gray-400" />
              依赖变化时重新执行，可在回调中返回清理函数
            </li>
          </ul>
          <div className="bg-gray-50 dark:bg-[#141418] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              数据请求示例
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              在右侧的代码编辑器中，你可以看到使用 watch 进行数据请求的示例。当
              url 参数变化时，会自动重新发起请求。
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                <code>{`function FetchData({ url }) {
  let data = null;
 
  watch(() => {
    fetch(url)
      .then(res => res.json())
      .then(_data => {
        data = _data;
      });
  });
 
  return (
    <div>
      <if cond={data}>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </if>
      <else>
        <p>加载中...</p>
      </else>
    </div>
  );
}`}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* 依赖追踪 */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            依赖追踪
          </h2>
          <div className="p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              watch
              会自动追踪其回调中用到的所有状态和计算值，只要依赖发生变化，回调就会重新执行。你无需手动指定依赖数组，OpenInula
              会智能地检测所有相关的响应式数据。
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                自动依赖检测
              </h3>
              <p className="mb-2 text-blue-800 dark:text-blue-200">
                在下面的示例中，watch 会自动追踪 count 变量的变化：
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                  <code>{`function Logger() {
  let count = 0;
  watch(() => {
    console.log('count 变化为：', count);
  });
 
  return <button onClick={() => count++}>增加</button>;
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* 清理副作用 */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            清理副作用
          </h2>
          <div className="p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              可以在 watch
              回调中返回一个清理函数，用于移除定时器、事件监听等副作用。这有助于避免内存泄漏和重复的副作用操作。
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                定时器示例
              </h3>
              <p className="mb-2 text-amber-800 dark:text-amber-200">
                下面的示例展示了如何使用清理函数来管理定时器：
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                  <code>{`function Timer() {
  let time = Date.now();
 
  watch(() => {
    const timer = setInterval(() => {
      time = Date.now();
    }, 1000);
    // 返回清理函数
    return () => clearInterval(timer);
  });
 
  return <div>当前时间：{new Date(time).toLocaleTimeString()}</div>;
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* 多个 watch */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            多个 watch
          </h2>
          <div className="p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              可以在同一个组件中使用多个 watch，分别监听不同的状态。每个 watch
              都有自己独立的依赖追踪和清理逻辑。
            </p>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                多状态监听
              </h3>
              <p className="mb-2 text-purple-800 dark:text-purple-200">
                下面的示例展示了如何同时监听多个不同的状态：
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                  <code>{`function MultiWatch() {
  let a = 1;
  let b = 2;
 
  watch(() => {
    console.log('a 变化：', a);
  });
  watch(() => {
    console.log('b 变化：', b);
  });
 
  return (
    <div>
      <button onClick={() => a++}>a++</button>
      <button onClick={() => b++}>b++</button>
    </div>
  );
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* 最佳实践 */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            最佳实践
          </h2>
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                ✓ 使用场景
              </h3>
              <ul className="list-disc list-inside space-y-1 text-green-800 dark:text-green-200">
                <li>
                  只在需要副作用（如数据请求、日志、定时器等）时使用 watch
                </li>
                <li>用于监听外部数据源的变化并同步到组件状态</li>
                <li>处理需要清理的副作用操作</li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                ⚠️ 避免的问题
              </h3>
              <ul className="list-disc list-inside space-y-1 text-yellow-800 dark:text-yellow-200">
                <li>避免在 watch 中直接修改依赖自身的状态，防止死循环</li>
                <li>善用清理函数，避免内存泄漏</li>
                <li>不要在 watch 外部直接调用副作用逻辑</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 注意事项 */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            注意事项
          </h2>
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
            <ul className="space-y-3 text-red-800 dark:text-red-200">
              <li className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <span>
                  watch 回调应为同步函数，避免直接返回
                  Promise。如果需要处理异步操作，在回调内部使用 async/await。
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <span>
                  清理函数只在依赖变化或组件卸载时调用，确保在清理函数中正确释放资源。
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <span>
                  避免在 watch
                  回调中执行过于复杂的逻辑，保持回调函数的简洁和高效。
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <span>
                  注意 watch
                  的执行时机，它会在依赖变化后立即执行，确保不会影响渲染性能。
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
