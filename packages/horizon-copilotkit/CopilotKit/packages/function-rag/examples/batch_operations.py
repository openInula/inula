#!/usr/bin/env python3
"""
批量操作示例 - 演示如何批量添加和管理函数。
"""

import asyncio
import sys
from pathlib import Path
from typing import List, Dict, Any

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core import ConfigManager, FunctionRAGSystem
from app.models import AddFunctionRequest, FunctionExample, Parameter, ParameterType


def create_math_functions() -> List[AddFunctionRequest]:
    """创建数学函数集合"""
    functions = []
    
    # 基础算术函数
    functions.append(AddFunctionRequest(
        name="add_numbers",
        description="计算多个数字的和",
        category="math",
        subcategory="arithmetic", 
        parameters={
            "numbers": Parameter(
                type=ParameterType.ARRAY,
                description="要相加的数字数组",
                required=True,
                items={"type": "number"}
            )
        },
        use_cases=["批量数字求和", "数据聚合", "统计计算"],
        examples=[
            FunctionExample(
                input="add_numbers([1, 2, 3, 4, 5])",
                output="15",
                context="计算一组正整数的和"
            )
        ],
        tags=["数学", "求和", "数组", "聚合"],
        implementation="def add_numbers(numbers): return sum(numbers)"
    ))
    
    functions.append(AddFunctionRequest(
        name="multiply_numbers", 
        description="计算多个数字的乘积",
        category="math",
        subcategory="arithmetic",
        parameters={
            "numbers": Parameter(
                type=ParameterType.ARRAY,
                description="要相乘的数字数组", 
                required=True,
                items={"type": "number"}
            )
        },
        use_cases=["批量数字相乘", "几何计算", "概率计算"],
        examples=[
            FunctionExample(
                input="multiply_numbers([2, 3, 4])",
                output="24",
                context="计算多个数字的乘积"
            )
        ],
        tags=["数学", "乘积", "数组", "几何"],
        implementation="def multiply_numbers(numbers): import math; return math.prod(numbers)"
    ))
    
    functions.append(AddFunctionRequest(
        name="calculate_average",
        description="计算数组的平均值",
        category="math", 
        subcategory="statistics",
        parameters={
            "values": Parameter(
                type=ParameterType.ARRAY,
                description="数值数组",
                required=True,
                items={"type": "number"}
            )
        },
        use_cases=["数据分析", "统计计算", "性能评估"],
        examples=[
            FunctionExample(
                input="calculate_average([10, 20, 30, 40])",
                output="25.0",
                context="计算简单数组的平均值"
            )
        ],
        tags=["数学", "平均值", "统计", "分析"],
        implementation="def calculate_average(values): return sum(values) / len(values)"
    ))
    
    return functions


def create_text_functions() -> List[AddFunctionRequest]:
    """创建文本处理函数集合"""
    functions = []
    
    functions.append(AddFunctionRequest(
        name="capitalize_words",
        description="将字符串中每个单词的首字母大写",
        category="text",
        subcategory="formatting",
        parameters={
            "text": Parameter(
                type=ParameterType.STRING,
                description="输入文本",
                required=True
            )
        },
        use_cases=["标题格式化", "用户输入清理", "文档处理"],
        examples=[
            FunctionExample(
                input="capitalize_words('hello world python')",
                output="'Hello World Python'",
                context="格式化英文文本"
            )
        ],
        tags=["文本", "格式化", "首字母", "标题"],
        implementation="def capitalize_words(text): return text.title()"
    ))
    
    functions.append(AddFunctionRequest(
        name="remove_whitespace",
        description="移除字符串开头和结尾的空白字符",
        category="text",
        subcategory="cleaning",
        parameters={
            "text": Parameter(
                type=ParameterType.STRING,
                description="需要清理的文本",
                required=True
            ),
            "remove_all": Parameter(
                type=ParameterType.BOOLEAN,
                description="是否移除所有空白字符",
                required=False,
                default=False
            )
        },
        use_cases=["数据清洗", "用户输入验证", "文本预处理"],
        examples=[
            FunctionExample(
                input="remove_whitespace('  hello world  ')",
                output="'hello world'",
                context="移除首尾空白"
            ),
            FunctionExample(
                input="remove_whitespace('  hello world  ', True)",
                output="'helloworld'",
                context="移除所有空白"
            )
        ],
        tags=["文本", "清理", "空白", "预处理"],
        implementation="def remove_whitespace(text, remove_all=False): return text.replace(' ', '') if remove_all else text.strip()"
    ))
    
    functions.append(AddFunctionRequest(
        name="count_characters",
        description="计算文本中不同类型字符的数量",
        category="text",
        subcategory="analysis",
        parameters={
            "text": Parameter(
                type=ParameterType.STRING,
                description="要分析的文本",
                required=True
            )
        },
        use_cases=["文本分析", "内容统计", "数据验证"],
        examples=[
            FunctionExample(
                input="count_characters('Hello World! 123')",
                output="{'total': 15, 'letters': 10, 'digits': 3, 'spaces': 1, 'special': 1}",
                context="分析混合文本"
            )
        ],
        tags=["文本", "分析", "统计", "字符"],
        implementation="def count_characters(text): ..."
    ))
    
    return functions


