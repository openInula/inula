# Select 选择器

下拉选择器。

## 何时使用

弹出一个下拉菜单给用户选择操作，用于代替原生的选择器，或者需要一个更优雅的多选器时。

当选项少时（少于 5 项），建议直接将选项平铺，使用 Radio 是更好的选择。

如果你在寻找一个可输可选的输入框，那你可能需要 AutoComplete。

## 代码演示

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/select/demo1"
  style="width: 100%; height: 220px; border: 0;"
></iframe>
<h3>基础用法</h3>
<p>最基础的下拉选择框，支持选项切换。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Select} from 'inula-ui';

function Demo1() {
    let value = '';
    const options = [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
        { label: 'Option C', value: 'c' },
        { label: 'Option D', value: 'd' },
    ];

    function handleChange(val) {
        value = val
    }

    return <Select style={{ width: 200 }} options={options} onChange={handleChange} placeholder="Select an option" />
}

export default Demo1; 

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/select/demo2"
  style="width: 100%; height: 220px; border: 0;"
></iframe>
<h3>受控用法</h3>
<p>通过 value 属性控制选中项。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Select} from 'inula-ui';

function Demo2() {
  let value = 'b';

  const options = [
    { label: '选项A', value: 'a' },
    { label: '选项B', value: 'b' },
    { label: '选项C', value: 'c' },
    { label: '选项D', value: 'd' },
  ];

  function handleChange(val) {
    value = val;
  }

  return <Select options={options} value={value} onChange={handleChange} placeholder="Select an option" />
}

export default Demo2; 

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/select/demo3"
  style="width: 100%; height: 220px; border: 0;"
></iframe>
<h3>禁用</h3>
<p>可禁用整个下拉选择框和单个选项。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Select} from 'inula-ui';

function Demo3() {

  const options = [
    { label: '选项A', value: 'a' },
    { label: '选项B', value: 'b' },
    { label: '选项C', value: 'c', disabled: true },
    { label: '选项D', value: 'd' },
  ];

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <Select options={options} placeholder="Select an option" />
      <Select options={options} disabled placeholder="Select an option" />
    </div>
  )
}

export default Demo3; 
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/select/demo4"
  style="width: 100%; height: 220px; border: 0;"
></iframe>
<h3>默认值</h3>
<p>设置默认选中项。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Select} from 'inula-ui';

function Demo4() {
  let value = '';

  const options = [
    { label: '选项A', value: 'a' },
    { label: '选项B', value: 'b' },
    { label: '选项C', value: 'c' },
    { label: '选项D', value: 'd' },
  ];

  function handleChange(val) {
    value = val;
  }

  return <Select options={options} defaultValue="d" onChange={handleChange} placeholder="Select an option" />
}

export default Demo4; 
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/select/demo5"
  style="width: 100%; height: 220px; border: 0;"
></iframe>
<h3>可清空</h3>
<p>支持清空已选项。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Select} from 'inula-ui';

function Demo5() {
  let value = '';

  const options = [
    { label: '选项A', value: 'a' },
    { label: '选项B', value: 'b' },
    { label: '选项C', value: 'c' },
    { label: '选项D', value: 'd' },
  ];

  function handleChange(val) {
    value = val;
  }

  return <Select options={options} allowClear onChange={handleChange} placeholder="Select an option" />
}

export default Demo5; 
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/select/demo6"
  style="width: 100%; height: 220px; border: 0;"
></iframe>
<h3>多选</h3>
<p>支持多选功能。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Select} from 'inula-ui';

function Demo6() {
  let value = '';

  const options = [
    { label: '选项A', value: 'a' },
    { label: '选项B', value: 'b' },
    { label: '选项C', value: 'c' },
    { label: '选项D', value: 'd' },
  ];

  function handleChange(val) {
    value = val;
  }

  return <Select options={options} multiple onChange={handleChange} placeholder="Select an option" />
}

export default Demo6; 
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/select/demo7"
  style="width: 100%; height: 220px; border: 0;"
></iframe>
<h3>分组/复杂用法</h3>
<p>支持分组选项、多选等复杂场景。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Select} from 'inula-ui';

function Demo7() {
  let values = []; 

  const options = [
    {
      label: '热门城市',
      options: [
        { value: 'Shanghai', label: '上海' },
        { value: 'Beijing', label: '北京' },
      ],
    },
    {
      label: '城市名',
      options: [
        { value: 'Chengdu', label: '成都' },
        { value: 'Shenzhen', label: '深圳' },
        { value: 'Guangzhou', label: '广州' },
        { value: 'Dalian', label: '大连' },
      ],
    },
  ];

  function handleChange(val) {
    values = [...val]; 
  }

  return <Select options={options} multiple onChange={handleChange} placeholder="Select an option" />
}

export default Demo7; 
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/select/demo8"
  style="width: 100%; height: 220px; border: 0;"
></iframe>
<h3>变体样式</h3>
<p>支持变体样式。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Select} from 'inula-ui';

function Demo8() {

  const options = [
    { label: '选项A', value: 'a' },
    { label: '选项B', value: 'b' },
    { label: '选项C', value: 'c', disabled: true },
    { label: '选项D', value: 'd' },
  ];

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <Select options={options} variant="outlined" placeholder="Select an option" />
      <Select options={options} variant="filled" placeholder="Select an option" />
      <Select options={options} size="small" variant="borderless" placeholder="Select an option" />
      <Select options={options} size="small" variant="underlined" placeholder="Select an option" />
    </div>
  )
}

export default Demo8; 
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

## API

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|---|---|---|---|---|
| options | 选项数据 | `{ label: string, value: string, disabled?: boolean }[] \| { label: string, options: { label: string, value: string, disabled?: boolean }[] }[]` | - | `[]` |
| value | 受控模式下的选中值 | `string \| string[]` | - | - |
| defaultValue | 非受控模式下的初始选中值 | `string \| string[]` | - | `""` |
| disabled | 是否禁用 | `boolean` | - | `false` |
| placeholder | 占位符文本 | `string` | - | `""` |
| onChange | 变化时回调 | `(value: string \| string[]) => void` | - | - |
| allowClear | 是否显示清除按钮 | `boolean` | - | `false` |
| multiple | 是否多选 | `boolean` | - | `false` |
| size | 选择器尺寸 | `string` | `small` / `default` / `large` / `medium` | `default` |
| variant | 选择器形态 | `string` | `outlined` / `filled` / `borderless` / `underlined` | `outlined` |
| className | 自定义类名 | `string` | - | `""` |
| style | 行内样式 | `CSSProperties` | - | `{}` |

说明：

- 受控/非受控：传 `value` 为受控模式，传 `defaultValue` 为非受控模式。
- 选项数据：`options` 支持普通选项数组和分组选项数组，分组选项格式为 `{ label: string, options: [...] }`。
- 多选模式：`multiple` 为 `true` 时，`value` 和 `onChange` 回调的值为数组类型。
- 清除功能：`allowClear` 为 `true` 时，在选中项存在且非禁用状态下显示清除按钮。
- 尺寸兼容：`medium` 尺寸等同于 `default`。
- 选项禁用：单个选项可通过 `disabled: true` 禁用，分组标题不支持禁用。
