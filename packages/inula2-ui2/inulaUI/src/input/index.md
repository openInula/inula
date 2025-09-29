# Input 输入框

通过鼠标或键盘输入内容，是最基础的表单域的包装。

## 何时使用

需要用户输入表单域内容时。

提供组合型输入框，带搜索的输入框，还可以进行大小选择。

## 代码演示

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/input/demo1"
  style="width: 100%; height: 90px; border: 0;"
></iframe>
<h3>基础输入框</h3>
<p>演示基础输入框的用法。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Input,Tag} from 'inula-ui';

function Demo1() {
    let value = "";

    function handleInput(e) {
        value = e.target.value;
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
                <Tag color="geekblue">非受控组件</Tag>
                <Input placeholder="请输入内容" />
                <Tag color="geekblue">受控组件</Tag>
                <Input value={value} onInput={handleInput} placeholder="请输入内容" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
                <Tag color="geekblue">不带默认值</Tag>
                <Input placeholder="请输入内容"/>
                <Tag color="geekblue">带默认值</Tag>
                <Input defaultValue="这是一个输入框" placeholder="请输入内容" />
            </div>
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
  src="http://localhost:5173/#/input/demo2"
  style="width: 100%; height: 170px; border: 0;"
></iframe>
<h3>不同尺寸</h3>
<p>演示不同尺寸的输入框。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Input,Tag} from 'inula-ui';

function Demo2() {

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex',  gap: 8, alignItems: 'flex-start' }}>
        <Tag color="geekblue">input</Tag>
        <Input size="small" placeholder="小尺寸" />
        <Input size="default" placeholder="默认尺寸" />
        <Input size="large" placeholder="大尺寸" />
      </div>
      <div style={{ display: 'flex',  gap: 8, alignItems: 'flex-start' }}>
        <Tag color="geekblue">textarea</Tag>
        <Input
          type="textarea"
          placeholder="小尺寸"
          size="small"
          autoSize={true}
          style={{ marginBottom: '10px' }}
        />
        <Input
          type="textarea"
          placeholder="默认尺寸"
          size="default"
          autoSize={true}
          style={{ marginBottom: '10px' }}
        />
        <Input
          type="textarea"
          placeholder="大尺寸"
          size="large"
          autoSize={true}
          style={{ marginBottom: '10px' }}
        />
      </div>
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
  src="http://localhost:5173/#/input/demo3"
  style="width: 100%; height: 140px; border: 0;"
></iframe>
<h3>不同形态</h3>
<p>演示不同形态的输入框。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Input,Tag} from 'inula-ui';

function Demo3() {

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Tag color="geekblue">input</Tag>
                <Input size="default" variant="filled" placeholder="filled形态" />
                <Input size="default" variant="outlined" placeholder="outlined形态" />
                <Input size="default" variant="borderless" placeholder="borderless形态" />
                <Input size="default" variant="underlined" placeholder="underlined形态" />
                <Input size="default" disabled placeholder="禁用状态" />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Tag color="geekblue">textarea</Tag>
                <Input
                    type="textarea"
                    placeholder="filled形态"
                    variant="filled"
                    autoSize={true}
                />
                <Input
                    type="textarea"
                    placeholder="outlined形态"
                    variant="outlined"
                    autoSize={true}
                />
                <Input
                    type="textarea"
                    placeholder="borderless形态"
                    variant="borderless"
                    autoSize={true}
                />
                <Input
                    type="textarea"
                    placeholder="underlined形态"
                    variant="underlined"
                    autoSize={true}
                />
                <Input
                    type="textarea"
                    placeholder="禁用状态的自动调整"
                    autoSize={true}
                    disabled={true}
                />
            </div>

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
  src="http://localhost:5173/#/input/demo4"
  style="width: 100%; height: 55px; border: 0;"
></iframe>
<h3>前后缀</h3>
<p>演示带前后缀的输入框。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Input} from 'inula-ui';

function Demo4() {

  return (
    <div>
      <Input addonBefore="http://" addonAfter=".com" placeholder="请输入内容" />
    </div>
  )
      
}

export default Demo4;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/input/demo5"
  style="width: 100%; height: 195px; border: 0;"
></iframe>
<h3>字数统计</h3>
<p>演示带字数统计的输入框。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Input} from 'inula-ui';

