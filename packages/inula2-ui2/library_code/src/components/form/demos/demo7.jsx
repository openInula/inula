import '../index.css';
import Input from '../../input/index.jsx';
import Button from '../../button/index.jsx';
import Tag from '../../tag';
import { Form, FormItem, setValueByPath } from '../index.jsx';

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

