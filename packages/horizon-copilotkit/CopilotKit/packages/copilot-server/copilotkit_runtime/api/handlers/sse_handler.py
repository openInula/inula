"""Server-Sent Events handler."""

import json
import asyncio
from typing import Any, AsyncIterator, Dict, Optional
from ..models.responses import SSEMessage


class SSEHandler:
    """Handle Server-Sent Events streaming."""
    
    @staticmethod
    def format_sse_message(
        data: Any,
        event: Optional[str] = None,
        id: Optional[str] = None,
        retry: Optional[int] = None
    ) -> str:
        """Format data as SSE message."""
        lines = []
        
        if id is not None:
            lines.append(f"id: {id}")
        
        if event is not None:
            lines.append(f"event: {event}")
        
        if retry is not None:
            lines.append(f"retry: {retry}")
        
        # Handle data serialization
        if isinstance(data, (dict, list)):
            data_str = json.dumps(data)
        else:
            data_str = str(data)
        
        # Split multi-line data
        for line in data_str.split('\n'):
            lines.append(f"data: {line}")
        
        return '\n'.join(lines) + '\n\n'
    
    @staticmethod
    async def stream_sse_messages(
        messages: AsyncIterator[SSEMessage]
    ) -> AsyncIterator[str]:
        """Stream SSE messages as formatted strings."""
        async for message in messages:
            yield SSEHandler.format_sse_message(
                data=message.data,
                event=message.event,
                id=message.id,
                retry=message.retry
            )
    
    @staticmethod
    def create_error_message(error: str, details: Optional[str] = None) -> SSEMessage:
        """Create an error SSE message."""
        return SSEMessage(
            event="error",
            data=json.dumps({
                "error": error,
                "details": details
            })
        )
    
    @staticmethod
    def create_completion_message() -> SSEMessage:
        """Create a completion SSE message."""
        return SSEMessage(
            event="complete",
            data=json.dumps({"status": "completed"})
        )