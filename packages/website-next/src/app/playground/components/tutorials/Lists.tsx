import { ChevronRight } from "lucide-react";
import CodeSection from "../CodeSection";

export default function List() {
  return (
    <>
      <div className="px-6 py-8 max-w-4xl">
        {/* 介绍 */}
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            列表渲染
          </h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              OpenInula 提供了内置的 <code>for</code> 标签来实现列表渲染，
              让数组的遍历与展示更加直观、语义清晰。你只需传入要遍历的数组到
              <code>each</code> 属性，并在回调中返回要渲染的 JSX 元素即可。
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              与传统的 <code>Array.map()</code> 写法相比，<code>for</code> 标签
              更贴近模板语义，结构更简洁，阅读成本更低；对于初学者来说，
              也更容易理解“对每一项渲染一段结构”的含义。
            </p>
          </div>
        </div>

        {/* 基本用法 */}
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            基本用法
          </h2>
          <div className="space-y-6">
            <div className="p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                简单列表
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                把要遍历的数组传入 <code>each</code>
                ，回调函数的第一个参数即当前项：
              </p>
              <CodeSection
                variant="gray"
                title="FruitList.jsx"
                description="使用 for 标签遍历数组"
                code={`function FruitList() {
  const fruits = ['苹果', '香蕉', '橙子'];
  
  return (
    <ul>
      <for each={fruits}>
        {(fruit) => <li>{fruit}</li>}
      </for>
    </ul>
  );
}`}
              />
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li>
                  <code>for</code> 必须包含 <code>each</code>{" "}
                  属性，值为待遍历数组。
                </li>
                <li>回调函数返回一个 JSX 元素作为每一项的渲染结果。</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                带索引的列表
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                回调函数的第二个参数是索引，可用于展示编号或生成 ID：
              </p>
              <CodeSection
                variant="gray"
                title="NumberedList.jsx"
                description="通过第二个参数获取索引"
                code={`function NumberedList() {
  const items = ['第一项', '第二项', '第三项'];
  
  return (
    <ul>
      <for each={items}>
        {(item, index) => (
          <li>#{index + 1}: {item}</li>
        )}
      </for>
    </ul>
  );
}`}
              />
            </div>

            <div className="p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                对象列表
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                遍历对象数组时，直接在回调中访问对象的各个字段进行渲染：
              </p>
              <CodeSection
                variant="blue"
                title="UserTable.jsx"
                description="渲染对象数组"
                code={`function UserList() {
  const users = [
    { id: 1, name: '张三', age: 25 },
    { id: 2, name: '李四', age: 30 },
    { id: 3, name: '王五', age: 28 }
  ];
  
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>姓名</th>
          <th>年龄</th>
        </tr>
      </thead>
      <tbody>
        <for each={users}>
          {(user) => (
            <tr>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.age}</td>
            </tr>
          )}
        </for>
      </tbody>
    </table>
  );
}`}
              />
            </div>
          </div>
        </div>

        {/* 列表操作 */}
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            列表操作
          </h2>
          <div className="space-y-6">
            <div className="p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                列表过滤
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                在渲染之前，先用 <code>filter</code> 得到需要展示的子集，
                模板中保持“只负责展示”的职责更清晰：
              </p>
              <CodeSection
                variant="gray"
                title="ActiveUserList.jsx"
                description="渲染前进行过滤"
                code={`function ActiveUserList() {
  const users = [
    { id: 1, name: '张三', active: true },
    { id: 2, name: '李四', active: false },
    { id: 3, name: '王五', active: true }
  ];
  
  const activeUsers = users.filter(user => user.active);
  
  return (
    <ul>
      <for each={activeUsers}>
        {(user) => <li>{user.name}</li>}
      </for>
    </ul>
  );
}`}
              />
            </div>

            <div className="p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                列表排序
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                需要按特定规则展示时，复制一份数组并排序，避免原地修改：
              </p>
              <CodeSection
                variant="amber"
                title="SortedUserList.jsx"
                description="渲染前进行排序"
                code={`function SortedUserList() {
  const users = [
    { id: 1, name: '张三', age: 25 },
    { id: 2, name: '李四', age: 30 },
    { id: 3, name: '王五', age: 28 }
  ];
  
  const sortedUsers = [...users].sort((a, b) => a.age - b.age);
  
  return (
    <ul>
      <for each={sortedUsers}>
        {(user) => (
          <li>{user.name} ({user.age}岁)</li>
        )}
      </for>
    </ul>
  );
}`}
              />
            </div>

            <div className="p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                嵌套列表
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                列表内部可以继续使用 <code>for</code>，适合树状/分组数据：
              </p>
              <CodeSection
                variant="purple"
                title="NestedList.jsx"
                description="内外两层 for 嵌套"
                code={`function NestedList() {
  const departments = [
    {
      name: '技术部',
      teams: ['前端组', '后端组', '测试组']
    },
    {
      name: '产品部',
      teams: ['设计组', '运营组']
    }
  ];
  
  return (
    <div>
      <for each={departments}>
        {(dept) => (
          <div>
            <h3>{dept.name}</h3>
            <ul>
              <for each={dept.teams}>
                {(team) => <li>{team}</li>}
              </for>
            </ul>
          </div>
        )}
      </for>
    </div>
  );
}`}
              />
            </div>
          </div>
        </div>

        {/* 最佳实践 */}
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            最佳实践
          </h2>
          <div className="space-y-6">
            <div className="p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                1. 列表项组件化
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                当每个列表项结构较复杂（包含多块信息、交互）时，建议抽成子组件，
                父组件只负责“遍历与传参”，子组件聚焦“展示与交互”。
              </p>
              <CodeSection
                variant="green"
                title="UserItemComponent.jsx"
                description="用子组件承载复杂项"
                code={`function UserItem({ user }) {
  return (
    <div className="user-item">
      <img src={user.avatar} alt={user.name} />
      <div className="user-info">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
      </div>
    </div>
  );
}
 
function UserList() {
  const users = [/* ... */];
  
  return (
    <div className="user-list">
      <for each={users}>
        {(user) => <UserItem user={user} />}
      </for>
    </div>
  );
}`}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                组件化有助于复用与测试，也能降低父组件的复杂度。
              </p>
            </div>

            <div className="p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                2. 列表更新优化（不可变数据）
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                当列表项会被勾选、切换等更新时，推荐使用不可变数据方式更新，
                通过创建新数组触发渲染，逻辑更容易推断：
              </p>
              <CodeSection
                variant="gray"
                title="TodoList.jsx"
                description="用 map 生成新数组，避免原地修改"
                code={`function TodoList() {
  let todos = [
    { id: 1, text: '学习 OpenInula', done: false },
    { id: 2, text: '写文档', done: false }
  ];
  
  function toggleTodo(id) {
    todos = todos.map(todo =>
      todo.id === id
        ? { ...todo, done: !todo.done }
        : todo
    );
  }
  
  return (
    <ul>
      <for each={todos}>
        {(todo) => (
          <li
            onClick={() => toggleTodo(todo.id)}
            style={{ textDecoration: todo.done ? 'line-through' : 'none' }}
          >
            {todo.text}
          </li>
        )}
      </for>
    </ul>
  );
}`}
              />
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li>
                  用 <code>map</code>、<code>filter</code> 这类返回新数组的
                  API。
                </li>
                <li>
                  避免原地 <code>push</code>、<code>splice</code>{" "}
                  导致状态难以追踪。
                </li>
              </ul>
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
                <code>for</code> 标签必须包含 <code>each</code> 属性。
              </li>
              <li>回调函数必须返回 JSX 元素。</li>
              <li>对于大列表，考虑分页或虚拟滚动以提升性能。</li>
              <li>避免在渲染函数中进行复杂计算，建议提前处理数据。</li>
            </ul>
          </div>
        </div>

        {/* 下一步 */}
        <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            继续学习
          </h3>
          <p className="text-blue-800 dark:text-blue-200 mb-4">
            参考 <code>/tutorial</code> 文件夹下的其他组件，继续探索更多
            OpenInula 特性。
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
