import json
from typing import Any, Dict, List

from pydantic import BaseModel
from .componentRegistry2 import ComponentRegistry2

class ActionRequest(BaseModel):
    component: str
    tool: str
    parameters: Dict[str, Any]

class LLMResponse(BaseModel):
    actions: List[ActionRequest]
    message: str

class LLMService2:
    def __init__(self, registry: ComponentRegistry2):
        self.registry = registry
    
    def generate_tool_schema_for_llm(self) -> Dict[str, Any]:
        """生成给LLM的工具schema"""
        components = self.registry.get_all_components()
        
        schema = {
            "type": "object",
            "properties": {
                "actions": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "component": {
                                "type": "string",
                                "enum": list(components.keys())
                            },
                            "tool": {
                                "type": "string"
                            },
                            "parameters": {
                                "type": "object"
                            }
                        },
                        "required": ["component", "tool", "parameters"]
                    }
                },
                "message": {"type": "string"}
            }
        }

        # 组件描述信息
        component_descriptions = {}
        for comp_name, component in components.items():
            component_descriptions[comp_name] = {
                "description": component.description,
                "tools": {
                    tool_def.name: {
                        "description": tool_def.description,
                        "parameters": tool_def.paramsSchema
                    }
                    for tool_def in component.tools
                }
            }

        return {
            "schema": schema,
            "component_descriptions": component_descriptions
        }
    
    async def create_llm_prompt(self, user_input: str) -> str:
        """创建LLM提示"""
        tool_info = self.generate_tool_schema_for_llm()
        print(tool_info)
        
        prompt = """你是一个智能助手，可以操作以下组件工具。根据用户请求，决定需要调用哪些工具。

可用组件:"""
        for comp_name, comp_info in tool_info["component_descriptions"].items():
            prompt += f"\n- {comp_name}: {comp_info['description']}"
            for tool_name, tool_info in comp_info["tools"].items():
                prompt += f"\n  - {tool_name}: {tool_info['description']}"
                prompt += f"\n    参数schema: {json.dumps(tool_info['parameters'], indent=2)}"
        
        prompt += f"""

用户请求: {user_input}

请以JSON格式响应，包含:
1. "actions"数组 - 指定要调用的组件、工具和参数
2. "message" - 给用户的自然语言回复

示例响应:
{{
    "actions": [
        {{
            "component": "Form",
            "tool": "setValue",
            "parameters": {{"field": "username", "value": "John"}}
        }}
    ],
    "message": "已设置用户名字段"
}}
"""
        return prompt
    
    async def process_llm_response(self, response: str) -> LLMResponse:
        """处理LLM原始响应"""
        try:
            data = json.loads(response)
            return LLMResponse(
                actions=[ActionRequest(**action) for action in data.get("actions", [])],
                message=data.get("message", "")
            )
        except Exception as e:
            raise ValueError(f"无效的LLM响应: {str(e)}")