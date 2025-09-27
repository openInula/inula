# Card 卡片组件

## 何时使用

卡片容器，可承载文字、列表、图片、段落，常用于后台概览页面。

## 代码演示

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/card/demo1"
  style="width: 100%; height: 900px; border: 0;"
></iframe>
<h3>基本</h3>
<p>完整的Card由header、body、footer三部分组成，支持两种大小、两种边框样式、两种hover动效</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { Card, Tag, Icon } from 'inula-ui';

const actions = [
  <Icon value="wand-magic-sparkles" />,
  <Icon value="gear" />,
  <Icon value="ellipsis" />,
];

const CardDemo = () => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <Tag color="geekblue" size="large">
        完整Card布局
      </Tag>
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Card
          title="Default size card"
          extra={<div>More</div>}
          cover={
            <img
              alt="example"
              src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
            />
          }
          actions={actions}
        >
          <div style={{ width: '100%' }}>Card content</div>
          <span>Card content</span>
          <span>Card content</span>
        </Card>
      </div>
      <Tag color="geekblue" size="large">
        不同大小、边框、hover动效的Card
      </Tag>
      <div
        style={{
          display: 'flex',
          gap: 20,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Card title="不带边框的Card" variant="borderless">
          <div style={{ width: '100%' }}>默认型号，无hover动效</div>
        </Card>
        <Card title="带边框的Card" size="small" hoverable>
          <div style={{ width: '100%' }}>小号，有hover动效</div>
        </Card>
      </div>
    </div>
  );
};

export default CardDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/card/demo2"
  style="width: 100%; height: 1000px; border: 0;"
></iframe>
<h3>加载、嵌套</h3>
<p>支持受控加载、嵌套卡片</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { Card, Tag, Switch, Icon } from 'inula-ui';

const actions = [
  <Icon value="wand-magic-sparkles" />,
  <Icon value="gear" />,
  <Icon value="ellipsis" />,
];

const CardDemo = () => {
  let loading = false;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <Tag color="geekblue" size="large">
        定义加载内容状态的Card
      </Tag>
      <div
        style={{
          display: 'flex',
          gap: 20,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Card
          title="loading card"
          extra={<div>More</div>}
          cover={
            <img
              alt="example"
              src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
            />
          }
          actions={actions}
          loading={loading}
        >
          <div style={{ width: '100%' }}>Card content</div>
          <span>Card content</span>
          <span>Card content</span>
        </Card>
      </div>
      <Switch
        checked={loading}
        onChange={() => {
          loading = !loading;
        }}
      />
      <text>点击切换内容加载状态</text>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          alignItems: 'start',
          width: '100%',
        }}
      >
        <Tag color="geekblue" size="large">
          嵌套Card样式
        </Tag>
        <Card title="inner card" type="inner">
          <div style={{ width: '100%' }}>放在Card下的Card组件样式</div>
        </Card>
      </div>
    </div>
  );
};

export default CardDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/card/demo3"
  style="width: 100%; height: 420px; border: 0;"
></iframe>
<h3>CardMeta组件</h3>
<p>CardMeta组件可以快速定义固定布局的内容。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { Card, Tag, Icon, CardMeta } from 'inula-ui';

const actions = [
  <Icon value="wand-magic-sparkles" />,
  <Icon value="gear" />,
  <Icon value="ellipsis" />,
];

const CardDemo = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        gap: 24,
      }}
    >
      <Tag color="geekblue" size="large">
        Meta组件，快速定义内容
      </Tag>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <Card
          cover={
            <img
              alt="example"
              src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
            />
          }
          actions={actions}
        >
          <CardMeta
            avatar={
              <img src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />
            }
            title="Card title"
            description="This is the description"
          />
        </Card>
      </div>
    </div>
  );
};

export default CardDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/card/demo4"
  style="width: 100%; height: 300px; border: 0;"
></iframe>
<h3>CardGrid网格型内嵌卡片</h3>
<p>常见的卡片内容区隔模式。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { Card, CardGrid, Tag } from 'inula-ui';

const CardDemo = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <Tag color="geekblue" size="large">
        Grid组件，网格型内嵌
      </Tag>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <Card title="Card Grid" gridbox>
          <CardGrid
            style={{
              width: '25%',
              textAlign: 'center',
            }}
          >
            Content
          </CardGrid>
          <CardGrid
            hoverable={false}
            style={{
              width: '25%',
              textAlign: 'center',
            }}
          >
            Content
          </CardGrid>
          <CardGrid
            style={{
              width: '25%',
              textAlign: 'center',
            }}
          >
            Content
          </CardGrid>
          <CardGrid
            style={{
              width: '25%',
              textAlign: 'center',
            }}
          >
            Content
          </CardGrid>
          <CardGrid
            style={{
              width: '25%',
              textAlign: 'center',
            }}
          >
            Content
          </CardGrid>
          <CardGrid
            style={{
              width: '25%',
              textAlign: 'center',
            }}
          >
            Content
          </CardGrid>
          <CardGrid
            style={{
              width: '25%',
              textAlign: 'center',
            }}
          >
            Content
          </CardGrid>
        </Card>
      </div>
    </div>
  );
};

