#!/usr/bin/env python3
"""
集成示例 - 演示如何将 Function RAG System 集成到实际应用中。
"""

import asyncio
import json
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core import ConfigManager, FunctionRAGSystem
from app.models import AddFunctionRequest, FunctionExample, Parameter, ParameterType, SearchRequest


@dataclass
class ChatbotIntent:
    """聊天机器人意图识别结果"""
    intent: str
    confidence: float
    entities: Dict[str, Any]
    raw_query: str


@dataclass 
class FunctionRecommendation:
    """函数推荐结果"""
    function_id: str
    function_name: str
    confidence: float
    reason: str
    parameters_suggestion: Dict[str, Any]


class SmartFunctionRecommender:
    """智能函数推荐器"""
    
    def __init__(self, rag_system: FunctionRAGSystem):
        self.rag_system = rag_system
        self.intent_patterns = {
            "calculate": ["计算", "算出", "求", "得出", "运算"],
            "process": ["处理", "转换", "格式化", "清理", "整理"],
            "validate": ["验证", "检查", "确认", "校验", "核实"],
            "search": ["搜索", "查找", "寻找", "检索", "获取"],
            "generate": ["生成", "创建", "制作", "产生", "构建"]
        }
    
    def analyze_intent(self, query: str) -> ChatbotIntent:
        """分析用户意图"""
        query_lower = query.lower()
        
        # 简单的意图识别
        best_intent = "unknown"
        best_confidence = 0.0
        
        for intent, keywords in self.intent_patterns.items():
            matches = sum(1 for keyword in keywords if keyword in query_lower)
            confidence = matches / len(keywords) if keywords else 0
            
            if confidence > best_confidence:
                best_confidence = confidence
                best_intent = intent
        
        # 提取简单的实体（数字、引号内的文本等）
        entities = {}
        import re
        
        # 提取数字
        numbers = re.findall(r'\d+\.?\d*', query)
        if numbers:
            entities['numbers'] = [float(n) if '.' in n else int(n) for n in numbers]
        
        # 提取引号内的文本
        quoted_text = re.findall(r'"([^"]*)"', query)
        if quoted_text:
            entities['quoted_text'] = quoted_text
        
        return ChatbotIntent(
            intent=best_intent,
            confidence=best_confidence,
            entities=entities,
            raw_query=query
        )
    
    async def recommend_functions(self, intent: ChatbotIntent, limit: int = 5) -> List[FunctionRecommendation]:
        """根据意图推荐函数"""
        recommendations = []
        
        try:
            # 使用 RAG 系统搜索相关函数
            search_request = SearchRequest(
                query=intent.raw_query,
                limit=limit * 2,  # 获取更多结果以便筛选
                include_scores=True
            )
            
            results = await self.rag_system.search_functions(search_request)
            
            for result in results[:limit]:
                # 生成参数建议
                param_suggestion = self._generate_parameter_suggestion(
                    result.function, 
                    intent.entities
                )
                
                # 生成推荐理由
                reason = self._generate_recommendation_reason(result, intent)
                
                recommendation = FunctionRecommendation(
                    function_id=result.function.id,
                    function_name=result.function.name,
                    confidence=result.score,
                    reason=reason,
                    parameters_suggestion=param_suggestion
                )
                
                recommendations.append(recommendation)
        
        except Exception as e:
            print(f"推荐函数时出错: {e}")
        
        return recommendations
    
    def _generate_parameter_suggestion(self, function, entities: Dict[str, Any]) -> Dict[str, Any]:
        """根据实体信息生成参数建议"""
        suggestions = {}
        
        for param_name, param_info in function.parameters.items():
            param_type = param_info.get('type', '').lower()
            
            # 根据参数类型和实体信息生成建议
            if param_type in ['number', 'integer', 'float'] and 'numbers' in entities:
                if entities['numbers']:
                    suggestions[param_name] = entities['numbers'][0]
            
            elif param_type == 'string' and 'quoted_text' in entities:
                if entities['quoted_text']:
                    suggestions[param_name] = entities['quoted_text'][0]
            
            elif param_type == 'array' and 'numbers' in entities:
                if len(entities['numbers']) > 1:
                    suggestions[param_name] = entities['numbers']
        
        return suggestions
    
    def _generate_recommendation_reason(self, result, intent: ChatbotIntent) -> str:
        """生成推荐理由"""
        reasons = []
        
        # 基于匹配分数
        if result.score > 0.8:
            reasons.append("高度匹配您的需求")
        elif result.score > 0.6:
            reasons.append("较好匹配您的需求")
        else:
            reasons.append("部分匹配您的需求")
        
        # 基于意图类型
        if intent.intent != "unknown":
            intent_desc = {
                "calculate": "适合计算类任务",
                "process": "适合数据处理任务",
                "validate": "适合验证类任务",
                "search": "适合搜索类任务",
                "generate": "适合生成类任务"
            }
            if intent.intent in intent_desc:
                reasons.append(intent_desc[intent.intent])
        
        # 基于函数类别
        category_desc = {
            "math": "数学计算功能",
            "text": "文本处理功能", 
            "array": "数组操作功能",
            "validation": "数据验证功能",
            "utility": "通用工具功能"
        }
        if result.function.category in category_desc:
            reasons.append(f"提供{category_desc[result.function.category]}")
        
        return "，".join(reasons)