def create_utility_functions() -> List[AddFunctionRequest]:
    """创建工具函数集合"""
    functions = []
    
    functions.append(AddFunctionRequest(
        name="validate_email",
        description="验证电子邮件地址格式是否有效",
        category="validation",
        subcategory="format",
        parameters={
            "email": Parameter(
                type=ParameterType.STRING,
                description="要验证的邮件地址",
                required=True
            )
        },
        use_cases=["用户注册验证", "数据质量检查", "表单验证"],
        examples=[
            FunctionExample(
                input="validate_email('user@example.com')",
                output="True",
                context="验证有效邮箱"
            ),
            FunctionExample(
                input="validate_email('invalid-email')",
                output="False", 
                context="检测无效邮箱"
            )
        ],
        tags=["验证", "邮箱", "格式", "表单"],
        implementation="def validate_email(email): import re; return bool(re.match(r'^[^@]+@[^@]+\\.[^@]+$', email))"
    ))
    
    functions.append(AddFunctionRequest(
        name="generate_uuid",
        description="生成唯一的 UUID 标识符",
        category="utility",
        subcategory="generation",
        parameters={
            "version": Parameter(
                type=ParameterType.INTEGER,
                description="UUID 版本 (1-5)",
                required=False,
                default=4
            )
        },
        use_cases=["唯一ID生成", "数据库主键", "会话标识"],
        examples=[
            FunctionExample(
                input="generate_uuid()",
                output="'f47ac10b-58cc-4372-a567-0e02b2c3d479'",
                context="生成随机 UUID4"
            )
        ],
        tags=["UUID", "标识符", "生成", "唯一"],
        implementation="def generate_uuid(version=4): import uuid; return str(getattr(uuid, f'uuid{version}')())"
    ))
    
    functions.append(AddFunctionRequest(
        name="format_timestamp",
        description="格式化时间戳为可读的日期时间字符串",
        category="utility", 
        subcategory="datetime",
        parameters={
            "timestamp": Parameter(
                type=ParameterType.NUMBER,
                description="Unix 时间戳",
                required=True
            ),
            "format": Parameter(
                type=ParameterType.STRING,
                description="日期格式字符串",
                required=False,
                default="%Y-%m-%d %H:%M:%S"
            )
        },
        use_cases=["日志格式化", "数据展示", "报告生成"],
        examples=[
            FunctionExample(
                input="format_timestamp(1609459200)",
                output="'2021-01-01 00:00:00'",
                context="格式化新年时间戳"
            )
        ],
        tags=["时间", "格式化", "日期", "时间戳"],
        implementation="def format_timestamp(timestamp, format='%Y-%m-%d %H:%M:%S'): from datetime import datetime; return datetime.fromtimestamp(timestamp).strftime(format)"
    ))
    
    return functions


