"""Message data models."""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field
from .enums import MessageRole, MessageStatusCode


class BaseMessage(BaseModel):
    """Base message model."""
    id: str
    created_at: datetime
    status: Optional[Union["SuccessMessageStatus", "FailedMessageStatus"]] = None


class TextMessage(BaseMessage):
    """Text message model."""
    content: Union[str, List[str]]
    role: MessageRole
    parent_message_id: Optional[str] = None


class ActionExecutionMessage(BaseMessage):
    """Action execution message model."""
    name: str
    arguments: Union[str, List[str]]
    parent_message_id: Optional[str] = None


class ResultMessage(BaseMessage):
    """Action result message model."""
    action_execution_id: str
    action_name: str
    result: Any


class AgentStateMessage(BaseMessage):
    """Agent state message model."""
    thread_id: str
    agent_name: str
    node_name: str
    run_id: str
    active: bool
    state: Dict[str, Any]
    running: bool
    role: MessageRole = MessageRole.ASSISTANT


# Union type for all message types
Message = Union[TextMessage, ActionExecutionMessage, ResultMessage, AgentStateMessage]


class MessageInput(BaseModel):
    """Input model for messages."""
    text_message: Optional["TextMessageInput"] = None
    action_execution_message: Optional["ActionExecutionMessageInput"] = None
    result_message: Optional["ResultMessageInput"] = None
    agent_state_message: Optional["AgentStateMessageInput"] = None


class TextMessageInput(BaseModel):
    """Text message input model."""
    id: Optional[str] = None
    content: str
    role: MessageRole


class ActionExecutionMessageInput(BaseModel):
    """Action execution message input model."""
    id: Optional[str] = None
    name: str
    arguments: str


class ResultMessageInput(BaseModel):
    """Result message input model."""
    id: Optional[str] = None
    action_execution_id: str
    action_name: str
    result: Any


class AgentStateMessageInput(BaseModel):
    """Agent state message input model."""
    id: Optional[str] = None
    thread_id: str
    agent_name: str
    node_name: str
    run_id: str
    active: bool
    state: Dict[str, Any]
    running: bool


class SuccessMessageStatus(BaseModel):
    """Success message status."""
    code: MessageStatusCode = MessageStatusCode.SUCCESS


class FailedMessageStatus(BaseModel):
    """Failed message status."""
    code: MessageStatusCode = MessageStatusCode.FAILED
    reason: str


class PendingMessageStatus(BaseModel):
    """Pending message status."""
    code: MessageStatusCode = MessageStatusCode.PENDING