class ChatbotSimulator:
    """聊天机器人模拟器"""
    
    def __init__(self, recommender: SmartFunctionRecommender):
        self.recommender = recommender
        self.conversation_history = []
    
    async def process_user_query(self, query: str) -> Dict[str, Any]:
        """处理用户查询"""
        print(f"\n🤖 处理查询: '{query}'")
        
        # 1. 意图分析
        intent = self.recommender.analyze_intent(query)
        print(f"   意图识别: {intent.intent} (置信度: {intent.confidence:.2f})")
        
        if intent.entities:
            print(f"   提取实体: {intent.entities}")
        
        # 2. 函数推荐
        recommendations = await self.recommender.recommend_functions(intent)
        
        # 3. 生成响应
        response = self._generate_response(intent, recommendations)
        
        # 4. 记录对话历史
        conversation_item = {
            "query": query,
            "intent": asdict(intent),
            "recommendations": [asdict(r) for r in recommendations],
            "response": response
        }
        self.conversation_history.append(conversation_item)
        
        return conversation_item
    
    def _generate_response(self, intent: ChatbotIntent, recommendations: List[FunctionRecommendation]) -> str:
        """生成响应文本"""
        if not recommendations:
            return "抱歉，我没有找到合适的函数来处理您的请求。"
        
        response_parts = []
        
        # 根据意图生成开场白
        intent_greetings = {
            "calculate": "我找到了一些计算相关的函数：",
            "process": "我找到了一些数据处理函数：",
            "validate": "我找到了一些验证功能：",
            "search": "我找到了一些搜索功能：",
            "generate": "我找到了一些生成功能：",
            "unknown": "我找到了一些可能有用的函数："
        }
        
        response_parts.append(intent_greetings.get(intent.intent, "我找到了一些相关函数："))
        
        # 添加推荐函数
        for i, rec in enumerate(recommendations[:3], 1):  # 只显示前3个
            response_parts.append(f"\n{i}. {rec.function_name}")
            response_parts.append(f"   {rec.reason}")
            response_parts.append(f"   置信度: {rec.confidence:.2f}")
            
            if rec.parameters_suggestion:
                param_strs = []
                for param, value in rec.parameters_suggestion.items():
                    param_strs.append(f"{param}={value}")
                response_parts.append(f"   建议参数: {', '.join(param_strs)}")
        
        if len(recommendations) > 3:
            response_parts.append(f"\n还有其他 {len(recommendations) - 3} 个相关函数...")
        
        return "".join(response_parts)


