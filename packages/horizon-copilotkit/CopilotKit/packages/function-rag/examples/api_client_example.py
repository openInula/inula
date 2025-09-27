#!/usr/bin/env python3
"""
API 客户端示例 - 演示如何使用 HTTP 客户端与 Function RAG System 交互。
"""

import asyncio
import json
import aiohttp
from typing import Dict, Any, List, Optional


class FunctionRAGClient:
    """Function RAG System HTTP 客户端"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip('/')
    
    async def _request(self, method: str, path: str, **kwargs) -> Dict[str, Any]:
        """发送 HTTP 请求"""
        url = f"{self.base_url}{path}"
        
        async with aiohttp.ClientSession() as session:
            async with session.request(method, url, **kwargs) as response:
                if response.content_type == 'application/json':
                    return await response.json()
                else:
                    text = await response.text()
                    try:
                        return json.loads(text)
                    except json.JSONDecodeError:
                        return {"text": text, "status": response.status}
    
    async def health_check(self) -> Dict[str, Any]:
        """检查系统健康状态"""
        return await self._request("GET", "/health/")
    
    async def add_function(self, function_data: Dict[str, Any]) -> Dict[str, Any]:
        """添加新函数"""
        return await self._request(
            "POST", 
            "/functions/",
            json=function_data,
            headers={"Content-Type": "application/json"}
        )
    
    async def search_functions(self, query: str, limit: int = 5) -> Dict[str, Any]:
        """搜索函数（简单接口）"""
        return await self._request(
            "GET", 
            f"/functions/search?q={query}&limit={limit}"
        )
    
    async def advanced_search(self, search_request: Dict[str, Any]) -> Dict[str, Any]:
        """高级搜索"""
        return await self._request(
            "POST",
            "/functions/search",
            json=search_request,
            headers={"Content-Type": "application/json"}
        )
    
    async def get_function_by_id(self, function_id: str) -> Dict[str, Any]:
        """根据 ID 获取函数"""
        return await self._request("GET", f"/functions/{function_id}")
    
    async def get_similar_functions(self, function_id: str, limit: int = 5) -> Dict[str, Any]:
        """获取相似函数"""
        return await self._request("GET", f"/functions/{function_id}/similar?limit={limit}")
    
    async def get_functions_by_category(self, category: str, limit: int = 10) -> Dict[str, Any]:
        """按类别获取函数"""
        return await self._request("GET", f"/functions/category/{category}?limit={limit}")
    
    async def delete_function(self, function_id: str) -> Dict[str, Any]:
        """删除函数"""
        return await self._request("DELETE", f"/functions/{function_id}")
    
    async def get_stats(self) -> Dict[str, Any]:
        """获取系统统计"""
        return await self._request("GET", "/health/stats")


async def demo_api_operations():
    """演示 API 操作"""
    client = FunctionRAGClient()
    
    print("🚀 Function RAG API 客户端示例")
    print("=" * 50)
    
    # 1. 健康检查
    print("\n1. 检查系统健康状态...")
    try:
        health = await client.health_check()
        print(f"✅ 系统状态: {health.get('status', 'unknown')}")
        if 'details' in health:
            print(f"   嵌入服务: {health['details'].get('embedding_service', {}).get('status', 'unknown')}")
            print(f"   向量存储: {health['details'].get('vector_storage', {}).get('status', 'unknown')}")
    except Exception as e:
        print(f"❌ 健康检查失败: {e}")
        return
    
    # 2. 添加示例函数
    print("\n2. 添加示例函数...")
    
    # 字符串处理函数
    string_function = {
        "name": "format_phone",
        "description": "格式化电话号码为统一格式",
        "category": "text",
        "subcategory": "formatting",
        "parameters": {
            "phone": {
                "type": "string",
                "description": "原始电话号码",
                "required": True
            },
            "format": {
                "type": "string", 
                "description": "格式类型：international, national, e164",
                "required": False,
                "default": "national"
            }
        },
        "use_cases": [
            "标准化用户输入的电话号码",
            "数据清洗和格式统一",
            "电话号码验证预处理"
        ],
        "examples": [
            {
                "input": "format_phone('13812345678')",
                "output": "138-1234-5678",
                "context": "格式化中国手机号码"
            },
            {
                "input": "format_phone('13812345678', 'international')",
                "output": "+86 138-1234-5678", 
                "context": "国际格式"
            }
        ],
        "tags": ["电话", "格式化", "文本处理", "验证"],
        "implementation": "def format_phone(phone, format='national'): ..."
    }
    
    try:
        result = await client.add_function(string_function)
        function_id = result.get('function_id')
        print(f"✅ 添加函数成功，ID: {function_id}")
    except Exception as e:
        print(f"❌ 添加函数失败: {e}")
        return
    
    # 数据分析函数
    data_function = {
        "name": "calculate_statistics",
        "description": "计算数组的统计信息（平均值、中位数、标准差）",
        "category": "data", 
        "subcategory": "analysis",
        "parameters": {
            "values": {
                "type": "array",
                "description": "数值数组",
                "required": True,
                "items": {"type": "number"}
            },
            "include_mode": {
                "type": "boolean",
                "description": "是否包含众数",
                "required": False,
                "default": False
            }
        },
        "use_cases": [
            "数据分析和报告生成",
            "质量控制统计",
            "科学计算统计摘要"
        ],
        "examples": [
            {
                "input": "calculate_statistics([1, 2, 3, 4, 5])",
                "output": "{'mean': 3.0, 'median': 3.0, 'std': 1.58}",
                "context": "计算简单数组统计"
            }
        ],
        "tags": ["统计", "数据分析", "数学", "计算"],
        "implementation": "def calculate_statistics(values, include_mode=False): ..."
    }
    
    try:
        result = await client.add_function(data_function)
        data_function_id = result.get('function_id')
        print(f"✅ 添加数据函数成功，ID: {data_function_id}")
    except Exception as e:
        print(f"❌ 添加数据函数失败: {e}")
    
    # 3. 简单搜索
    print("\n3. 简单搜索演示...")
    
    search_queries = [
        "格式化电话号码",
        "数据统计分析",
        "处理文本"
    ]
    
    for query in search_queries:
        try:
            print(f"\n🔍 搜索: '{query}'")
            results = await client.search_functions(query, limit=3)
            
            if 'results' in results and results['results']:
                for i, result in enumerate(results['results'], 1):
                    func = result['function']
                    score = result.get('score', 0)
                    print(f"  {i}. {func['name']} (评分: {score:.3f})")
                    print(f"     {func['description']}")
            else:
                print("     没有找到匹配的函数")
        except Exception as e:
            print(f"   ❌ 搜索失败: {e}")
    
    # 4. 高级搜索
    print("\n4. 高级搜索演示...")
    
    advanced_search_request = {
        "query": "我需要一个可以处理和格式化文本数据的函数",
        "limit": 5,
        "include_scores": True,
        "filters": {
            "category": "text"
        }
    }
    
    try:
        results = await client.advanced_search(advanced_search_request)
        print(f"🔍 高级搜索结果:")
        
        if 'results' in results and results['results']:
            for i, result in enumerate(results['results'], 1):
                func = result['function']
                score = result.get('score', 0)
                match_type = result.get('match_type', 'unknown')
                print(f"  {i}. {func['name']}")
                print(f"     评分: {score:.3f} | 匹配类型: {match_type}")
                print(f"     描述: {func['description']}")
        else:
            print("     没有找到匹配的函数")
    except Exception as e:
        print(f"❌ 高级搜索失败: {e}")
    
    # 5. 获取相似函数
    if function_id:
        print(f"\n5. 获取与函数 {function_id} 相似的函数...")
        try:
            similar = await client.get_similar_functions(function_id, limit=3)
            if 'results' in similar and similar['results']:
                for i, result in enumerate(similar['results'], 1):
                    func = result['function']
                    score = result.get('score', 0)
                    print(f"  {i}. {func['name']} (相似度: {score:.3f})")
                    print(f"     {func['description']}")
            else:
                print("     没有找到相似函数")
        except Exception as e:
            print(f"❌ 获取相似函数失败: {e}")
    
    # 6. 按类别搜索
    print("\n6. 按类别搜索...")
    categories = ["text", "data", "math"]
    
    for category in categories:
        try:
            print(f"\n📂 类别: {category}")
            results = await client.get_functions_by_category(category, limit=3)
            
            if 'results' in results and results['results']:
                for i, result in enumerate(results['results'], 1):
                    func = result['function']
                    print(f"  {i}. {func['name']}")
                    print(f"     {func['description']}")
            else:
                print(f"     类别 '{category}' 中没有函数")
        except Exception as e:
            print(f"   ❌ 搜索类别 '{category}' 失败: {e}")
    
    # 7. 获取系统统计
    print("\n7. 系统统计...")
    try:
        stats = await client.get_stats()
        print(f"📊 系统统计:")
        print(f"   总函数数: {stats.get('total_functions', 0)}")
        print(f"   嵌入缓存: {stats.get('embedding_cache_size', 0)}")
        print(f"   运行时间: {stats.get('uptime', 'unknown')}")
    except Exception as e:
        print(f"❌ 获取统计失败: {e}")
    
    # 8. 获取具体函数详情
    if function_id:
        print(f"\n8. 获取函数详情 (ID: {function_id})...")
        try:
            func_detail = await client.get_function_by_id(function_id)
            if 'function' in func_detail:
                func = func_detail['function']
                print(f"📋 函数详情:")
                print(f"   名称: {func['name']}")
                print(f"   描述: {func['description']}")
                print(f"   类别: {func['category']}")
                if func.get('tags'):
                    print(f"   标签: {', '.join(func['tags'])}")
                print(f"   参数数量: {len(func.get('parameters', {}))}")
                print(f"   示例数量: {len(func.get('examples', []))}")
        except Exception as e:
            print(f"❌ 获取函数详情失败: {e}")
    
    print("\n✅ API 客户端示例完成！")


async def demo_error_handling():
    """演示错误处理"""
    client = FunctionRAGClient()
    
    print("\n🛡️ 错误处理演示")
    print("-" * 30)
    
    # 尝试获取不存在的函数
    try:
        result = await client.get_function_by_id("non-existent-id")
        print(f"意外成功: {result}")
    except Exception as e:
        print(f"✅ 正确捕获错误: {e}")
    
    # 尝试搜索空查询
    try:
        result = await client.search_functions("")
        print(f"空查询结果: {result}")
    except Exception as e:
        print(f"✅ 空查询错误: {e}")


if __name__ == "__main__":
    try:
        # 运行主要演示
        asyncio.run(demo_api_operations())
        
        # 运行错误处理演示
        asyncio.run(demo_error_handling())
        
    except KeyboardInterrupt:
        print("\n❌ 用户中断")
    except Exception as e:
        print(f"\n❌ 运行错误: {e}")
        import traceback
        traceback.print_exc()