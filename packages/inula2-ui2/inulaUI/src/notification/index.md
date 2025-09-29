# Notification 通知提示框

全局展示通知提醒信息。

## 何时使用

在系统四个角显示通知提醒信息。经常用于以下情况：

- 较为复杂的通知内容。
- 带有交互的通知，给出用户下一步的行动点。
- 系统主动推送。

## 代码演示

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/notification/demo1"
  style="width: 100%; height: 200px; border: 0;"
></iframe>
<h3>基础通知</h3>
<p>演示信息、成功、警告、错误四种类型的通知用法。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Input,Tag,Button} from 'inula-ui';
import { info, success, warning, error } from 'inula-ui/notification';

function Demo1() {
  function show(type) {
    if (type === 'info') info({ message: '信息提示', bgColor: true, description: '这是一条普通的信息提示' });
    if (type === 'success') success({ message: '成功提示', description: '操作已成功完成' });
    if (type === 'warning') warning({ message: '警告提示', description: '请注意相关事项' });
    if (type === 'error') error({ message: '错误提示', description: '操作失败，请重试' });
    if (type === 'text') text({ message: '文本提示', bgColor: true, description: '这是一条普通的文本提示' });
  }
  return (
    <div style={{ display: 'flex' }}>
      <Button type="primary" onClick={() => show('info')}>显示信息通知</Button>
      <Button type="primary" onClick={() => show('success')} style={{ marginLeft: 8 }}>显示成功通知</Button>
      <Button type="primary" onClick={() => show('warning')} style={{ marginLeft: 8 }}>显示警告通知</Button>
      <Button type="primary" danger onClick={() => show('error')} style={{ marginLeft: 8 }}>显示错误通知</Button>
    </div>
  );
}

export default Demo1; 

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/notification/demo2"
  style="width: 100%; height:200px; border: 0;"
></iframe>
<h3>自定义关闭按钮</h3>
<p>演示如何自定义通知的关闭按钮文本和样式。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Input,Tag,Button} from 'inula-ui';

import { text } from 'inula-ui/notification';

function Demo2() {
  function showCustomClose() {
    text({
      message: '自定义关闭按钮',
      description: '关闭按钮变成了"关闭"并加粗变色',
      closeText: '关闭',
      closeClassName: 'my-close-btn',
    });
  }
  return (
    <div style={{ display: 'flex' }}>
        <Button type="primary" onClick={showCustomClose}>自定义关闭按钮</Button>
    </div>
  );
}

export default Demo2;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/notification/demo3"
  style="width: 100%; height: 200px; border: 0;"
></iframe>
<h3>自定义操作按钮</h3>
<p>演示如何为通知添加自定义操作按钮。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Input,Tag,Button} from 'inula-ui';

import { text } from 'inula-ui/notification';

function Demo3() {
  function showCustomActions() {
    text({
      message: 'Notification Title',
      description: 'A function will be called after the notification is closed...',
      actions: ({ notification, remove, onClose }) => (
        <>
          <Button type="link" size="small" onClick={() => remove(notification.key)}>Destroy All</Button>
          <Button type="primary" size="small" onClick={onClose} style={{ marginLeft: 8 }}>Confirm</Button>
        </>
      )
    });
  }
  return (
    <div style={{ display: 'flex' }}>
        <Button type="primary" onClick={showCustomActions}>自定义操作按钮</Button>
    </div>
  );
}

export default Demo3; 

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/notification/demo4"
  style="width: 100%; height: 500px; border: 0;"
></iframe>
<h3>弹出位置</h3>
<p>演示通知在不同屏幕位置的弹出效果。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Input,Button} from 'inula-ui';

import { text } from 'inula-ui/notification';

