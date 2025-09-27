# Tag 标签组件

## 何时使用

进行标记和分类的小标签。

## 代码演示

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tag/demo1"
  style="width: 100%; height: 55px; border: 0;"
></iframe>
<h3>基本</h3>
<p>基本标签、link标签、带关闭按钮的标签</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { Tag } from 'inula-ui';

const Demo1 = () => {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Tag>基本标签</Tag>
      <Tag>
        <a
          href="https://docs.openinula.net/next/introduction"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'inherit' }}
        >
          Link标签
        </a>
      </Tag>
      <Tag closable>Prevent Default</Tag>
    </div>
  );
};

export default Demo1;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tag/demo2"
  style="width: 100%; height: 100px; border: 0;"
></iframe>
<h3>颜色</h3>
<p>不同颜色的Tag</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { Tag } from 'inula-ui';

const Demo2 = () => {
  const colors = [
    'magenta',
    'red',
    'volcano',
    'orange',
    'gold',
    'lime',
    'green',
    'cyan',
    'blue',
    'geekblue',
    'purple',
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', gap: 8 }}>
        <div>Presets</div>
        {colors.map((c) => (
          <Tag key={c} color={c}>
            {c}
          </Tag>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div>Custom</div>
        <Tag color="#2db7f5">#2db7f5</Tag>
        <Tag color="#87d068">#87d068</Tag>
      </div>
    </div>
  );
};

export default Demo2;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tag/demo3"
  style="width: 100%; height: 100px; border: 0;"
></iframe>
<h3>增删tag</h3>
<p>可以控制增加删减tag</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { Tag } from 'inula-ui';

const Demo3 = () => {
  let tags = ['Unremovable', 'Tag 2', '大家读'];
  let newIndex = 1;

  const handleClose = (removed) => {
    tags = tags.filter((t) => t !== removed);
  };

  const addTag = () => {
    const next = `New Tag ${newIndex++}`;
    tags = [...tags, next];
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
      }}
    >
      {tags.map((tag, i) => (
        <Tag key={tag} closable={i !== 0} onClose={() => handleClose(tag)}>
          {tag}
        </Tag>
      ))}
      <Tag
        bordered
        closable={false}
        onClick={addTag}
        className="inula-tag-dashed"
      >
        + New Tag
      </Tag>
    </div>
  );
};

export default Demo3;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/tag/demo4"
  style="width: 100%; height: 55px; border: 0;"
></iframe>
<h3>CheckableTag</h3>
<p>支持可以选中的Tag</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { CheckabelTag } from 'inula-ui';

const Demo4 = () => {
  let checked = [true, false, false, false];
  const tags = ['Movies', 'Books', 'Music', 'Sports'];

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {tags.map((tag, i) => (
        <CheckableTag
          key={tag}
          defaultChecked={checked[i]}
          onChange={(next) => {
            checked[i] = next;
          }}
        >
          {tag}
        </CheckableTag>
      ))}
    </div>
  );
};

export default Demo4;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

## API

| 属性      | 说明             | 类型            | 可选值                           | 默认值      |
| --------- | ---------------- | --------------- | -------------------------------- | ----------- |
| color     | 标签内置颜色     | `string`        | `PRESET-COLORS`                  | `'default'` |
| size      | 标签大小         | `string`        | `'small' \| 'default' \| 'large` | `'default'` |
| icon      | 自定义图标       | `node`          | `-                               | -           |
| closable  | 是否显示关闭按钮 | `boolean`       | -                                | `false`     |
| bordered  | 是否显示边框     | `boolean`       | -                                | `true`      |
| round     | 是否显示圆角     | `boolean`       | -                                | `false`     |
| disabled  | 是否禁用标签     | `boolean`       | -                                | `false`     |
| onClose   | 关闭回调         | `function(e)`   | -                                | -           |
| onClick   | 点击回调         | `function(e)`   | -                                | -           |
| children  | 卡片内容         | `node`          | -                                | -           |
| className | 自定义类名       | `string`        | -                                | -           |
| style     | 行内样式         | `CSSProperties` | -                                | -           |
| ...rest   | 其他属性         | -               | -                                | -           |

### CheckableTag

| 属性           | 说明         | 类型          | 可选值 | 默认值  |
| -------------- | ------------ | ------------- | ------ | ------- |
| checked        | 当前选中状态 | `boolean`     | -      | -       |
| defaultChecked | 默认选中     | `boolean`     | -      | `false` |
| disabled       | 是否禁用标签 | `boolean`     | -      | `false` |
| onChange       | 状态改变回调 | `function(e)` | -      | -       |
| children       | 卡片内容     | `node`        | -      | -       |
| className      | 自定义类名   | `string`      | -      | -       |
| ...rest        | 其他属性     | -             | -      | -       |

说明：

- `PRESET_COLORS`：[
  'magenta','red','volcano','orange','gold','lime','green','cyan','blue','geekblue','purple',
  'success','processing','warning','error','default'
  ]
- 当传入`checked`时 CheckableTag 为外部受控状态。
