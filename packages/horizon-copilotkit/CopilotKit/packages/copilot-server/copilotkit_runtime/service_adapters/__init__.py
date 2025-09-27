"""Service adapters for different AI providers."""

from .base import ServiceAdapter, CopilotServiceAdapter
from .deepseek import DeepSeekAdapter


__all__ = [
    "ServiceAdapter",
    "CopilotServiceAdapter", 
    "DeepSeekAdapter",
    "OpenAIAdapter"
]