async def demo_batch_operations():
    """演示批量操作"""
    print("🚀 Function RAG 批量操作示例")
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
        
        # 3. 准备批量函数数据
        print("\n3. 准备函数数据...")
        
        all_functions = []
        all_functions.extend(create_math_functions())
        all_functions.extend(create_text_functions())
        all_functions.extend(create_utility_functions())
        
        print(f"   准备了 {len(all_functions)} 个函数")
        print(f"   数学函数: {len(create_math_functions())} 个")
        print(f"   文本函数: {len(create_text_functions())} 个") 
        print(f"   工具函数: {len(create_utility_functions())} 个")
        
        # 3. 批量添加函数
        print("\n3. 批量添加函数...")
        
        added_ids = []
        failed_functions = []
        
        for i, function in enumerate(all_functions, 1):
            try:
                function_id = await rag_system.add_function(function)
                added_ids.append(function_id)
                print(f"   ✅ {i:2d}/10 - {function.name} (ID: {function_id})")
            except Exception as e:
                failed_functions.append((function.name, str(e)))
                print(f"   ❌ {i:2d}/10 - {function.name} 失败: {e}")
        
        print(f"\n📊 批量添加结果:")
        print(f"   成功: {len(added_ids)} 个")
        print(f"   失败: {len(failed_functions)} 个")
        
        if failed_functions:
            print(f"   失败的函数:")
            for name, error in failed_functions:
                print(f"     - {name}: {error}")
        
        # 4. 批量搜索验证
        print("\n4. 批量搜索验证...")
        
        search_queries = [
            "数学计算",
            "文本处理", 
            "格式化",
            "验证邮箱",
            "生成ID"
        ]
        
        for query in search_queries:
            try:
                from app.models import SearchRequest
                search_request = SearchRequest(query=query, limit=3)
                results = await rag_system.search_functions(search_request)
                
                print(f"\n🔍 搜索 '{query}': 找到 {len(results)} 个结果")
                for j, result in enumerate(results[:2], 1):
                    print(f"   {j}. {result.function.name} (分数: {result.score:.3f})")
                    
            except Exception as e:
                print(f"❌ 搜索 '{query}' 失败: {e}")
        
        # 5. 按类别统计
        print("\n5. 按类别统计...")
        
        categories = ["math", "text", "validation", "utility"]
        category_stats = {}
        
        for category in categories:
            try:
                results = await rag_system.get_functions_by_category(category, limit=100)
                category_stats[category] = len(results)
                print(f"   📂 {category}: {len(results)} 个函数")
                
                if results:
                    # 显示该类别的前几个函数
                    print(f"      示例:")
                    for result in results[:3]:
                        print(f"        - {result.function.name}")
                        
            except Exception as e:
                print(f"❌ 获取类别 '{category}' 失败: {e}")
                category_stats[category] = 0
        
        # 6. 相似性分析
        print("\n6. 相似性分析...")
        
        if added_ids:
            sample_id = added_ids[0]  # 取第一个添加的函数
            try:
                similar = await rag_system.get_similar_functions(sample_id, limit=5)
                print(f"🔗 与函数 {sample_id} 相似的函数:")
                
                for i, result in enumerate(similar, 1):
                    print(f"   {i}. {result.function.name}")
                    print(f"      相似度: {result.score:.3f}")
                    print(f"      类别: {result.function.category}")
                    
            except Exception as e:
                print(f"❌ 相似性分析失败: {e}")
        
        # 7. 系统统计总览
        print("\n7. 系统统计总览...")
        
        try:
            stats = await rag_system.get_system_stats()
            print(f"📊 最终统计:")
            print(f"   总函数数: {stats.get('total_functions', 0)}")
            print(f"   嵌入缓存: {stats.get('embedding_cache_size', 0)}")
            print(f"   各类别分布:")
            
            total_by_category = sum(category_stats.values())
            for category, count in category_stats.items():
                percentage = (count / total_by_category * 100) if total_by_category > 0 else 0
                print(f"     {category}: {count} ({percentage:.1f}%)")
                
        except Exception as e:
            print(f"❌ 获取系统统计失败: {e}")
        
        # 8. 可选：清理演示数据
        print(f"\n8. 清理演示数据...")
        cleanup_choice = input("是否删除演示添加的函数？(y/N): ").strip().lower()
        
        if cleanup_choice == 'y':
            deleted_count = 0
            for function_id in added_ids:
                try:
                    await rag_system.delete_function(function_id)
                    deleted_count += 1
                    print(f"   🗑️  删除函数: {function_id}")
                except Exception as e:
                    print(f"   ❌ 删除函数 {function_id} 失败: {e}")
            
            print(f"✅ 删除了 {deleted_count} 个演示函数")
        else:
            print("🚫 保留演示函数，可手动删除")
        
        print("\n✅ 批量操作示例完成！")


async def demo_batch_error_handling():
    """演示批量操作的错误处理"""
    print("\n🛡️ 批量操作错误处理演示")
    print("-" * 40)
    
    config_manager = ConfigManager()
    rag_config = config_manager.get_rag_config()
    
    async with FunctionRAGSystem(rag_config) as rag_system:
        # 清理之前的数据
        await rag_system.clear_all_functions()
        
        # 创建一些有问题的函数定义
        problematic_functions = [
            AddFunctionRequest(
                name="",  # 空名称
                description="有问题的函数1",
                category="test",
                parameters={}
            ),
            AddFunctionRequest(
                name="valid_function",
                description="正常函数",
                category="test",
                parameters={}
            ),
            AddFunctionRequest(
                name="duplicate_function", 
                description="可能重复的函数",
                category="test",
                parameters={}
            )
        ]
        
        print("尝试批量添加有问题的函数...")
        
        success_count = 0
        error_count = 0
        
        for i, func in enumerate(problematic_functions, 1):
            try:
                function_id = await rag_system.add_function(func)
                print(f"✅ {i}. {func.name or '(空名称)'} - 成功 (ID: {function_id})")
                success_count += 1
            except Exception as e:
                print(f"❌ {i}. {func.name or '(空名称)'} - 失败: {e}")
                error_count += 1
        
        print(f"\n结果: 成功 {success_count}, 失败 {error_count}")


if __name__ == "__main__":
    try:
        # 运行主要批量操作演示
        asyncio.run(demo_batch_operations())
        
        # 运行错误处理演示
        asyncio.run(demo_batch_error_handling())
        
    except KeyboardInterrupt:
        print("\n❌ 用户中断")
    except Exception as e:
        print(f"\n❌ 运行错误: {e}")
        import traceback
        traceback.print_exc()