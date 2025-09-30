# Tabs 标签页

选项卡切换组件。

## 何时使用

提供平级的区域将大块内容进行收纳和展现，保持界面整洁。

## 代码演示

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tabs/demo1"
  style="width: 100%; height: 170px; border: 0;"
></iframe>
<h3>基本</h3>
<p>默认选中第一项</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Tabs} from 'inula-ui';

const TabsDemo = () => {

  const onChange = (key) => {
    console.log(key);
  };

  const items = [
    {
      key: "1",
      label: "Tab 1",
      children: "Content of Tab Pane 1",
    },
    {
      key: "2",
      label: "Tab 2",
      children: "Content of Tab Pane 2",
    },
    { key: "3", label: "Tab 3", children: "Content of Tab Pane 3" },
  ];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, width: "80%" }}>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tabs items={items} defaultActiveKey="1" onChange={onChange} />
      </div>
    </div>
  );
};

export default TabsDemo;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tabs/demo2"
  style="width: 100%; height: 170px; border: 0;"
></iframe>
<h3>禁用</h3>
<p>禁用第二项</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Tabs} from 'inula-ui';

const TabsDemo = () => {
  const onChange = (key) => {
    console.log(key);
  };

  const items = [
    {
      key: "1",
      label: "Tab 1",
      children: "Content of Tab Pane 1",
    },
    {
      key: "2",
      label: "Tab 2",
      children: "Content of Tab Pane 2",
      disabled: true,
    },
    { key: "3", label: "Tab 3", children: "Content of Tab Pane 3" },
  ];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, width: "80%" }}>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tabs items={items} defaultActiveKey="1" onChange={onChange} />
      </div>
    </div>
  );
};

export default TabsDemo;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tabs/demo3"
  style="width: 100%; height: 170px; border: 0;"
></iframe>
<h3>居中</h3>
<p>标签居中显示</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Tabs} from 'inula-ui';

const TabsDemo = () => {
  const onChange = (key) => {
    console.log(key);
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, width: "80%" }}>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tabs
          items={Array.from({ length: 3 }).map((_, i) => {
            const id = String(i + 1);
            return {
              label: `Tab ${id}`,
              key: id,
              children: `Content of Tab Pane ${id}`,
            };
          })}
          centered
          defaultActiveKey="1"
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default TabsDemo;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tabs/demo4"
  style="width: 100%; height: 170px; border: 0;"
></iframe>
<h3>图标</h3>
<p>带有图标的标签</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Tabs,Icon} from 'inula-ui';

const TabsDemo = () => {
  const items = [
    {
      key: "1",
      label: "Tab 1",
      children: "Content of Tab Pane 1",
      icon: <Icon value="vuejs" theme="brand" />,
    },
    {
      key: "2",
      label: "Tab 2",
      children: "Content of Tab Pane 2",
      icon: <Icon value="apple" theme="brand" />,
    },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, width: "80%" }}>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tabs items={items} defaultActiveKey="2" />
      </div>
    </div>
  );
};

export default TabsDemo;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tabs/demo5"
  style="width: 100%; height: 226px; border: 0;"
></iframe>
<h3>指示条</h3>
<p>设置 indicator 属性，自定义指示条宽度和对齐方式。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Button,Tabs} from 'inula-ui';

const TabsDemo = () => {
  let indicator = "center"; // start | center | end | { size?: number | (origin: number) => number; align: start | center | end; } 自定义指示器长度和对齐方式
  const items = [
    {
      key: "1",
      label: "Tab 1",
      children: "Content of Tab Pane 1",
    },
    {
      key: "2",
      label: "Tab 2",
      children: "Content of Tab Pane 2",
    },
    { key: "3", label: "Tab 3", children: "Content of Tab Pane 3" },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, width: "80%" }}>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tabs items={items} defaultActiveKey="1" indicator={{ size: (origin) => origin - 20, align: indicator }} />
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Button onClick={() => (indicator = "start")}>Start</Button>
        <Button onClick={() => (indicator = "center")}>Center</Button>
        <Button onClick={() => (indicator = "end")}>End</Button>
      </div>
    </div>
  );
};

export default TabsDemo;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tabs/demo6"
  style="width: 100%; height: 226px; border: 0;"
