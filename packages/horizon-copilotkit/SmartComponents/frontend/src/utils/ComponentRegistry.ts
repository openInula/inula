import { ComponentTool, RealComponentTool } from "./defineComponentTool"

const registry = new Map()

export async function registerComponent(component:RealComponentTool,instance:any) {

  registry.set(component.name, { component, instance })

  const componentInfo = {
    name: component.name,
    description: component.description,
    tools: Object.entries(component.tools).map(([toolName, tool]) => ({
      name: toolName,
      description:tool.description,
      paramsSchema: tool.paramsSchema,
    })),
  };

  //注册时给后端发送post请求，同步注册信息
  try{
    const response=await fetch("http://localhost:8000/api/register",{
      method:"POST",
      headers:{
        
        'Content-Type': 'application/json',
      },
      body:JSON.stringify(componentInfo)
    });
    console.log("结果",response);
    if(!response.ok){
      console.log("后端注册失败");
    }
  }catch(err){
    console.log("向后端注册失败",err)
  }
}

//后端只需要返回name,tool,params!不需要传递instance
//在注册时也只需要传递这些信息
export async function callComponentTool(name:string, tool:string, params:any) {
  const entry = registry.get(name)
  if (!entry) throw new Error('未注册组件')
  const cb = entry.component.tools[tool]?.cb
  if (!cb) throw new Error('未注册工具方法')
  return await cb(entry.instance, params)
}