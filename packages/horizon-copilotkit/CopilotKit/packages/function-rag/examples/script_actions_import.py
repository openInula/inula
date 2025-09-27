#!/usr/bin/env python3
"""
Playwright 脚本动作定义导入示例 - 将 playwright-scripts/definitions 目录下的动作定义转换为 RAG 函数并入库。
"""

import asyncio
import json
import sys
import re
from pathlib import Path
from typing import Dict, Any, List

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core import ConfigManager, FunctionRAGSystem
from app.models import AddFunctionRequest, FunctionExample, Parameter, ParameterType


def convert_js_to_json(js_str: str) -> str:
    """
    将JavaScript对象字符串转换为JSON字符串
    
    Args:
        js_str: JavaScript对象字符串
        
    Returns:
        JSON字符串
    """
    try:
        # 1. 移除JavaScript注释
        # 移除单行注释 //
        js_str = re.sub(r'//.*?$', '', js_str, flags=re.MULTILINE)
        # 移除多行注释 /* */
        js_str = re.sub(r'/\*.*?\*/', '', js_str, flags=re.DOTALL)
        
        # 2. 处理属性名：给没有引号的属性名加上双引号
        # 匹配冒号前的属性名，但要避免影响字符串值中的内容
        js_str = re.sub(r'(\n\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:', r'\1"\2":', js_str)
        
        # 3. 处理字符串值：将单引号字符串转为双引号（但不影响双引号字符串内部的单引号）
        # 先保护已经存在的双引号字符串
        protected_strings = []
        def protect_double_quoted(match):
            protected_strings.append(match.group(0))
            return f"__PROTECTED_STRING_{len(protected_strings)-1}__"
        
        # 保护双引号字符串
        js_str = re.sub(r'"([^"\\]*(?:\\.[^"\\]*)*)"', protect_double_quoted, js_str)
        
        # 现在可以安全地转换单引号字符串
        js_str = re.sub(r"'([^'\\]*(?:\\.[^'\\]*)*)'", r'"\1"', js_str)
        
        # 恢复保护的双引号字符串
        for i, protected in enumerate(protected_strings):
            js_str = js_str.replace(f"__PROTECTED_STRING_{i}__", protected)
        
        # 4. 移除尾随逗号
        js_str = re.sub(r',(\s*[}\]])', r'\1', js_str)
        
        return js_str
        
    except Exception as e:
        print(f"转换JS到JSON时出错: {e}")
        return ""


