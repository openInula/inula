"use client";

import React, { useEffect } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import "highlight.js/styles/github-dark.css";

export default function Component() {
  useEffect(() => {
    hljs.highlightAll();
  }, []);

  const codeImport = `import { render } from '@openinula/next';`;

  const codeComponent = `import { useState, useEffect } from 'openinula';

function App() {
  return (
    <>
      <h1>This is a Header</h1>
      <Nested />
    </>
  );
}`;

  const codeRender = `import { render } from '@openinula/next';

function App() {
  return (
    <>
      <h1>This is my first component</h1>
    </>
  );
}

render(App(), document.getElementById('app'));`;

  return (
    <div className="p-6 rounded-lg h-full">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        OpenInula 组件
      </h2>

      <div className="space-y-4 text-gray-700 dark:text-gray-300">
        <p>
          在构建应用程序时，你需要拆分代码以获得更好的模块化和复用性。在
          OpenInula 中，你可以通过创建组件达到这个目的。组件仅仅是函数，会在首次
          渲染时执行；之后的更新由 OpenInula 的响应式系统接管。
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            1）引入render方法
          </h3>
          <p className="mb-2">
            他能将组件从虚拟节点转化为真是DOM，挂载到#app这个DOM元素中
          </p>
          <pre className="rounded-md overflow-auto">
            <code className="language-tsx">{codeImport}</code>
          </pre>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
            2）渲染到页面
          </h3>
          <p className="mb-2">
            如果你在独立页面中运行，可通过 `@openinula/next` 的 `render`
            进行挂载：
          </p>
          <pre className="rounded-md overflow-auto">
            <code className="language-tsx">{codeRender}</code>
          </pre>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
            提示
          </h3>
          <ul className="list-disc list-inside space-y-1 text-purple-800 dark:text-purple-200">
            <li>组件函数只在首次渲染时调用，之后由响应式系统更新。</li>
            <li>
              你可以将多个组件放在同一文件，也可以拆分为多个文件之后导入使用。
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
