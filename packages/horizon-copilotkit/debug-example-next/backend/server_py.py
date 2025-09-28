#!/usr/bin/env python3
"""
CopilotKit Debug Example Next - Backend Server (使用 create_copilot_app API)
基于 copilot-server 的 FastAPI 后端服务，使用新的 create_copilot_app API
"""

import os
import sys
import logging
from datetime import datetime
from typing import Dict, Any, List
from pathlib import Path

import uvicorn
from dotenv import load_dotenv
import uuid
import openai

# 添加 copilot-server 到路径
current_dir = Path(__file__).parent
project_root = current_dir.parent.parent
runtime_python_path = project_root / "CopilotKit" / "packages" / "copilot-server"
sys.path.insert(0, str(runtime_python_path))

try:
    from copilotkit_runtime import (
        CopilotRuntime,
        CopilotRuntimeConstructorParams,
        DeepSeekAdapter,
        create_copilot_app,
        Action,
        Parameter,
        ConversationalApprovalManager,
        ApprovalMiddleware
    )
except ImportError as e:
    print(f"错误: 无法导入 copilot-server 模块: {e}")
    print(f"请确保 copilot-server 路径正确: {runtime_python_path}")
    sys.exit(1)

# 加载环境变量
load_dotenv()

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('backend.log')
    ]
)

logger = logging.getLogger(__name__)

# ================================
# 审批系统相关定义
# ================================


# 全局对话式审批管理器实例
conversational_approval_manager = None

def get_approval_manager():
    """获取对话式审批管理器实例"""
    global conversational_approval_manager
    if conversational_approval_manager is None:
        conversational_approval_manager = ConversationalApprovalManager()
    return conversational_approval_manager