function Demo4() {
  return (
    <div style={{ display: 'flex' }}>
      <Button type="primary" onClick={() => text({ message: '右上角', description: 'placement: topRight', placement: 'topRight' })}>右上角(topRight)</Button>
      <Button type="primary" onClick={() => text({ message: '左上角', description: 'placement: topLeft', placement: 'topLeft' })} style={{ marginLeft: 8 }}>左上角(topLeft)</Button>
      <Button type="primary" onClick={() => text({ message: '右下角', description: 'placement: bottomRight', placement: 'bottomRight' })} style={{ marginLeft: 8 }}>右下角(bottomRight)</Button>
      <Button type="primary" onClick={() => text({ message: '左下角', description: 'placement: bottomLeft', placement: 'bottomLeft' })} style={{ marginLeft: 8 }}>左下角(bottomLeft)</Button>
      <Button type="primary" onClick={() => text({ message: '顶部中间', description: 'placement: top', placement: 'top' })} style={{ marginLeft: 8 }}>顶部中间(top)</Button>
      <Button type="primary" onClick={() => text({ message: '底部中间', description: 'placement: bottom', placement: 'bottom' })} style={{ marginLeft: 8 }}>底部中间(bottom)</Button>
    </div>
  );
}

export default Demo4; 

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/notification/demo5"
  style="width: 100%; height: 200px; border: 0;"
></iframe>
<h3>选择背景颜色</h3>
<p>可以传入bgColor显示不同的背景颜色</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Input,Button} from 'inula-ui';

import { text, info } from 'inula-ui/notification';

function Demo5() {
  function show(type) {
    if (type === 'text') text({ message: '不带bgColor', description: '这是一条普通的信息提示' });
    if (type === 'info') info({ message: '带bgColor', bgColor: true, description: '这是一条普通的文本提示' });
  }
  return (
    <div style={{ display: 'flex' }}>
      <Button type="primary" onClick={() => show('text')}>不带bgColor</Button>
      <Button type="primary" onClick={() => show('info')} style={{ marginLeft: 8 }}>带bgColor</Button>
    </div>
  );
}

export default Demo5; 
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

## API

### 静态方法

- `notification.open(options)`：以自定义 `type` 打开通知。
- `notification.info(options)`：信息通知。
- `notification.success(options)`：成功通知。
- `notification.warning(options)`：警告通知。
- `notification.error(options)`：错误通知。
- `notification.text(options)`：无图标的文本通知。

> 以上方法均为即时调用，不返回实例；通知会在 `duration` 到时或点击关闭按钮后消失。

### options

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|---|---|---|---|---|
| message | 通知标题 | `string` | - | - |
| description | 通知内容 | `string` | - | - |
| duration | 自动关闭时间，单位 ms；为 `0` 时不自动关闭 | `number` | - | `3000` |
| placement | 弹出位置 | `"topLeft" \| "topRight" \| "bottomLeft" \| "bottomRight" \| "top" \| "bottom"` | - | `topRight` |
| closeText | 关闭按钮文本 | `string` | - | `×` |
| closeClassName | 关闭按钮类名 | `string` | - | `inula-notification-close` |
| actions | 自定义操作区域 | `ReactNode \| (ctx) => ReactNode` | - | - |
| bgColor | 是否使用类型背景色 | `boolean` | - | `false` |
| onClose | 点击关闭时回调 | `() => void` | - | - |
| type | 通知类型，仅 `open` 时需要 | `"info" \| "success" \| "warning" \| "error" \| "text"` | - | `info` |

说明：

- `actions` 支持传入节点或函数。函数签名：`({ notification, remove, onClose }) => ReactNode`，可通过 `remove(notification.key)` 主动关闭当前通知，或调用 `onClose()` 触发关闭。
- 未设置 `duration` 时默认为 3000ms；设为 `0` 可常驻。
- `placement` 支持六个方位：`topRight`（默认）、`topLeft`、`bottomRight`、`bottomLeft`、`top`、`bottom`。
- `type` 在 `info/success/warning/error/text` 方法中已内置，无需再传；仅在使用 `open` 时按需指定。
