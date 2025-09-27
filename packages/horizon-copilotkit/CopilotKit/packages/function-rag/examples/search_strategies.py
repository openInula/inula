#!/usr/bin/env python3
"""
搜索策略示例 - 演示不同的搜索方式和策略。
"""

import asyncio
import sys
from pathlib import Path
from typing import List, Dict, Any

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core import ConfigManager, FunctionRAGSystem
from app.models import AddFunctionRequest, FunctionExample, Parameter, ParameterType, SearchRequest


async def setup_sample_functions(rag_system: FunctionRAGSystem) -> List[str]:
    """设置示例函数用于搜索演示"""
    functions = [
        # 数据处理函数
        AddFunctionRequest(
            name="sort_array",
            description="对数组进行排序，支持升序和降序",
            category="array",
            subcategory="sorting",
            parameters={
                "arr": Parameter(
                    type=ParameterType.ARRAY,
                    description="要排序的数组",
                    required=True
                ),
                "reverse": Parameter(
                    type=ParameterType.BOOLEAN,
                    description="是否降序排序",
                    required=False,
                    default=False
                )
            },
            use_cases=["数据排序", "列表整理", "统计分析预处理"],
            examples=[
                FunctionExample(
                    input="sort_array([3, 1, 4, 1, 5])",
                    output="[1, 1, 3, 4, 5]",
                    context="升序排序"
                )
            ],
            tags=["排序", "数组", "数据处理", "算法"],
            implementation="def sort_array(arr, reverse=False): return sorted(arr, reverse=reverse)"
        ),
        
        # 字符串操作
        AddFunctionRequest(
            name="extract_keywords",
            description="从文本中提取关键词，去除停用词",
            category="text",
            subcategory="analysis",
            parameters={
                "text": Parameter(
                    type=ParameterType.STRING,
                    description="输入文本",
                    required=True
                ),
                "max_keywords": Parameter(
                    type=ParameterType.INTEGER,
                    description="最大关键词数量",
                    required=False,
                    default=10
                )
            },
            use_cases=["内容分析", "SEO优化", "文档摘要", "搜索引擎"],
            examples=[
                FunctionExample(
                    input="extract_keywords('机器学习是人工智能的重要分支')",
                    output="['机器学习', '人工智能', '分支']",
                    context="中文关键词提取"
                )
            ],
            tags=["关键词", "文本分析", "NLP", "提取"],
            implementation="def extract_keywords(text, max_keywords=10): ..."
        ),
        
        # 数学计算
        AddFunctionRequest(
            name="calculate_distance",
            description="计算两个点之间的欧几里得距离",
            category="math",
            subcategory="geometry",
            parameters={
                "point1": Parameter(
                    type=ParameterType.ARRAY,
                    description="第一个点的坐标 [x, y]",
                    required=True
                ),
                "point2": Parameter(
                    type=ParameterType.ARRAY,
                    description="第二个点的坐标 [x, y]",
                    required=True
                )
            },
            use_cases=["几何计算", "地图距离", "数据分析", "机器学习"],
            examples=[
                FunctionExample(
                    input="calculate_distance([0, 0], [3, 4])",
                    output="5.0",
                    context="计算原点到点(3,4)的距离"
                )
            ],
            tags=["距离", "几何", "数学", "坐标"],
            implementation="def calculate_distance(point1, point2): import math; return math.sqrt(sum((a-b)**2 for a,b in zip(point1, point2)))"
        ),
        
        # API 相关
        AddFunctionRequest(
            name="make_http_request",
            description="发送 HTTP 请求并处理响应",
            category="network",
            subcategory="http",
            parameters={
                "url": Parameter(
                    type=ParameterType.STRING,
                    description="请求的URL",
                    required=True
                ),
                "method": Parameter(
                    type=ParameterType.STRING,
                    description="HTTP方法 (GET, POST, PUT, DELETE)",
                    required=False,
                    default="GET"
                ),
                "headers": Parameter(
                    type=ParameterType.OBJECT,
                    description="请求头",
                    required=False
                )
            },
            use_cases=["API调用", "数据获取", "Web爬虫", "集成服务"],
            examples=[
                FunctionExample(
                    input="make_http_request('https://api.example.com/data')",
                    output="{'status': 200, 'data': {...}}",
                    context="获取API数据"
                )
            ],
            tags=["HTTP", "API", "请求", "网络"],
            implementation="def make_http_request(url, method='GET', headers=None): ..."
        ),
        
        # 数据验证
        AddFunctionRequest(
            name="validate_json_schema",
            description="根据 JSON Schema 验证数据结构",
            category="validation",
            subcategory="data",
            parameters={
                "data": Parameter(
                    type=ParameterType.OBJECT,
                    description="要验证的数据",
                    required=True
                ),
                "schema": Parameter(
                    type=ParameterType.OBJECT,
                    description="JSON Schema 定义",
                    required=True
                )
            },
            use_cases=["数据验证", "API输入检查", "配置验证", "质量控制"],
            examples=[
                FunctionExample(
                    input="validate_json_schema({'name': 'John'}, {'type': 'object', 'properties': {'name': {'type': 'string'}}})",
                    output="True",
                    context="验证简单对象"
                )
            ],
            tags=["验证", "JSON", "Schema", "数据质量"],
            implementation="def validate_json_schema(data, schema): import jsonschema; jsonschema.validate(data, schema); return True"
        ),
        
        # 文件操作
        AddFunctionRequest(
            name="parse_csv_data",
            description="解析 CSV 数据并返回结构化对象",
            category="file",
            subcategory="parsing",
            parameters={
                "csv_content": Parameter(
                    type=ParameterType.STRING,
                    description="CSV 文本内容",
                    required=True
                ),
                "delimiter": Parameter(
                    type=ParameterType.STRING,
                    description="分隔符",
                    required=False,
                    default=","
                )
            },
            use_cases=["数据导入", "文件解析", "批量处理", "报表生成"],
            examples=[
                FunctionExample(
                    input="parse_csv_data('name,age\\nAlice,25\\nBob,30')",
                    output="[{'name': 'Alice', 'age': '25'}, {'name': 'Bob', 'age': '30'}]",
                    context="解析简单CSV数据"
                )
            ],
            tags=["CSV", "解析", "文件", "数据"],
            implementation="def parse_csv_data(csv_content, delimiter=','): import csv; ..."
        )
    ]
    
    # 批量添加函数
    added_ids = []
    for func in functions:
        try:
            function_id = await rag_system.add_function(func)
            added_ids.append(function_id)
        except Exception as e:
            print(f"添加函数 {func.name} 失败: {e}")
    
    return added_ids


