# Spin 加载中

用于页面和区块的加载中状态。

## 何时使用

页面局部处于等待异步数据或正在渲染过程时，合适的加载动效会有效缓解用户的焦虑。

## 代码演示

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/spin/demo1"
  style="width: 100%; height: 110px; border: 0;"
></iframe>
<h3>基本样式</h3>
<p>默认加载指示器，大中小型号</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Spin,Tag} from 'inula-ui';

const SpinDemo = () => {

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", width: '100%' }}>
        <Tag color="geekblue">最简单的Spin</Tag>
        <Spin />
      </div>
      <div style={{ display: "flex", gap: 20, alignItems: "center", width: '100%' }}>
        <Tag color="geekblue">小中大的Spin</Tag>
        <Spin size="small" />
        <Spin size="default" />
        <Spin size="large" />
      </div>
    </div>
  );
};

export default SpinDemo;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/spin/demo2"
  style="width: 100%; height: 250px; border: 0;"
></iframe>
<h3>嵌套状态样式</h3>
<p>包裹子组件且不为全屏状态情况，加载覆盖子组件、自定义tip</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Spin,Switch,Tag} from 'inula-ui';

const SpinDemo = () => {
  let loading = false;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", width: '100%' }}>
      <Tag color="geekblue">简单嵌套状态</Tag>
        <Spin spinning={loading}>
          <div
            style={{
              width: "100px",
              height: "100px",
              backgroundColor: "skyblue",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "4px",
            }}
          >
            这是子组件
          </div>
        </Spin>
        <Switch checked={loading} onChange={() => (loading = !loading)} />
        <text>切换嵌套组件的加载状态</text>
      </div>
      <div style={{ display: "flex", gap: 20, alignItems: "center", width: '100%' }}>
      <Tag color="geekblue">自定义tip的Spin，小中大样式</Tag>
        <Spin size="small" tip="loading">
          <div
            style={{
              width: "100px",
              height: "100px",
              backgroundColor: "skyblue",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "4px",
            }}
          ></div>
        </Spin>
        <Spin size="default" tip="loading">
          <div
            style={{
              width: "100px",
              height: "100px",
              backgroundColor: "skyblue",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "4px",
            }}
          ></div>
        </Spin>
        <Spin size="large" tip="loading">
          <div
            style={{
              width: "100px",
              height: "100px",
              backgroundColor: "skyblue",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "4px",
            }}
          ></div>
        </Spin>
      </div>
    </div>
  );
};

export default SpinDemo;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/spin/demo3"
  style="width: 100%; height: 120px; border: 0;"
></iframe>
<h3>带delay延迟触发加载动画</h3>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Spin,Switch,Tag} from 'inula-ui';

const SpinDemo = () => {
  let loading = false;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tag color="geekblue">
          点击延迟一秒触发加载
        </Tag>
        <Spin spinning={loading} delay={1000}>
          <div
            style={{
              width: "100px",
              height: "100px",
              backgroundColor: "skyblue",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "4px",
            }}
          >
            这是子组件
          </div>
        </Spin>
        <Switch checked={loading} onChange={() => (loading = !loading)} />
        <text>延迟触发切换状态按钮</text>
      </div>
    </div>
  );
};

export default SpinDemo;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/spin/demo4"
  style="width: 100%; height: 200px; border: 0;"
></iframe>
<h3>全屏覆盖加载动画</h3>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {ButSpinton,Button} from 'inula-ui';
const SpinDemo = () => {
  let showFullScreen = false;
  let percent = -100;

  const showLoader = () => {
    showFullScreen = true;
    const interval = setInterval(() => {
      percent += 10;
      if (percent >= 100) {
        clearInterval(interval);
        showFullScreen = false;
        percent = -100;
      }
    }, 100);
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <Spin spinning={showFullScreen} fullscreen percent={percent} size="large"></Spin>
        <Button onClick={showLoader}>点击触发全屏加载</Button>
      </div>
    </div>
  );
};

export default SpinDemo;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/spin/demo5"
  style="width: 100%; height: 130px; border: 0;"
></iframe>
<h3>永不停止的进度条加载</h3>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Spin,Switch} from 'inula-ui';
const SpinDemo = () => {
  let auto = false;
  let percent = -50;

  watch(() => {
    if (auto) {
      percent = "auto";
      return;
    } else {
      percent = -50;
      const interval = setInterval(() => {
        percent += 10;
        if (percent >= 100) {
          percent = -50;
        }
      }, 100);

      return () => {
        clearInterval(interval);
      };
    }
  });

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      <div
        style={{
          display: "flex",
          gap: 20,
          alignItems: "center",
          width: "100%",
          height: 60,
        }}
      >
        <Spin percent={percent} size="small"></Spin>
        <Spin percent={percent}></Spin>
        <Spin percent={percent} size="large"></Spin>
      </div>
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <Switch
          checked={auto}
          onChange={() => (auto = !auto)}
          unCheckedChildren="auto"
          checkedChildren="auto"
        />
        <text>点击切换auto,进度条永不停止</text>
      </div>
    </div>
  );
};

export default SpinDemo;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

## API

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|---|---|---|---|---|
| spinning | 是否显示加载状态 | `boolean` | - | `true` |
| delay | 延迟显示加载状态的时间（毫秒） | `number` | - | - |
| fullscreen | 是否全屏显示 | `boolean` | - | `false` |
| indicator | 自定义加载指示器 | `ReactNode` | - | - |
| percent | 进度百分比 | `number \| "auto"` | - | - |
| size | 加载指示器尺寸 | `string` | `small` / `default` / `large` | `default` |
| tip | 加载提示文本 | `string` | - | - |
| wrapperClassName | 包装器类名 | `string` | - | - |
| className | 自定义类名 | `string` | - | - |
| children | 子组件（嵌套模式） | `ReactNode` | - | - |
| style | 行内样式 | `CSSProperties` | - | - |
| maxProgressWidth | 进度条最大宽度 | `number` | - | `44` |

说明：

- 显示模式：有 `children` 且非 `fullscreen` 时为嵌套模式，覆盖子组件显示；`fullscreen` 为全屏模式；否则为独立模式。
- 延迟显示：`delay` 设置延迟时间，避免快速切换时闪烁，使用防抖机制实现。
- 进度指示：`percent` 为数字时显示进度条，为 `"auto"` 时显示无限循环进度条。
- 自定义指示器：`indicator` 可完全自定义加载指示器，优先级高于默认指示器。
- 提示文本：`tip` 在嵌套模式和全屏模式下显示在指示器下方。
- 尺寸影响：不同 `size` 会影响指示器大小和进度条宽度（`maxProgressWidth` 会自动调整）。
