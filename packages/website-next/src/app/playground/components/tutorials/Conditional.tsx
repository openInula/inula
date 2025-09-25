import { ChevronRight } from "lucide-react";
import CodeSection from "../CodeSection";

export default function ConditionalTutorial() {
  return (
    <>
      <div className="px-6 py-8 max-w-4xl">
        {/* 介绍部分 */}
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            条件渲染
          </h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              OpenInula 提供了内置的条件渲染标签，使得条件渲染变得简单直观。
              与三元表达式相比，结构更清晰、层级更直观，阅读成本更低。
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              你可以像组织普通 JSX 一样组织条件分支。<code>if</code>、
              <code>else-if</code>和 <code>else</code>{" "}
              会按顺序进行匹配：命中即渲染，否则继续判断，最后走兜底。
            </p>
          </div>
        </div>

        {/* 基本用法 */}
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            基本用法
          </h2>
          <div className="space-y-4">
            <div className=" p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                if 条件
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                典型场景是“有值就显示，没有就不渲染”。这能避免在 DOM
                中出现空占位， 也能让辅助信息按需出现。
              </p>
              <CodeSection
                variant="gray"
                title="最简显示/隐藏"
                description="条件为真即渲染，假则跳过"
                code={`function Notification({ message }) {
  return (
    <div>
      <if cond={message}>
        <p className="message">{message}</p>
      </if>
    </div>
  );
}`}
              />
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li>
                  空串、<code>null</code>、<code>false</code>{" "}
                  等判为假时不会渲染该节点。
                </li>
                <li>与布局无缝融合，不需要额外 API 或包装组件。</li>
              </ul>
            </div>

            <div className=" p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                if-else 条件
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                适合在“互斥的两种状态”之间切换，例如登录状态、加载状态等。
                主路径放在 <code>if</code>，兜底内容放在 <code>else</code>。
              </p>
              <CodeSection
                variant="gray"
                title="两态切换"
                description="结构直观、优先级清晰"
                code={`function LoginStatus({ isLoggedIn }) {
  return (
    <div>
      <if cond={isLoggedIn}>
        <button onClick={() => /* logout */ {}}>退出登录</button>
      </if>
      <else>
        <button onClick={() => /* login */ {}}>登录</button>
      </else>
    </div>
  );
}`}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                把“更常见/更重要”的路径放前面，可读性更好。
              </p>
            </div>

            <div className=" p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                多重条件（else-if）
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                当状态超过两种时，使用 <code>else-if</code> 串联判断，最后用{" "}
                <code>else</code>
                做兜底，确保任何未知状态都有合理反馈。
              </p>
              <CodeSection
                variant="blue"
                title="多分支选择"
                description="从高优先级到低优先级依次判定"
                code={`function TrafficLight({ color }) {
  return (
    <div>
      <if cond={color === 'red'}>
        <p>停止</p>
      </if>
      <else-if cond={color === 'yellow'}>
        <p>注意</p>
      </else-if>
      <else-if cond={color === 'green'}>
        <p>通行</p>
      </else-if>
      <else>
        <p>信号灯故障</p>
      </else>
    </div>
  );
}`}
              />
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li>先写最常见/最关键的分支，减少读者思维跳跃。</li>
                <li>复杂判断可提前存入变量，避免在模板中重复计算。</li>
              </ul>
            </div>

            <div className=" p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                条件表达式
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                <code>cond</code>{" "}
                接受任意返回布尔的表达式，可配合可选链、取反以及与/或组合。
                建议保持简洁，把昂贵或冗长的逻辑上移为变量。
              </p>
              <CodeSection
                variant="amber"
                title="表达式示例"
                description="可选链/取反/逻辑与或"
                code={`function UserProfile({ user }) {
  return (
    <div>
      <if cond={user && user.age >= 18}>
        <h2>成年用户</h2>
      </if>
      <if cond={user?.premium && !user.suspended}>
        <h3>高级会员</h3>
      </if>
    </div>
  );
}`}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                把 <code>user?.premium</code>、<code>isAdult</code>{" "}
                等先计算出来，模板更清爽。
              </p>
            </div>

            <div className=" p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                嵌套条件
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                建议采用“先外后内”的层级：外层判断资源/可见性，内层判断权限/具体动作。
                超过两层时优先考虑拆分子组件。
              </p>
              <CodeSection
                variant="purple"
                title="嵌套结构"
                description="外层存在性，内层权限/动作"
                code={`function ProductDisplay({ product, user }) {
  return (
    <div>
      <if cond={product}>
        <if cond={user?.isAdmin}>
          <button>编辑商品</button>
        </if>
        <else-if cond={user?.canPurchase}>
          <button>购买</button>
        </else-if>
        <else>
          <p>请登录后购买</p>
        </else>
      </if>
      <else>
        <p>商品不存在</p>
      </else>
    </div>
  );
}`}
              />
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li>先判断“是否可展示”，再判断“能做什么”。</li>
                <li>当嵌套过深时，用子组件承载一层逻辑，层次更清晰。</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 最佳实践 */}
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            最佳实践
          </h2>
          <div className="space-y-4">
            <div className=" p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                1. 提前返回
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                对“前置条件不满足直接结束”的场景，使用函数级提前返回，能有效减少模板中的分支嵌套，
                让主体渲染更聚焦。
              </p>
              <CodeSection
                variant="gray"
                title="提前返回示例"
                description="把前置条件放在函数顶部"
                code={`function AdminPanel({ user }) {
  if (!user) return <p>请先登录</p>;
  if (!user.isAdmin) return <p>权限不足</p>;
  return <div>管理员面板</div>;
}`}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                减少嵌套深度，主体结构更清晰。
              </p>
            </div>

            <div className=" p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                2. 条件组合
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                先用语义化的布尔变量表达复杂逻辑，再在模板中使用这些变量做条件判断；
                模板只负责“展示是什么”，逻辑放在上方变量。
              </p>
              <CodeSection
                variant="gray"
                title="语义变量示例"
                description="先计算再渲染"
                code={`function UserAccess({ user, resource }) {
  const canView = user && user.permissions.includes('view');
  const canEdit = canView && user.permissions.includes('edit');
  const isOwner = resource.ownerId === user.id;

  return (
    <div>
      <if cond={canView}>
        <div>{resource.content}</div>
        <if cond={canEdit || isOwner}>
          <button>编辑</button>
        </if>
      </if>
      <else>
        <p>无访问权限</p>
      </else>
    </div>
  );
}`}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                变量名如 <code>canView</code>、<code>isOwner</code>{" "}
                能直接表达业务含义。
              </p>
            </div>

            <div className=" p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                3. 避免过度嵌套（组件化）
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                当分支过多或逻辑交织时，把某一整块“业务段落”抽成子组件，让每个组件只关注一个维度的条件判断，
                父组件负责组织与拼装。
              </p>
              <CodeSection
                variant="green"
                title="组件化示例"
                description="拆分权限视图"
                code={`function UserActions({ user, resource }) {
  return (
    <div>
      <ViewPermission user={user}>
        <ResourceContent resource={resource} />
        <EditPermission user={user} resource={resource}>
          <EditButtons resource={resource} />
        </EditPermission>
      </ViewPermission>
    </div>
  );
}

function ViewPermission({ user, children }) {
  return (
    <>
      <if cond={user && user.permissions.includes('view')}>
        {children}
      </if>
      <else>
        <p>无访问权限</p>
      </else>
    </>
  );
}`}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                父组件把控“展示哪些块”，子组件决定“块内如何判断”。
              </p>
            </div>
          </div>
        </div>

        {/* 注意事项 */}
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            注意事项
          </h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800">
            <ul className="space-y-3 text-amber-900 dark:text-amber-100">
              <li>
                条件标签必须包含 <code>cond</code> 属性，表达式应返回布尔值。
              </li>
              <li>
                <code>else-if</code> 和 <code>else</code> 必须紧跟在{" "}
                <code>if</code> 或 <code>else-if</code> 之后。
              </li>
              <li>
                避免在 <code>cond</code>{" "}
                中进行昂贵计算，建议提前计算为变量并复用。
              </li>
              <li>
                分支很多时优先考虑“分层 + 组件化”，控制嵌套深度在两层以内。
              </li>
            </ul>
          </div>
        </div>

        {/* 下一步 */}
        <div className=" border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            继续学习
          </h3>
          <p className="text-blue-800 dark:text-blue-200 mb-4">
            参考 <code>/tutorial</code> 文件夹下的其他组件，进一步了解更多用法。
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
