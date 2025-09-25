import { ChevronRight } from "lucide-react";

export default function StateTutorial() {
  return (
    <>
      <div className="px-6 py-8 max-w-4xl">
        {/* 介绍部分 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            状态管理
          </h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              OpenInula 的状态管理采用直观的方式，无需特殊的 API 或
              Hook，直接使用 JavaScript
              变量和赋值即可。这种设计让状态管理变得简单而自然，就像编写普通的
              JavaScript 代码一样。
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              在传统的 React 中，你需要使用 useState、useReducer 等 Hook
              来管理状态。但在 OpenInula 中，你只需要声明一个普通的 JavaScript
              变量，框架会自动追踪这些变量的变化并更新 UI。
            </p>
          </div>
        </div>

        {/* 基础概念 */}
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            基础概念
          </h2>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              什么是状态？
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              状态是组件中会随时间变化的数据。在 OpenInula 中，任何 JavaScript
              变量都可以成为状态，包括基本类型（数字、字符串、布尔值）、对象和数组。
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              当你修改这些变量时，OpenInula 会自动检测变化并重新渲染相关的 UI
              部分。这种响应式系统让你无需手动管理何时更新界面。
            </p>
          </div>
        </div>

        {/* 声明状态 */}
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            声明状态
          </h2>
          <div>
            <ol className="list-decimal ml-6 space-y-6">
              <li>
                <div className="px-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    基本类型状态
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    最简单的状态就是基本类型。你可以在组件函数中直接声明一个变量，比如计数器、开关状态、文本内容等。这些变量在组件重新渲染时会保持其值，并且当你修改它们时会触发
                    UI 更新。
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    例如，一个计数器组件只需要声明{" "}
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      let count = 0
                    </code>
                    ，然后在点击事件中直接修改{" "}
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      count++
                    </code>{" "}
                    即可。
                  </p>
                </div>
              </li>
              <li>
                <div className="px-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    对象状态
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    对于复杂的数据结构，你可以使用对象来组织状态。比如用户信息、表单数据、应用配置等。对象状态让你能够将相关的数据组织在一起，使代码更加清晰和易于维护。
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    你可以直接修改对象的属性，OpenInula
                    会检测到这些变化并更新相应的 UI。例如，修改用户主题只需要{" "}
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      user.preferences.theme = 'dark'
                    </code>
                    。
                  </p>
                </div>
              </li>
              <li>
                <div className="px-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    数组状态
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    数组状态常用于列表数据，如待办事项、商品列表、消息记录等。OpenInula
                    支持数组的增删改查操作，并且能够高效地更新列表 UI。
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    推荐使用不可变更新模式来处理数组，即创建新的数组而不是修改原数组。这样可以确保状态变化的正确追踪，避免潜在的问题。
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>

        {/* 状态更新 */}
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            状态更新
          </h2>
          <div>
            <ul className="list-disc ml-6 space-y-6">
              <li>
                <div className="px-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    直接赋值
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    最简单的状态更新方式就是直接赋值。你可以使用任何 JavaScript
                    赋值操作，包括{" "}
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      =
                    </code>
                    、
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      +=
                    </code>
                    、
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      ++
                    </code>{" "}
                    等。
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    状态之间可以互相依赖，一个状态的变化可以触发另一个状态的更新。这种自然的依赖关系让状态管理变得直观和灵活。
                  </p>
                </div>
              </li>
              <li>
                <div className="px-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    批量更新
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    当需要同时更新多个相关状态时，你可以将它们组织在一个函数中。这样可以确保所有状态同时更新，避免中间状态导致的
                    UI 不一致。
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    例如，重置表单时，你可以一次性将所有字段重置为初始值，而不是逐个更新每个字段。
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* 最佳实践 */}
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            最佳实践
          </h2>
          <div>
            <ol className="list-decimal ml-6 space-y-6">
              <li>
                <div className="px-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    状态初始化
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    对于复杂的初始状态，建议将初始化逻辑提取为独立的函数。这样做的好处是代码更清晰，初始状态可以复用，并且便于测试和维护。
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    当需要重置状态时，可以直接调用初始化函数，确保状态回到正确的初始值。
                  </p>
                </div>
              </li>
              <li>
                <div className="px-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    状态组织
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    对于复杂组件，建议将相关的状态和方法组织在一起。可以使用对象来封装相关的状态和操作，让代码结构更清晰。
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    例如，购物车组件可以将商品列表、总价、添加商品、删除商品等方法组织在一个对象中，形成一个完整的状态管理单元。
                  </p>
                </div>
              </li>
              <li>
                <div className="px-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    派生状态
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    避免重复存储可以从现有状态计算出的值。派生状态应该通过计算获得，而不是单独存储。这样可以避免数据不一致的问题，并且减少状态管理的复杂度。
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    例如，待办事项的完成数量应该通过过滤已完成的待办事项来计算，而不是单独存储一个计数器。
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>

        {/* 注意事项 */}
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            注意事项
          </h2>
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
            <ul className="space-y-3 text-red-800 dark:text-red-200">
              <li className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <span>
                  避免直接修改复杂对象的深层属性，推荐使用不可变更新模式，创建新的对象而不是修改原对象。
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <span>
                  确保状态更新是同步的，避免在异步操作中直接修改状态，这可能导致状态不一致的问题。
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <span>
                  对于大型应用，当状态管理变得复杂时，考虑使用专门的状态管理库来更好地组织和管理状态。
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <span>
                  注意状态的作用域，避免创建不必要的全局状态，保持状态的局部性和封装性。
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* 下一步 */}
        <div className=" border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            掌握状态管理了吗？
          </h3>
          <p className="text-blue-800 dark:text-blue-200 mb-4">
            现在你已经了解了 OpenInula
            的状态管理概念和最佳实践。状态管理是构建交互式应用的核心，掌握好这些概念将帮助你创建更加健壮和可维护的应用程序。
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
