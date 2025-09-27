#!/usr/bin/env python3
"""
删除Collection示例 - 演示如何删除和重建向量数据库collection。

⚠️  警告：此操作将删除所有存储的函数数据，请谨慎使用！
"""

import asyncio
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core import ConfigManager, FunctionRAGSystem
from app.models import (
    AddFunctionRequest, FunctionExample, Parameter, ParameterType
)


async def demonstrate_collection_operations():
    """演示collection删除和重建操作。"""
    print("🗑️  Function RAG System - Collection删除示例")
    print("=" * 60)
    print("⚠️  警告：此操作将删除所有存储的函数数据！")
    print("=" * 60)

    # 1. 初始化系统
    print("\n1. 初始化 RAG 系统...")
    config_manager = ConfigManager()
    rag_config = config_manager.get_rag_config()

    if not config_manager.validate_config():
        print("❌ 配置验证失败！请检查 .env 文件")
        return

    async with FunctionRAGSystem(rag_config) as rag_system:
        # 2. 检查当前collection状态
        print("\n2. 检查当前collection状态...")
        try:
            stats = await rag_system.get_system_stats()
            print("📊 当前状态:")
            collection_name = rag_config.storage.collection_name
            print(f"   - Collection名称: {collection_name}")
            print(f"   - 总函数数量: {stats.get('total_functions', 0)}")
            print(f"   - 向量维度: {rag_config.storage.vector_size}")
            distance = rag_config.storage.distance_metric
            print(f"   - 距离算法: {distance}")
        except Exception as e:
            print(f"❌ 获取collection状态失败: {e}")

        # 3. 添加一些测试数据
        print("\n3. 添加测试数据...")
        test_functions = [
            AddFunctionRequest(
                name="test_add",
                description="测试加法函数",
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
                use_cases=["计算两个数字的和"],
                examples=[
                    FunctionExample(
                        input="test_add(2, 3)",
                        output="5",
                        context="简单加法示例"
                    )
                ],
                tags=["数学", "加法", "测试"],
                implementation="def test_add(a, b): return a + b"
            ),
            AddFunctionRequest(
                name="test_multiply",
                description="测试乘法函数",
                category="math",
                subcategory="arithmetic",
                parameters={
                    "x": Parameter(
                        type=ParameterType.NUMBER,
                        description="第一个数字",
                        required=True
                    ),
                    "y": Parameter(
                        type=ParameterType.NUMBER,
                        description="第二个数字",
                        required=True
                    )
                },
                use_cases=["计算两个数字的乘积"],
                examples=[
                    FunctionExample(
                        input="test_multiply(4, 5)",
                        output="20",
                        context="简单乘法示例"
                    )
                ],
                tags=["数学", "乘法", "测试"],
                implementation="def test_multiply(x, y): return x * y"
            )
        ]

        # 添加测试函数
        added_ids = []
        for func in test_functions:
            try:
                function_id = await rag_system.add_function(func)
                added_ids.append(function_id)
                print(f"✅ 添加函数: {func.name} (ID: {function_id})")
            except Exception as e:
                print(f"❌ 添加函数 {func.name} 失败: {e}")

        # 4. 验证数据已添加
        print("\n4. 验证数据已添加...")
        try:
            stats_after_add = await rag_system.get_system_stats()
            print("📊 添加数据后:")
            total_funcs = stats_after_add.get('total_functions', 0)
            print(f"   - 总函数数量: {total_funcs}")

            # 搜索验证
            from app.models import SearchRequest
            search_result = await rag_system.search_functions(
                SearchRequest(query="数学函数", limit=5)
            )
            print(f"   - 搜索'数学函数'找到: {len(search_result)} 个结果")

        except Exception as e:
            print(f"❌ 验证数据失败: {e}")

        # 5. 确认删除操作
        print("\n5. 准备删除collection...")
        print("⚠️  这将删除所有存储的函数数据！")

        # 在自动化脚本中，我们跳过用户确认
        # 在实际使用中，您可能想要添加用户确认
        confirm = True
        # confirm = input("确认删除吗？(yes/no): ").lower().strip() == 'yes'

        if not confirm:
            print("❌ 操作已取消")
            return

        # 6. 执行删除操作
        print("\n6. 执行collection删除操作...")
        try:
            success = await rag_system.clear_all_functions()
            if success:
                print("✅ Collection删除成功！")
                print("   - 所有函数数据已清除")
                print("   - Collection已重新创建")
                print("   - 缓存已清理")
            else:
                print("❌ Collection删除失败")
        except Exception as e:
            print(f"❌ 删除操作异常: {e}")

        # 7. 验证删除结果
        print("\n7. 验证删除结果...")
        try:
            stats_after_delete = await rag_system.get_system_stats()
            print("📊 删除后状态:")
            total_after = stats_after_delete.get('total_functions', 0)
            print(f"   - 总函数数量: {total_after}")

            # 搜索验证
            search_result_after = await rag_system.search_functions(
                SearchRequest(query="数学函数", limit=5)
            )
            print(f"   - 搜索'数学函数'找到: {len(search_result_after)} 个结果")

            if stats_after_delete.get('total_functions', 0) == 0:
                print("✅ 验证成功：Collection已完全清空")
            else:
                print("⚠️  警告：Collection似乎未完全清空")

        except Exception as e:
            print(f"❌ 验证删除结果失败: {e}")