export default CardDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/card/demo5"
  style="width: 100%; height: 500px; border: 0;"
></iframe>
<h3>Tabs切换卡片</h3>
<p>可以定义带标签的卡片。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { Card, Tag } from 'inula-ui';

const tabList = [
  {
    key: 'tab1',
    tab: 'tab1',
  },
  {
    key: 'tab2',
    tab: 'tab2',
  },
];

const contentList = {
  tab1: <p>content1</p>,
  tab2: <p>content2</p>,
};

const tabListNoTitle = [
  {
    key: 'article',
    label: 'article',
  },
  {
    key: 'app',
    label: 'app',
  },
  {
    key: 'project',
    label: 'project',
  },
];

const contentListNoTitle = {
  article: <p>article content</p>,
  app: <p>app content</p>,
  project: <p>project content</p>,
};

const CardDemo = () => {
  let activeTabKey1 = 'tab1';
  let activeTabKey2 = 'article';
  const onTab1Change = (key) => {
    activeTabKey1 = key;
  };

  const onTab2Change = (key) => {
    activeTabKey2 = key;
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <Tag color="geekblue" size="large">
        两种传参方式的标签卡片
      </Tag>
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Card
          style={{ width: '100%' }}
          title="Card title"
          extra={<a href="#">More</a>}
          tabList={tabList}
          activeTabKey={activeTabKey1}
          onTabChange={onTab1Change}
        >
          {contentList[activeTabKey1]}
        </Card>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 20,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Card
          style={{ width: '100%' }}
          tabList={tabListNoTitle}
          activeTabKey={activeTabKey2}
          tabBarExtraContent={<a href="#">More</a>}
          onTabChange={onTab2Change}
          tabProps={{
            size: 'middle',
          }}
        >
          {contentListNoTitle[activeTabKey2]}
        </Card>
      </div>
    </div>
  );
};

export default CardDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

## API

### Card

| 属性                | 说明                                                   | 类型                                                                | 可选值                       | 默认值       |
| ------------------- | ------------------------------------------------------ | ------------------------------------------------------------------- | ---------------------------- | ------------ |
| type                | 卡片类型                                               | `string`                                                            | `'default' \| 'inner'`       | `'default'`  |
| size                | 卡片大小                                               | `string`                                                            | `'small' \| 'default'`       | `'default'`  |
| loading             | 卡片内容加载                                           | `boolean`                                                           | -                            | `false`      |
| variant             | 边框样式                                               | `string`                                                            | `'outlined' \| 'borderless'` | `'outlined'` |
| hoverable           | 悬停浮空                                               | `boolean`                                                           | -                            | `false`      |
| gridbox             | 网格布局，只有`children`全为`CardGrid`时才能传入`true` | `boolean`                                                           | -                            | `false`      |
| tabList             | tab 标签                                               | `{ key: string, tab: string }[] \| { key: string,label: string }[]` | -                            | -            |
| tabProps            | tab 相关属性                                           | `object`                                                            | -                            | -            |
| activeTabKey        | tab 选中标签                                           | `string`                                                            | -                            | -            |
| defaultActiveTabKey | tab 初始选中标签                                       | `string`                                                            | -                            | -            |
| onTabChange         | tab 状态改变事件                                       | `function(key)`                                                     | -                            | -            |
| title               | 头部 title                                             | `string`                                                            | -                            | -            |
| extra               | 头部额外内容                                           | `node`                                                              | -                            | -            |
| cover               | 卡片封面，位于 header 下方                             | `node`                                                              | -                            | -            |
| actions             | 卡片操作栏                                             | `node[] \|string[]`                                                 | -                            | -            |
| children            | 卡片内容                                               | `node`                                                              | -                            | -            |
| className           | 自定义类名                                             | `string`                                                            | -                            | -            |
| style               | 行内样式                                               | `CSSProperties`                                                     | -                            | -            |
| ...rest             | 其他属性                                               | -                                                                   | -                            | -            |

### CardMeta

| 属性        | 说明       | 类型            | 可选值 | 默认值 |
| ----------- | ---------- | --------------- | ------ | ------ |
| avatar      | 头像型     | `node`          | -      | -      |
| title       | 标题       | `string\| node` | -      | -      |
| description | 介绍       | `string\|node`  | -      | -      |
| className   | 自定义类名 | `string`        | -      | -      |
| style       | 行内样式   | `CSSProperties` | -      | -      |

### CardGrid

| 属性      | 说明               | 类型            | 可选值 | 默认值 |
| --------- | ------------------ | --------------- | ------ | ------ |
| hoverable | hover 悬浮动画效果 | `string`        | -      | `true` |
| children  | 卡片内容           | `node`          | -      | -      |
| className | 自定义类名         | `string`        | -      | -      |
| style     | 行内样式           | `CSSProperties` | -      | -      |
| ...rest   | 其他属性           | -               | -      | -      |

说明：

- 完整布局 Card 的 header 包含`title、extra`，如果为标签卡片还包含`tabs`，body 包含`cover`封面、`children`内容，footer 为`actions`。
- 网格布局属性`gridbox`只有孩子全为`CardGrid`才会生效。
