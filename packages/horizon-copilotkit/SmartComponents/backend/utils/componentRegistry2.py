# 组件注册表
from typing import Any, Dict, List, Optional

from fastapi import HTTPException
from pydantic import BaseModel

class ToolInfo(BaseModel):
    description:str
    name: str
    paramsSchema: Dict[str, Any]

class ComponentRegistration(BaseModel):
    name: str
    description: str
    tools: List[ToolInfo]

class ComponentRegistry2:
    def __init__(self):
        self._components: Dict[str, ComponentRegistration] = {}
    
    def register_component(self, component: ComponentRegistration):
        tools_dict = {tool.name: tool for tool in component.tools}
        self._components[component.name] = component
    def get_component(self, name: str) -> Optional[ComponentRegistration]:
        return self._components.get(name)
    
    def get_all_components(self) -> Dict[str, ComponentRegistration]:
        return self._components



    



