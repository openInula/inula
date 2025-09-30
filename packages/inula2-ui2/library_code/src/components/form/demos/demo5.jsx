import { Form, FormItem, getValueByPath, setValueByPath } from "../index.jsx";
import Input from "../../input/index.jsx";
import Select from "../../select/index.jsx";
import Button from "../../button/index.jsx";
import { Checkbox } from "../../checkbox/index.jsx";
import Radio from "../../radio/index.jsx";
import Switch from "../../switch/index.jsx";

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