def load_js_definition_file(file_path: Path) -> Dict[str, Any]:
    """
    从 JavaScript 定义文件中提取动作定义
    将JavaScript对象转换为JSON后解析
    
    Args:
        file_path: JS 定义文件路径
        
    Returns:
        动作定义字典
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 提取 export const xxxDefinition = { ... }; 中的对象
        pattern = r'export\s+const\s+\w+Definition\s*=\s*({[\s\S]*?});'
        match = re.search(pattern, content)
        
        if not match:
            print(f"⚠️  无法找到定义对象: {file_path.name}")
            return {}
        
        obj_str = match.group(1)
        
        # 转换JavaScript对象为JSON
        json_str = convert_js_to_json(obj_str)
        
        if not json_str:
            print(f"⚠️  转换JSON失败: {file_path.name}")
            return {}
        
        # 解析JSON
        definition = json.loads(json_str)
        definition['_source_file'] = file_path.name
        
        print(f"✅ 成功解析: {file_path.name}")
        return definition
        
    except Exception as e:
        print(f"❌ 解析文件失败 {file_path.name}: {e}")
        return {}


def load_script_actions(definitions_dir: Path, script_names: List[str]) -> List[Dict[str, Any]]:
    """
    从 definitions 目录加载指定的脚本动作定义
    
    Args:
        definitions_dir: 定义文件目录路径
        script_names: 要加载的脚本名称列表
        
    Returns:
        动作定义列表
    """
    actions = []
    
    if not definitions_dir.exists():
        print(f"❌ 目录不存在: {definitions_dir}")
        return actions
    
    print(f"🔍 准备加载 {len(script_names)} 个指定的脚本定义")
    
    for script_name in script_names:
        # 构建完整的文件路径
        file_path = definitions_dir / f"{script_name}.definition.js"
        
        if not file_path.exists():
            print(f"⚠️  文件不存在: {file_path.name}")
            continue
            
        definition = load_js_definition_file(file_path)
        if definition:
            actions.append(definition)
            print(f"  ✅ 已加载: {script_name}")
        else:
            print(f"  ❌ 加载失败: {script_name}")
    
    print(f"✅ 成功加载 {len(actions)} 个动作定义")
    return actions


def convert_js_type_to_parameter_type(js_type: str) -> ParameterType:
    """将 JavaScript 类型转换为 ParameterType"""
    type_mapping = {
        "string": ParameterType.STRING,
        "number": ParameterType.NUMBER,
        "boolean": ParameterType.BOOLEAN,
        "object": ParameterType.OBJECT,
        "array": ParameterType.ARRAY
    }
    return type_mapping.get(js_type.lower(), ParameterType.STRING)


def convert_js_parameters_to_rag(js_params: Dict[str, Any]) -> Dict[str, Parameter]:
    """将 JavaScript 参数定义转换为 RAG 参数格式"""
    parameters = {}
    
    if not js_params or js_params.get("type") != "object":
        return parameters
    
    properties = js_params.get("properties", {})
    required_fields = js_params.get("required", [])
    
    for param_name, param_def in properties.items():
        param_type = convert_js_type_to_parameter_type(param_def.get("type", "string"))
        description = param_def.get("description", f"{param_name} 参数")
        required = param_name in required_fields
        default = param_def.get("default")
        enum_values = param_def.get("enum")
        
        parameter = Parameter(
            type=param_type,
            description=description,
            required=required,
            default=default
        )
        
        # 处理枚举值
        if enum_values:
            parameter.enum = enum_values
        
        # 处理数组项类型
        if param_type == ParameterType.ARRAY and "items" in param_def:
            items_def = param_def["items"]
            if "enum" in items_def:
                parameter.items = {"enum": items_def["enum"]}
        
        parameters[param_name] = parameter
    
    return parameters


def convert_action_to_function(action_def: Dict[str, Any]) -> AddFunctionRequest:
    """
    将脚本动作定义转换为 RAG 函数
    
    Args:
        action_def: 单个动作定义数据
        
    Returns:
        AddFunctionRequest 对象
    """
    name = action_def.get("name", "unknown_action")
    description = action_def.get("description", "脚本动作")
    # source_file = action_def.get("_source_file", "unknown.js")
    
    category = "script-action"
    subcategory = ""
    
    # 转换参数
    js_parameters = action_def.get("parameters", {})
    parameters = convert_js_parameters_to_rag(js_parameters)
    
    # 生成使用场景
    # use_cases = generate_action_use_cases(name, description)
    use_cases = []
    
    # 生成示例
    examples = generate_action_examples(name, description, parameters)
    
    # 生成标签
    # tags = generate_action_tags(name, description, source_file)
    tags = []
    
    # 生成实现说明
    implementation = generate_action_implementation(action_def)
    
    return AddFunctionRequest(
        name=name,
        description=description,
        category=category,
        subcategory=subcategory,
        parameters=parameters,
        use_cases=use_cases,
        examples=examples,
        tags=tags,
        implementation=implementation
    )


def generate_action_use_cases(name: str, description: str) -> List[str]:
    """生成动作使用场景"""
    use_cases = [
        f"自动化测试中需要执行{name}操作",
        f"Web UI 自动化流程中使用{name}"
    ]
    
    # 基于动作名称添加特定场景
    if "form" in name.lower():
        use_cases.extend([
            "自动填写表单数据",
            "批量表单提交测试"
        ])
    elif "llm" in name.lower() or "chat" in name.lower():
        use_cases.extend([
            "与聊天机器人进行交互测试",
            "验证LLM响应功能"
        ])
    
    return use_cases


def generate_action_examples(name: str, description: str, parameters: Dict[str, Parameter]) -> List[FunctionExample]:
    """生成动作示例"""
    examples = []
    
    # 基础调用示例
    if name == "ask-llm":
        examples.append(FunctionExample(
            input="'向聊天界面发送测试消息'",
            output="'LLM响应: 收到您的测试消息'",
            context="使用ask-llm动作与前端聊天界面进行交互"
        ))
    elif name == "fill-form":
        examples.append(FunctionExample(
            input="{'name': '张三', 'email': 'zhangsan@example.com', 'age': 25}",
            output="'表单填写完成'",
            context="使用fill-form动作自动填写用户信息表单"
        ))
    else:
        examples.append(FunctionExample(
            input=f"'执行{name}动作'",
            output=f"'{name}动作执行完成'",
            context=f"调用{name}进行自动化操作"
        ))
    
    return examples


def generate_action_tags(name: str, description: str, source_file: str) -> List[str]:
    """生成动作标签"""
    tags = ["playwright", "automation", "ui-test"]
    
    # 基于名称添加标签
    if "form" in name.lower():
        tags.extend(["form", "input", "填表"])
    if "llm" in name.lower() or "chat" in name.lower():
        tags.extend(["llm", "chat", "对话"])
    if "fill" in name.lower():
        tags.append("填充")
    if "ask" in name.lower():
        tags.append("询问")
    
    # 基于描述添加标签
    if "用户" in description:
        tags.append("用户交互")
    if "表单" in description:
        tags.append("表单处理")
    if "消息" in description:
        tags.append("消息处理")
    
    return list(set(tags))  # 去重


def generate_action_implementation(action_def: Dict[str, Any]) -> str:
    """生成动作实现说明"""
    implementation = {
        "action_type": "playwright_script",
        "function_name": action_def.get("name"),
        "source_file": action_def.get("_source_file"),
        "parameters_schema": action_def.get("parameters", {}),
        "usage": f"调用 Playwright 脚本执行 {action_def.get('name')} 动作"
    }
    
    return json.dumps(implementation, ensure_ascii=False, indent=2)


async def import_script_actions_to_rag(definitions_dir: Path, script_names: List[str], batch_size: int = 5):
    """
    将 Playwright 脚本动作定义导入到 RAG 系统
    
    Args:
        definitions_dir: 定义文件目录路径
        script_names: 要导入的脚本名称列表
        batch_size: 批处理大小
    """
    print("🚀 Playwright 脚本动作导入 RAG 系统")
    print("=" * 50)
    
    # 1. 加载动作定义
    print("\n1. 加载动作定义...")
    actions_data = load_script_actions(definitions_dir, script_names)
    if not actions_data:
        print("❌ 没有找到可用的动作定义")
        return
    print(f"actions_data: {actions_data}")
    
    # 2. 初始化RAG系统
    print("\n2. 初始化 RAG 系统...")
    config_manager = ConfigManager()
    rag_config = config_manager.get_rag_config()
    
    async with FunctionRAGSystem(rag_config) as rag_system:
        # 3. 批量转换和导入
        print(f"\n3. 开始批量导入 {len(actions_data)} 个脚本动作...")
        
        success_count = 0
        error_count = 0
        
        # 分批处理
        for i in range(0, len(actions_data), batch_size):
            batch = actions_data[i:i + batch_size]
            batch_num = i // batch_size + 1
            total_batches = (len(actions_data) + batch_size - 1) // batch_size
            
            print(f"\n处理批次 {batch_num}/{total_batches} ({len(batch)} 项)...")
            
            for action_def in batch:
                try:
                    # 转换为函数
                    function_request = convert_action_to_function(action_def)
                    
                    # 添加到RAG
                    await rag_system.add_function(function_request)
                    
                    action_name = action_def.get("name", "未命名动作")
                    success_count += 1
                    
                except Exception as e:
                    action_name = action_def.get("name", "未命名动作")
                    print(f"  ❌ {action_name} 导入失败: {e}")
                    error_count += 1
            
            # 批次间短暂延迟
            if i + batch_size < len(actions_data):
                await asyncio.sleep(0.1)
        
        # 4. 导入结果统计
        print(f"\n4. 导入完成统计:")
        print(f"  ✅ 成功: {success_count}")
        print(f"  ❌ 失败: {error_count}")
        print(f"  📊 总计: {len(actions_data)}")
        if len(actions_data) > 0:
            print(f"  📈 成功率: {success_count/len(actions_data)*100:.1f}%")
        
        print("\n✅ Playwright 脚本动作导入完成！")


def main():
    """主函数"""
    # 用户可指定的脚本名称列表
    script_names_to_import = [
        "alarm-search-all",
        # 可以在此添加更多脚本名称
        # "other-script",
    ]
    
    print(f"📋 准备导入的脚本: {', '.join(script_names_to_import)}")
    print("💡 提示: 可以在代码中修改 script_names_to_import 数组来指定要导入的脚本")
    
    # Playwright 脚本定义目录路径
    current_dir = Path(__file__).parent
    project_root = current_dir.parent.parent
    definitions_dir = (project_root / "copilot-chat" / "frontend" / 
                      "playwright-scripts" / "definitions")
    
    if not definitions_dir.exists():
        print(f"❌ 找不到目录: {definitions_dir}")
        print("请确保目录路径正确")
        return
    
    # 执行导入
    try:
        asyncio.run(import_script_actions_to_rag(definitions_dir, script_names_to_import))
    except KeyboardInterrupt:
        print("\n❌ 用户中断导入过程")
    except Exception as e:
        print(f"\n❌ 导入过程出错: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()