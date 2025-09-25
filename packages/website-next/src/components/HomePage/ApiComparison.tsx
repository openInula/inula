import { CodeComparison } from "@/components/magicui/code-comparison";

export default function ApiComparison() {
  return (
    <section className="mt-10 w-full">
      <div className="max-w-5xl mx-auto">
        {/* 背景装饰 */}
        <div className="relative">
          {/* 渐变背景 */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 rounded-3xl blur-3xl -z-10"></div>
          
          {/* 主容器 */}
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100/50">
            {/* 顶部装饰线 */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
            
            <h2 className="text-3xl font-bold mb-15 text-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              ⚡️API 对比
            </h2>

            <div className="flex flex-wrap justify-start items-end md:gap-[11%] w-full pl-6">
              <div className="flex-1 min-w-[260px] max-w-[400px]">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-2xl border border-red-100/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="font-bold text-xl mb-2 text-left text-red-700">传统 API</div>
                  <div className="text-gray-600 text-base leading-7 text-left">
                    频繁重渲染、虚拟DOM对比、性能损耗大，状态与UI绑定不够直接。
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-[260px] max-w-[400px]">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="font-bold text-xl mb-2 text-left text-green-700">响应式 API</div>
                  <div className="text-gray-600 text-base leading-7 text-left">
                    只更新变化的DOM，<b>无需</b>虚拟DOM，对比开销极小，状态与UI直接响应。
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="bg-gray-50/50 rounded-2xl p-6 shadow-inner border border-gray-200/50">
                <CodeComparison
                  beforeCode={`import { useState, render } from 'openinula';
function UserInput() {
  const [count, setCount] = useState(0); // [!code --]
  function incrementCount() {
    setCount(count + 1); // [!code --]
  }

  return (
    <>
      <h1>{count}</h1>
      <button onClick={incrementCount}>Add 1</button>
    </>
  );
}

render(<UserInput />, document.getElementById('app')); // [!code --]`}
                  afterCode={`import { render } from '@openinula/next';
function UserInput() {
  let count = 0; // [!code focus]
  function incrementCount() {
    count = count + 1; // [!code focus]
  }

  return (
    <>
      <h1>{count}</h1>
      <button onClick={incrementCount}>Add 1</button>
    </>
  );
}

render(UserInput(), document.getElementById('app')); // [!code focus]`}
                  language="tsx"
                  filename="Index.tsx"
                  lightTheme="github-light"
                  darkTheme="github-dark"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