async def demonstrate_manual_collection_deletion():
    """演示直接使用vector storage service删除collection。"""
    print("\n" + "=" * 60)
    print("🔧 高级操作：直接删除Collection（不重建）")
    print("=" * 60)

    config_manager = ConfigManager()
    rag_config = config_manager.get_rag_config()

    # 直接使用vector storage服务
    from app.services import VectorStorageService

    vector_storage = VectorStorageService(rag_config.storage)

    try:
        # 初始化连接
        await vector_storage.initialize()

        # 获取collection信息
        print("\n1. 获取collection信息...")
        try:
            collection_info = await vector_storage.get_collection_stats()
            print("📊 Collection统计:")
            for key, value in collection_info.items():
                print(f"   - {key}: {value}")
        except Exception as e:
            print(f"ℹ️  无法获取collection信息: {e}")

        # 手动删除collection
        collection_name = rag_config.storage.collection_name
        print(f"\n2. 手动删除collection: {collection_name}")

        try:
            # 直接调用qdrant客户端删除collection
            await vector_storage.client.delete_collection(
                rag_config.storage.collection_name
            )
            print("✅ Collection删除成功（未重建）")
            print("ℹ️  注意：下次使用时系统会自动重建collection")

        except Exception as e:
            print(f"❌ 手动删除失败: {e}")

        # 尝试重新创建（可选）
        print("\n3. 重新创建collection...")
        try:
            await vector_storage._create_collection()
            print("✅ Collection重新创建成功")
        except Exception as e:
            print(f"❌ 重新创建失败: {e}")

    finally:
        # 清理连接
        await vector_storage.close()


async def show_collection_management_info():
    """显示collection管理的重要信息。"""
    print("\n" + "=" * 60)
    print("📚 Collection管理重要信息")
    print("=" * 60)

    print("""
🔍 什么是Collection？
   - Collection是向量数据库中的数据容器
   - 类似于传统数据库中的表
   - 存储所有函数的向量embeddings和元数据

⚠️  删除Collection的影响：
   - 所有存储的函数数据将永久丢失
   - 所有向量embeddings将被删除
   - 系统需要重新索引所有函数

🛠️  何时需要删除Collection：
   - 更改向量维度设置
   - 更改距离算法
   - 数据损坏需要重建
   - 开发测试需要清空数据
   - 迁移到新的embedding模型

🔧 删除方式：
   1. rag_system.clear_all_functions() - 删除并重建
   2. vector_storage.client.delete_collection() - 仅删除

💡 最佳实践：
   - 删除前备份重要数据
   - 在测试环境中验证操作
   - 考虑批量删除特定函数而非整个collection
   - 删除后验证系统状态
    """)


async def main():
    """主要演示函数。"""
    try:
        # 显示信息
        await show_collection_management_info()

        # 演示标准删除操作
        await demonstrate_collection_operations()

        # 演示高级删除操作
        await demonstrate_manual_collection_deletion()

        print("\n✅ Collection删除示例演示完成！")
        print("\n💡 提示：")
        print("   - 删除collection是不可逆操作")
        print("   - 建议在生产环境中谨慎使用")
        print("   - 可以使用clear_all_functions()来安全地重置数据")

    except KeyboardInterrupt:
        print("\n❌ 用户中断操作")
    except Exception as e:
        print(f"\n❌ 运行出错: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())