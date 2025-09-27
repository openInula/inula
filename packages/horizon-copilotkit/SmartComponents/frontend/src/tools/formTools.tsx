
import { defineComponentTool } from "../utils/defineComponentTool"
export const getFormConfig = () =>
  defineComponentTool({
    name: 'Form',
    description: '表单操作工具',
    tools: {
      setFieldValue: {
        description:"填充表单字段",
        paramsSchema: {
            type: "object",
            properties: {
                field: { type: "string" },
                value: { type: "string" }
            },
            required: ["field", "value"]
        },
        cb: (instance:any, { field, value }) => {
          instance.setFieldValue(field, value)
          return { type: 'text', text: `字段 ${field} 已设置为 ${value}` }
        }
      },
      submitForm: {
        description:"提交表单",
        paramsSchema: {},
        cb: (instance) => {
          instance.submitForm()
          return { type: 'text', text: '表单已提交' }
        }
      }
    }
  })