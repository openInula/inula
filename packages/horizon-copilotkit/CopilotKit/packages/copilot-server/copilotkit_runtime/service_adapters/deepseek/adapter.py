"""
Copilot Runtime adapter for DeepSeek.

## Example

```python
from copilotkit_runtime import CopilotRuntime, DeepSeekAdapter

copilot_kit = CopilotRuntime()

# Option 1: Using OpenAI-compatible client
import openai
deepseek = openai.OpenAI(
    api_key="<your-deepseek-api-key>",
    base_url="https://api.deepseek.com/v1",
)
adapter = DeepSeekAdapter(openai=deepseek)

# Option 2: Direct configuration
adapter = DeepSeekAdapter(api_key="<your-deepseek-api-key>")
```

## Available Models

DeepSeek supports the following models:
- deepseek-chat (default): DeepSeek's flagship model optimized for chat
- deepseek-coder: Specialized for code generation and understanding  
- deepseek-reasoner: Enhanced reasoning capabilities
"""

import json
import uuid
from typing import Any, Dict, List, Optional, Union, AsyncIterator
import httpx
import structlog
from pydantic import BaseModel

from ...lib.types import Message, RuntimeEventSource
from ...lib.types.runtime import ExtensionsResponse
from ...api.models.requests import ActionInput, ForwardedParametersInput, ExtensionsInput, AgentSessionInput, AgentStateInput
from ..base import ServiceAdapter, CopilotServiceAdapter


logger = structlog.get_logger(__name__)

DEFAULT_MODEL = "deepseek-chat"
DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1"

# DeepSeek model token limits
MAX_TOKENS_BY_MODEL = {
    "deepseek-chat": 32000,
    "deepseek-coder": 32000,
    "deepseek-reasoner": 32000,
}
DEFAULT_MAX_TOKENS = 32000


class DeepSeekAdapterParams(BaseModel):
    """Parameters for DeepSeek adapter configuration."""
    
    openai: Optional[Any] = None  # OpenAI-compatible client
    api_key: Optional[str] = None
    model: str = DEFAULT_MODEL
    disable_parallel_tool_calls: bool = False
    base_url: str = DEEPSEEK_BASE_URL
    headers: Optional[Dict[str, str]] = None
    
    class Config:
        arbitrary_types_allowed = True


class CopilotRuntimeChatCompletionRequest(BaseModel):
    """Request interface for chat completion."""
    
    event_source: RuntimeEventSource
    messages: List[Message]
    actions: List[ActionInput]
    model: Optional[str] = None
    thread_id: Optional[str] = None
    run_id: Optional[str] = None
    forwarded_parameters: Optional[ForwardedParametersInput] = None
    extensions: Optional[ExtensionsInput] = None
    agent_session: Optional[AgentSessionInput] = None
    agent_states: Optional[List[AgentStateInput]] = None
    
    class Config:
        arbitrary_types_allowed = True


class CopilotRuntimeChatCompletionResponse(BaseModel):
    """Response interface for chat completion."""
    
    thread_id: str
    run_id: Optional[str] = None
    extensions: Optional[ExtensionsResponse] = None