async def demo_semantic_search(rag_system: FunctionRAGSystem):
    """演示语义搜索"""
    print("\n🧠 语义搜索演示")
    print("-" * 30)
    
    # 语义相关的查询
    semantic_queries = [
        "我需要整理一个数字列表",  # 应该匹配 sort_array
        "计算两个位置之间的直线距离",  # 应该匹配 calculate_distance
        "从网站获取数据",  # 应该匹配 make_http_request
        "分析文章中的重要词汇",  # 应该匹配 extract_keywords
        "检查数据是否符合要求"  # 应该匹配 validate_json_schema
    ]
    
    for query in semantic_queries:
        try:
            search_request = SearchRequest(
                query=query,
                limit=3,
                include_scores=True
            )
            
            results = await rag_system.search_functions(search_request)
            print(f"\n🔍 查询: '{query}'")
            
            if results:
                for i, result in enumerate(results, 1):
                    print(f"  {i}. {result.function.name} (分数: {result.score:.3f})")
                    print(f"     描述: {result.function.description}")
                    print(f"     匹配类型: {result.match_type.value}")
            else:
                print("     没有找到匹配结果")
                
        except Exception as e:
            print(f"     搜索失败: {e}")


async def demo_keyword_search(rag_system: FunctionRAGSystem):
    """演示关键词搜索"""
    print("\n🔑 关键词搜索演示")
    print("-" * 30)
    
    # 精确关键词查询
    keyword_queries = [
        "排序",  # 应该匹配 sort_array
        "HTTP",  # 应该匹配 make_http_request
        "CSV",   # 应该匹配 parse_csv_data
        "距离",   # 应该匹配 calculate_distance
        "验证"    # 应该匹配 validate_json_schema
    ]
    
    for keyword in keyword_queries:
        try:
            search_request = SearchRequest(
                query=keyword,
                limit=3,
                include_scores=True
            )
            
            results = await rag_system.search_functions(search_request)
            print(f"\n🏷️  关键词: '{keyword}'")
            
            if results:
                for i, result in enumerate(results, 1):
                    print(f"  {i}. {result.function.name} (分数: {result.score:.3f})")
                    # 显示匹配的标签
                    matching_tags = [tag for tag in result.function.tags if keyword in tag]
                    if matching_tags:
                        print(f"     匹配标签: {', '.join(matching_tags)}")
            else:
                print("     没有找到匹配结果")
                
        except Exception as e:
            print(f"     搜索失败: {e}")


