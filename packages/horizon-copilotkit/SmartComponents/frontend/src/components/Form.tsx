// FormComponent.tsx
import React, { forwardRef, useImperativeHandle } from 'react'
import { Form, Input, Button } from 'antd'

interface FormHandle {
  setFieldValue: (field: string, value: any) => void
  submitForm: () => void
}

interface FormComponentProps {
  // 这里可以添加组件的props定义
}

const FormComponent = forwardRef<FormHandle, FormComponentProps>((props, ref) => {
  const [form] = Form.useForm()

  useImperativeHandle(ref, (): FormHandle => ({
    setFieldValue: (field: string, value: any) => {
      form.setFieldsValue({ [field]: value })
    },
    submitForm: () => {
      form.submit()
    }
  }))

  const onFinish = () => {
    alert('表单提交成功：')
  }

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item label="用户名" name="username" rules={[{ required: true }]}>
        <Input placeholder="请输入用户名" />
      </Form.Item>
      <Button type="primary" htmlType="submit">提交</Button>
    </Form>
  )
})

export default FormComponent