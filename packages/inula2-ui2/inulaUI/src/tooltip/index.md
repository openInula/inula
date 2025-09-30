# Tooltip 文字提示

简单的文字提示气泡框。

## 何时使用

鼠标移入则显示提示，移出消失，气泡浮层不承载复杂文本和操作。

可用来代替系统默认的 title 提示，提供一个 按钮/文字/操作 的文案解释。

## 代码演示

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tooltip/demo1"
  style="width: 100%; height: 110px; border: 0;"
></iframe>
<h3>基本用法</h3>
<p>最基础的 Tooltip 用法，鼠标悬停显示提示内容。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Tooltip,Button} from 'inula-ui';

function Demo1() {
    return (
        <div style={{ display: 'flex', margin: '20px' }}>
            <Tooltip title="提示文字">
                <Button type="primary">鼠标移入显示提示</Button>
            </Tooltip>
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
  src="http://localhost:5173/#/tooltip/demo2"
  style="width: 100%; height: 130px; border: 0"
></iframe>
<h3>不同位置</h3>
<p>Tooltip 支持在上、下、左、右等不同方向显示。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Tooltip,Button} from 'inula-ui';

function Demo() {
  return (
    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', height:'90px', alignItems:'center' }}>
      <div style={{ display: 'flex' }}>
        <Tooltip title="上方提示" placement="top" trigger="hover">
          <Button type="primary">上方 hover</Button>
        </Tooltip>
      </div>
      <div style={{ display: 'flex' }}>
        <Tooltip title="下方提示" placement="bottom">
          <Button type="primary">下方 hover</Button>
        </Tooltip>
      </div>
      <div style={{ display: 'flex' }}>
        <Tooltip title="左侧提示" placement="left">
          <Button type="primary">左侧 hover</Button>
        </Tooltip>
      </div>
      <div style={{ display: 'flex' }}>
        <Tooltip title="右侧提示" placement="right">
          <Button type="primary">右侧 hover</Button>
        </Tooltip>
      </div>
    </div>
  );
}
export default Demo;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tooltip/demo3"
  style="width: 100%; height: 130px; border: 0;"
></iframe>
<h3>模式</h3>
<p>Tooltip 支持hover和click模式</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Tooltip,Button} from 'inula-ui';

function Demo() {
  return (
    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', height:'90px', alignItems:'center' }}>
      <div style={{ display: 'flex' }}>
        <Tooltip title="hover" trigger="hover">
          <Button type="primary">hover</Button>
        </Tooltip>
      </div>
      <div style={{ display: 'flex' }}>
        <Tooltip title="click" trigger="click">
          <Button type="primary">click</Button>
        </Tooltip>
      </div>
    </div>
  );
}
export default Demo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

## API

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|---|---|---|---|---|
| title | 提示内容 | `ReactNode` | - | - |
| placement | 提示框位置 | `string` | `top` / `bottom` / `left` / `right` | `top` |
| trigger | 触发方式 | `string` | `hover` / `click` | `hover` |
| className | 自定义类名 | `string` | - | `""` |
| style | 行内样式 | `CSSProperties` | - | `{}` |
| children | 触发节点 | `ReactNode` | - | - |

说明：

- 触发说明：`hover` 下鼠标移入显示/移出隐藏；`click` 下单击切换显隐；
- 点击触发节点与浮层外部区域会关闭已打开的提示框（外部点击防抖由文档事件实现）。
- `className` 与 `style` 作用于外层包裹元素（触发节点容器）。
