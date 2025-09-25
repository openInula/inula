import CodeSection from "../CodeSection";

export default function EventHandling() {
  return (
    <div className="px-6 py-8 max-w-4xl">
      {/* 介绍 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          事件处理
        </h2>
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            OpenInula 使用 <code>onXxx</code> 属性绑定事件，语义直观、接近原生。
            常见如 <code>onClick</code>、<code>onInput</code>、
            <code>onSubmit</code> 等。
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>基本思路</strong>
              ：用事件触发函数，函数里更新状态或执行业务逻辑。
            </li>
            <li>
              <strong>轻量用法</strong>
              ：简单场景可用内联箭头函数；复杂场景提取为命名函数。
            </li>
            <li>
              <strong>修饰常见场景</strong>：<code>e.preventDefault()</code>{" "}
              阻止默认；
              <code>e.stopPropagation()</code> 阻止冒泡。
            </li>
          </ul>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          基本用法
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
          下例展示点击与表单提交的典型处理方式，实际项目里可根据需要拆分为更小的函数：
        </p>
        <div className="grid gap-6">
          <CodeSection
            variant="gray"
            title="ClickCounter.jsx"
            description="点击事件示例，函数中更新状态或执行逻辑"
            code={`function ClickCounter() {
  let count = 0;
  function handleClick() { count++; }
  return <button onClick={handleClick}>点击次数：{count}</button>;
}`}
          />
          <CodeSection
            variant="blue"
            title="LoginForm.jsx"
            description="表单提交中常用 e.preventDefault() 阻止默认刷新"
            code={`function LoginForm() {
  let username = '';
  let password = '';
  function handleSubmit(e) {
    e.preventDefault();
    console.log('提交登录', { username, password });
  }
  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onInput={e => username = e.target.value} />
      <input type="password" value={password} onInput={e => password = e.target.value} />
      <button type="submit">登录</button>
    </form>
  );
}`}
          />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          常见事件与要点
        </h3>
        <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            <strong>表单事件</strong>：<code>onInput</code>/
            <code>onChange</code> 更新输入值，
            <code>onSubmit</code> 提交表单。注意阻止默认刷新并进行校验。
          </p>
          <p>
            <strong>鼠标事件</strong>：<code>onMouseMove</code>/
            <code>onMouseEnter</code> 等用于跟踪位置、
            悬停高亮或拖拽等交互。频繁触发的事件建议配合节流/防抖。
          </p>
          <p>
            <strong>键盘事件</strong>：<code>onKeyDown</code>/
            <code>onKeyUp</code> 可实现快捷键与输入辅助， 注意组合键判定（如{" "}
            <code>e.ctrlKey</code>、<code>e.metaKey</code>）。
          </p>
          <p>
            <strong>事件修饰</strong>： 使用 <code>e.preventDefault()</code>{" "}
            阻止默认行为、
            <code>e.stopPropagation()</code> 阻止冒泡；
            只有在确有需要时才调用，避免打断正常交互链路。
          </p>
          <p>
            <strong>自定义事件</strong>：通过 props 传入回调让父子组件通信，
            子组件内部可先做校验/埋点，再调用 <code>props.onXxx?.(e)</code>。
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          最佳实践
        </h3>
        <ul className="list-disc list-inside space-y-3 text-gray-700 dark:text-gray-300">
          <li>
            <strong>命名规范</strong>：事件函数统一以 <code>handle</code>{" "}
            前缀命名， 如 <code>handleSubmit</code>、
            <code>handleItemClick</code>，便于全局检索与协作。
          </li>
          <li>
            <strong>参数传递</strong>：需要额外参数时用箭头函数包一层 （如{" "}
            <code>
              onClick={"{"}(e) =&gt; handleItemClick(item, index, e){"}"}
            </code>
            ）。
          </li>
          <li>
            <strong>性能优化</strong>：
            频繁触发的事件（输入、滚动、mousemove）建议配合节流/防抖；
            避免在渲染中创建不必要的内联函数，重要场景下提取稳定引用。
          </li>
          <li>
            <strong>资源清理</strong>：
            使用定时器或手动注册的监听器时，确保在组件卸载时清理，避免内存泄漏。
          </li>
          <li>
            <strong>冒泡与捕获</strong>：
            了解事件传播顺序，按需在合适层级处理，减少全局拦截带来的副作用。
          </li>
        </ul>
      </div>

      {/* 注意事项（简洁列点） */}
      <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800">
        <ul className="space-y-3 text-amber-900 dark:text-amber-100">
          <li>
            事件函数中不要依赖不稳定的 <code>this</code>{" "}
            绑定；优先使用显式参数。
          </li>
          <li>避免在渲染期间创建大量内联函数；必要时提取至组件内命名函数。</li>
          <li>清理定时器与自建事件监听器；减少悬挂任务与内存泄漏风险。</li>
          <li>
            区分默认行为与冒泡传播；谨慎使用 <code>preventDefault</code>/
            <code>stopPropagation</code>。
          </li>
        </ul>
      </div>
    </div>
  );
}
