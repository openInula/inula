# Checkbox 多选框

收集用户的多项选择。

## 何时使用

在一组可选项中进行多项选择时；

单独使用可以表示两种状态之间的切换，和 switch 类似。区别在于切换 switch 会直接触发状态改变，而 checkbox 一般用于状态标记，需要和提交操作配合。

## 代码演示

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/checkbox/demo1"
  style="width: 100%; height: 130px; border: 0;"
></iframe>
<h3>基本Checkbox</h3>
<p>选中、默认选中、禁用、indeterminate样式</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Checkbox,Tag} from 'inula-ui';

const CheckboxDemo = () => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tag color="geekblue">基本状态</Tag >
        <Checkbox>普通Checkbox</Checkbox>
        <Checkbox checked={true}>选中</Checkbox>
        <Checkbox defaultChecked>默认选中</Checkbox>
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tag color="geekblue">indeterminate复选框样式</Tag >
        <Checkbox indeterminate>indeterminate按钮</Checkbox>
        <Checkbox indeterminate checked>
          indeterminate选中
        </Checkbox>
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tag color="geekblue">禁用状态</Tag >
        <Checkbox disabled>禁用未选中</Checkbox>
        <Checkbox disabled checked>
          禁用选中
        </Checkbox>
        <Checkbox disabled defaultChecked>
          禁用默认选中
        </Checkbox>
        <Checkbox indeterminate disabled>
          indeterminate按钮禁用
        </Checkbox>
      </div>
    </div>
  );
};

export default CheckboxDemo;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/checkbox/demo2"
  style="width: 100%; height: 215px; border: 0;"
></iframe>
<h3>CheckboxGroup</h3>
<p>选中、默认选中、禁用、外部受控</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Tag,CheckboxGroup} from 'inula-ui';

const CheckboxDemo = () => {
  let checkedList = ["Apple", "Pear"];

  const options = [
    { label: "Apple", value: "Apple", disabled: true },
    { label: "Pear", value: "Pear" },
    { label: "Orange", value: "Orange" },
  ];

  const onChange = (list) => {
    checkedList = list;
  };

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <div
        style={{ display: "flex", gap: 16, alignItems: "center", width: "100%" }}
      >
        <Tag color="geekblue">定义默认选中和选中:</Tag>
        <CheckboxGroup
          options={options}
          defaultValue={["Apple"]}
          value={["Apple", "Pear"]}
        />
      </div>
      <div
        style={{ display: "flex", gap: 16, alignItems: "center", width: "100%" }}
      >
        <Tag color="geekblue">只定义默认选中</Tag>
        <CheckboxGroup options={options} defaultValue={["Apple"]} />
      </div>
      <div
        style={{ display: "flex", gap: 16, alignItems: "center", width: "100%" }}
      >
        <Tag color="geekblue">只定义选中</Tag>
        <CheckboxGroup options={options} value={["Apple", "Orange"]} />
      </div>
      <div
        style={{ display: "flex", gap: 16, alignItems: "center", width: "100%" }}
      >
        <Tag color="geekblue">全禁用</Tag>
        <CheckboxGroup options={options} disabled />
      </div>
      <div
        style={{ display: "flex", gap: 16, alignItems: "center", width: "100%" }}
      >
        <Tag color="geekblue">外部受控</Tag>
        <CheckboxGroup
          options={options}
          defaultValue={checkedList}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default CheckboxDemo;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/checkbox/demo3"
  style="width: 100%; height: 40px; border: 0;"
></iframe>
<h3>案例</h3>
<p>区分全不选、部分选、全选的复选框案例</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Checkbox, CheckboxGroup} from 'inula-ui';

const plainOptions = ['Apple', 'Pear', 'Orange'];
const defaultCheckedList = ['Apple', 'Orange'];

const CheckboxDemo = () => {
  let checkedList = defaultCheckedList;
  let checkAll = plainOptions.length === checkedList.length;
  let indeterminate = checkedList.length > 0 && checkedList.length < plainOptions.length;

  const onChange = (list) => {
    checkedList = list;
  };

  const onCheckAllChange = (e) => {
    checkedList = e.target.checked ? plainOptions : [];
  };

  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} defaultChecked={checkAll}>
        Check all
      </Checkbox>
      <CheckboxGroup options={plainOptions} defaultValue={checkedList} onChange={onChange} />
    </div>
  );
};

export default CheckboxDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

## API

### Checkbox

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|---|---|---|---|---|
| checked | 受控模式下的选中状态 | `boolean` | - | - |
| defaultChecked | 非受控模式下的初始选中状态 | `boolean` | - | `false` |
| disabled | 是否禁用 | `boolean` | - | `false` |
| indeterminate | 半选状态 | `boolean` | - | `false` |
| variant | 复选框形态 | `string` | `outlined` / `filled` / `borderless` / `underlined` | `outlined` |
| onChange | 变化时回调 | `(e) => void` | - | - |
| onBlur | 失去焦点时回调 | `(e) => void` | - | - |
| onFocus | 获得焦点时回调 | `(e) => void` | - | - |
| children | 复选框内容 | `ReactNode` | - | - |
| className | 自定义类名 | `string` | - | - |
| style | 行内样式 | `CSSProperties` | - | - |

### CheckboxGroup

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|---|---|---|---|---|
| value | 受控模式下的选中值数组 | `string[]` | - | - |
| defaultValue | 非受控模式下的初始选中值数组 | `string[]` | - | `[]` |
| disabled | 是否禁用所有复选框 | `boolean` | - | `false` |
| options | 选项配置 | `string[] \| { value: string, label: string, disabled?: boolean, className?: string, style?: CSSProperties }[]` | - | - |
| onChange | 变化时回调 | `(checkedValues: string[]) => void` | - | - |
| className | 自定义类名 | `string` | - | - |
| style | 行内样式 | `CSSProperties` | - | - |

说明：

- 受控/非受控：Checkbox 传 `checked` 为受控模式，传 `defaultChecked` 为非受控模式；CheckboxGroup 传 `value` 为受控模式，传 `defaultValue` 为非受控模式。
- 半选状态：`indeterminate` 为 `true` 时显示半选样式，常用于全选/部分选场景。
- 选项配置：`options` 可以是字符串数组，也可以是对象数组，对象支持 `value`、`label`、`disabled`、`className`、`style` 属性。
- 事件回调：Checkbox 的 `onChange` 返回事件对象，CheckboxGroup 的 `onChange` 返回选中值数组。