async def demo_category_search(rag_system: FunctionRAGSystem):
    """演示类别搜索"""
    print("\n📂 类别搜索演示")
    print("-" * 30)
    
    # 按类别搜索
    categories = ["array", "text", "math", "network", "validation", "file"]
    
    for category in categories:
        try:
            results = await rag_system.get_functions_by_category(category, limit=5)
            print(f"\n📁 类别: '{category}' - 找到 {len(results)} 个函数")
            
            for i, result in enumerate(results, 1):
                print(f"  {i}. {result.function.name}")
                print(f"     子类别: {result.function.subcategory}")
                print(f"     描述: {result.function.description}")
                
        except Exception as e:
            print(f"     搜索类别 '{category}' 失败: {e}")


async def demo_advanced_search_filters(rag_system: FunctionRAGSystem):
    """演示高级搜索过滤器"""
    print("\n🔬 高级搜索过滤器演示")
    print("-" * 40)
    
    # 1. 带类别过滤的搜索
    print("\n1. 按类别过滤搜索")
    try:
        search_request = SearchRequest(
            query="数据处理",
            limit=5,
            include_scores=True,
            filters={
                "category": "array"
            }
        )
        
        results = await rag_system.search_functions(search_request)
        print(f"🔍 搜索 '数据处理' (仅限 'array' 类别): {len(results)} 个结果")
        
        for i, result in enumerate(results, 1):
            print(f"  {i}. {result.function.name} - {result.function.category}")
            
    except Exception as e:
        print(f"过滤搜索失败: {e}")
    
    # 2. 带标签过滤的搜索
    print("\n2. 按标签过滤搜索")
    try:
        search_request = SearchRequest(
            query="处理",
            limit=5,
            include_scores=True,
            filters={
                "tags": ["数据处理"]
            }
        )
        
        results = await rag_system.search_functions(search_request)
        print(f"🏷️  搜索 '处理' (包含 '数据处理' 标签): {len(results)} 个结果")
        
        for i, result in enumerate(results, 1):
            print(f"  {i}. {result.function.name}")
            print(f"     标签: {', '.join(result.function.tags)}")
            
    except Exception as e:
        print(f"标签过滤搜索失败: {e}")


async def demo_similarity_search(rag_system: FunctionRAGSystem, sample_ids: List[str]):
    """演示相似性搜索"""
    print("\n🔗 相似性搜索演示")
    print("-" * 30)
    
    if not sample_ids:
        print("没有可用的示例函数ID进行相似性搜索")
        return
    
    # 选择几个函数查找相似的函数
    for i, function_id in enumerate(sample_ids[:3], 1):
        try:
            # 先获取函数信息
            function_result = await rag_system.get_function_by_id(function_id)
            if not function_result:
                continue
                
            function_name = function_result.function.name
            
            # 查找相似函数
            similar_results = await rag_system.get_similar_functions(function_id, limit=3)
            
            print(f"\n{i}. 与 '{function_name}' 相似的函数:")
            
            if similar_results:
                for j, result in enumerate(similar_results, 1):
                    print(f"  {j}. {result.function.name} (相似度: {result.score:.3f})")
                    print(f"     类别: {result.function.category}")
                    print(f"     描述: {result.function.description[:50]}...")
            else:
                print("     没有找到相似的函数")
                
        except Exception as e:
            print(f"     相似性搜索失败: {e}")


async def demo_search_performance(rag_system: FunctionRAGSystem):
    """演示搜索性能对比"""
    print("\n⚡ 搜索性能对比")
    print("-" * 30)
    
    import time
    
    test_queries = [
        "数据排序",
        "文本分析", 
        "网络请求",
        "数据验证",
        "文件解析"
    ]
    
    # 测试不同搜索参数的性能
    search_configs = [
        {"limit": 5, "name": "标准搜索 (limit=5)"},
        {"limit": 10, "name": "扩展搜索 (limit=10)"},
        {"limit": 5, "include_scores": True, "name": "包含分数"},
        {"limit": 5, "include_scores": True, "filters": {"category": "text"}, "name": "分类过滤"}
    ]
    
    for config in search_configs:
        print(f"\n📊 {config.pop('name')}")
        times = []
        
        for query in test_queries:
            try:
                start_time = time.time()
                
                search_request = SearchRequest(query=query, **config)
                results = await rag_system.search_functions(search_request)
                
                end_time = time.time()
                elapsed = (end_time - start_time) * 1000  # 转换为毫秒
                times.append(elapsed)
                
            except Exception as e:
                print(f"   查询 '{query}' 失败: {e}")
        
        if times:
            avg_time = sum(times) / len(times)
            min_time = min(times)
            max_time = max(times)
            
            print(f"   平均响应时间: {avg_time:.1f}ms")
            print(f"   最快: {min_time:.1f}ms | 最慢: {max_time:.1f}ms")
        
        # 恢复 name 字段以便下次循环使用
        config["name"] = search_configs[search_configs.index(config)]["name"] if "name" in search_configs[search_configs.index(config)] else ""