></iframe>
<h3>位置</h3>
<p>有四个位置，tabPosition="left|right|top|bottom"。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Button,Tabs} from 'inula-ui';

const TabsDemo = () => {
  let pos = "top"; // top | bottom | left | right
  const items = [
    {
      key: "1",
      label: "Tab 1",
      children: "Content of Tab Pane 1",
    },
    {
      key: "2",
      label: "Tab 2",
      children: "Content of Tab Pane 2",
    },
    { key: "3", label: "Tab 3", children: "Content of Tab Pane 3" },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, width: "80%" }}>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tabs items={items} defaultActiveKey="1" tabPosition={pos} />
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Button onClick={() => (pos = "top")}>Top</Button>
        <Button onClick={() => (pos = "bottom")}>Bottom</Button>
        <Button onClick={() => (pos = "left")}>Left</Button>
        <Button onClick={() => (pos = "right")}>Right</Button>
      </div>
    </div>
  );
};

export default TabsDemo;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tabs/demo7"
  style="width: 100%; height: 535px; border: 0;"
></iframe>
<h3>大小</h3>
<p>有三种大小，size="small|middle|large"。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Button,Tabs} from 'inula-ui';

const TabsDemo = () => {
  let size = "default"; //small | default | large
  const items = [
    {
      key: "1",
      label: "Tab 1",
      children: "Content of Tab Pane 1",
    },
    {
      key: "2",
      label: "Tab 2",
      children: "Content of Tab Pane 2",
    },
    { key: "3", label: "Tab 3", children: "Content of Tab Pane 3" },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", width: "80%" }}>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Button onClick={() => (size = "small")}>Small</Button>
        <Button onClick={() => (size = "default")}>Default</Button>
        <Button onClick={() => (size = "large")}>Large</Button>
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          // alignItems: "center",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <Tabs items={items} defaultActiveKey="1" size={size} />
        <Tabs items={items} defaultActiveKey="1" size={size} type="card" />
        <Tabs
          items={items}
          defaultActiveKey="1"
          size={size}
          type="editable-card"
        />
      </div>
    </div>
  );
};

export default TabsDemo;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tabs/demo8"
  style="width: 100%; height: 170px; border: 0;"
></iframe>
<h3>新增和关闭标签</h3>
<p>只有卡片样式的页签支持新增和关闭选项。使用 closable={false} 禁止关闭。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Tabs} from 'inula-ui';

const TabsDemo = () => {
    const items = [
        {
          key: "1",
          label: "Tab 1",
          children: "Content of Tab Pane 1",
        },
        {
          key: "2",
          label: "Tab 2",
          children: "Content of Tab Pane 2",
        },
        { key: "3", label: "Tab 3", children: "Content of Tab Pane 3", closable: false },
    ];
    
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, width: "80%" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center", width: "100%" }}>
                <Tabs items={items} defaultActiveKey="1" type="editable-card" />
            </div>
        </div>
    )
}

export default TabsDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tabs/demo9"
  style="width: 100%; height: 226px; border: 0;"
></iframe>
<h3>自定义增加标签</h3>
<p>自定义新增标签。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Button,Tabs} from 'inula-ui';

const TabsDemo = () => {
  const items = [
    {
      key: "1",
      label: "Tab 1",
      children: "Content of Tab Pane 1",
    },
    {
      key: "2",
      label: "Tab 2",
      children: "Content of Tab Pane 2",
    },
    {
      key: "3",
      label: "Tab 3",
      children: "Content of Tab Pane 3",
      closable: false,
    },
  ];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, width: "80%" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Button>ADD</Button>
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tabs items={items} defaultActiveKey="1" type="editable-card" hideAdd />
      </div>
    </div>
  );
};

export default TabsDemo;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tabs/demo10"
  style="width: 100%; height: 170px; border: 0;"
></iframe>
<h3>标签额外内容</h3>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Tabs,Icon,Button} from 'inula-ui';

const LeftExtraContent = <Button type="primary">leftextra</Button>;
const RightExtraContent = <Button type="primary">rightextra</Button>;