def create_demo_actions() -> List[Action]:
    """创建演示动作"""
    
    async def get_current_time(arguments: Dict[str, Any]) -> str:
        """获取当前时间"""
        timezone = arguments.get("timezone", "UTC")
        try:
            current_time = datetime.now()
            formatted_time = current_time.strftime("%Y-%m-%d %H:%M:%S")
            
            logger.info(f"⏰ 获取当前时间: {formatted_time} ({timezone})")
            return f"当前时间 ({timezone}): {formatted_time}"
        except Exception as e:
            logger.error(f"获取时间失败: {e}")
            return f"获取时间失败: {str(e)}"
    
    async def calculate(arguments: Dict[str, Any]) -> str:
        """计算数学表达式"""
        expression = arguments.get("expression", "")
        try:
            # 简单的安全计算
            if any(op in expression for op in ['import', 'exec', 'eval', '__', 'open', 'file']):
                return "不安全的表达式，计算被拒绝"
            
            # 只允许基本的数学运算
            allowed_chars = set('0123456789+-*/()., ')
            if not all(c in allowed_chars for c in expression):
                return "包含不允许的字符，只支持基本数学运算"
            
            result = eval(expression)
            logger.info(f"🧮 计算: {expression} = {result}")
            return f"计算结果: {expression} = {result}"
        except ZeroDivisionError:
            return "错误: 除零操作"
        except Exception as e:
            logger.error(f"计算失败: {e}")
            return f"计算错误: {str(e)}"
    
    async def get_user_info(arguments: Dict[str, Any]) -> str:
        """获取用户信息"""
        user_id = arguments.get("user_id", "default")
        try:
            # 模拟用户数据
            users_db = {
                "default": {"name": "演示用户", "role": "guest", "last_login": "2024-01-15"},
                "admin": {"name": "管理员", "role": "admin", "last_login": "2024-01-16"},
                "user1": {"name": "张三", "role": "user", "last_login": "2024-01-14"}
            }
            
            user_info = users_db.get(user_id, {
                "name": "未知用户",
                "role": "guest", 
                "last_login": "从未登录"
            })
            
            result = f"用户信息 - 姓名: {user_info['name']}, 角色: {user_info['role']}, 最后登录: {user_info['last_login']}"
            logger.info(f"👤 获取用户信息: {user_id} -> {user_info}")
            return result
        except Exception as e:
            logger.error(f"获取用户信息失败: {e}")
            return f"获取用户信息失败: {str(e)}"
    
    async def check_status(arguments: Dict[str, Any]) -> str:
        """检查系统状态"""
        service = arguments.get("service", "system")
        try:
            # 模拟系统状态检查
            status_db = {
                "system": {"status": "运行中", "uptime": "24小时", "cpu": "45%", "memory": "62%"},
                "database": {"status": "正常", "connections": "8/100", "response_time": "12ms"},
                "api": {"status": "正常", "requests_per_min": "150", "error_rate": "0.1%"},
                "cache": {"status": "正常", "hit_rate": "89%", "memory_usage": "34%"}
            }
            
            service_status = status_db.get(service, {
                "status": "未知服务",
                "message": f"服务 '{service}' 不存在"
            })
            
            if "message" in service_status:

                result = service_status["message"]
            else:
                status_info = ", ".join([f"{k}: {v}" for k, v in service_status.items()])
                result = f"{service.upper()} 状态 - {status_info}"
            
            logger.info(f"📊 检查状态: {service} -> {service_status}")
            return result
        except Exception as e:
            logger.error(f"状态检查失败: {e}")
            return f"状态检查失败: {str(e)}"
    
    async def handle_approval(arguments: Dict[str, Any]) -> str:
        """处理用户的审批决定"""
        decision = arguments.get("decision", "").lower().strip()
        approval_id_partial = arguments.get("approval_id", "").strip()
        
        # 使用对话式审批管理器处理审批
        approval_manager = get_approval_manager()
        return await approval_manager.handle_conversational_approval(
            decision=decision,
            approval_id_partial=approval_id_partial
        )
    
    async def generate_travel_plan(arguments: Dict[str, Any]) -> str:
        """生成AI旅行规划，返回JSON格式的方案数据供前端处理"""
        import json
        
        destination = arguments.get("destination", "")
        budget = arguments.get("budget", "10000")
        days = arguments.get("days", 7)
        preferences = arguments.get("preferences", "")
        
        logger.info(f"🧳 开始生成旅行规划: {destination}, 预算: {budget}, 天数: {days}")
        
        try:
            # 构建AI提示词
            prompt = f"""你是一个专业的旅行规划师，请为用户生成4个不同风格的{destination}旅行方案。

用户需求：
- 目的地：{destination}
- 预算：{budget}元
- 天数：{days}天
- 偏好：{preferences or '综合体验'}

请生成4个不同主题的旅行方案，每个方案包含：
1. 标题（例如：东京文化深度游）
2. 简短描述（50字内）
3. 4个亮点特色
4. 建议价格（基于预算调整）
5. 详细的天天行程安排
6. AI推荐理由（为什么推荐这个方案）

请严格按照以下JSON格式返回，不要添加任何其他文字：
{{
  "plans": [
    {{
      "id": 1,
      "title": "方案标题",
      "description": "简短描述",
      "highlights": ["特色1", "特色2", "特色3", "特色4"],
      "price": 价格数字,
      "itinerary": "详细行程安排（用\\n分隔每天）",
      "aiReason": "AI推荐理由"
    }},
    {{
      "id": 2,
      "title": "方案标题",
      "description": "简短描述",
      "highlights": ["特色1", "特色2", "特色3", "特色4"],
      "price": 价格数字,
      "itinerary": "详细行程安排（用\\n分隔每天）",
      "aiReason": "AI推荐理由"
    }},
    {{
      "id": 3,
      "title": "方案标题",
      "description": "简短描述",
      "highlights": ["特色1", "特色2", "特色3", "特色4"],
      "price": 价格数字,
      "itinerary": "详细行程安排（用\\n分隔每天）",
      "aiReason": "AI推荐理由"
    }},
    {{
      "id": 4,
      "title": "方案标题",
      "description": "简短描述",
      "highlights": ["特色1", "特色2", "特色3", "特色4"],
      "price": 价格数字,
      "itinerary": "详细行程安排（用\\n分隔每天）",
      "aiReason": "AI推荐理由"
    }}
  ]
}}

请确保每个方案都有不同的主题风格（如文化、美食、自然、奢华等），价格根据主题合理调整。只返回JSON，不要有任何解释文字。"""

            # 调用AI生成方案
            logger.info(f"[旅行规划] 开始为{destination}生成旅行方案...")
            
            # 使用OpenAI客户端直接调用DeepSeek API
            
            # 获取DeepSeek API密钥
            deepseek_api_key = os.getenv("DEEPSEEK_API_KEY")
            if not deepseek_api_key:
                logger.warning("⚠️ 未设置DEEPSEEK_API_KEY环境变量，使用默认方案")
                raise Exception("DEEPSEEK_API_KEY not configured")
            
            # 创建OpenAI客户端连接DeepSeek
            client = openai.AsyncOpenAI(
                api_key=deepseek_api_key,
                base_url="https://api.deepseek.com/v1"
            )
            
            messages = [{"role": "user", "content": prompt}]
            
            # 调用DeepSeek API
            response = await client.chat.completions.create(
                model="deepseek-chat",
                messages=messages,
                max_tokens=2000
            )
            ai_content = response.choices[0].message.content
            
            logger.info(f"[旅行规划] AI响应: {ai_content[:200]}...")
            
            # 解析AI返回的JSON
            import re
            try:
                # 尝试多种方式提取JSON
                json_content = None
                
                # 方法1: 查找```json代码块
                if "```json" in ai_content:
                    json_start = ai_content.find("```json") + 7
                    json_end = ai_content.find("```", json_start)
                    json_content = ai_content[json_start:json_end].strip()
                    logger.info(f"[旅行规划] 使用代码块方式提取JSON")
                
                # 方法2: 查找```代码块(不带json标识)
                elif "```" in ai_content and json_content is None:
                    json_start = ai_content.find("```") + 3
                    json_end = ai_content.find("```", json_start)
                    if json_end > json_start:
                        potential_json = ai_content[json_start:json_end].strip()
                        if potential_json.startswith("{"):
                            json_content = potential_json
                            logger.info(f"[旅行规划] 使用通用代码块方式提取JSON")
                
                # 方法3: 直接查找JSON对象
                if json_content is None and "{" in ai_content and "}" in ai_content:
                    # 使用正则表达式找到完整的JSON对象
                    json_match = re.search(r'\{.*\}', ai_content, re.DOTALL)
                    if json_match:
                        json_content = json_match.group(0)
                        logger.info(f"[旅行规划] 使用正则表达式提取JSON")
                    else:
                        # 备用方法：从第一个{到最后一个}
                        json_start = ai_content.find("{")
                        json_end = ai_content.rfind("}") + 1
                        json_content = ai_content[json_start:json_end]
                        logger.info(f"[旅行规划] 使用位置定位方式提取JSON")
                
                if not json_content:
                    raise ValueError("No JSON found in AI response")
                
                logger.info(f"[旅行规划] 提取的JSON内容: {json_content[:300]}...")
                
                # 清理JSON内容
                json_content = json_content.strip()
                
                # 尝试解析JSON
                ai_plans = json.loads(json_content)
                
                # 验证JSON结构
                if not isinstance(ai_plans, dict) or "plans" not in ai_plans:
                    raise ValueError("Invalid JSON structure: missing 'plans' key")
                
                if not isinstance(ai_plans["plans"], list):
                    raise ValueError("Invalid JSON structure: 'plans' should be a list")
                
                if len(ai_plans["plans"]) == 0:
                    raise ValueError("No travel plans found in AI response")
                
                logger.info(f"[旅行规划] 成功解析AI生成的{len(ai_plans['plans'])}个方案")
                
                # 返回包含JSON数据的特殊格式字符串，前端将解析此格式
                travel_data = {
                    "plans": ai_plans["plans"],
                    "destination": destination,
                    "budget": budget,
                    "days": days,
                    "preferences": preferences
                }
                
                # 返回JSON数据，前端会识别这个格式并触发interrupt
                return f"TRAVEL_PLANS_JSON:{json.dumps(travel_data, ensure_ascii=False)}"
                
            except (json.JSONDecodeError, ValueError) as e:
                logger.error(f"[旅行规划] JSON解析失败: {e}")
                logger.error(f"[旅行规划] AI原始响应: {ai_content}")
                
                # 如果JSON解析失败，提供默认方案
                fallback_plans = [
                    {
                        "id": 1,
                        "title": f"{destination} 经典文化之旅",
                        "description": f"{days}天深度文化体验，预算约{budget}元",
                        "highlights": ["历史古迹游览", "当地文化体验", "传统美食品尝", "民俗活动参与"],
                        "price": int(float(budget) * 0.8),
                        "itinerary": f"第1-2天：抵达{destination}，市区观光\\n第3-4天：历史文化景点深度游\\n第5-6天：当地民俗体验\\n第{days}天：返程",
                        "aiReason": f"根据您的文化偏好，这个行程专注于深度体验{destination}的历史和传统文化"
                    }
                ]
                
                travel_data = {
                    "plans": fallback_plans,
                    "destination": destination,
                    "budget": budget,
                    "days": days,
                    "preferences": preferences,
                    "note": "AI响应解析失败，返回默认方案"
                }
                
                return f"TRAVEL_PLANS_JSON:{json.dumps(travel_data, ensure_ascii=False)}"
                
        except Exception as e:
            logger.error(f"[旅行规划] 生成旅行方案失败: {e}")
            
            # 出现错误时也提供一个基础方案
            error_plans = [
                {
                    "id": 1,
                    "title": f"{destination} 基础旅行方案",
                    "description": f"为您准备的{days}天{destination}旅行计划",
                    "highlights": ["当地景点游览", "特色美食体验", "文化活动参与", "购物休闲"],
                    "price": int(float(budget) * 0.9),
                    "itinerary": f"第1天：抵达{destination}\\n第2-{days-1}天：深度游览\\n第{days}天：返程",
                    "aiReason": "AI生成遇到问题，为您提供基础旅行方案"
                }
            ]
            
            travel_data = {
                "plans": error_plans,
                "destination": destination,
                "budget": budget,
                "days": days,
                "preferences": preferences,
                "error": str(e)
            }
            
            return f"TRAVEL_PLANS_JSON:{json.dumps(travel_data, ensure_ascii=False)}"
    
    # 创建动作列表（部分需要审批）
    actions = [
        # 直接执行的工具（无需审批）
        Action(
            name="get_current_time",
            description="获取当前时间，可指定时区（无需审批）",
            parameters=[
                Parameter(
                    name="timezone",
                    type="string",
                    description="时区，例如: UTC, Asia/Shanghai, America/New_York",
                    required=False
                )
            ],
            handler=get_current_time
        ),
        Action(
            name="get_user_info",
            description="获取用户信息 注意：此工具需要人工审批，执行前会显示审批提示。",
            parameters=[
                Parameter(
                    name="user_id",
                    type="string",
                    description="用户ID，可选值: default, admin, user1",
                    required=False
                )
            ],
            handler=get_user_info
        ),
        
        # 审批决定处理工具
        Action(
            name="handle_approval",
            description="【重要】只有当用户在最新消息中明确输入了'y'、'yes'、'同意'、'是'、'n'、'no'、'拒绝'、'否'等审批决定时，才能调用此工具。绝对不要在显示审批消息后立即调用此工具，必须等待用户的实际回复。如果用户没有明确输入审批决定，就不要调用此工具。",
            parameters=[
                Parameter(
                    name="decision",
                    type="string",
                    description="用户在最新消息中明确输入的审批决定，必须是以下值之一: 'y', 'yes', '同意', '是', 'n', 'no', '拒绝', '否'。只有用户真正输入了这些词时才使用。",
                    required=True
                ),
                Parameter(
                    name="approval_id",
                    type="string",
                    description="可选的审批ID（部分即可），如果不提供则处理最新的审批请求",
                    required=False
                )
            ],
            handler=handle_approval
        ),
        
        # 需要审批的工具
        Action(
            name="calculate",
            description="计算数学表达式，支持基本的四则运算。注意：此工具需要人工审批，执行前会显示审批提示。",
            parameters=[
                Parameter(
                    name="expression",
                    type="string",
                    description="要计算的数学表达式，例如: 2+3*4, (10-5)/2",
                    required=True
                )
            ],
            handler=calculate
        ),
        Action(
            name="check_status",
            description="检查系统或服务状态。注意：此工具需要人工审批，执行前会显示审批提示。",
            parameters=[
                Parameter(
                    name="service",
                    type="string",
                    description="服务名称，可选值: system, database, api, cache",
                    required=False
                )
            ],
            handler=check_status
        ),
        
        # 旅行规划工具 - 直接在对话中生成并触发interrupt
        Action(
            name="generateTravelPlan",
            description="AI智能旅行规划 - 根据目的地、预算等信息，生成多个个性化旅行方案并通过弹窗卡片供用户选择",
            parameters=[
                Parameter(
                    name="destination",
                    type="string",
                    description="旅行目的地，例如: 东京, 巴黎, 纽约, 北京",
                    required=True
                ),
                Parameter(
                    name="budget",
                    type="string",
                    description="预算金额（人民币），例如: 10000, 15000, 20000",
                    required=False
                ),
                Parameter(
                    name="days",
                    type="integer",
                    description="旅行天数，例如: 7, 10, 14",
                    required=False
                ),
                Parameter(
                    name="preferences",
                    type="string",
                    description="旅行偏好，例如: 文化体验, 美食之旅, 自然风光, 购物休闲",
                    required=False
                )
            ],
            handler=generate_travel_plan
        )
    ]
    
    return actions


