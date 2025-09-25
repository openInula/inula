"use client";

import { ChevronRight } from "lucide-react";
import CodeSection from "../CodeSection";

export default function ComputedTutorial() {
  return (
    <>
      <div className="px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            计算值
          </h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              在 OpenInula
              2中，计算值（Computed）是指依赖于其他状态变量的表达式。你只需像写普通
              JS 一样声明变量，编译器会自动识别并优化这些依赖关系。
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              计算值让响应式编程变得极其自然和直观。你不需要学习特殊的 API
              或记住复杂的规则，只需要按照 JavaScript
              的语法来编写代码，OpenInula 会自动处理依赖追踪和更新优化。
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              这种设计让代码更加简洁、可读性更强，同时还能获得出色的性能表现。计算值会在依赖变化时自动重新计算，确保
              UI 始终显示最新的计算结果。
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            基础概念
          </h2>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              什么是计算值？
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              计算值是基于其他状态变量自动计算得出的值。当依赖的状态发生变化时，计算值会自动重新计算，确保始终反映最新的数据状态。
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              在 OpenInula 中，计算值就是普通的 JavaScript
              变量声明，编译器会智能地识别这些依赖关系，并自动建立响应式连接。
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              这种设计让计算值既强大又简单，你不需要学习新的概念或
              API，只需要按照 JavaScript 的思维方式来编写代码即可。
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            基本用法
          </h2>
          <div>
            <div className=" p-6 rounded-lg transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                简单计算值
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                最简单的计算值就是基于单个状态变量的表达式。你只需要声明一个变量，其值依赖于其他状态变量即可。
              </p>
              <CodeSection
                title="示例：简单计算值"
                description="一个基于单个状态的计算结果，会随依赖自动更新。"
                variant="blue"
                code={`function DoubleCounter() {
  let count = 0;
  // 计算值：double 会自动随着 count 变化
  const double = count * 2;

  return (
    <div>
      <p>当前计数：{count}</p>
      <p>双倍值：{double}</p>
      <button onClick={() => count++}>增加</button>
    </div>
  );
}`}
              />
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                在这个例子中，
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  double
                </code>{" "}
                是一个计算值，它依赖于{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  count
                </code>{" "}
                变量。当{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  count
                </code>{" "}
                发生变化时，
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  double
                </code>{" "}
                会自动重新计算并更新 UI。
              </p>
            </div>

            <div className=" p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                自动依赖追踪
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                OpenInula
                的编译器会自动分析计算值中使用的变量，建立依赖关系图。你不需要手动声明依赖，框架会自动处理这一切。
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                这种自动依赖追踪让代码更加简洁，同时还能避免手动管理依赖时可能出现的错误和遗漏。
              </p>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            多重依赖
          </h2>
          <div>
            <div className=" p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                多个状态变量
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                计算值可以依赖多个状态变量，当其中任何一个依赖发生变化时，计算值都会重新计算。
              </p>
              <CodeSection
                title="示例：多个依赖的计算值"
                description="总价依赖单价与数量，任一变化都会触发更新。"
                variant="green"
                code={`function PriceCalculator() {
  let price = 100;
  let quantity = 2;
  const total = price * quantity;
 
  return (
    <div>
      <p>单价：{price}</p>
      <p>数量：{quantity}</p>
      <p>总价：{total}</p>
      <button onClick={() => quantity++}>增加数量</button>
    </div>
  );
}`}
              />
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                在这个价格计算器中，
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  total
                </code>{" "}
                计算值依赖于{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  price
                </code>{" "}
                和{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  quantity
                </code>{" "}
                两个变量。当其中任何一个发生变化时，总价都会自动更新。
              </p>
            </div>

            <div className=" p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                复杂计算逻辑
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                计算值可以包含复杂的计算逻辑，包括条件判断、循环、函数调用等。只要这些逻辑中使用了响应式变量，计算值就会正确地追踪依赖。
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                例如，你可以根据用户等级、商品类型、促销活动等多个因素来计算最终价格，所有这些依赖都会被自动追踪。
              </p>
            </div>
          </div>
        </div>

        {/* 嵌套计算 */}
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            嵌套计算
          </h2>
          <div>
            <div className=" p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                计算值依赖计算值
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                计算值可以依赖其他计算值，形成嵌套的依赖关系。这种设计让复杂的计算逻辑变得清晰和模块化。
              </p>
              <CodeSection
                title="示例：嵌套计算"
                description="c 依赖 b，b 依赖 a；任一前置变化都会传导更新。"
                variant="purple"
                code={`function NestedComputed() {
  let a = 1;
  const b = a + 2;  // 计算值 b 依赖于 a
  const c = b * 3;  // 计算值 c 依赖于 b
 
  return <div>c 的值：{c}</div>;
}`}
              />
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                在这个例子中，
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  c
                </code>{" "}
                依赖于{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  b
                </code>
                ，而{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  b
                </code>{" "}
                又依赖于{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  a
                </code>
                。当{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  a
                </code>{" "}
                发生变化时，
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  b
                </code>{" "}
                和{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  c
                </code>{" "}
                都会按正确的顺序重新计算。
              </p>
            </div>

            <div className=" p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                依赖链优化
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                OpenInula
                会智能地优化嵌套计算值的更新顺序，确保计算值按照正确的依赖顺序重新计算，避免不必要的重复计算。
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                这种优化让复杂的计算逻辑既清晰又高效，你可以放心地构建复杂的计算值依赖关系。
              </p>
            </div>
          </div>
        </div>

        {/* 注意事项 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            注意事项
          </h2>
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
            <ul className="space-y-3 text-red-800 dark:text-red-200">
              <li className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <span>
                  计算值应为纯表达式，不要在其中执行异步操作或副作用。异步操作应该在事件处理函数中进行。
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <span>
                  如果依赖的状态较多，建议提前拆分变量，提升可读性。复杂的计算逻辑可以拆分为多个简单的计算值。
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <span>
                  避免在计算值中进行昂贵的计算操作，如果计算成本很高，考虑使用缓存或其他优化策略。
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <span>
                  注意计算值的命名，使用清晰、描述性的变量名，让代码的意图更加明确。
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* 下一步 */}
        <div className=" border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            掌握计算值了吗？
          </h3>
          <p className="text-blue-800 dark:text-blue-200 mb-4">
            现在你已经了解了 OpenInula
            的计算值概念和最佳实践。计算值是响应式编程的核心特性，掌握好这些概念将帮助你创建更加智能和高效的应用程序。
          </p>
          <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
            <ChevronRight size={16} className="mr-1" />
            <span>继续学习其他 OpenInula 特性</span>
          </div>
        </div>
      </div>
    </>
  );
}