async def demo_integration():
    """演示集成应用"""
    print("🤖 Function RAG 集成应用演示")
    print("=" * 50)
    
    # 1. 初始化系统
    print("\n1. 初始化系统...")
    config_manager = ConfigManager()
    rag_config = config_manager.get_rag_config()
    
    if not config_manager.validate_config():
        print("❌ 配置验证失败！")
        return
    
    async with FunctionRAGSystem(rag_config) as rag_system:
        # 2. 清理之前的数据
        print("\n2. 清理之前的数据...")
        await rag_system.clear_all_functions()
        print("✅ 清理完成")
        
        # 3. 添加一些示例函数
        print("\n3. 添加示例函数...")
        
        sample_functions = [
            AddFunctionRequest(
                name="calculate_tax", 
                description="计算商品的税额",
                category="finance",
                subcategory="tax",
                parameters={
                    "amount": Parameter(type=ParameterType.NUMBER, description="商品金额", required=True),
                    "tax_rate": Parameter(type=ParameterType.NUMBER, description="税率", required=False, default=0.1)
                },
                use_cases=["电商税费计算", "财务系统", "发票生成"],
                examples=[
                    FunctionExample(
                        input="calculate_tax(100, 0.08)",
                        output="8.0",
                        context="计算100元商品8%的税费"
                    )
                ],
                tags=["税费", "计算", "财务", "电商"],
                implementation="def calculate_tax(amount, tax_rate=0.1): return amount * tax_rate"
            ),
            
            AddFunctionRequest(
                name="validate_phone",
                description="验证电话号码格式是否正确",
                category="validation",
                subcategory="format",
                parameters={
                    "phone": Parameter(type=ParameterType.STRING, description="电话号码", required=True),
                    "country_code": Parameter(type=ParameterType.STRING, description="国家代码", required=False, default="CN")
                },
                use_cases=["用户注册", "表单验证", "数据清洗"],
                examples=[
                    FunctionExample(
                        input="validate_phone('13812345678')",
                        output="True",
                        context="验证中国手机号"
                    )
                ],
                tags=["验证", "电话", "格式", "注册"],
                implementation="def validate_phone(phone, country_code='CN'): ..."
            ),
            
            AddFunctionRequest(
                name="format_currency",
                description="格式化货币显示",
                category="text",
                subcategory="formatting",
                parameters={
                    "amount": Parameter(type=ParameterType.NUMBER, description="金额", required=True),
                    "currency": Parameter(type=ParameterType.STRING, description="货币符号", required=False, default="￥")
                },
                use_cases=["电商展示", "财务报表", "价格显示"],
                examples=[
                    FunctionExample(
                        input="format_currency(1234.56)",
                        output="'￥1,234.56'",
                        context="格式化人民币金额"
                    )
                ],
                tags=["格式化", "货币", "显示", "金额"],
                implementation="def format_currency(amount, currency='￥'): return f'{currency}{amount:,.2f}'"
            )
        ]
        
        for func in sample_functions:
            try:
                await rag_system.add_function(func)
                print(f"   ✅ 添加 {func.name}")
            except Exception as e:
                print(f"   ❌ 添加 {func.name} 失败: {e}")
        
        # 3. 创建智能推荐器和聊天机器人
        print("\n3. 创建智能推荐器...")
        recommender = SmartFunctionRecommender(rag_system)
        chatbot = ChatbotSimulator(recommender)
        
        # 4. 演示用户交互
        print("\n4. 用户交互演示")
        print("-" * 30)
        
        test_queries = [
            "我需要计算100元商品的税费",
            "帮我验证这个电话号码13812345678是否正确",
            "如何格式化显示金额1234.56",
            "我想要处理数据",
            "生成一个报告"
        ]
        
        for query in test_queries:
            try:
                conversation = await chatbot.process_user_query(query)
                print(f"\n👤 用户: {query}")
                print(f"🤖 助手: {conversation['response']}")
                
            except Exception as e:
                print(f"❌ 处理查询失败: {e}")
        
        # 5. 分析对话历史
        print(f"\n5. 对话分析")
        print("-" * 20)
        
        history = chatbot.conversation_history
        print(f"总对话轮次: {len(history)}")
        
        # 意图分布统计
        intent_counts = {}
        for item in history:
            intent = item['intent']['intent']
            intent_counts[intent] = intent_counts.get(intent, 0) + 1
        
        print("意图分布:")
        for intent, count in intent_counts.items():
            print(f"  {intent}: {count} 次")
        
        # 推荐成功率
        successful_recommendations = sum(1 for item in history if item['recommendations'])
        success_rate = successful_recommendations / len(history) if history else 0
        print(f"推荐成功率: {success_rate:.1%}")
        
        # 平均置信度
        confidences = []
        for item in history:
            for rec in item['recommendations']:
                confidences.append(rec['confidence'])
        
        if confidences:
            avg_confidence = sum(confidences) / len(confidences)
            print(f"平均推荐置信度: {avg_confidence:.3f}")
        
        # 6. 导出对话日志
        print(f"\n6. 导出对话日志...")
        
        log_file = Path("conversation_log.json")
        try:
            with open(log_file, 'w', encoding='utf-8') as f:
                json.dump({
                    "timestamp": asyncio.get_event_loop().time(),
                    "total_conversations": len(history),
                    "conversations": history
                }, f, ensure_ascii=False, indent=2)
            
            print(f"✅ 对话日志已保存到: {log_file}")
            
        except Exception as e:
            print(f"❌ 保存日志失败: {e}")


