# Framework Adapters

这个目录包含了针对不同前端框架的事件适配器，用于确保 Playwright Actuator 能够正确触发框架特有的事件系统。

## React Adapter

React 适配器专门处理 React 组件的合成事件（SyntheticEvents），确保能够正确触发 React 的 `onChange`、`onInput` 等事件处理器。

### 特性

- ✅ 自动检测 React 组件
- ✅ 支持 React 17+ 的 Fiber 架构
- ✅ 支持老版本 React 的内部实例结构
- ✅ 创建完整的 SyntheticEvent 对象
- ✅ 自动回退到原生事件
- ✅ 智能事件处理器查找
- ✅ 用户交互事件模拟（focus/blur）

### 使用方法

#### 1. 通过 LocatorAdapter 自动使用

```javascript
import { page } from '@copilotkit/playwright-actuator';

// 这些方法会自动使用 React 适配器处理事件
await page.getByLabel('姓名输入框').fill('张三');
await page.getByRole('checkbox', { name: '同意条款' }).check();
await page.getByLabel('国家选择').selectOption('中国');
```

#### 2. 直接使用 React 适配器

```javascript
import { getReactAdapter, triggerReactChangeEvent } from '@copilotkit/playwright-actuator/framework-adapters';

const reactAdapter = getReactAdapter();

// 触发 change 事件
const element = document.querySelector('#name-input');
const result = await reactAdapter.triggerChangeEvent(element, '张三');

console.log('事件触发方式:', result.method); // 'react' 或 'native'
console.log('是否成功:', result.success);
```

#### 3. 使用便捷函数

```javascript
import { triggerReactChangeEvent, triggerReactInputEvent } from '@copilotkit/playwright-actuator/framework-adapters';

const nameInput = document.querySelector('#name-input');

// 触发 React change 事件
await triggerReactChangeEvent(nameInput, '张三');

// 触发 React input 事件
await triggerReactInputEvent(nameInput, '张三');
```

### API 参考

#### ReactEventAdapter 类

##### 方法

- `triggerChangeEvent(element, value?)` - 触发 change 事件
- `triggerInputEvent(element, value?)` - 触发 input 事件
- `triggerInteractionEvents(element)` - 触发用户交互事件（focus/blur）
- `isReactComponent(element)` - 检查元素是否是 React 组件

##### 返回值

所有触发方法都返回 `ReactEventTriggerResult`：

```typescript
interface ReactEventTriggerResult {
  success: boolean;        // 是否成功触发事件
  method: 'react' | 'native'; // 使用的触发方式
  error?: string;          // 错误信息（如果失败）
}
```

### 工作原理

1. **智能组件检测**: 
   - 自动检测元素是否为 React 组件
   - 通过查找 React 内部属性（`__reactFiber`、`__reactInternalInstance` 等）来识别

2. **双轨事件处理**:
   - **React 组件**: 使用 React 适配器处理合成事件
   - **原生元素**: 直接触发原生 DOM 事件（更高效）

3. **React 事件处理流程**:
   - 在 React Fiber 的不同属性中查找事件处理器
   - 创建符合 React 标准的 SyntheticEvent 对象
   - 直接调用 React 的事件处理器
   - 如果失败，回退到原生事件

4. **原生事件处理流程**:
   - 创建标准的 DOM 事件对象
   - 正确设置事件属性（target、bubbles 等）
   - 直接通过 `dispatchEvent` 触发

5. **性能优化**: 只对检测到的 React 组件使用复杂的合成事件处理

### 支持的 React 版本

- ✅ React 18.x
- ✅ React 17.x
- ✅ React 16.x
- ✅ React 15.x（有限支持）

### 支持的事件类型

- ✅ `onChange` - 表单控件值变化
- ✅ `onInput` - 输入事件
- ✅ `onFocus` - 获得焦点
- ✅ `onBlur` - 失去焦点

### 支持的元素类型

- ✅ `<input>` - 所有类型的输入框
- ✅ `<textarea>` - 文本区域
- ✅ `<select>` - 下拉选择框
- ✅ `<input type="checkbox">` - 复选框
- ✅ `<input type="radio">` - 单选框

### 调试

启用调试日志来查看事件触发过程：

```javascript
import { getReactAdapter } from '@copilotkit/playwright-actuator/framework-adapters';

const logger = {
  debug: (message, ...args) => console.log('[DEBUG]', message, ...args),
  info: (message, ...args) => console.log('[INFO]', message, ...args),
  warn: (message, ...args) => console.warn('[WARN]', message, ...args),
  error: (message, ...args) => console.error('[ERROR]', message, ...args)
};

const reactAdapter = getReactAdapter(logger);
```

### 扩展支持

要添加对其他框架的支持，可以参考 React 适配器的实现模式：

1. 在 `framework-adapters` 目录下创建新的适配器文件
2. 实现相应的事件触发逻辑
3. 在 `index.ts` 中导出新的适配器
4. 在 `locator-adapter.ts` 中集成使用

### 常见问题

**Q: 为什么需要 React 适配器？**
A: React 使用自己的合成事件系统，普通的 DOM 事件无法正确触发 React 组件的事件处理器。

**Q: 如何知道事件是否成功触发？**
A: 检查返回的 `ReactEventTriggerResult` 对象的 `success` 属性和 `method` 属性。

**Q: 支持自定义事件吗？**
A: 目前主要支持表单相关的标准事件，未来版本可能会扩展支持更多事件类型。

**Q: 性能如何？**
A: React 适配器的性能开销很小，只在检测到 React 组件时才会尝试直接触发 React 事件。

## 未来计划

- [ ] Vue.js 适配器
- [ ] Angular 适配器  
- [ ] Svelte 适配器
- [ ] 更多事件类型支持
- [ ] 自定义事件支持