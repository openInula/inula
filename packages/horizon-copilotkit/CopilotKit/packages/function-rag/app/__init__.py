"""
Function RAG System - Python implementation.

A comprehensive RAG (Retrieval-Augmented Generation) system for storing and querying
LLM functions with multi-stage hybrid search capabilities.
"""

from .core import ConfigManager, FunctionRAGSystem
from .models import *
from .services import EmbeddingService, RetrievalEngine, VectorStorageService

__version__ = "1.0.0"
__author__ = "CopilotKit"
__email__ = "support@copilotkit.ai"

__all__ = [
    # Core
    "ConfigManager",
    "FunctionRAGSystem",
    # Services
    "EmbeddingService",
    "VectorStorageService", 
    "RetrievalEngine",
]