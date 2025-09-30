import '../index.css';
import Input from '../../input';
import Button from '../../button';
import { Form, FormItem, setValueByPath } from '../index';
import Select from '../../select';
import Radio from '../../radio';
import Switch from '../../switch';

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
