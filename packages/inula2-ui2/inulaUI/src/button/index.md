# Button 按钮组件

支持五种类型和四种状态属性。

## 何时使用

标记了一个（或封装一组）操作命令，响应用户点击行为，触发相应的业务逻辑。

在 inula-ui 中我们提供了五种按钮。

- 🔵 主按钮：用于主行动点，一个操作区域只能有一个主按钮。
- ⚪️ 默认按钮：用于没有主次之分的一组行动点。
- 😶 虚线按钮：常用于添加操作。
- 🔤 文本按钮：用于最次级的行动点。
- 🔗 链接按钮：一般用于链接，即导航至某位置。

以及四种状态属性与上面配合使用。

- ⚠️ 危险：删除/移动/修改权限等危险操作，一般需要二次确认。
- 👻 幽灵：用于背景色比较复杂的地方，常用在首页/产品页等展示场景。
- 🚫 禁用：行动点不可用的时候，一般需要文案解释。
- 🔃 加载中：用于异步操作等待反馈的时候，也可以避免多次提交。

## 代码演示

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/button/demo1"
  style="width: 100%; height: 55px; border: 0;"
></iframe>
<h3>基本</h3>
<p>展示按钮的五种类型：主按钮、默认按钮、虚线按钮、文本按钮、链接按钮、变体样式。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Button} from 'inula-ui';

function ButtonDemo() {
    let loading = false;
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <Button type="primary">主按钮</Button>
            <Button>默认按钮</Button>
            <Button type="dashed">虚线按钮</Button>
            <Button type="text">文本按钮</Button>
            <Button type="link">链接按钮</Button>
            <Button variant="outlined">outlined</Button>
            <Button variant="filled">filled</Button>
            <Button variant="borderless">borderless</Button>
            <Button variant="underlined">underlined</Button>
        </div>
    );
}
export default ButtonDemo;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/button/demo2"
  style="width: 100%; height: 55px; border: 0;"
></iframe>
<h3>危险</h3>
<p>展示五种类型按钮的'危险'状态用法。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Button} from 'inula-ui';

function ButtonDemo() {
    let loading = false;
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <Button type="primary" danger>危险主按钮</Button>
            <Button danger>危险默认按钮</Button>
            <Button type="dashed" danger>危险虚线按钮</Button>
            <Button type="text" danger>危险文本按钮</Button>
            <Button type="link" danger>危险链接按钮</Button>
        </div>
    );
} 
export default ButtonDemo;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/button/demo3"
  style="width: 100%; height: 85px; border: 0;"
></iframe>
<h3>幽灵</h3>
<p>展示按钮的'幽灵'状态，包括主按钮、默认按钮和危险主按钮的幽灵样式。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Button} from 'inula-ui';

function ButtonDemo() {
    return (
        <div className="demo-dark-bg" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <Button type="primary" ghost>主幽灵按钮</Button>
            <Button ghost>默认幽灵按钮</Button>
            <Button type="primary" danger ghost>危险幽灵按钮</Button>
        </div>
    );
}
export default ButtonDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/button/demo4"
  style="width: 100%; height: 55px; border: 0;"
></iframe>
<h3>禁用</h3>
<p>展示五种类型按钮的'禁用'状态用法。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Button} from 'inula-ui';

function ButtonDemo() {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <Button type="primary" disabled>禁用主按钮</Button>
            <Button disabled>禁用默认按钮</Button>
            <Button type="dashed" disabled>禁用虚线按钮</Button>
            <Button type="text" disabled>禁用文本按钮</Button>
            <Button type="link" disabled>禁用链接按钮</Button>
        </div>
    );
} 
export default ButtonDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/button/demo5"
  style="width: 100%; height: 55px; border: 0;"
></iframe>
<h3>加载中</h3>
<p>展示五种类型按钮的'加载中'状态用法。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Button} from 'inula-ui';

function ButtonDemo() {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <Button type="primary" loading>加载中主按钮</Button>
            <Button loading>加载中默认按钮</Button>
            <Button type="dashed" loading>加载中虚线按钮</Button>
            <Button type="text" loading>加载中文本按钮</Button>
            <Button type="link" loading>加载中链接按钮</Button>
        </div>
    );
} 
export default ButtonDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/button/demo6"
  style="width: 100%; height: 55px; border: 0;"
></iframe>
<h3>交互加载</h3>
<p>演示点击按钮后进入加载中状态，1.5秒后恢复。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Button} from 'inula-ui';

function ButtonDemo() {
  let loading = false;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      <Button type="primary" loading={loading} onClick={() => {
        loading = true;
        setTimeout(() => loading = false, 1500);
        console.log(loading);
      }}>点击加载</Button>
    </div>
  );
} 
export default ButtonDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

## API

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|---|---|---|---|---|
| type | 按钮类型 | `string` | `primary` / `default` / `dashed` / `text` / `link` | `default` |
| variant | 视觉变体 | `string` | `outlined` / `filled` / `borderless` / `underlined` | `outlined` |
| danger | 危险状态样式 | `boolean` | - | `false` |
| ghost | 幽灵样式（深色背景常用） | `boolean` | - | `false` |
| disabled | 禁用状态 | `boolean` | - | `false` |
| loading | 加载中状态（禁用且展示旋转图标） | `boolean` | - | `false` |
| htmlType | 原生按钮类型 | `string` | `button` / `submit` / `reset` | `button` |
| onClick | 点击回调 | `(e) => void` | - | - |
| children | 按钮内容 | `ReactNode` | - | - |

说明：其余属性会透传给原生 `button` 元素（如 `title`、`id`、`aria-*` 等）。
