# Radio 单选框

用于在多个备选项中选中单个状态。

## 何时使用

用于在多个备选项中选中单个状态。

和 Select 的区别是，Radio 所有选项默认可见，方便用户在比较中选择，因此选项不宜过多。

## 代码演示

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/radio/demo1"
  style="width: 100%; height: 40px; border: 0;"
></iframe>
<h3>基础用法</h3>
<p>最基础的单选框，支持选项切换。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Radio} from 'inula-ui';

function Demo1() {
  let selected = 'a';
  
  function handleRadioChange(val) {
    selected = val;
  }
  
  return (
    <div style={{ display: 'flex' }}>
      <Radio label="选项A" value="a" checked={selected === 'a'} onChange={handleRadioChange} />
      <Radio label="选项B" value="b" checked={selected === 'b'} onChange={handleRadioChange} />
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
  src="http://localhost:5173/#/radio/demo2"
  style="width: 100%; height: 105px; border: 0;"
></iframe>
<h3>选项组用法</h3>
<p>通过 options 属性批量渲染单选框组。。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Radio} from 'inula-ui';

function Demo2() {
  let selected = 'a';
  function handleRadioChange(val) {
    selected = val;
  }
  const options = [
    { label: '选项A', value: 'a', checked: selected === 'a' },
    { label: '选项B', value: 'b', checked: selected === 'b' },
    { label: '选项C', value: 'c', checked: selected === 'c' },
  ];
  return (
    <Radio name="group2" options={options} onChange={handleRadioChange} />
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
  src="http://localhost:5173/#/radio/demo3"
  style="width: 100%; height: 45px; border: 0;"
></iframe>
<h3>不同尺寸</h3>
<p>展示单选框的三种尺寸：大号、默认、小号。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Radio} from 'inula-ui';

function Demo3() {
  let selected = 'a';
  
  function handleRadioChange(val) {
    selected = val;
  }
  
  return (
    <div style={{ display: 'flex' }}>
      <Radio label="大号" value="a" checked={selected === 'a'} onChange={handleRadioChange} size="large" />
      <Radio label="默认" value="b" checked={selected === 'b'} onChange={handleRadioChange} size="default" />
      <Radio label="小号" value="c" checked={selected === 'c'} onChange={handleRadioChange} size="small" />
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
  src="http://localhost:5173/#/radio/demo4"
  style="width: 100%; height: 40px; border: 0;"
></iframe>
<h3>禁用状态</h3>
<p>展示禁用的单选框，用户无法进行选择。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Radio} from 'inula-ui';

function Demo4() {
  return (
    <div style={{ display: 'flex' }}>
      <Radio label="禁用A" value="a" checked={false} disabled />
      <Radio label="禁用B" value="b" checked={true} disabled />
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
  src="http://localhost:5173/#/radio/demo5"
  style="width: 100%; height: 40px; border: 0;"
></iframe>
<h3>只读状态</h3>
<p>展示只读的单选框，选中状态不可更改。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Radio} from 'inula-ui';

function Demo5() {
  let selected = 'a';
  function handleRadioChange(val) {
    selected = val;
  }
  return (
    <div style={{ display: 'flex' }}>
      <Radio label="只读A" value="a" checked={selected === 'a'} readOnly onChange={handleRadioChange} />
      <Radio label="只读B" value="b" checked={selected === 'b'} readOnly onChange={handleRadioChange} />
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
  src="http://localhost:5173/#/radio/demo6"
  style="width: 100%; height: 105px; border: 0;"
></iframe>
<h3>选中、只读、禁用</h3>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Radio} from 'inula-ui';

function Demo6() {
  let selected = 'a';
  function handleRadioChange(val) {
    selected = val;
  }
  const options = [
    { label: 'A', value: 'a', checked: selected === 'a' },
    { label: 'B(禁用)', value: 'b', checked: selected === 'b', disabled: true },
    { label: 'C(只读)', value: 'c', checked: selected === 'c', readOnly: true },
  ];
  return (
    <Radio name="group6" options={options} onChange={handleRadioChange} />
  );
}
export default Demo6; 
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

## API

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|---|---|---|---|---|
| checked | 是否选中 | `boolean` | - | `false` |
| disabled | 是否禁用 | `boolean` | - | `false` |
| readOnly | 是否只读 | `boolean` | - | `false` |
| value | 单选框的值 | `string` | - | `""` |
| name | 单选框组名 | `string` | - | `""` |
| label | 单选框标签 | `string` | - | `""` |
| size | 单选框尺寸 | `string` | `large` / `default` / `small` | `default` |
| variant | 单选框形态 | `string` | `outlined` / `filled` / `borderless` / `underlined` | `outlined` |
| options | 选项组配置 | `{ label: string, value: string, checked?: boolean, disabled?: boolean, readOnly?: boolean }[]` | - | - |
| onChange | 变化时回调 | `(value: string, e: Event) => void` | - | - |
| className | 自定义类名 | `string` | - | `""` |
| style | 行内样式 | `CSSProperties` | - | `{}` |

说明：

- 单选逻辑：同组内只能选中一个选项，选中新选项时会自动取消其他选项的选中状态。
- 选项组：传 `options` 数组时，组件会渲染为单选框组，每个选项支持独立的 `checked`、`disabled`、`readOnly` 状态。
- 事件回调：`onChange` 回调接收两个参数：选中值 `value` 和事件对象 `e`。
- 只读状态：`readOnly` 为 `true` 时，选中状态不可更改，但仍可触发 `onChange` 回调。
- 禁用状态：`disabled` 为 `true` 时，单选框不可交互，不会触发 `onChange` 回调。
