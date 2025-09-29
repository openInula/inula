# Form 表单

高性能表单控件，自带数据域管理。包含数据录入、校验以及对应样式。

## 何时使用

用于创建一个实体或收集信息。

需要对输入的数据类型进行校验时。

## 代码演示

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/form/demo1"
  style="width: 100%; height: 265px; border: 0;"
></iframe>
<h3>基本</h3>
<p>基本的表单数据域控制展示，包含布局、初始化、验证、提交。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Button,Input,Form, FormItem, setValueByPath,Checkbox} from 'inula-ui';

const Demo1 = () => {
  let layout = 'horizontal';
  let user = {
    username: '',
    password: '',
    remember: false,
  };

  const rules = {
    username: [
      { required: true, message: '请输入用户名' },
      { min: 3, message: '至少 3 个字符' }
    ],
    password: [
      { required: true, message: '请输入密码' },
      { min: 6, message: '至少 6 位' }
    ],
  };

  const handleFinish = (values) => {
    console.log('提交成功：', values);
    alert('提交成功: ' + JSON.stringify(values));
  };

  const handleFailed = ({ errors }) => {
    console.log('提交失败：', errors);
    // alert('提交失败: ' + JSON.stringify(errors));
  };

  return (
    <div style={{ padding: 24, width: 600 }}>
      <Form
        model={user}
        rules={rules}
        layout={layout}
        onFinish={handleFinish}
        onFinishFailed={handleFailed}
      >
        <FormItem name="username" label="Username" required model={user}>
          <Input
            placeholder="请输入用户名"
            onInput={(e) => setValueByPath(user, 'username', e.target.value)}
          />
        </FormItem>

        <FormItem name="password" label="Password" required model={user}>
          <Input
            type="password"
            placeholder="请输入密码"
            onInput={(e) => setValueByPath(user, 'password', e.target.value)}
          />
        </FormItem>

        <FormItem name="remember" label={null} model={user}>
          <Checkbox 
            defaultChecked={user.remember}
            onChange={(e) => {
              user.remember = e.target.checked;
            }}
          >
            Remember me
          </Checkbox>
        </FormItem>

        <FormItem name="remember" label={null} model={user}>
          <Button type="primary" htmlType="submit">Submit</Button>
        </FormItem>
      </Form>
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
  src="http://localhost:5173/#/form/demo2"
  style="width: 100%; height: 290px; border: 0;"
></iframe>
<h3>表单方法调用</h3>
<p>展示表单的各种方法调用，包括校验、重置、设置值等。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Button,Input,Form, FormItem, setValueByPath} from 'inula-ui';

const Demo = () => {
  let layout = 'horizontal';
  let user = {
    username: '',
    email: '',
    phone: ''
  };

  const rules = {
    username: [
      { required: true, message: '请输入用户名' },
      { min: 3, message: '至少 3 个字符' }
    ],
    email: [
      { required: true, message: '请输入邮箱' },
      { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' }
    ],
    phone: [
      { required: true, message: '请输入手机号' },
      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
    ]
  };

  let formRef = null;

  const handleFinish = (values) => {
    console.log('提交成功：', values);
  };

  const handleFailed = ({ errors }) => {
    console.log('提交失败：', errors);
  };

  const handleSetValues = () => {
    
    // 尝试通过重新赋值整个对象来触发响应式更新
    user.username = 'testuser';
    user.email = 'test@example.com';
    user.phone = '13800138000';
    
    // 强制触发响应式更新
    // user = { ...user };
    
    console.log('SetValues - user:', user);
    alert('表单值已设置');
  };

  return (
    <div style={{ padding: 24, width: 600 }}>
      <Form
        ref={formRef}
        model={user}
        rules={rules}
        layout={layout}
        onFinish={handleFinish}
        onFinishFailed={handleFailed}
      >
        <FormItem name="username" label="Username" required model={user}>
          <Input
            placeholder="请输入用户名"
            onInput={(e) => setValueByPath(user, 'username', e.target.value)}
          />
        </FormItem>

        <FormItem name="email" label="Email" required model={user}>
          <Input
            placeholder="请输入邮箱"
            onInput={(e) => setValueByPath(user, 'email', e.target.value)}
          />
        </FormItem>

        <FormItem name="phone" label="Phone" required model={user}>
          <Input
            placeholder="请输入手机号"
            onInput={(e) => setValueByPath(user, 'phone', e.target.value)}
          />
        </FormItem>

        <div style={{ marginLeft: 120, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button type="primary" htmlType="submit">Submit</Button>
          <Button htmlType="reset">Reset</Button>
          <Button type="link" onClick={handleSetValues}>Fill form</Button>
        </div>
      </Form>
    </div>
  );
};

export default Demo;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/form/demo3"
  style="width: 100%; height: 255px; border: 0;"
></iframe>
<h3>表单布局</h3>
<p>表单有三种布局。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Button,Input,Form, FormItem, setValueByPath,Select} from 'inula-ui';

const Demo3 = () => {
    let layout = 'inline';
    let searchForm = {
        keyword: '',
        category: ''
    };

    const categoryOptions = [
        { label: '全部', value: 'all' },
        { label: '技术', value: 'tech' },
        { label: '设计', value: 'design' },
        { label: '产品', value: 'product' }
    ];

    const handleSearch = (values) => {
        console.log('搜索条件：', values);
    };

    const handleReset = () => {
        searchForm.keyword = '';
        searchForm.category = '';
    };

    return (
        <div style={{ paddingTop: 24, textAlign: 'left' }}>
            <Form
                model={searchForm}
                layout={layout}
                labelAlign="left"
                onFinish={handleSearch}
                style={{ marginBottom: 16, maxWidth: layout === 'inline' ? 'none' : 600 }}
            >
                <FormItem label="Form Layout" name="layout" style={{display: 'flex'}}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <Button type={layout === 'horizontal' ? 'primary' : 'default'} onClick={() => { layout = 'horizontal'; }}>horizontal</Button>
                        <Button type={layout === 'vertical' ? 'primary' : 'default'} onClick={() => { layout = 'vertical'; }}>vertical</Button>
                        <Button type={layout === 'inline' ? 'primary' : 'default'} onClick={() => { layout = 'inline'; }}>inline</Button>
                    </div>
                </FormItem>
                <FormItem name="keyword" label="Field A" model={searchForm}>
                    <Input
                        placeholder="input placeholder"
                        onInput={(e) => setValueByPath(searchForm, 'keyword', e.target.value)}
                    />
                </FormItem>

                <FormItem name="category" label="Field B" model={searchForm}>
                    <Select
                        placeholder="input placeholder"
                        options={categoryOptions}
                        onChange={(value) => setValueByPath(searchForm, 'category', value)}
                    />
                </FormItem>

                <FormItem name="actions" label={null} model={searchForm}>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button type="primary" htmlType="submit">Search</Button>
                        <Button onClick={handleReset}>Reset</Button>
                    </div>
                </FormItem>
            </Form>
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
  src="http://localhost:5173/#/form/demo4"
  style="width: 100%; height: 500px; border: 0;"
></iframe>
<h3>表单禁用</h3>
<p>展示表单的禁用功能，包括禁用状态切换、表单重置等。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Button,Input,Form, FormItem, setValueByPath,Select,Radio,Switch} from 'inula-ui';

const Demo4 = () => {
  let isDisabled = false;
  let formData = {
    radio: '',
    input: '',
    select: '',
    textarea: '',
    switch: false
  };

  const selectOptions = [
    { label: '选项1', value: 'option1' },
    { label: '选项2', value: 'option2' },
    { label: '选项3', value: 'option3' }
  ];

  const radioOptions = [
    { label: 'Apple', value: 'apple' },
    { label: 'Pear', value: 'pear' }
  ];

  const handleFinish = (values) => {
    console.log('提交成功：', values);
    alert('提交成功: ' + JSON.stringify(values));
  };

  const handleFailed = ({ errors }) => {
    console.log('提交失败：', errors);
  };

  const toggleDisabled = () => {
    isDisabled = !isDisabled;
  };

  return (
    <div style={{ padding: 24, width: 800 }}>
      
      <div style={{ marginBottom: 16, display: 'flex' }}>
        <Button onClick={toggleDisabled} type="primary">
          {isDisabled ? '启用表单' : '禁用表单'}
        </Button>
        
      </div>

      <Form
          model={formData}
          disabled={isDisabled}
          onFinish={handleFinish}
          onFinishFailed={handleFailed}
        >
          <FormItem name="radio" label="Radio" model={formData}>
            <Radio
              name='group'
              options={radioOptions.map(option => ({
                ...option,
                checked: formData.radio === option.value
              }))}
              onChange={(value) => setValueByPath(formData, 'radio', value)}
              disabled={isDisabled}
            />
          </FormItem>

          <FormItem name="input" label="Input" model={formData}>
            <Input
              placeholder="请输入内容"
              value={formData.input}
              onInput={(e) => setValueByPath(formData, 'input', e.target.value)}
              disabled={isDisabled}
            />
          </FormItem>

          <FormItem name="select" label="Select" model={formData}>
            <Select
              placeholder="请选择"
              options={selectOptions}
              value={formData.select}
              onChange={(value) => setValueByPath(formData, 'select', value)}
              disabled={isDisabled}
            />
          </FormItem>

          <FormItem name="textarea" label="TextArea" model={formData}>
            <Input
              type="textarea"
              placeholder="请输入多行文本"
              rows={3}
              value={formData.textarea}
              onInput={(e) => setValueByPath(formData, 'textarea', e.target.value)}
              disabled={isDisabled}
            />
          </FormItem>

          <FormItem name="switch" label="Switch" model={formData}>
            <Switch
              checked={formData.switch}
              onClick={() => {
                formData.switch = !formData.switch;
              }}
              onChange={(e) => setValueByPath(formData, 'switch', e.target.checked)}
              disabled={isDisabled}
            />
          </FormItem>

          <FormItem name="button" label="Button" model={formData}>
            <Button disabled={isDisabled}>Button</Button>
          </FormItem>

          <FormItem name="actions" label={null} model={formData}>
            <Button type="primary" htmlType="submit" disabled={isDisabled}>
              Submit
            </Button>
          </FormItem>
        </Form>
    </div>
  );
};

export default Demo4;

```

</details>
</div>
<!-- markdownlint-enable MD033 -->

<!-- markdownlint-disable MD033 -->
<div style="border: 1px solid #eaecef; border-radius: 4px; padding: 0 20px 20px; margin: 20px 0">
<iframe
  src="http://localhost:5173/#/form/demo5"
  style="width: 100%; height: 395px; border: 0;"
></iframe>
<h3>表单变体</h3>
<p>展示四种不同的表单变体：outlined（默认）、filled、borderless、underlined。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Button,Form, FormItem, getValueByPath, setValueByPath,,Input,Select,Checkbox,Radio,Switch} from 'inula-ui';

function Demo5() {
  let variant = 'outlined';
  // 创建表单数据模型
  let formData = {
    username: '',
    email: '',
    country: '',
    description: '',
    agree: false,
    gender: '',
    notifications: false
  };

  const selectOptions = [
    // { label: '中国', value: 'china' },
    // { label: '美国', value: 'usa' },
    // { label: '日本', value: 'japan' },
    // { label: '韩国', value: 'korea' },
  ];

  const handleFinish = (values) => {
    console.log('表单提交成功:', values);
    alert('表单提交成功！请查看控制台输出。');
  };

  const handleFailed = (errors) => {
    console.log('表单校验失败:', errors);
    alert('表单校验失败，请检查输入！');
  };

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
        <Form
          model={formData}
          variant={variant}
          onFinish={handleFinish}
          onFinishFailed={handleFailed}
        >
          <FormItem label="Form Layout" name="layout" style={{ display: 'flex' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button type={variant === 'outlined' ? 'primary' : 'default'} onClick={() => { variant = 'outlined'; }}>outlined</Button>
              <Button type={variant === 'filled' ? 'primary' : 'default'} onClick={() => { variant = 'filled'; }}>filled</Button>
              <Button type={variant === 'borderless' ? 'primary' : 'default'} onClick={() => { variant = 'borderless'; }}>borderless</Button>
              <Button type={variant === 'underlined' ? 'primary' : 'default'} onClick={() => { variant = 'underlined'; }}>underlined</Button>
            </div>
          </FormItem>

          <FormItem name="username" label="Username" model={formData} required>
            <Input
              value={formData.username}
              onInput={(e) => setValueByPath(formData, 'username', e.target.value)}
            />
          </FormItem>

          <FormItem name="email" label="Email" model={formData} required>
            <Input
              type="email"
              value={formData.email}
              onInput={(e) => setValueByPath(formData, 'email', e.target.value)}
            />
          </FormItem>

          <FormItem name="country" label="Country" model={formData}>
            <Select
              options={selectOptions}
              value={formData.country}
              onChange={(value) => setValueByPath(formData, 'country', value)}
            />
          </FormItem>

          <FormItem name="description" label="Description" model={formData}>
            <Input
              type="textarea"
              rows={3}
              value={formData.description}
              onInput={(e) => setValueByPath(formData, 'description', e.target.value)}
            />
          </FormItem>

          <FormItem name="remember" label={null} model={formData}>
            <Button type="primary" htmlType="submit">submit</Button>
          </FormItem>
        </Form>
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
  src="http://localhost:5173/#/form/demo7"
  style="width: 100%; height: 360px; border: 0;"
></iframe>
<h3>自定义必填标记</h3>
<p>展示自定义必填标记的功能，包括默认、可选、隐藏、自定义。</p>

<details class="demo-source">
  <summary style="padding-inline-start: 0;">查看示例代码</summary>

```jsx | pure
import {Button,Input,Tag,Form, FormItem, setValueByPath} from 'inula-ui';

const Demo7 = () => {
  let layout = 'vertical';
  let requiredMark = 'default'; // default | optional | hidden | customize

  let formModel = {
    fieldA: '',
    fieldB: ''
  };

  const rules = {
    fieldA: [{ required: true, message: 'Field A 为必填项' }],
    fieldB: []
  };
  

  const customizeRequiredMark = (label, { required }) => (
    <>
      {required ? <Tag color='red' style={{marginRight: '5px'}}>Required</Tag> : <Tag color='geekblue' style={{marginRight: '5px'}}>optional</Tag>}
      {label}
    </>
  );

  const onFinish = (values) => {
    console.log('提交成功: ', values);
  };

  const onFailed = ({ errors }) => {
    console.log('提交失败: ', errors);
  };

  return (
    <div style={{ padding: 24, width: 640 }}>
      <Form
        model={formModel}
        rules={rules}
        requiredMark={requiredMark}
        layout={layout}
        labelAlign="left"
        requiredMarkRender={requiredMark === 'customize' ? customizeRequiredMark : null}
        onFinish={onFinish}
        onFinishFailed={onFailed}
      >
        <FormItem label="Required Mark" name="requiredMark">
          <div style={{ display: 'flex', gap: 12 }}>
            <Button type={requiredMark === 'default' ? 'primary' : 'default'} onClick={() => { requiredMark = 'default'; }}>Default</Button>
            <Button type={requiredMark === 'optional' ? 'primary' : 'default'} onClick={() => { requiredMark = 'optional'; }}>Optional</Button>
            <Button type={requiredMark === 'hidden' ? 'primary' : 'default'} onClick={() => { requiredMark = 'hidden'; }}>Hidden</Button>
            <Button type={requiredMark === 'customize' ? 'primary' : 'default'} onClick={() => { requiredMark = 'customize'; }}>Customize</Button>
          </div>
        </FormItem>
        <FormItem name="fieldA" label="Field A" required model={formModel}>
          <Input
            placeholder="input placeholder"
            onInput={(e) => setValueByPath(formModel, 'fieldA', e.target.value)}
          />
        </FormItem>

        <FormItem name="fieldB" label="Field B" model={formModel}>
          <Input
            placeholder="input placeholder"
            onInput={(e) => setValueByPath(formModel, 'fieldB', e.target.value)}
          />
        </FormItem>

        <FormItem name="submit" label={null} model={formModel}>
          <Button type="primary" htmlType="submit">Submit</Button>
        </FormItem>
      </Form>
    </div>
  );
};

export default Demo7;
```

</details>
</div>
<!-- markdownlint-enable MD033 -->

## API

### Form 属性

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|---|---|---|---|---|
| model | 表单数据模型（响应式对象） | `Record<string, any>` | - | `{}` |
| rules | 表单级校验规则 | `Record<string, Rule \| Rule[]>` | - | `{}` |
| layout | 表单布局 | `string` | `horizontal` / `vertical` / `inline` | `horizontal` |
| labelAlign | 标签对齐方式 | `string` | `left` / `right` | `right` |
| colon | 是否在标签后显示冒号 | `boolean` | - | `true` |
| disabled | 整体禁用 | `boolean` | - | `false` |
| variant | 视觉变体 | `string` | `outlined` / `filled` / `borderless` / `underlined` | `outlined` |
| size | 表单控件尺寸 | `string` | `small` / `medium` / `large` | `medium` |
| requiredMark | 必填标记策略 | `string` | `default` / `optional` / `hidden` / `customize` | `default` |
| requiredMarkRender | 自定义必填标记渲染 | `(label, ctx) => any` | - | `null` |
| onFinish | 提交且校验通过回调 | `(values) => void` | - | - |
| onFinishFailed | 提交且校验失败回调 | `({ errors, values }) => void` | - | - |
| className | 自定义类名 | `string` | - | - |
| style | 内联样式 | `Record<string, any>` | - | - |

说明：其余属性会透传给原生 `form` 元素。

#### Rule 规则项

| 字段 | 说明 | 类型 |
|---|---|---|
| required | 是否必填 | `boolean` |
| min | 最小值/最小长度 | `number` |
| max | 最大值/最大长度 | `number` |
| pattern | 正则校验 | `RegExp` |
| validator | 自定义校验函数，返回 `false` 或错误文案表示失败 | `(value, model) => boolean \| string \| { valid: boolean; message?: string }` |
| message | 校验失败的提示文案 | `string` |

### Form 实例方法

| 方法 | 说明 | 签名 |
|---|---|---|
| validate | 校验表单，返回是否通过与错误/值 | `(fieldNames?: string[]) => { valid: boolean; errors: Record<string, string>; values: any }` |
| validateField | 校验单个字段 | `(fieldName: string) => { valid: boolean; error: string; value: any }` |
| resetFields | 重置字段为默认空值 | `(fieldNames?: string[]) => void` |
| setFieldsValue | 批量设置字段值 | `(values: Record<string, any>) => void` |
| getFieldsValue | 获取全部或部分字段值 | `(fieldNames?: string[]) => any` |
| clearValidate | 清除校验状态（占位，按需扩展） | `(fieldNames?: string[]) => void` |
| submit | 触发表单提交 | `() => void` |

### FormItem 属性

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|---|---|---|---|---|
| name | 字段名（支持路径 `a.b.c`） | `string` | - | - |
| label | 标签文本，传 `null` 隐藏 | `any` | - | - |
| required | 是否必填（叠加到规则） | `boolean` | - | `false` |
| rules | 字段级规则（与表单级规则合并） | `Rule \| Rule[]` | - | `[]` |
| model | 绑定的表单模型（用于注册字段） | `Record<string, any>` | - | - |
| validateOn | 触发校验时机 | `string` | `change` / `blur` / `submit` | `change` |
| help | 帮助文案 | `any` | - | - |
| extra | 额外说明 | `any` | - | - |
| className | 自定义类名 | `string` | - | - |
| style | 内联样式 | `Record<string, any>` | - | - |
| colon | 覆盖是否展示冒号 | `boolean` | - | `true` |
| children | 表单控件 | `any` | - | - |

说明：`disabled`、`variant`、`size`、`requiredMark` 等会从 `Form` 上下文继承。

### 辅助函数

从包中额外导出以下工具函数：

- `getValueByPath(obj, path)`：根据路径获取对象值。
- `setValueByPath(obj, path, value)`：根据路径设置对象值。
