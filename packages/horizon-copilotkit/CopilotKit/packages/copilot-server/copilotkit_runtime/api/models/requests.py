"""Request data models."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from .messages import MessageInput
from .enums import CopilotRequestType


class GenerateCopilotResponseMetadataInput(BaseModel):
    """Metadata for copilot response generation."""
    request_type: Optional[CopilotRequestType] = None


class ActionInput(BaseModel):
    """Action input model."""
    name: str
    description: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    available: Optional[str] = None


class FrontendInput(BaseModel):
    """Frontend input model."""
    actions: List[ActionInput] = []
    url: Optional[str] = None


class GuardrailsInput(BaseModel):
    """Guardrails input model."""
    input_validation_rules: Optional[Dict[str, List[str]]] = None


class CloudInput(BaseModel):
    """Cloud input model."""
    guardrails: Optional[GuardrailsInput] = None


class ForwardedParametersInput(BaseModel):
    """Forwarded parameters input model."""
    parameters: Optional[Dict[str, Any]] = None


class AgentSessionInput(BaseModel):
    """Agent session input model."""
    session_id: Optional[str] = None
    agent_name: Optional[str] = None


class AgentStateInput(BaseModel):
    """Agent state input model."""
    agent_name: str
    state: Dict[str, Any]
    thread_id: Optional[str] = None
    run_id: Optional[str] = None


class ExtensionsInput(BaseModel):
    """Extensions input model."""
    extensions: Optional[Dict[str, Any]] = None


class MetaEventInput(BaseModel):
    """Meta event input model."""
    type: str
    name: str
    data: Optional[Dict[str, Any]] = None


class GenerateCopilotResponseInput(BaseModel):
    """Main input model for copilot response generation."""
    metadata: GenerateCopilotResponseMetadataInput
    thread_id: Optional[str] = None
    run_id: Optional[str] = None
    messages: List[MessageInput]
    frontend: FrontendInput
    cloud: Optional[CloudInput] = None
    forwarded_parameters: Optional[ForwardedParametersInput] = None
    agent_session: Optional[AgentSessionInput] = None
    agent_state: Optional[AgentStateInput] = None
    agent_states: Optional[List[AgentStateInput]] = None
    extensions: Optional[ExtensionsInput] = None
    meta_events: Optional[List[MetaEventInput]] = None