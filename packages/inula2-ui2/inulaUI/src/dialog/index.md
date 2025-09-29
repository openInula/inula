# Modal 对话框

展示一个对话框，提供标题、内容区、操作区。

## 何时使用

需要用户处理事务，又不希望跳转页面以致打断工作流程时，可以使用 Modal 在当前页面正中打开一个浮层，承载相应的操作。

## 代码演示

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/modal/demo1"
  style="width: 100%; height: 300px; border: 0;"
></iframe>
<h3>普通弹窗</h3>
<p>演示普通弹窗的用法。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Modal,Button} from 'inula-ui';


function Demo1() {
    let open = false;

    return (
        <div>
            <Button type="primary" onClick={() => open = true}>Open Modal</Button>
            <Modal
                open={open}
                onClose={() => open = false}
                title="普通弹窗"
            >
                <div>这是一个最基础的弹出框内容。</div>
            </Modal>
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
  src="http://localhost:5173/#/modal/demo2"
  style="width: 100%; height: 300px; border: 0;"
></iframe>
<h3>自定义标题样式</h3>
<p>演示如何自定义弹窗的标题样式</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Modal,Button} from 'inula-ui';

function Demo2() {
    let open = false;

    return (
        <div>
            <Button type="primary" onClick={() => open = true}>Open Modal</Button>
            <Modal
                open={open}
                title={<div style={{ color: '#1890ff' }}>自定义标题样式</div>}
                onClose={() => open = false}
            >
                <div>对话框内容。</div>
            </Modal>
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
  src="http://localhost:5173/#/modal/demo3"
  style="width: 100%; height: 500px; border: 0;"
></iframe>
<h3>自定义内容</h3>
<p>可以在对话框内放置任何内容。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Modal,Button} from 'inula-ui';

function Demo3() {
    let open = false;

    return (
        <div>
            <Button type="primary" onClick={() => open = true}>Open Modal</Button>
            <Modal
                open={open}
                title="自定义页脚"
                onClose={() => open = false}
            >
                <div style={{ textAlign: 'center' }}>
                    <h3>这是一个自定义内容</h3>
                    <p>可以放置任何内容</p>
                    <img src="https://placekitten.com/300/200" alt="示例图片" />
                </div>
            </Modal>
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
  src="http://localhost:5173/#/modal/demo4"
  style="width: 100%; height: 300px; border: 0;"
></iframe>
<h3>自定义页脚</h3>
<p>演示如何为弹窗添加自定义页脚。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Modal,Button} from 'inula-ui';

function Demo4() {
    let open = false;

    return (
        <div>
            <Button type="primary" onClick={() => open = true}>Open Modal</Button>
            <Modal
                open={open}
                title={<div style={{ color: '#1890ff' }}>自定义标题样式</div>}
                onClose={() => open = false}
                footer={
                    <Button onClick={() => open = false}>关闭</Button>
                }
            >
                <div>对话框内容。</div>
            </Modal>
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
  src="http://localhost:5173/#/modal/demo5"
  style="width: 100%; height: 300px; border: 0;"
></iframe>
<h3>居中弹窗</h3>
<p>设置 centered 可以让对话框垂直居中。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Modal,Button} from 'inula-ui';

function Demo5() {
    let open = false;

    return (
        <div>
            <Button onClick={() => open = true}>Open Modal</Button>
            <Modal
                open={open}
                title="居中弹窗"
                onClose={() => open = false}
                centered={true}
            >
                <div>对话框内容。</div>
            </Modal>
        </div>
    );
}
export default Demo5;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/modal/demo6"
  style="width: 100%; height: 300px; border: 0;"
></iframe>
<h3>异步关闭弹窗</h3>
<p>演示如何设置异步关闭弹窗。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Modal,Button} from 'inula-ui';


function Demo6() {
    let open = false;

    const handleOk = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          open = false;
        } catch (error) {
          console.error('操作失败:', error);
        }
      };
    return (
        <div>
            <Button onClick={() => open = true}>Open Modal</Button>
            <Modal
                open={open}
                onClose={() => open = false}
                onBeforeClose={handleOk}
                title="异步关闭弹窗"
            >
                <div>内容</div>
            </Modal>
        </div>
    );
}
export default Demo6;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/modal/demo7"
  style="width: 100%; height: 300px; border: 0;"
></iframe>
<h3>全屏弹窗</h3>
<p>演示如何设置全屏弹窗。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Modal,Button} from 'inula-ui';

function Demo7() {
    let open = false;

    return (
        <div>
            <Button type="primary" onClick={() => open = true}>Open Modal</Button>
            <Modal
                open={open}
                onClose={() => open = false}
                title="全屏弹窗"
                fullscreen={true}
            >
                <div>这是全屏弹窗内容</div>
            </Modal>
        </div>
    );
}
export default Demo7;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->
## API

| 属性 | 说明 | 类型 | 默认值 |
|---|---|---|---|
| open | 是否打开对话框 | `boolean` | - |
| onClose | 关闭回调 | `() => void` | - |
| title | 标题内容 | `ReactNode` | - |
| children | 对话框内容区域 | `ReactNode` | - |
| footer | 自定义页脚；不传则展示默认页脚（取消/确定） | `ReactNode` | - |
| className | 自定义类名 | `string` | `""` |
| style | 行内样式 | `CSSProperties` | `{}` |
| maskClosable | 点击遮罩是否可关闭 | `boolean` | `true` |
| zIndex | 遮罩及弹窗层级 | `number` | `1000` |
| fullscreen | 是否全屏显示 | `boolean` | `false` |
| centered | 是否垂直居中 | `boolean` | `false` |
| onBeforeClose | 关闭前拦截，返回 `false` 可阻止关闭；支持返回 `Promise<boolean>` | `() => boolean \| Promise<boolean>` | - |

说明：

- 未传 `footer` 时，组件会渲染默认页脚：`取消` 与 `确定` 按钮，均会触发关闭逻辑。
- `onBeforeClose` 支持同步或异步返回；当返回值为 `false`（或异步返回 `false`）时，取消本次关闭。
- 异步关闭处理中会进入内部 `closing` 状态：关闭按钮与确认按钮会禁用并显示加载效果。
- 点击遮罩在 `maskClosable=true` 时触发关闭；点击内容区域不会关闭。
- 组件通过 `Portal` 渲染至 `#root` 容器，请确保文档中存在对应元素。