async def demo_api_integration():
    """演示 API 集成场景"""
    print("\n\n🌐 API 集成场景演示")
    print("=" * 40)
    
    # 模拟一个Web应用的API端点
    class MockWebAPI:
        def __init__(self, rag_system: FunctionRAGSystem):
            self.rag_system = rag_system
            self.recommender = SmartFunctionRecommender(rag_system)
        
        async def get_function_suggestions(self, user_query: str, user_context: Dict = None) -> Dict:
            """API端点：获取函数建议"""
            try:
                intent = self.recommender.analyze_intent(user_query)
                recommendations = await self.recommender.recommend_functions(intent, limit=3)
                
                return {
                    "status": "success",
                    "query": user_query,
                    "intent": {
                        "type": intent.intent,
                        "confidence": intent.confidence
                    },
                    "suggestions": [
                        {
                            "function_id": rec.function_id,
                            "function_name": rec.function_name,
                            "confidence": rec.confidence,
                            "reason": rec.reason,
                            "parameters": rec.parameters_suggestion
                        }
                        for rec in recommendations
                    ],
                    "context": user_context or {}
                }
                
            except Exception as e:
                return {
                    "status": "error",
                    "message": str(e),
                    "query": user_query
                }
    
    # 演示 API 集成
    config_manager = ConfigManager()
    rag_config = config_manager.get_rag_config()
    
    async with FunctionRAGSystem(rag_config) as rag_system:
        # 清理之前的数据
        await rag_system.clear_all_functions()
        
        api = MockWebAPI(rag_system)
        
        # 模拟API调用
        api_calls = [
            {
                "query": "计算订单总价",
                "context": {"user_type": "merchant", "app": "e-commerce"}
            },
            {
                "query": "验证用户输入",
                "context": {"user_type": "developer", "app": "form-validator"}
            }
        ]
        
        print("API 调用演示:")
        for call in api_calls:
            result = await api.get_function_suggestions(call["query"], call["context"])
            
            print(f"\n📡 API 调用:")
            print(f"   查询: {call['query']}")
            print(f"   上下文: {call['context']}")
            print(f"   结果: {result['status']}")
            
            if result['status'] == 'success':
                print(f"   建议数量: {len(result['suggestions'])}")
                for i, suggestion in enumerate(result['suggestions'], 1):
                    print(f"     {i}. {suggestion['function_name']} (置信度: {suggestion['confidence']:.3f})")


if __name__ == "__main__":
    try:
        # 运行集成演示
        asyncio.run(demo_integration())
        
        # 运行API集成演示
        asyncio.run(demo_api_integration())
        
        print("\n✅ 集成示例演示完成！")
        
    except KeyboardInterrupt:
        print("\n❌ 用户中断")
    except Exception as e:
        print(f"\n❌ 运行错误: {e}")
        import traceback
        traceback.print_exc()