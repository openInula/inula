export interface ComponentTool {
  /** 组件的工具名 */
  name: string
  /** 组件具有的功能描述 */
  description: string
  /** 组件的工具集合 */
  tools: Record<
    string,
    {
      description:string
      paramsSchema: any
      cb: (instance: any, value: any) => any
    }
  >
}

export interface RealComponentTool {
  /** 组件的工具名 */
  name: string
  /** 组件具有的功能描述 */
  description: string
  
  tools:Record<string,{
      description:string
      paramsSchema: any
      cb: (instance: any, value: any) => any
    }>
  /** 汇总所有功能到一起的tool */
  cb: (instance: any, params: Record<string, any>) => void
}

// export const getParamsSchema = (tools: Record<string, { paramsSchema: any }>): Record<string, any> => {
//   return Object.keys(tools).reduce((acc: Record<string, any>, key: string) => {
//     acc[key] = tools[key].paramsSchema
//     return acc
//   }, {})
// }

export const defineComponentTool = (componentMcpConfig: ComponentTool): RealComponentTool => {
  const tools=componentMcpConfig.tools;

  const realTool: RealComponentTool = {
    name: componentMcpConfig.name,
    description: componentMcpConfig.description,
    tools:tools,
    cb: (instance: any, args) => {
      if (!args || !Object.keys(args).length) {
        return { content: [{ type: 'text', text: 'no tools' }] }
      }

      const results = Object.entries(args).map(([key, value]) => {
        const tool = componentMcpConfig.tools[key]
        if (!tool) {
          return { content: [{ type: 'text', text: `tool ${key} not found` }] }
        }
        return tool.cb(instance, value)
      })

      return { content: results }
    }
  }
  return realTool
}
