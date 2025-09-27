"""Enumeration types for the API."""

from enum import Enum
from typing import Union


class MessageRole(str, Enum):
    """Message role enumeration."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
    FUNCTION = "function"
    TOOL = "tool"


class ActionInputAvailability(str, Enum):
    """Action input availability enumeration."""
    ENABLED = "enabled"
    DISABLED = "disabled"


class CopilotRequestType(str, Enum):
    """Copilot request type enumeration."""
    CHAT = "chat"
    TEXTAREA = "textarea"
    POPUP = "popup"


class MessageStatusCode(str, Enum):
    """Message status code enumeration."""
    SUCCESS = "success"
    FAILED = "failed"
    PENDING = "pending"




class LangGraphEventTypes(str, Enum):
    """LangGraph event types enumeration."""
    ON_INTERRUPT = "on_interrupt"


# Type aliases for union types
MessageStatusUnion = Union["SuccessMessageStatus", "FailedMessageStatus"]
ResponseStatusUnion = Union["SuccessResponseStatus", "FailedResponseStatus"]