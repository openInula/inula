"""Base service adapter interface."""

from abc import ABC, abstractmethod
from typing import Any, AsyncIterator, Dict, List, Optional
from pydantic import BaseModel


class CopilotServiceAdapter(ABC):
    """Abstract base class for CopilotKit service adapters."""
    
    @abstractmethod
    async def process(self, request: Any) -> Any:
        """Process a copilot runtime chat completion request."""
        pass


class ServiceAdapter(ABC):
    """Legacy abstract base class for service adapters."""
    
    def __init__(self, api_key: str, model: Optional[str] = None, **kwargs):
        """Initialize the service adapter."""
        self.api_key = api_key
        self.model = model
        self.config = kwargs
    
    @abstractmethod
    async def generate_response(
        self,
        messages: List[Dict[str, Any]],
        actions: Optional[List[Dict[str, Any]]] = None,
        **kwargs
    ) -> AsyncIterator[Dict[str, Any]]:
        """Generate a response from the service."""
        pass
    
    @abstractmethod
    async def stream_response(
        self,
        messages: List[Dict[str, Any]],
        actions: Optional[List[Dict[str, Any]]] = None,
        **kwargs
    ) -> AsyncIterator[Dict[str, Any]]:
        """Stream a response from the service."""
        pass
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the model."""
        return {
            "model": self.model,
            "provider": self.__class__.__name__,
            "api_key_provided": bool(self.api_key)
        }