async def demo_search_result_analysis(rag_system: FunctionRAGSystem):
    """演示搜索结果分析"""
    print("\n🔍 搜索结果分析")
    print("-" * 30)
    
    # 分析查询
    analysis_query = "数据处理和分析"
    
    try:
        search_request = SearchRequest(
            query=analysis_query,
            limit=10,
            include_scores=True
        )
        
        results = await rag_system.search_functions(search_request)
        
        print(f"📊 查询 '{analysis_query}' 的结果分析:")
        print(f"   总结果数: {len(results)}")
        
        if not results:
            print("   没有搜索结果")
            return
        
        # 分数分布分析
        scores = [r.score for r in results]
        avg_score = sum(scores) / len(scores)
        max_score = max(scores)
        min_score = min(scores)
        
        print(f"   分数分布:")
        print(f"     平均分数: {avg_score:.3f}")
        print(f"     最高分数: {max_score:.3f}")
        print(f"     最低分数: {min_score:.3f}")
        
        # 按分数段分组
        high_score = [r for r in results if r.score >= 0.8]
        medium_score = [r for r in results if 0.5 <= r.score < 0.8]
        low_score = [r for r in results if r.score < 0.5]
        
        print(f"   分数段分布:")
        print(f"     高相关性 (≥0.8): {len(high_score)} 个")
        print(f"     中等相关性 (0.5-0.8): {len(medium_score)} 个")
        print(f"     低相关性 (<0.5): {len(low_score)} 个")
        
        # 类别分布
        categories = {}
        for result in results:
            cat = result.function.category
            categories[cat] = categories.get(cat, 0) + 1
        
        print(f"   类别分布:")
        for category, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
            print(f"     {category}: {count} 个")
        
        # 匹配类型分析
        match_types = {}
        for result in results:
            match_type = result.match_type.value
            match_types[match_type] = match_types.get(match_type, 0) + 1
        
        print(f"   匹配类型分布:")
        for match_type, count in sorted(match_types.items(), key=lambda x: x[1], reverse=True):
            print(f"     {match_type}: {count} 个")
        
        # 详细展示前几个结果
        print(f"\n   前3个最佳匹配:")
        for i, result in enumerate(results[:3], 1):
            print(f"   {i}. {result.function.name}")
            print(f"      分数: {result.score:.3f} | 类型: {result.match_type.value}")
            print(f"      描述: {result.function.description}")
            if result.explanation:
                print(f"      解释: {result.explanation}")
            
    except Exception as e:
        print(f"搜索结果分析失败: {e}")


async def main():
    """主函数"""
    print("🚀 Function RAG 搜索策略演示")
    print("=" * 50)
    
    # 1. 初始化系统
    print("\n1. 初始化 RAG 系统...")
    config_manager = ConfigManager()
    rag_config = config_manager.get_rag_config()
    
    if not config_manager.validate_config():
        print("❌ 配置验证失败！请检查 .env 文件")
        return
    
    async with FunctionRAGSystem(rag_config) as rag_system:
        # 2. 清理之前的数据
        print("\n2. 清理之前的数据...")
        await rag_system.clear_all_functions()
        print("✅ 清理完成")
        
        # 3. 设置示例数据
        print("\n3. 设置示例函数...")
        sample_ids = await setup_sample_functions(rag_system)
        print(f"✅ 添加了 {len(sample_ids)} 个示例函数")
        
        # 4. 运行各种搜索演示
        await demo_semantic_search(rag_system)
        await demo_keyword_search(rag_system)
        await demo_category_search(rag_system)
        await demo_advanced_search_filters(rag_system)
        await demo_similarity_search(rag_system, sample_ids)
        await demo_search_performance(rag_system)
        await demo_search_result_analysis(rag_system)
        
        # 4. 清理数据（可选）
        print(f"\n🧹 清理演示数据...")
        cleanup = input("是否删除演示函数？(y/N): ").strip().lower()
        
        if cleanup == 'y':
            for function_id in sample_ids:
                try:
                    await rag_system.delete_function(function_id)
                except Exception as e:
                    print(f"删除 {function_id} 失败: {e}")
            print("✅ 清理完成")
        
        print("\n✅ 搜索策略演示完成！")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n❌ 用户中断")
    except Exception as e:
        print(f"\n❌ 运行错误: {e}")
        import traceback
        traceback.print_exc()