def main():
    """主函数"""
    logger.info("🚀 启动CopilotKit Debug Example (使用 create_copilot_app API)")
    
    try:
        # 获取DeepSeek API密钥
        deepseek_api_key = os.getenv("DEEPSEEK_API_KEY")
        if not deepseek_api_key or deepseek_api_key == "test_key":
            logger.warning("⚠️ 未设置有效的DEEPSEEK_API_KEY环境变量")
            # 可以继续运行，但聊天功能将不可用
            deepseek_api_key = "test_key"
        
        # 创建DeepSeek适配器
        deepseek_adapter = DeepSeekAdapter(
            api_key=deepseek_api_key,
            model=os.getenv("DEEPSEEK_MODEL", "deepseek-chat"),
            base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")
        )
        
        # 创建演示动作
        demo_actions = create_demo_actions()
        
        # 创建运行时
        runtime = CopilotRuntime(
            CopilotRuntimeConstructorParams(
                actions=demo_actions
            )
        )
        
        # 配置对话式审批系统
        conversational_approval_manager = get_approval_manager()
        approval_middleware = ApprovalMiddleware(
            approval_required_tools={"calculate", "get_user_info","check_status"},
            approval_manager=conversational_approval_manager
        )
        runtime.approval_middleware = approval_middleware
        
        logger.info("🔐 已配置对话式审批系统，需要审批的工具: check_status, calculate, get_user_info")
        
        # 使用 create_copilot_app API 创建应用
        app = create_copilot_app(
            runtime=runtime,
            service_adapter=deepseek_adapter,
            title="CopilotKit Debug Example (New API)",
            version="0.1.0",
            cors_origins=["*"],
            prefix="/api/copilotkit"
        )
        
        # 添加自定义路由
        @app.get("/debug/new-api")
        async def debug_new_api():
            """调试新API端点"""
            return {
                "message": "使用新的 create_copilot_app API 创建的应用",
                "api": "create_copilot_app",
                "runtime": "CopilotKit Python Runtime",
                "version": "0.1.0",
                "actions_count": len(demo_actions),
                "actions": [action.name for action in demo_actions],
                "timestamp": datetime.utcnow().isoformat()
            }

        # ================================
        # 审批系统API端点（对话式审批）
        # ================================

        @app.get("/api/approvals/pending")
        async def get_pending_approvals():
            """获取所有待审批的工具调用"""
            approval_manager = get_approval_manager()
            pending = approval_manager.get_pending_approvals()
            return {
                "pending_count": len(pending),
                "pending_requests": [
                    {
                        "approval_id": pending_call.approval_id,
                        "session_id": pending_call.session_id,
                        "tool_name": pending_call.tool_name,
                        "arguments": pending_call.arguments,
                        "timestamp": pending_call.timestamp,
                    }
                    for pending_call in pending.values()
                ]
            }

        @app.get("/api/approvals/status")
        async def get_approval_status():
            """获取审批系统状态"""
            approval_manager = get_approval_manager()
            pending = approval_manager.get_pending_approvals()
            return {
                "status": "running",
                "pending_count": len(pending),
                "total_capacity": 100,  # 假设最大支持100个待审批
                "uptime": "running since server start",
                "approval_type": "conversational",
                "features": {
                    "conversational_approval": True,
                    "chat_based_decisions": True,
                    "approval_timeout": None
                }
            }

        # ================================
        # 旧的AI旅行规划API端点已移除
        # 现在使用对话中的generateTravelPlan动作
        # ================================
        
        logger.info(f"✅ 创建CopilotRuntime成功，注册了 {len(demo_actions)} 个动作")
        for action in demo_actions:
            logger.info(f"   - {action.name}: {type(action.handler).__name__}")
        
        # 检查审批中间件是否正确配置
        if runtime.approval_middleware:
            logger.info(f"🔐 审批中间件配置:")
            logger.info(f"   - 需要审批的工具: {list(runtime.approval_middleware.approval_required_tools)}")
            logger.info(f"   - 审批管理器类型: {type(runtime.approval_middleware.approval_manager).__name__}")
        
        logger.info(f"🔧 配置DeepSeek适配器: {deepseek_adapter.model}")
        logger.info("🌐 使用 create_copilot_app API 创建FastAPI应用")
        
        # 启动服务器
        port = int(os.getenv("SERVER_PORT", "8005"))  # 支持环境变量配置端口
        host = "localhost"
        
        logger.info(f"📡 服务器配置:")
        logger.info(f"   - 地址: {host}:{port}")
        logger.info(f"   - API文档: http://{host}:{port}/docs") 
        logger.info(f"   - 健康检查: http://{host}:{port}/api/health")
        logger.info(f"   - 新API调试: http://{host}:{port}/debug/new-api")
        logger.info(f"   - CopilotKit Hello: http://{host}:{port}/copilotkit/hello")
        logger.info(f"🔐 审批系统API端点:")
        logger.info(f"   - 待审批列表: http://{host}:{port}/api/approvals/pending")
        logger.info(f"   - 审批工具调用: POST http://{host}:{port}/api/approvals/approve")
        logger.info(f"   - 取消审批: DELETE http://{host}:{port}/api/approvals/{{approval_id}}")
        logger.info(f"   - 审批系统状态: http://{host}:{port}/api/approvals/status")
        
        uvicorn.run(
            app,
            host=host,
            port=port,
            log_level="info",
            reload=False
        )
        
    except Exception as e:
        logger.error(f"❌ 启动失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main() 