"""Helper utility functions."""

import uuid
import random
import string
from typing import Any, Dict


def random_id(length: int = 8) -> str:
    """Generate a random ID string."""
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))


def generate_uuid() -> str:
    """Generate a UUID string."""
    return str(uuid.uuid4())


def safe_get(data: Dict[str, Any], key: str, default: Any = None) -> Any:
    """Safely get a value from a dictionary."""
    return data.get(key, default)


def merge_dicts(*dicts: Dict[str, Any]) -> Dict[str, Any]:
    """Merge multiple dictionaries."""
    result = {}
    for d in dicts:
        if d:
            result.update(d)
    return result