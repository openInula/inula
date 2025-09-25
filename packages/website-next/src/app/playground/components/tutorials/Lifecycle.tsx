"use client";

import React, { useEffect } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import "highlight.js/styles/github-dark.css";

export default function Lifecycle() {
  useEffect(() => {
    hljs.highlightAll();
  }, []);

  const codePageTitle = `function PageTitle() {
  let title = '';
  didMount(() => {
    title = document.title;
  });
  return <p>页面标题：{title}</p>;
}`;

  const codeFetchData = `function FetchData() {
  let data = null;
  didMount(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(d => { data = d; });
  });
  return <pre>{JSON.stringify(data)}</pre>;
}`;

  const codeTimer = `function Timer() {
  let timer;
  didMount(() => {
    timer = setInterval(() => {}, 1000);
  });
  willUnmount(() => clearInterval(timer));
  // 或 didUnmount(() => clearInterval(timer));
  return <div>定时器已启动</div>;
}`;

  const codeEventListener = `function Listener() {
  function onResize() {}
  didMount(() => window.addEventListener('resize', onResize));
  willUnmount(() => window.removeEventListener('resize', onResize));
  return <div>监听窗口大小</div>;
}`;

  const codeWatchCleanup = `function Watcher() {
  let timer;
  watch(() => {
    timer = setInterval(() => {}, 1000);
    return () => clearInterval(timer);
  });
  return <div>watch 清理</div>;
}`;

  return (
    <div className="px-6 py-8 max-w-4xl">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        OpenInula 生命周期
      </h2>
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          OpenInula
          的生命周期管理非常简单直观，主要通过三个钩子函数来处理组件的挂载、卸载和副作用清理。
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          与传统的 React 不同，OpenInula
          提供了更简洁的生命周期钩子，让你能够轻松管理组件的副作用和清理操作。
        </p>
      </div>

      <div className="space-y-8 text-gray-700 dark:text-gray-300">
        {/* 挂载阶段 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            🚀 挂载阶段
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            组件挂载时可执行副作用，如数据请求、事件监听等。OpenInula 提供
            didMount 钩子。
          </p>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              基本用法
            </h3>
            <pre className="rounded-md overflow-auto bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
              <code className="language-jsx">{codePageTitle}</code>
            </pre>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              数据请求
            </h3>
            <pre className="rounded-md overflow-auto bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
              <code className="language-jsx">{codeFetchData}</code>
            </pre>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              最佳实践
            </h4>
            <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
              <li>只在 didMount 中执行副作用</li>
              <li>清理副作用请用 willUnmount/didUnmount</li>
            </ul>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              注意事项
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              didMount 只在组件首次挂载时执行一次
            </p>
          </div>
        </div>

        {/* 卸载阶段 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            🗑️ 卸载阶段
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            组件卸载时需清理副作用，防止内存泄漏。OpenInula 提供
            willUnmount/didUnmount 钩子。
          </p>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              基本用法
            </h3>
            <pre className="rounded-md overflow-auto bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
              <code className="language-jsx">{codeTimer}</code>
            </pre>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              副作用清理
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>清理定时器、事件监听、watch 副作用等</li>
              <li>推荐所有副作用都在卸载时清理</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              最佳实践
            </h4>
            <ul className="list-disc list-inside space-y-1 text-green-800 dark:text-green-200">
              <li>所有副作用都应在卸载时清理</li>
              <li>推荐用 willUnmount/didUnmount</li>
            </ul>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              注意事项
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>清理函数只在组件卸载时执行一次</li>
              <li>避免遗留定时器、事件监听等，防止内存泄漏</li>
            </ul>
          </div>
        </div>

        {/* 清理操作 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            🧹 清理操作
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            清理操作用于移除副作用，如定时器、事件监听、watch 清理函数等。
          </p>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              定时器清理
            </h3>
            <pre className="rounded-md overflow-auto bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
              <code className="language-jsx">{codeTimer}</code>
            </pre>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              事件监听清理
            </h3>
            <pre className="rounded-md overflow-auto bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
              <code className="language-jsx">{codeEventListener}</code>
            </pre>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              watch 清理函数
            </h3>
            <pre className="rounded-md overflow-auto bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
              <code className="language-jsx">{codeWatchCleanup}</code>
            </pre>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
              最佳实践
            </h4>
            <ul className="list-disc list-inside space-y-1 text-purple-800 dark:text-purple-200">
              <li>所有副作用都应有清理逻辑</li>
              <li>推荐统一在 willUnmount/didUnmount 或 watch 清理函数中处理</li>
            </ul>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              注意事项
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>避免遗留定时器、事件监听等，防止内存泄漏</li>
            </ul>
          </div>
        </div>

        {/* 总结 */}
        <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-4">
            📝 总结
          </h3>
          <div className="space-y-3 text-amber-800 dark:text-amber-200">
            <p>
              OpenInula 的生命周期管理非常简单直观，主要通过三个钩子函数来处理：
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>didMount</strong>：组件挂载时执行副作用
              </li>
              <li>
                <strong>willUnmount/didUnmount</strong>：组件卸载时清理副作用
              </li>
              <li>
                <strong>watch 清理函数</strong>：在 watch 中直接返回清理函数
              </li>
            </ul>
            <p>
              记住：<strong>每个副作用都应该有对应的清理逻辑</strong>
              ，这是防止内存泄漏的关键！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
