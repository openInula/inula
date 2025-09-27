# Switch 开关组件

## 何时使用

使用开关可以切换两种状态。

## 代码演示

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/switch/demo1"
  style="width: 100%; height: 150px; border: 0;"
></iframe>
<h3>基本</h3>
<p>两种型号开关，支持默认选中、禁用</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { Switch, Tag } from 'inula-ui';

const SwitchDemo = () => {
  let checked = false;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Tag color="geekblue">默认型号、小号开关</Tag>
        <Switch />
        <text>默认型号</text>
        <Switch size="small" />
        <text>小号</text>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Tag color="geekblue">默认选中</Tag>
        <Switch defaultChecked={true} />
        <text>默认选中</text>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Tag color="geekblue">禁用开关</Tag>
        <Switch defaultChecked={true} disabled={true} />
        <text>默认选中禁用</text>
        <Switch disabled={true} />
        <text>禁用</text>
      </div>
    </div>
  );
};

export default SwitchDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/switch/demo2"
  style="width: 100%; height: 55px; border: 0;"
></iframe>
<h3>受控</h3>
<p>开关状态外部受控案例</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { Switch, Tag, Button } from 'inula-ui';

const SwitchDemo = () => {
  let checked = false;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Tag color="geekblue">外部受控开关</Tag>
        <Switch checked={true} style={{ backgroundColor: 'pink' }} />
        <text>选中</text>
        <Switch checked={checked} />
        <Button onClick={() => (checked = !checked)}>切换</Button>
      </div>
    </div>
  );
};

export default SwitchDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/switch/demo3"
  style="width: 100%; height: 55px; border: 0;"
></iframe>
<h3>带内容开关</h3>
<p>可以自定义选中和非选中时开关的内容</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { Switch, Tag, Icon } from 'inula-ui';

const SwitchDemo = () => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Tag color="geekblue">带内容的开关</Tag>
        <Switch
          checkedChildren="开启"
          unCheckedChildren="关闭"
          defaultChecked
        />
        <Switch checkedChildren="1" unCheckedChildren="0" />
        <Switch
          checkedChildren={<Icon value="check" color="white" size={18} />}
          unCheckedChildren={<Icon value="close" color="white" size={18} />}
          defaultChecked
        />
      </div>
    </div>
  );
};

export default SwitchDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/switch/demo4"
  style="width: 100%; height: 55px; border: 0;"
></iframe>
<h3>加载</h3>
<p>支持加载状态开关，加载中不可操作。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import { Switch, Tag } from 'inula-ui';

const SwitchDemo = () => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Tag color="geekblue">加载状态开关</Tag>
        <Switch defaultChecked loading />
        <Switch defaultValue={true} loading size="small" />
      </div>
    </div>
  );
};

export default SwitchDemo;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

## API

| 属性              | 说明                             | 类型            | 可选值                 | 默认值  |
| ----------------- | -------------------------------- | --------------- | ---------------------- | ------- |
| defaultChecked    | 默认选中                         | `boolean`       | -                      | `false` |
| defaultValue      | defaultChecked 别名              | `boolean`       | -                      | `false` |
| size              | 开关大小                         | `string`        | `'default' \| 'small'` | `false` |
| checked           | 当前选中状态                     | `boolean`       | -                      | -       |
| disabled          | 禁用状态                         | `boolean`       | -                      | `false` |
| loading           | 加载中状态（禁用且展示旋转图标） | `boolean`       | -                      | `false` |
| checkedChildren   | 选中时 swicth 自带内容           | `node`          | -                      | -       |
| unCheckedChildren | 非选中时 swicth 自带内容         | `node`          | -                      | -       |
| onChange          | 状态改变回调                     | `(e) => void`   | -                      | -       |
| onClick           | 点击回调                         | `(e) => void`   | -                      | -       |
| className         | 自定义样式类                     | `string`        | -                      | -       |
| style             | 自定义行内样式                   | `CSSProperties` | -                      | -       |

说明：当传入`checked`时 switch 为外部受控状态。