class DeepSeekAdapter(CopilotServiceAdapter, ServiceAdapter):
    """Service adapter for DeepSeek AI models with full TypeScript equivalence."""
    
    def __init__(self, params: Optional[DeepSeekAdapterParams] = None, **kwargs):
        """Initialize the DeepSeek adapter."""
        if params is None:
            params = DeepSeekAdapterParams(**kwargs)
        
        # Initialize logger first
        self.logger = logger.bind(component="DeepSeekAdapter")
        
        # Store parameters
        self.model = params.model
        self.disable_parallel_tool_calls = params.disable_parallel_tool_calls
        self.base_url = params.base_url
        self.api_key = params.api_key
        
        # Initialize client
        if params.openai:
            self._client = params.openai
            self.logger.info("🔗 Using provided OpenAI client")
        else:
            if not params.api_key:
                raise ValueError("DeepSeek API key is required when openai instance is not provided")
            
            # Check if API key is valid (not a test key)
            if params.api_key == "test_key":
                self.logger.warning("⚠️ Using test API key - DeepSeek API calls will fail!")
            
            custom_http_client = httpx.AsyncClient(
                verify=False,
                timeout=60.0
            )

            # Create OpenAI client for DeepSeek API
            try:
                from openai import AsyncOpenAI
                self._client = AsyncOpenAI(
                    api_key=params.api_key,
                    base_url=params.base_url,
                    timeout=60.0,
                    http_client=custom_http_client
                )
                self.logger.info(f"🔗 Created OpenAI client for DeepSeek API: {params.base_url}")
            except ImportError:
                # Fallback to HTTP client if openai package is not available
                self._http_client = httpx.AsyncClient(
                    base_url=params.base_url,
                    verify=False,
                    headers={
                        "Authorization": f"Bearer {params.api_key}",
                        "User-Agent": "CopilotKit-DeepSeek-Adapter",
                        "Content-Type": "application/json",
                        **(params.headers or {})
                    },
                    timeout=60.0
                )
                self._client = None
                self.logger.info(f"🔗 Created HTTP client for DeepSeek API: {params.base_url}")
        
        super().__init__(params.api_key or "", params.model)
    
    async def process(self, request: CopilotRuntimeChatCompletionRequest) -> CopilotRuntimeChatCompletionResponse:
        """Process a chat completion request with full TypeScript equivalence."""
        self.logger.info("🚀 DeepSeekAdapter.process() method called!")
        
        thread_id_from_request = request.thread_id
        model = request.model or self.model
        messages = request.messages
        actions = request.actions
        event_source = request.event_source
        forwarded_parameters = request.forwarded_parameters
        
        self.logger.info("Processing request", 
                        thread_id=thread_id_from_request,
                        model=model,
                        messages_count=len(messages),
                        actions_count=len(actions),
                        timestamp=str(uuid.uuid4()))
        
        # Convert actions to OpenAI tools
        tools = [self._convert_action_input_to_openai_tool(action) for action in actions]
        thread_id = thread_id_from_request or str(uuid.uuid4())
        
        # Filter messages using allowlist approach
        valid_tool_use_ids = set()
        
        # Extract valid tool_call IDs
        for message in messages:
            if message.is_action_execution_message():
                valid_tool_use_ids.add(message.id)
        
        # Filter messages, keeping only those with valid tool_call IDs
        filtered_messages = []
        for message in messages:
            if message.is_result_message():
                # Skip if there's no corresponding tool_call
                if message.action_execution_id not in valid_tool_use_ids:
                    continue
                # Remove this ID from valid IDs so we don't process duplicates
                valid_tool_use_ids.discard(message.action_execution_id)
                filtered_messages.append(message)
            else:
                # Keep all non-tool-result messages
                filtered_messages.append(message)
        
        # Convert messages to OpenAI format
        openai_messages = [
            self._convert_message_to_openai_message(m, keep_system_role=True) 
            for m in filtered_messages
        ]
        
        # DeepSeek compatibility fix: convert unsupported 'developer' role to 'system'
        openai_messages = [
            {**msg, "role": "system"} if msg.get("role") == "developer" else msg
            for msg in openai_messages
        ]
        
        # Limit messages to token count
        openai_messages = self._limit_messages_to_token_count(openai_messages, tools, model)
        
        # Handle tool choice
        tool_choice = None
        if forwarded_parameters and forwarded_parameters.tool_choice:
            if forwarded_parameters.tool_choice == "function":
                tool_choice = {
                    "type": "function",
                    "function": {"name": forwarded_parameters.tool_choice_function_name}
                }
            else:
                tool_choice = forwarded_parameters.tool_choice
        
        self.logger.info("Sending request to API",
                        model=model,
                        messages_count=len(openai_messages),
                        tools_count=len(tools),
                        messages_preview=[
                            {
                                "role": m.get("role"),
                                "content": str(m.get("content", ""))[:100] + "..." if len(str(m.get("content", ""))) > 100 else str(m.get("content", ""))
                            }
                            for m in openai_messages[:3]
                        ])
        
        try:
            # Prepare request payload
            request_payload = {
                "model": model,
                "stream": True,
                "messages": openai_messages,
            }
            
            if tools:
                request_payload["tools"] = tools
                # Add detailed tools logging
                self.logger.info("🔧 Tools being sent to DeepSeek API", 
                               tools_count=len(tools),
                               tools_summary=[{
                                   "name": tool.get("function", {}).get("name", "unknown"),
                                   "parameters_type": type(tool.get("function", {}).get("parameters", {})),
                                   "parameters_keys": list(tool.get("function", {}).get("parameters", {}).keys()) if isinstance(tool.get("function", {}).get("parameters"), dict) else "not_dict"
                               } for tool in tools])
                
                # Log full tools for debugging (first tool only to avoid spam)
                if tools:
                    self.logger.info("🔧 First tool full structure", tool=tools[0])
            
            if forwarded_parameters:
                if forwarded_parameters.max_tokens:
                    request_payload["max_tokens"] = forwarded_parameters.max_tokens
                if forwarded_parameters.stop:
                    request_payload["stop"] = forwarded_parameters.stop
                if forwarded_parameters.temperature:
                    # DeepSeek temperature range
                    request_payload["temperature"] = max(0.1, min(2.0, forwarded_parameters.temperature))
            
            if tool_choice:
                request_payload["tool_choice"] = tool_choice
            
            if self.disable_parallel_tool_calls:
                request_payload["parallel_tool_calls"] = False
            
            self.logger.debug("API Request payload", payload=request_payload)
            
            # Stream the response
            self.logger.info("📡 Calling DeepSeek API...", payload_keys=list(request_payload.keys()))
            
            # Check if we should simulate response for test key
            if self.api_key == "test_key":
                await self._simulate_test_response(event_source)
                return CopilotRuntimeChatCompletionResponse(thread_id=thread_id)
            
            # Use OpenAI client if available, otherwise use HTTP client
            if self._client:
                self.logger.info("🔄 Using OpenAI client streaming...")
                # Create the OpenAI stream outside the event handler (matching original logic)
                stream = await self._client.chat.completions.create(**request_payload)
                self.logger.info("🔄 OpenAI stream created successfully, starting to process...")
                await self._stream_response_with_openai(stream, event_source)
            else:
                # Create the HTTP stream outside the event handler
                self.logger.info("🔄 Creating HTTP stream...")
                http_response_stream = self._http_client.stream(
                    "POST",
                    "/chat/completions",
                    json=request_payload
                )
                
                self.logger.info("🔄 HTTP stream created successfully, starting to process...")
                
                # Process the stream with the response object
                await self._stream_response(http_response_stream, event_source)
            
            return CopilotRuntimeChatCompletionResponse(thread_id=thread_id)
            
        except Exception as error:
            self.logger.error("DeepSeek API error", error=str(error), exc_info=True)
            # Send error to event stream for better debugging
            try:
                await self._send_error_to_stream(event_source, f"DeepSeek API error: {str(error)}")
            except Exception as stream_error:
                self.logger.error("Failed to send error to stream", error=str(stream_error))
            raise Exception(f"DeepSeek API request failed: {str(error)}")
    
    async def _send_error_to_stream(self, event_source: RuntimeEventSource, error_message: str):
        """Send error message to event stream."""
        async def error_handler(event_stream):
            error_id = str(uuid.uuid4())
            event_stream.send_text_message_start(error_id)
            event_stream.send_text_message_content(error_id, f"❌ Error: {error_message}")
            event_stream.send_text_message_end(error_id)
            if hasattr(event_stream, 'complete'):
                event_stream.complete()
            elif hasattr(event_stream, 'on_completed'):
                event_stream.on_completed()
        
        await event_source.stream(error_handler)
    
    async def _simulate_test_response(self, event_source: RuntimeEventSource):
        """Simulate a test response when using test API key."""
        async def stream_handler(event_stream):
            self.logger.info("🧪 Simulating response for test key")
            # Simulate a simple text response
            test_message_id = str(uuid.uuid4())
            event_stream.send_text_message_start(test_message_id)
            event_stream.send_text_message_content(test_message_id, 
                "Hello! This is a test response from DeepSeek adapter (no valid API key configured). Please set DEEPSEEK_API_KEY environment variable to use real DeepSeek API.")
            event_stream.send_text_message_end(test_message_id)
            if hasattr(event_stream, 'complete'):
                event_stream.complete()
            elif hasattr(event_stream, 'on_completed'):
                event_stream.on_completed()
        
        await event_source.stream(stream_handler)
    
    async def _stream_response(self, http_response_stream, event_source: RuntimeEventSource):
        """Stream response from DeepSeek API with full TypeScript equivalence."""
        
        async def stream_handler(event_stream):
            mode = None  # "function" | "message" | None
            current_message_id = ""
            current_tool_call_id = ""
            current_action_name = ""
            accumulated_content = ""  # 累加内容，匹配 TypeScript 版本
            
            try:
                self.logger.info("🔄 Starting stream iteration...")
                chunk_count = 0
                
                async with http_response_stream as response:
                    self.logger.info(f"🌐 HTTP Response status: {response.status_code}")
                    
                    if not response.is_success:
                        error_data = await response.aread()
                        error_text = error_data.decode('utf-8') if isinstance(error_data, bytes) else str(error_data)
                        self.logger.error(f"DeepSeek API HTTP error: {response.status_code} - {error_text}")
                        
                        # Try to parse error as JSON for better debugging
                        try:
                            error_json = json.loads(error_text)
                            self.logger.error("🔍 DeepSeek API error details", error_json=error_json)
                            
                            # Look for schema validation errors specifically
                            if "error" in error_json:
                                error_details = error_json["error"]
                                if isinstance(error_details, dict):
                                    if "message" in error_details:
                                        self.logger.error("🔍 Error message", message=error_details["message"])
                                    if "type" in error_details:
                                        self.logger.error("🔍 Error type", error_type=error_details["type"])
                                    if "code" in error_details:
                                        self.logger.error("🔍 Error code", code=error_details["code"])
                        except json.JSONDecodeError:
                            self.logger.error("🔍 Could not parse error response as JSON")
                        
                        raise Exception(f"DeepSeek API error: {response.status_code} - {error_text}")
                    
                    async for line in response.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        
                        data_str = line[6:].strip()  # Remove "data: " prefix
                        
                        if data_str == "[DONE]":
                            self.logger.info(f"Stream completed after {chunk_count} chunks")
                            break
                        
                        try:
                            chunk = json.loads(data_str)
                        except json.JSONDecodeError as e:
                            self.logger.warning(f"Failed to parse JSON chunk: {data_str[:100]}... - {str(e)}")
                            continue
                        
                        chunk_count += 1
                        
                        if not chunk.get("choices"):
                            continue
                        
                        choice = chunk["choices"][0]
                        delta = choice.get("delta", {})
                        tool_calls = delta.get("tool_calls")
                        content = delta.get("content")
                        finish_reason = choice.get("finish_reason")
                        
                        tool_call = tool_calls[0] if tool_calls else None
                        
                        self.logger.debug(f"Received chunk #{chunk_count}",
                                        choices_length=len(chunk.get("choices", [])),
                                        finish_reason=finish_reason,
                                        has_tool_call=bool(tool_call),
                                        has_content=bool(content))
                        
                        # Check if should end stream
                        if finish_reason:
                            self.logger.info(f"Finish reason detected: {finish_reason}")
                        
                        # Mode switching logic from TypeScript
                        if mode == "message" and tool_call and tool_call.get("id"):
                            self.logger.debug("Switching from message to function mode")
                            mode = None
                            accumulated_content = ""  # 重置累加内容
                            event_stream.send_text_message_end(message_id=current_message_id)
                        elif mode == "function" and (not tool_call or tool_call.get("id")):
                            self.logger.debug("Switching from function to message mode")
                            mode = None
                            event_stream.send_action_execution_end(action_execution_id=current_tool_call_id)
                        
                        # Send appropriate start event
                        if mode is None:
                            if tool_call and tool_call.get("id"):
                                self.logger.debug("Starting function mode")
                                mode = "function"
                                current_tool_call_id = tool_call["id"]
                                current_action_name = tool_call.get("function", {}).get("name", "")
                                event_stream.send_action_execution_start(
                                    current_tool_call_id,
                                    current_action_name,
                                    chunk.get("id", "")
                                )
                            elif content:
                                self.logger.debug("Starting message mode")
                                mode = "message"
                                current_message_id = chunk.get("id", str(uuid.uuid4()))
                                accumulated_content = ""  # 重置累加内容
                                event_stream.send_text_message_start(current_message_id)
                        
                        # Send content events
                        if mode == "message" and content:
                            # 累加内容以匹配 TypeScript 版本的行为
                            accumulated_content += content
                            self.logger.debug("Sending accumulated text content", 
                                            delta=content, 
                                            accumulated=accumulated_content)
                            event_stream.send_text_message_content(
                                current_message_id,
                                accumulated_content  # 发送累加的内容，而不是增量
                            )
                        elif mode == "function" and tool_call and tool_call.get("function", {}).get("arguments"):
                            args = tool_call["function"]["arguments"]
                            self.logger.debug("Sending function arguments", args=args)
                            event_stream.send_action_execution_args(
                                current_tool_call_id,
                                args
                            )
                        
                        # Force end stream after finish reason
                        if finish_reason:
                            self.logger.debug(f"Breaking loop due to finish reason: {finish_reason}")
                            break
                
                self.logger.info(f"Stream loop ended after {chunk_count} chunks, sending final events")
                
                # Send end events
                if mode == "message":
                    self.logger.debug("Ending final text message")
                    event_stream.send_text_message_end(current_message_id)
                elif mode == "function":
                    self.logger.debug("Ending final function execution")
                    event_stream.send_action_execution_end(current_tool_call_id)
                    
            except Exception as error:
                self.logger.error("Streaming error", error=str(error), exc_info=True)
                if mode == "message":
                    self.logger.debug("Error cleanup: ending text message")
                    try:
                        event_stream.send_text_message_end(current_message_id)
                    except Exception as cleanup_error:
                        self.logger.error("Error in cleanup", error=str(cleanup_error))
                elif mode == "function" and current_tool_call_id:
                    self.logger.debug("Error cleanup: ending function execution")
                    try:
                        event_stream.send_action_execution_end(current_tool_call_id)
                    except Exception as cleanup_error:
                        self.logger.error("Error in cleanup", error=str(cleanup_error))
                # Don't re-raise, let the stream complete gracefully
                self.logger.warning("Stream error handled, completing event stream")
            
            # Complete event stream
            self.logger.info("Completing event stream")
            if hasattr(event_stream, 'complete'):
                event_stream.complete()
            elif hasattr(event_stream, 'on_completed'):
                event_stream.on_completed()
            else:
                self.logger.warning(f"Event stream {type(event_stream)} has no complete method")
        
        await event_source.stream(stream_handler)
    
    async def _stream_response_with_openai(self, stream, event_source: RuntimeEventSource):
        """Stream response using OpenAI client's stream object."""
        
        async def stream_handler(event_stream):
            mode = None  # "function" | "message" | None
            current_message_id = ""
            current_tool_call_id = ""
            current_action_name = ""
            accumulated_content = ""  # 累加内容，匹配 TypeScript 版本
            
            try:
                self.logger.info("🔄 Starting OpenAI client stream...")
                chunk_count = 0
                
                async for chunk in stream:
                    chunk_count += 1
                    
                    if not chunk.choices:
                        continue
                    
                    choice = chunk.choices[0]
                    delta = choice.delta
                    tool_calls = delta.tool_calls if hasattr(delta, 'tool_calls') else None
                    content = delta.content if hasattr(delta, 'content') else None
                    finish_reason = choice.finish_reason
                    
                    tool_call = tool_calls[0] if tool_calls else None
                    
                    self.logger.debug(f"Received OpenAI chunk #{chunk_count}",
                                    choices_length=len(chunk.choices),
                                    finish_reason=finish_reason,
                                    has_tool_call=bool(tool_call),
                                    has_content=bool(content))
                    
                    # Check if should end stream
                    if finish_reason:
                        self.logger.info(f"Finish reason detected: {finish_reason}")
                    
                    # Mode switching logic (same as HTTP version)
                    if mode == "message" and tool_call and hasattr(tool_call, 'id') and tool_call.id:
                        self.logger.debug("Switching from message to function mode")
                        mode = None
                        accumulated_content = ""
                        event_stream.send_text_message_end(message_id=current_message_id)
                    elif mode == "function" and (not tool_call or (hasattr(tool_call, 'id') and tool_call.id)):
                        self.logger.debug("Switching from function to message mode")
                        mode = None
                        event_stream.send_action_execution_end(action_execution_id=current_tool_call_id)
                    
                    # Send appropriate start event
                    if mode is None:
                        if tool_call and hasattr(tool_call, 'id') and tool_call.id:
                            self.logger.debug("Starting function mode")
                            mode = "function"
                            current_tool_call_id = tool_call.id
                            current_action_name = tool_call.function.name if hasattr(tool_call, 'function') and hasattr(tool_call.function, 'name') else ""
                            event_stream.send_action_execution_start(
                                current_tool_call_id,
                                current_action_name,
                                chunk.id or ""
                            )
                        elif content:
                            self.logger.debug("Starting message mode")
                            mode = "message"
                            current_message_id = chunk.id or str(uuid.uuid4())
                            accumulated_content = ""
                            event_stream.send_text_message_start(current_message_id)
                    
                    # Send content events
                    if mode == "message" and content:
                        accumulated_content += content
                        self.logger.debug("Sending accumulated text content", 
                                        delta=content, 
                                        accumulated=accumulated_content)
                        event_stream.send_text_message_content(
                            current_message_id,
                            accumulated_content
                        )
                    elif mode == "function" and tool_call and hasattr(tool_call, 'function') and hasattr(tool_call.function, 'arguments'):
                        event_stream.send_action_execution_args(
                            current_tool_call_id,
                            tool_call.function.arguments
                        )
                
                self.logger.info(f"OpenAI stream completed after {chunk_count} chunks")
                
                # Send final end events
                if mode == "message":
                    event_stream.send_text_message_end(message_id=current_message_id)
                elif mode == "function":
                    event_stream.send_action_execution_end(action_execution_id=current_tool_call_id)
                
            except Exception as e:
                self.logger.error("Streaming error", error=str(e), exc_info=True)
                # Cleanup and complete stream
                try:
                    if mode == "message":
                        event_stream.send_text_message_end(message_id=current_message_id)
                    elif mode == "function":
                        event_stream.send_action_execution_end(action_execution_id=current_tool_call_id)
                except Exception as cleanup_error:
                    self.logger.error("Error in cleanup", error=str(cleanup_error))
                # Don't re-raise, let the stream complete gracefully
                self.logger.warning("Stream error handled, completing event stream")
            
            # Complete event stream
            self.logger.info("Completing event stream")
            if hasattr(event_stream, 'complete'):
                event_stream.complete()
            elif hasattr(event_stream, 'on_completed'):
                event_stream.on_completed()
            else:
                self.logger.warning(f"Event stream {type(event_stream)} has no complete method")
        
        await event_source.stream(stream_handler)
    
    def _convert_action_input_to_openai_tool(self, action: ActionInput) -> Dict[str, Any]:
        """Convert ActionInput to OpenAI tool format."""
        # Handle both lib.types.ActionInput (with json_schema) and api.models.requests.ActionInput (with parameters)
        parameters = {}
        
        # Add debug logging
        self.logger.info("🔍 Converting action to OpenAI tool", 
                        action_name=action.name,
                        has_json_schema=hasattr(action, 'json_schema'),
                        has_parameters=hasattr(action, 'parameters'),
                        json_schema_value=getattr(action, 'json_schema', None),
                        parameters_value=getattr(action, 'parameters', None))
        
        # Try to get json_schema first
        if hasattr(action, 'json_schema') and getattr(action, 'json_schema', None):
            # lib.types.ActionInput format
            try:
                json_schema = getattr(action, 'json_schema')
                if isinstance(json_schema, str):
                    parameters = json.loads(json_schema)
                else:
                    parameters = json_schema
                self.logger.info("✅ Parsed json_schema successfully", 
                               parameters=parameters,
                               parameters_type=type(parameters))
            except (json.JSONDecodeError, TypeError) as e:
                self.logger.warning("❌ Failed to parse json_schema", 
                                  error=str(e),
                                  json_schema=json_schema)
                parameters = {}
        elif hasattr(action, 'parameters') and getattr(action, 'parameters', None):
            # api.models.requests.ActionInput format
            action_parameters = getattr(action, 'parameters')
            if isinstance(action_parameters, dict):
                # Check if parameters is already a valid JSON schema
                if action_parameters.get('type') == 'object' and 'properties' in action_parameters:
                    # Already in OpenAI schema format, use as-is
                    parameters = action_parameters
                    self.logger.info("✅ Using existing schema format", 
                                   parameters=parameters)
                else:
                    # Create a basic JSON schema from parameters dict
                    parameters = {
                        "type": "object",
                        "properties": action_parameters,
                        "required": []
                    }
                    self.logger.info("✅ Created schema from parameters dict", 
                                   parameters=parameters)
            else:
                self.logger.warning("❌ action_parameters is not a dict", 
                                  action_parameters=action_parameters,
                                  type=type(action_parameters))
                parameters = {}
        else:
            self.logger.info("ℹ️ No json_schema or parameters found, using empty parameters")
            parameters = {}
        
        # Ensure parameters is a valid JSON schema object
        if not isinstance(parameters, dict):
            self.logger.warning("⚠️ parameters is not a dict, converting to empty object", 
                              parameters=parameters,
                              type=type(parameters))
            parameters = {}
        
        # If parameters dict is empty, set a minimal valid schema
        if not parameters:
            parameters = {
                "type": "object",
                "properties": {},
                "required": []
            }
            self.logger.info("🔧 Using minimal schema for empty parameters")
        
        # Validate the parameters schema structure
        if "type" not in parameters:
            self.logger.warning("⚠️ Schema missing 'type' field, adding it", parameters=parameters)
            parameters["type"] = "object"
        
        # Ensure type is not the string "object" but the actual type
        if parameters.get("type") == "object" and not isinstance(parameters.get("properties"), dict):
            self.logger.warning("⚠️ Schema has type='object' but no properties dict", parameters=parameters)
            if "properties" not in parameters:
                parameters["properties"] = {}
        
        result_tool = {
            "type": "function",
            "function": {
                "name": action.name,
                "description": action.description or "",
                "parameters": parameters,
            }
        }
        
        self.logger.info("🔧 Generated OpenAI tool", 
                        tool=result_tool,
                        parameters_keys=list(parameters.keys()) if isinstance(parameters, dict) else "not_dict")
        
        return result_tool
    
    def _convert_message_to_openai_message(self, message: Message, keep_system_role: bool = False) -> Dict[str, Any]:
        """Convert Message to OpenAI message format."""
        if message.is_text_message():
            role = message.role
            if message.role == "system" and not keep_system_role:
                role = "developer"
            return {
                "role": role,
                "content": message.content
            }
        elif message.is_image_message():
            return {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/{message.format};base64,{message.bytes}"
                        }
                    }
                ]
            }
        elif message.is_action_execution_message():
            return {
                "role": "assistant",
                "tool_calls": [
                    {
                        "id": message.id,
                        "type": "function",
                        "function": {
                            "name": message.name,
                            "arguments": json.dumps(message.arguments)
                        }
                    }
                ]
            }
        elif message.is_result_message():
            return {
                "role": "tool",
                "content": message.result,
                "tool_call_id": message.action_execution_id
            }
        else:
            # Fallback for unknown message types
            return {
                "role": "user",
                "content": str(message)
            }
    
    def _limit_messages_to_token_count(self, messages: List[Dict[str, Any]], tools: List[Dict[str, Any]], model: str, max_tokens: Optional[int] = None) -> List[Dict[str, Any]]:
        """Limit messages to token count."""
        if max_tokens is None:
            max_tokens = MAX_TOKENS_BY_MODEL.get(model, DEFAULT_MAX_TOKENS)
        
        # Simple token counting (length / 3 approximation)
        def count_tokens(text: str) -> int:
            return len(text) // 3
        
        def count_message_tokens(message: Dict[str, Any]) -> int:
            content = message.get("content", "")
            if isinstance(content, str):
                return count_tokens(content)
            elif isinstance(content, list):
                return sum(count_tokens(str(item)) for item in content)
            return 0
        
        def count_tools_tokens(tools_list: List[Dict[str, Any]]) -> int:
            if not tools_list:
                return 0
            return count_tokens(json.dumps(tools_list))
        
        # Reserve tokens for tools
        tools_tokens = count_tools_tokens(tools)
        if tools_tokens > max_tokens:
            raise Exception(f"Too many tokens in function definitions: {tools_tokens} > {max_tokens}")
        
        available_tokens = max_tokens - tools_tokens
        
        # Reserve tokens for system/developer messages
        system_messages = [m for m in messages if m.get("role") in ["system", "developer"]]
        for msg in system_messages:
            tokens = count_message_tokens(msg)
            available_tokens -= tokens
            if available_tokens < 0:
                raise Exception("Not enough tokens for system message")
        
        # Add messages in reverse order until we run out of tokens
        result = []
        cutoff = False
        
        for message in reversed(messages):
            if message.get("role") in ["system", "developer"]:
                result.insert(0, message)
                continue
            elif cutoff:
                continue
            
            tokens = count_message_tokens(message)
            if available_tokens < tokens:
                cutoff = True
                continue
            
            result.insert(0, message)
            available_tokens -= tokens
        
        return result
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get DeepSeek model information."""
        return {
            "model": self.model,
            "provider": "DeepSeek",
            "base_url": self.base_url,
            "supports_streaming": True,
            "supports_functions": True,
            "supports_parallel_tool_calls": not self.disable_parallel_tool_calls,
            "max_tokens": MAX_TOKENS_BY_MODEL.get(self.model, DEFAULT_MAX_TOKENS)
        }
    
    async def __aenter__(self):
        """Async context manager entry."""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if hasattr(self, '_http_client'):
            await self._http_client.aclose()
    
    async def generate_response(
        self,
        messages: List[Dict[str, Any]],
        actions: Optional[List[Dict[str, Any]]] = None,
        **kwargs
    ) -> AsyncIterator[Dict[str, Any]]:
        """Generate a response from the DeepSeek service (legacy interface)."""
        self.logger.info("🔄 DeepSeekAdapter.generate_response() method called (legacy interface)!")
        # Create simple HTTP request to DeepSeek API
        if not hasattr(self, '_http_client'):
            # Use test content if no API key
            yield {
                "type": "text_content",
                "content": "Hello! I'm a test response from DeepSeek adapter (no API key configured).",
                "role": "assistant"
            }
            return
        
        # Convert messages to DeepSeek format
        deepseek_messages = []
        for msg in messages:
            deepseek_messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", "")
            })
        
        # Prepare DeepSeek API request
        payload = {
            "model": kwargs.get('model', self.model),
            "messages": deepseek_messages,
            "stream": True,
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        try:
            # Make streaming request to DeepSeek API
            async with self._http_client.stream(
                "POST",
                "/chat/completions",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            ) as response:
                if response.status_code == 200:
                    async for line in response.aiter_lines():
                        line = line.strip()
                        if line.startswith("data: "):
                            data = line[6:]  # Remove "data: " prefix
                            if data == "[DONE]":
                                break
                            try:
                                chunk = json.loads(data)
                                if chunk.get("choices") and chunk["choices"][0].get("delta"):
                                    delta = chunk["choices"][0]["delta"]
                                    if "content" in delta:
                                        yield {
                                            "type": "text_content",
                                            "content": delta["content"],
                                            "role": "assistant"
                                        }
                            except json.JSONDecodeError:
                                continue
                else:
                    # Fallback response
                    yield {
                        "type": "text_content",
                        "content": f"Error: API returned status {response.status_code}",
                        "role": "assistant"
                    }
        except Exception as e:
            # Fallback response
            yield {
                "type": "text_content", 
                "content": f"Hello! I'm a test response. (Error: {str(e)})",
                "role": "assistant"
            }
    
    async def stream_response(
        self,
        messages: List[Dict[str, Any]],
        actions: Optional[List[Dict[str, Any]]] = None,
        **kwargs
    ) -> AsyncIterator[Dict[str, Any]]:
        """Stream a response from the DeepSeek service (legacy interface)."""
        # For now, just delegate to generate_response
        async for item in self.generate_response(messages, actions, **kwargs):
            yield item