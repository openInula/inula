
import { defineComponentTool } from "../utils/defineComponentTool"
export const getSelectConfig = () =>
  defineComponentTool({
    name: 'Select',
    description: '下拉选择器组件',
    tools: {
      setValue: {
        description:"选中选择器的一个选项",
        paramsSchema: {
            value:{
                type:"string",
                description: "要设置的选中值"
            }
        },
        cb: (instance:any, { value }) => {
          instance.setValue(value)
          return { type: 'text', text: `选择器已设置为 ${value}` }
        }
      },
      setOpen: {
        description:"设置选择器打开和关闭状态",
        paramsSchema: {
            open:{
                type:"boolean",
                description: "设置的选择器打开还是关闭状态"
            }
        },
        cb: (instance,{open}) => {
          instance.setOpen(open)
          return { type: 'text', text: '已设置表单状态' }
        }
      }
    }
  })