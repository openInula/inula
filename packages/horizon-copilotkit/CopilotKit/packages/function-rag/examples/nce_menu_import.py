#!/usr/bin/env python3
"""
NCE 菜单分析导入示例 - 将 NCE-menu-analysis.json 中的菜单功能转换为 RAG 函数并入库。
"""

import asyncio
import json
import sys
from pathlib import Path
from typing import Dict, Any, List

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core import ConfigManager, FunctionRAGSystem
from app.models import AddFunctionRequest, FunctionExample, Parameter, ParameterType


def load_nce_menu_data(json_file_path: str) -> List[Dict[str, Any]]:
    """
    从 JSON 文件加载 NCE 菜单数据
    
    Args:
        json_file_path: JSON 文件路径
        
    Returns:
        菜单数据列表
    """
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"✅ 成功加载 {len(data)} 个菜单项")
        return data
    except Exception as e:
        print(f"❌ 加载 JSON 文件失败: {e}")
        return []


def convert_menu_to_function(menu_item: Dict[str, Any]) -> AddFunctionRequest:
    """
    将菜单项转换为 RAG 函数
    
    Args:
        menu_item: 单个菜单项数据
        
    Returns:
        AddFunctionRequest 对象
    """
    menu_id = menu_item.get("id", "unknown")
    name = menu_item.get("name", "未命名功能")
    primary_function = menu_item.get("primaryFunction", "")
    emit_actions = menu_item.get("emit", [])
    
    category = "menu"
    subcategory = ""
    
    # 构建参数（基于emit动作）
    # parameters = build_parameters_from_emit(emit_actions)
    parameters = {}
    
    # 生成使用场景
    # use_cases = generate_use_cases(name, primary_function)
    use_cases = []
    
    # 生成示例
    examples = generate_examples(menu_id, name, emit_actions)
    
    # 生成标签
    # tags = generate_tags(name, primary_function, category)
    tags = []
    
    # 生成实现说明
    implementation = generate_implementation(menu_id, emit_actions)
    
    return AddFunctionRequest(
        name=f"{menu_id.lower()}",
        description=f"菜单名称：{name}，功能描述：{primary_function}" if primary_function else name,
        category=category,
        subcategory=subcategory,
        parameters=parameters,
        use_cases=use_cases,
        examples=examples,
        tags=tags,
        implementation=implementation
    )

def build_parameters_from_emit(emit_actions: List[str]) -> Dict[str, Parameter]:
    """基于emit动作构建参数"""
    parameters = {}
    
    # 基础参数 - 每个NCE功能都有的
    parameters["session_id"] = Parameter(
        type=ParameterType.STRING,
        description="用户会话ID",
        required=False,
        default="current_session"
    )
    
    # 根据emit动作类型添加特定参数
    if len(emit_actions) >= 2:
        action_type = emit_actions[0] if emit_actions[0] else "unknown"
        action_params = emit_actions[1] if len(emit_actions) > 1 else ""
        
        if "jumpSPAPage" in action_type:
            parameters["target_url"] = Parameter(
                type=ParameterType.STRING,
                description="目标页面URL或动作参数",
                required=False,
                default=action_params
            )
            
        if "Href" in action_params:
            parameters["open_type"] = Parameter(
                type=ParameterType.STRING,
                description="页面打开方式",
                required=False,
                default="current"
            )
            
        if "Action" in action_params:
            parameters["action_params"] = Parameter(
                type=ParameterType.OBJECT,
                description="动作执行参数",
                required=False
            )
    
    return parameters


def generate_use_cases(name: str, primary_function: str) -> List[str]:
    """生成使用场景"""
    use_cases = []
    
    # 基于主要功能生成使用场景
    if primary_function:
        use_cases.append(f"执行{name}相关操作")
        
        # 根据关键词生成更具体的使用场景
        if "管理" in primary_function:
            use_cases.append(f"系统管理员使用{name}进行日常维护")
            
        if "配置" in primary_function:
            use_cases.append(f"网络工程师使用{name}进行系统配置")
            
        if "监控" in primary_function:
            use_cases.append(f"运维人员使用{name}进行系统监控")
            
        if "安全" in primary_function:
            use_cases.append(f"安全管理员使用{name}进行安全策略配置")
    else:
        use_cases.append(f"访问{name}功能模块")
        use_cases.append(f"在NCE系统中使用{name}")
    
    return use_cases


def generate_examples(menu_id: str, name: str, emit_actions: List[str]) -> List[FunctionExample]:
    """生成功能示例"""
    examples = []
    
    # 基础调用示例
    examples.append(FunctionExample(
        input=f"'打开{name}功能'",
        output=f"'成功打开{name}功能'",
        context=f"调用openMenu函数打开{name}功能模块"
    ))
    
    return examples


