"""Response data models."""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union, AsyncIterator
from pydantic import BaseModel
from .messages import Message
from .enums import MessageStatusCode


class SuccessResponseStatus(BaseModel):
    """Success response status."""
    code: str = "success"


class FailedResponseStatus(BaseModel):
    """Failed response status.""" 
    code: str = "failed"
    reason: str


class GuardrailsValidationFailureResponse(BaseModel):
    """Guardrails validation failure response."""
    code: str = "guardrails_validation_failure"
    guardrails_reason: str


class MessageStreamInterruptedResponse(BaseModel):
    """Message stream interrupted response."""
    code: str = "message_stream_interrupted"
    message_id: Optional[str] = None


class UnknownErrorResponse(BaseModel):
    """Unknown error response."""
    code: str = "unknown_error"
    description: str


class GuardrailsResult(BaseModel):
    """Guardrails validation result."""
    status: str  # "allowed" or "denied"
    reason: Optional[str] = None


class CopilotResponse(BaseModel):
    """Main copilot response model."""
    thread_id: str
    run_id: str
    status: Union[
        SuccessResponseStatus,
        FailedResponseStatus, 
        GuardrailsValidationFailureResponse,
        MessageStreamInterruptedResponse,
        UnknownErrorResponse
    ]
    extensions: Optional[Dict[str, Any]] = None
    meta_events: Optional[AsyncIterator[Dict[str, Any]]] = None
    messages: Optional[AsyncIterator[Message]] = None
    
    class Config:
        arbitrary_types_allowed = True


class Agent(BaseModel):
    """Agent information model."""
    name: str
    description: Optional[str] = None
    version: Optional[str] = None


class AgentsResponse(BaseModel):
    """Available agents response."""
    agents: List[Agent]


class StreamEvent(BaseModel):
    """Base streaming event model."""
    type: str
    data: Dict[str, Any]


class SSEMessage(BaseModel):
    """Server-Sent Event message model."""
    event: Optional[str] = None
    data: str
    id: Optional[str] = None
    retry: Optional[int] = None