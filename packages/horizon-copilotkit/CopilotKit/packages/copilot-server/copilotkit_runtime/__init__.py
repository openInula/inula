"""
CopilotKit Runtime Python

The Python runtime for integrating powerful AI Copilots into any application.
Easily implement custom AI Chatbots, AI Agents, AI Textareas, and more.
"""

__version__ = "1.8.15"
__author__ = "CopilotKit Team"
__email__ = "team@copilotkit.ai"
__license__ = "MIT"

# Core exports
from .lib.runtime.copilot_runtime import (
    CopilotRuntime,
    CopilotRuntimeConfig,
    CopilotRuntimeConstructorParams,
    copilot_kit_endpoint,
    langgraph_platform_endpoint,
    flatten_tool_calls_no_duplicates
)

# Service adapter exports
from .service_adapters import (
    ServiceAdapter,
    CopilotServiceAdapter,
    DeepSeekAdapter,
    
)

# API exports
from .api.handlers import CopilotHandler, SSEHandler
from .api.models.requests import GenerateCopilotResponseInput
from .api.models.responses import CopilotResponse

# State management exports
from .lib.state_manager import StateManager, MessageStatusManager

# Integration exports  
from .lib.integrations import fastapi_integration, create_copilot_app, CopilotRuntimeServer

# Logging exports
from .lib.logging import LoggingConfig, Logger

# Types exports
from .lib.types import (
    Message,
    Role,
    ActionInput,
    ActionResult,
    Action,
    Parameter,
    AgentState,
    StreamingResponse,
)

# Approval system exports
from .lib.approval import (
    ApprovalManager,
    ApprovalMiddleware,
    PendingToolCall,
    ApprovalRequest,
    ApprovalResponse,
    ApprovalStatus,
    ConversationalApprovalManager,
    create_conversational_approval_wrapper,
    create_approval_decision_handler,
    get_conversational_approval_manager
)

# Exception exports
from .lib.exceptions import ApprovalRequiredError

__all__ = [
    "__version__",
    "__author__", 
    "__email__",
    "__license__",
    # Core
    "CopilotRuntime",
    "CopilotRuntimeConfig",
    "CopilotRuntimeConstructorParams",
    "copilot_kit_endpoint",
    "langgraph_platform_endpoint",
    "flatten_tool_calls_no_duplicates",
    # Service Adapters
    "ServiceAdapter", 
    "CopilotServiceAdapter",
    "DeepSeekAdapter",
    # API
    "CopilotHandler",
    "SSEHandler",
    "GenerateCopilotResponseInput",
    "CopilotResponse",
    # State Management
    "StateManager",
    "MessageStatusManager",
    # Integrations
    "fastapi_integration",
    "create_copilot_app",
    "CopilotRuntimeServer",
    # Logging
    "LoggingConfig",
    "Logger",
    # Types
    "Message",
    "Role", 
    "ActionInput",
    "ActionResult",
    "Action",
    "Parameter",
    "AgentState",
    "StreamingResponse",
    # Approval System
    "ApprovalManager",
    "ApprovalMiddleware",
    "PendingToolCall",
    "ApprovalRequest",
    "ApprovalResponse",
    "ApprovalStatus",
    "ConversationalApprovalManager",
    "create_conversational_approval_wrapper",
    "create_approval_decision_handler",
    "get_conversational_approval_manager",
    # Exceptions
    "ApprovalRequiredError",
]