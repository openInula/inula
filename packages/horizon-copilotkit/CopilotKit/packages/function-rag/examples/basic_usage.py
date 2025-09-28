#!/usr/bin/env python3
"""
基础使用示例 - 演示如何使用 Function RAG System 的基本功能。
"""

import asyncio
import os
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core import ConfigManager, FunctionRAGSystem
from app.models import AddFunctionRequest, FunctionExample, Parameter, ParameterType


async def main():
    """主要示例函数。"""
    print("🚀 Function RAG System 基础使用示例")
    print("=" * 50)
    
    # 1. 初始化系统
    print("\n1. 初始化 RAG 系统...")
    config_manager = ConfigManager()
    rag_config = config_manager.get_rag_config()
    
    # 检查配置
    if not config_manager.validate_config():
        print("❌ 配置验证失败！请检查 .env 文件")
        return
    
    async with FunctionRAGSystem(rag_config) as rag_system:
        # 2. 清理之前的数据
        print("\n2. 清理之前的数据...")
        await rag_system.clear_all_functions()
        print("✅ 清理完成")
        
        # 3. 添加示例函数
        print("\n3. 添加示例函数...")
        
        # 数学函数示例
        math_function = AddFunctionRequest(
            name="calculate_sum",
            description="计算两个数字的和",
            category="math",
            subcategory="arithmetic",
            parameters={
                "a": Parameter(
                    type=ParameterType.NUMBER,
                    description="第一个数字",
                    required=True
                ),
                "b": Parameter(
                    type=ParameterType.NUMBER,
                    description="第二个数字",
                    required=True
                )
            },
            use_cases=[
                "计算两个整数的和",
                "计算浮点数相加",
                "基础数学运算"
            ],
            examples=[
                FunctionExample(
                    input="calculate_sum(2, 3)",
                    output="5",
                    context="计算两个正整数"
                ),
                FunctionExample(
                    input="calculate_sum(-1, 5)",
                    output="4",
                    context="计算负数和正数"
                )
            ],
            tags=["数学", "算术", "计算器", "加法"],
            implementation="def calculate_sum(a, b): return a + b"
        )
        
        function_id_1 = await rag_system.add_function(math_function)
        print(f"✅ 添加数学函数成功，ID: {function_id_1}")
        
        # 文本处理函数示例
        text_function = AddFunctionRequest(
            name="reverse_string",
            description="反转字符串",
            category="text",
            subcategory="manipulation",
            parameters={
                "text": Parameter(
                    type=ParameterType.STRING,
                    description="要反转的字符串",
                    required=True
                )
            },
            use_cases=[
                "反转用户输入的文本",
                "字符串回文检测预处理",
                "文本处理工具"
            ],
            examples=[
                FunctionExample(
                    input="reverse_string('hello')",
                    output="'olleh'",
                    context="反转简单英文单词"
                ),
                FunctionExample(
                    input="reverse_string('你好世界')",
                    output="'界世好你'",
                    context="反转中文字符串"
                )
            ],
            tags=["文本", "字符串", "反转", "处理"],
            implementation="def reverse_string(text): return text[::-1]"
        )
        
        function_id_2 = await rag_system.add_function(text_function)
        print(f"✅ 添加文本函数成功，ID: {function_id_2}")
        
        # 数组处理函数示例
        array_function = AddFunctionRequest(
            name="find_max",
            description="找到数组中的最大值",
            category="array",
            subcategory="analysis",
            parameters={
                "numbers": Parameter(
                    type=ParameterType.ARRAY,
                    description="数字数组",
                    required=True,
                    items={"type": "number"}
                )
            },
            use_cases=[
                "找到列表中的最大数值",
                "数据分析中的最值查找",
                "统计计算"
            ],
            examples=[
                FunctionExample(
                    input="find_max([1, 5, 3, 9, 2])",
                    output="9",
                    context="找到正整数数组的最大值"
                ),
                FunctionExample(
                    input="find_max([-1, -5, -3])",
                    output="-1",
                    context="找到负数数组的最大值"
                )
            ],
            tags=["数组", "最大值", "分析", "统计"],
            implementation="def find_max(numbers): return max(numbers)"
        )
        
        function_id_3 = await rag_system.add_function(array_function)
        print(f"✅ 添加数组函数成功，ID: {function_id_3}")
        
        # 4. 搜索函数
        print("\n4. 搜索函数...")
        
        # 搜索数学相关函数
        print("\n🔍 搜索：'计算两个数字'")
        from app.models import SearchRequest
        
        search_request = SearchRequest(
            query="计算两个数字",
            limit=5,
            include_scores=True
        )
        
        results = await rag_system.search_functions(search_request)
        
        if results:
            for i, result in enumerate(results, 1):
                print(f"  {i}. {result.function.name}")
                print(f"     描述: {result.function.description}")
                print(f"     匹配分数: {result.score:.3f}")
                print(f"     匹配类型: {result.match_type.value}")
                if result.explanation:
                    print(f"     解释: {result.explanation}")
                print()
        
        # 搜索文本处理函数
        print("🔍 搜索：'反转文本'")
        search_request.query = "反转文本"
        results = await rag_system.search_functions(search_request)
        
        if results:
            for i, result in enumerate(results, 1):
                print(f"  {i}. {result.function.name}")
                print(f"     描述: {result.function.description}")
                print(f"     匹配分数: {result.score:.3f}")
        
        # 5. 按类别搜索
        print("\n5. 按类别搜索...")
        
        print("🔍 搜索类别：'math'")
        math_functions = await rag_system.get_functions_by_category("math", limit=10)
        
        if math_functions:
            for i, result in enumerate(math_functions, 1):
                print(f"  {i}. {result.function.name} - {result.function.description}")
        
        # 6. 查找相似函数
        print("\n6. 查找相似函数...")
        
        print(f"🔍 查找与 '{function_id_1}' 相似的函数")
        similar_functions = await rag_system.get_similar_functions(function_id_1, limit=3)
        
        if similar_functions:
            for i, result in enumerate(similar_functions, 1):
                print(f"  {i}. {result.function.name}")
                print(f"     相似度: {result.score:.3f}")
                print(f"     描述: {result.function.description}")
        
        # 7. 获取特定函数
        print("\n7. 获取特定函数...")
        
        print(f"🔍 获取函数 ID: {function_id_2}")
        function_result = await rag_system.get_function_by_id(function_id_2)
        
        if function_result:
            func = function_result.function
            print(f"  名称: {func.name}")
            print(f"  描述: {func.description}")
            print(f"  类别: {func.category}")
            print(f"  标签: {', '.join(func.tags)}")
            print(f"  示例数量: {len(func.examples)}")
        
        # 8. 系统统计
        print("\n8. 系统统计...")
        
        stats = await rag_system.get_system_stats()
        print(f"  总函数数: {stats.get('total_functions', 0)}")
        print(f"  嵌入缓存大小: {stats.get('embedding_cache_size', 0)}")
        
        # 9. 健康检查
        print("\n9. 系统健康检查...")
        
        health = await rag_system.health_check()
        print(f"  系统状态: {health.get('status', 'unknown')}")
        
        if health.get('details'):
            details = health['details']
            if 'embedding_service' in details:
                emb_status = details['embedding_service']
                print(f"  嵌入服务: {emb_status.get('status', 'unknown')}")
                if 'provider' in emb_status:
                    print(f"  提供商: {emb_status['provider']}")
                    print(f"  模型: {emb_status.get('model', 'unknown')}")
            
            if 'vector_storage' in details:
                vec_status = details['vector_storage']
                print(f"  向量存储: {vec_status.get('status', 'unknown')}")
        
        print("\n✅ 示例运行完成！")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n❌ 用户中断")
    except Exception as e:
        print(f"\n❌ 运行错误: {e}")
        import traceback
        traceback.print_exc()