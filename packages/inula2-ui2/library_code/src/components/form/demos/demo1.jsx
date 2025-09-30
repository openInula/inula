import '../index.css';
import Input from '../../input';
import Button from '../../button';
import { Form, FormItem, setValueByPath } from '../index';
import { Checkbox } from '../../checkbox';

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

