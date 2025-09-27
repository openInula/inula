"""Validation utility functions."""

from typing import Any, Dict, List, Optional
import jsonschema
from pydantic import ValidationError


def validate_json_schema(data: Dict[str, Any], schema: Dict[str, Any]) -> bool:
    """Validate data against a JSON schema."""
    try:
        jsonschema.validate(data, schema)
        return True
    except jsonschema.ValidationError:
        return False


def validate_message_format(message: Dict[str, Any]) -> bool:
    """Validate message format."""
    required_fields = ["id", "type"]
    return all(field in message for field in required_fields)


def validate_action_format(action: Dict[str, Any]) -> bool:
    """Validate action format."""
    required_fields = ["name"]
    return all(field in action for field in required_fields)


def sanitize_input(text: str) -> str:
    """Sanitize user input."""
    # Basic sanitization - remove dangerous characters
    if not isinstance(text, str):
        return ""
    
    # Remove null bytes and other control characters
    sanitized = "".join(char for char in text if ord(char) >= 32 or char in "\n\r\t")
    
    return sanitized.strip()