const TabsDemo = () => {
  let tabBarExtraContent = { left: LeftExtraContent, right: RightExtraContent };
  const items = [
    {
      key: "1",
      label: "Tab 1",
      children: "Content of Tab Pane 1",
      icon: <Icon value="home" />,
    },
    {
      key: "2",
      label: "Tab 2",
      children: "Content of Tab Pane 2",
    },
    { key: "3", label: "Tab 3", children: "Content of Tab Pane 3" },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, width: "80%" }}>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tabs
          items={items}
          tabBarExtraContent={tabBarExtraContent}
        />
      </div>
    </div>
  );
};

export default TabsDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tabs/demo11"
  style="width: 100%; height: 300px; border: 0;"
></iframe>
<h3>标签滚动</h3>
<p>标签过多时，可滚动。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Button,Tabs} from 'inula-ui';

const TabsDemo = () => {
  let mode = "top";

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, width: 1000 }}>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tabs
          defaultActiveKey="1"
          tabPosition={mode}
          style={{ height: 220 }}
          items={Array.from({ length: 30 }, (_, i) => {
            const id = String(i);
            return {
              label: `Tab-${id}`,
              key: id,
              disabled: i === 28,
              children: `Content of tab ${id}`,
            };
          })}
        />
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Button onClick={() => (mode = "top")}>Horizonal</Button>
        <Button onClick={() => (mode = "left")}>Vertical</Button>
      </div>
    </div>
  );
};

export default TabsDemo;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

## API

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|---|---|---|---|---|
| items | 选项卡配置数组 | `TabProps[]` | - | - |
| type | 选项卡类型 | `string` | `line` / `card` / `editable-card` | `line` |
| size | 选项卡尺寸 | `string` | `small` / `default` / `large` | `default` |
| tabPosition | 选项卡位置 | `string` | `top` / `bottom` / `left` / `right` | `top` |
| centered | 是否居中显示 | `boolean` | - | `false` |
| activeKey | 受控模式下的当前激活选项卡 | `string` | - | - |
| defaultActiveKey | 非受控模式下的默认激活选项卡 | `string` | - | `items[0].key` |
| addIcon | 添加按钮图标 | `ReactNode` | - | `<Icon value="plus" size={16} />` |
| hideAdd | 是否隐藏添加按钮 | `boolean` | - | `false` |
| indicator | 指示器配置 | `{ size?: number \| (origin: number) => number; align?: 'start' \| 'center' \| 'end' }` | - | - |
| tabBarExtraContent | 标签栏额外内容 | `ReactNode \| { left?: ReactNode; right?: ReactNode }` | - | - |
| tabBarGutter | 标签栏间隔距离 | `number` | - | - |
| tabBarStyle | 标签栏样式 | `CSSProperties` | - | - |
| className | 自定义类名 | `string` | - | - |
| style | 行内样式 | `CSSProperties` | - | - |
| onChange | 选项卡切换回调 | `(key: string) => void` | - | - |
| onTabClick | 选项卡点击回调 | `(key: string, e: React.MouseEvent) => void` | - | - |
| onEdit | 选项卡编辑回调 | `(targetKey: string, action: 'add' \| 'remove') => void` | - | - |
| onTabScroll | 选项卡滚动回调 | `({ direction: 'left' \| 'right' \| 'top' \| 'bottom' }) => void` | - | - |

### TabProps

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|---|---|---|---|---|
| key | 选项卡唯一标识 | `string` | - | - |
| label | 选项卡标题 | `ReactNode` | - | - |
| children | 选项卡内容 | `ReactNode` | - | - |
| disabled | 是否禁用 | `boolean` | - | `false` |
| icon | 选项卡图标 | `ReactNode` | - | - |
| closable | 是否可关闭 | `boolean` | - | `true` |
| closeIcon | 关闭按钮图标 | `ReactNode` | - | `<Icon value="close" size={16} />` |

说明：

- 受控/非受控：传 `activeKey` 为受控模式，传 `defaultActiveKey` 为非受控模式。
- 可编辑卡片：`type="editable-card"` 时支持添加/删除选项卡，可通过 `hideAdd` 隐藏添加按钮。
- 指示器：`indicator.size` 可为数字或函数，函数接收原始宽度返回新宽度；`indicator.align` 控制对齐方式。
- 额外内容：`tabBarExtraContent` 可为 ReactNode 或包含 `left`/`right` 的对象。
- 事件回调：`onEdit` 仅在 `type="editable-card"` 时有效；`onTabScroll` 在标签栏滚动时触发。