def generate_tags(name: str, primary_function: str, category: str) -> List[str]:
    """生成标签"""
    tags = ["NCE", "网管系统"]
    
    # 添加基于名称的标签
    name_keywords = ["网络", "管理", "配置", "监控", "安全", "用户", "策略", "日志", "审计"]
    for keyword in name_keywords:
        if keyword in name:
            tags.append(keyword)
    
    # 添加基于功能描述的标签
    if primary_function:
        func_keywords = ["IP", "RADIUS", "Syslog", "防盗", "锁定", "认证", "授权"]
        for keyword in func_keywords:
            if keyword in primary_function:
                tags.append(keyword)
    
    # 添加类别标签
    tags.append(category)
    
    return list(set(tags))  # 去重


def generate_implementation(menu_id: str, emit_actions: List[str]) -> str:
    """生成实现说明"""
    return json.dumps({"function": "openMenu", "arguments": emit_actions}, ensure_ascii=False)


async def import_nce_menus_to_rag(json_file_path: str, batch_size: int = 10):
    """
    将 NCE 菜单数据导入到 RAG 系统
    
    Args:
        json_file_path: JSON 文件路径
        batch_size: 批处理大小
    """
    print("🚀 NCE 菜单功能导入 RAG 系统")
    print("=" * 50)
    
    # 1. 加载菜单数据
    print("\n1. 加载菜单数据...")
    menu_data = load_nce_menu_data(json_file_path)
    if not menu_data:
        return
    
    # 2. 初始化RAG系统
    print("\n2. 初始化 RAG 系统...")
    config_manager = ConfigManager()
    rag_config = config_manager.get_rag_config()
    
    if not config_manager.validate_config():
        print("❌ 配置验证失败！请检查 .env 文件")
        return
    
    async with FunctionRAGSystem(rag_config) as rag_system:
        # 3. 批量转换和导入
        print(f"\n3. 开始批量导入 {len(menu_data)} 个菜单功能...")
        
        success_count = 0
        error_count = 0
        
        # 分批处理
        for i in range(0, len(menu_data), batch_size):
            batch = menu_data[i:i + batch_size]
            batch_num = i // batch_size + 1
            total_batches = (len(menu_data) + batch_size - 1) // batch_size
            
            print(f"\n处理批次 {batch_num}/{total_batches} ({len(batch)} 项)...")
            
            for menu_item in batch:
                try:
                    # 转换为函数
                    function_request = convert_menu_to_function(menu_item)
                    
                    # 添加到RAG
                    function_id = await rag_system.add_function(function_request)
                    
                    menu_name = menu_item.get("name", "未命名")
                    print(f"  ✅ {menu_name} -> {function_id}")
                    success_count += 1
                    
                except Exception as e:
                    menu_name = menu_item.get("name", "未命名")
                    print(f"  ❌ {menu_name} 导入失败: {e}")
                    error_count += 1
            
            # 批次间短暂延迟
            if i + batch_size < len(menu_data):
                await asyncio.sleep(0.1)
        
        # 4. 导入结果统计
        print(f"\n4. 导入完成统计:")
        print(f"  ✅ 成功: {success_count}")
        print(f"  ❌ 失败: {error_count}")
        print(f"  📊 总计: {len(menu_data)}")
        print(f"  📈 成功率: {success_count/len(menu_data)*100:.1f}%")
        
        # 5. 验证导入结果
        print("\n5. 验证导入结果...")
        stats = await rag_system.get_system_stats()
        total_functions = stats.get('total_functions', 0)
        print(f"  当前RAG系统中共有 {total_functions} 个函数")
        
        # 6. 示例搜索测试
        print("\n6. 示例搜索测试...")
        from app.models import SearchRequest
        
        test_queries = [
            "网络管理",
            "用户管理",
            "安全配置",
            "监控日志"
        ]
        
        for query in test_queries:
            print(f"\n🔍 搜索: '{query}'")
            search_request = SearchRequest(query=query, limit=3, include_scores=True)
            results = await rag_system.search_functions(search_request)
            
            if results:
                for i, result in enumerate(results, 1):
                    print(f"  {i}. {result.function.name}")
                    print(f"     描述: {result.function.description[:100]}...")
                    print(f"     评分: {result.score:.3f}")
            else:
                print("     没有找到匹配的函数")
        
        print("\n✅ NCE 菜单功能导入完成！")


def main():
    """主函数"""
    # NCE 菜单分析 JSON 文件路径
    current_dir = Path(__file__).parent
    project_root = current_dir.parent.parent
    json_file_path = project_root / "menu-analysis" / "examples" / "results" / "NCE-analysis.json"
    
    if not json_file_path.exists():
        print(f"❌ 找不到文件: {json_file_path}")
        print("请确保文件路径正确")
        return
    
    # 执行导入
    try:
        asyncio.run(import_nce_menus_to_rag(str(json_file_path)))
    except KeyboardInterrupt:
        print("\n❌ 用户中断导入过程")
    except Exception as e:
        print(f"\n❌ 导入过程出错: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()