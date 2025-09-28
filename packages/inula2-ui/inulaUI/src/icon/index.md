# Icon 图标组件

## 何时使用

当你需要通过图标表达意思时

## 代码演示

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/icon/demo1"
  style="width: 100%; height: 70px; border: 0;"
></iframe>
<h3>基本</h3>
<p>仅支持实体图标和品牌图标，可以改变颜色。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { Icon } from 'inula-ui';

function IconDemo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Icon value="user" />
        <text>user默认实体</text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Icon value="user" theme="filled" />
        <text>user实体</text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Icon value="user" theme="filled" color="blue" />
        <text>user实体蓝色</text>
      </div>
    </div>
  );
}

export default IconDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/icon/demo2"
  style="width: 100%; height: 80px; border: 0;"
></iframe>
<h3>大小</h3>
<p>通过size字段可以改变大小</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { Icon } from 'inula-ui';

function IconDemo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Icon value="chevron-down" />
        <text>下箭头默认实体</text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Icon value="chevron-down" theme="filled" />
        <text>下箭头实体</text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Icon value="chevron-down" theme="filled" size={32} />
        <text>下箭头实体32px</text>
      </div>
    </div>
  );
}

export default IconDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/icon/demo3"
  style="width: 100%; height: 130px; border: 0;"
></iframe>
<h3>动画</h3>
<p>支持旋转动画</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { Icon } from 'inula-ui';

function IconDemo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Icon value="caret-left" />
        <text>caret-left默认实体</text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Icon value="caret-left" theme="filled" />
        <text>caret-left实体</text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Icon value="caret-left" theme="filled" color="blue" />
        <text>caret-left实体蓝色</text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Icon value="caret-left" theme="filled" color="skyblue" rotate={45} />
        <text>caret-left实体天蓝色旋转45</text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Icon value="caret-left" theme="filled" color="skyblue" spin={true} />
        <text>caret-left实体天蓝色旋转</text>
      </div>
    </div>
  );
}

export default IconDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/icon/demo4"
  style="width: 100%; height: 130px; border: 0;"
></iframe>
<h3>品牌图标</h3>
<p>品牌图标示例。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { Icon } from 'inula-ui';

function IconDemo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Icon value="apple" theme="brand" />
        <text>苹果品牌图标</text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Icon value="apple" theme="brand" size={32} />
        <text>苹果品牌图标32px</text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Icon value="apple" theme="brand" color="#40E0D0" />
        <text>苹果品牌图标绿色</text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Icon value="apple" theme="brand" color="green" rotate={120} />
        <text>苹果品牌图标绿色旋转120度</text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Icon value="apple" theme="brand" color="green" spin={true} />
        <text>苹果品牌图标绿色旋转</text>
      </div>
    </div>
  );
}

export default IconDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/icon/demo5"
  style="width: 100%; height: 1000px; border: 0;"
></iframe>
<h3>实体图标表</h3>
<p>该框架支持的所有实体图标表，点击即可复制。</p>

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/icon/demo6"
  style="width: 100%; height: 1000px; border: 0;"
></iframe>
<h3>品牌图标表</h3>
<p>该框架支持的所有品牌图标表，点击即可复制。</p>

</details>
</div>
<!-- markdownlint-enable MD033 -->

## API

| 属性    | 说明                                         | 类型            | 可选值                | 默认值     |
| ------- | -------------------------------------------- | --------------- | --------------------- | ---------- |
| value   | 图标名称                                     | `string`        | -                     | -          |
| theme   | 图标主题，filled 或 brand 支持实体、品牌图标 | `string`        | `'filled' \| 'brand'` | `'filled'` |
| size    | 图标大小                                     | `number`        | -                     | -          |
| color   | 图标颜色                                     | `string`        | -                     | -          |
| rotate  | 图标旋转角度                                 | `number`        | -                     | -          |
| spin    | 是否旋转动画                                 | `boolean`       | -                     | `false`    |
| style   | 图标样式                                     | `CSSProperties` | -                     | -          |
| onClick | 点击事件                                     | `function(e)`   | -                     | -          |
| ...rest | 其他属性                                     | -               | -                     | -          |