function Demo5() {
  let value = "这是一个输入框";

  function handleInput(e) {
    value = e.target.value;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Input
        value={value}
        onInput={handleInput}
        showCount
        maxLength={20}
        placeholder="请输入内容"
      />
      <Input
        defaultValue="这是一个输入框"
        showCount
        placeholder="请输入内容"
      />
      <Input
        type="textarea"
        placeholder="带字数统计的自动调整"
        autoSize={true}
        showCount={true}
        maxLength={200}
        style={{ marginBottom: '10px' }}
      />
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
  src="http://localhost:5173/#/input/demo6"
  style="width: 100%; height: 85px; border: 0;"
></iframe>
<h3>清除按钮</h3>
<p>演示带清除按钮的输入框。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Input} from 'inula-ui';

function Demo6() {
  let value = "";

  function handleInput(e) {
    value = e.target.value;
  }

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <Input
        defaultValue="这是一个输入框"
        allowClear
        placeholder="请输入内容"
      />
      <Input
        type="textarea"
        allowClear
        placeholder="请输入内容"
        autoSize={true}
      />
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
  src="http://localhost:5173/#/input/demo7"
  style="width: 100%; height: 120px; border: 0;"
></iframe>
<h3>Textarea 自动调整高度</h3>
<p>演示 textarea 的自动调整高度功能。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Input,Tag} from 'inula-ui';

const Demo7 = () => {
    return (
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                <Tag color='geekblue'>基础 textarea</Tag>
                <Input
                    type="textarea"
                    placeholder="这是一个普通的 textarea"
                />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                <Tag color='geekblue'>自动调整高度（布尔值）</Tag>
                <Input
                    type="textarea"
                    placeholder="输入文字，高度会自动调整"
                    autoSize={true}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                <Tag color='geekblue'>自定义最小最大行数</Tag>
                <Input
                    type="textarea"
                    placeholder="最小2行，最大6行"
                    autoSize={{ minRows: 2, maxRows: 6 }}
                />
            </div>

        </div>
    );
};

export default Demo7;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/input/demo8"
  style="width: 100%; height: 55px; border: 0;"
></iframe>
<h3>状态</h3>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Input} from 'inula-ui';

const Demo8 = () => {

    let value = "";

    function handleInput(e) {
        console.log("handleInput111", e.target.value);
        value = e.target.value;
    }
    return (
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <Input
                placeholder="请输入内容"
                value={value}
                onInput={handleInput}
            />
            <Input
                placeholder="请输入内容"
                value={value}
                onInput={handleInput}
                status="error"
            />
            <Input
                placeholder="请输入内容"
                value={value}
                onInput={handleInput}
                status="warning"
            />
        </div>
    );
}

export default Demo8;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/input/demo9"
  style="width: 100%; height: 55px; border: 0;"
></iframe>
<h3>密码框</h3>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Input} from 'inula-ui';

let password = '';

function handlePasswordInput(e) {
  password = e.target.value;
}


const Demo9 = () => {
  return  <Input type="password" showPassword={true} placeholder="请输入密码" value={password} onInput={handlePasswordInput}/>
} 

export default Demo9;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

## API

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|---|---|---|---|---|
| value | 受控模式下的输入值 | `string` | - | - |
| defaultValue | 非受控模式下的初始值 | `string` | - | `""` |
| type | 输入框类型 | `string` | `text` / `password` / `textarea` | `text` |
| size | 输入框尺寸 | `string` | `small` / `default` / `large` | `default` |
| variant | 输入框形态 | `string` | `outlined` / `filled` / `borderless` / `underlined` | `outlined` |
| placeholder | 占位符文本 | `string` | - | `""` |
| disabled | 是否禁用 | `boolean` | - | `false` |
| allowClear | 是否显示清除按钮 | `boolean` | - | `false` |
| showCount | 是否显示字数统计 | `boolean` | - | `false` |
| maxLength | 最大输入长度 | `number` | - | `5000` |
| autoSize | 自动调整高度（仅 textarea） | `boolean \| { minRows: number, maxRows: number }` | - | `false` |
| addonBefore | 前置标签 | `ReactNode` | - | - |
| addonAfter | 后置标签 | `ReactNode` | - | - |
| status | 输入框状态 | `string` | `error` / `warning` | - |
| onInput | 输入事件回调 | `(e) => void` | - | - |
| onChange | 变更事件回调 | `(e) => void` | - | - |
| className | 自定义类名 | `string` | - | `""` |
| style | 行内样式 | `CSSProperties` | - | `{}` |

说明：

- 受控/非受控：传 `value` 为受控模式，传 `defaultValue` 为非受控模式。
- 密码框：`type="password"` 时自动显示密码可见性切换按钮。
- 自动调整：`autoSize` 为 `true` 时无限制调整；为对象时可设置 `minRows` 与 `maxRows`。
- 字数统计：`showCount` 为 `true` 时在输入框右下角显示当前字数与最大长度。
- 清除按钮：`allowClear` 为 `true` 且非禁用且有内容时显示清除按钮。
- 前后缀：`addonBefore` 与 `addonAfter` 会在输入框前后添加标签。
- 状态：`status` 为 `error` 或 `warning` 时显示对应状态样式。
