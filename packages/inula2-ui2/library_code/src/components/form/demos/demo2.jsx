import '../index.css';
import Input from '../../input';
import Button from '../../button';
import { Form, FormItem, setValueByPath } from '../index';


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
          {/* <Button type="link" onClick={handleSetValues}>Fill form</Button> */}
        </div>
      </Form>
    </div>
  );
};

export default Demo;
