"""
Configuration management for Function RAG system.
"""

import os
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings

from app.models import (
    EmbeddingConfig,
    FunctionRAGConfig,
    RetrievalConfig,
    StorageConfig,
)


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # API Configuration
    api_title: str = Field(default="Function RAG System")
    api_version: str = Field(default="1.0.0")
    api_description: str = Field(default="RAG system for storing and querying LLM functions")
    debug: bool = Field(default=False)
    
    # Server Configuration  
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000)
    workers: int = Field(default=1)
    
    # Embedding Configuration
    embedding_provider: str = Field(default="openai")
    embedding_model: str = Field(default="text-embedding-3-large")
    embedding_api_key: Optional[str] = Field(default=None, env="EMBEDDING_API_KEY")
    embedding_base_url: Optional[str] = Field(default=None)
    embedding_max_tokens: int = Field(default=8191)
    embedding_batch_size: int = Field(default=100)
    
    # Storage Configuration
    vector_db_url: str = Field(default="http://localhost:6333")
    collection_name: str = Field(default="llm_functions")
    vector_size: int = Field(default=3072)
    distance_metric: str = Field(default="cosine")
    
    # Retrieval Configuration
    retrieval_top_k: int = Field(default=50)
    retrieval_rerank_top_n: int = Field(default=10)
    retrieval_semantic_weight: float = Field(default=0.7)
    retrieval_keyword_weight: float = Field(default=0.2)
    retrieval_category_weight: float = Field(default=0.1)
    retrieval_threshold: float = Field(default=0.1)
    retrieval_use_cache: bool = Field(default=True)
    
    # Logging Configuration
    log_level: str = Field(default="INFO")
    log_format: str = Field(default="json")
    
    # CORS Configuration
    cors_origins: list = Field(default=["*"])
    cors_methods: list = Field(default=["GET", "POST", "PUT", "DELETE"])
    cors_headers: list = Field(default=["*"])
    
    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


class ConfigManager:
    """Configuration manager for the Function RAG system."""
    
    def __init__(self, env_file: Optional[str] = None):
        """Initialize configuration manager."""
        if env_file:
            self.settings = Settings(_env_file=env_file)
        else:
            self.settings = Settings()
        
        # Load API key from environment if not set
        if not self.settings.embedding_api_key:
            if self.settings.embedding_provider == "deepseek":
                self.settings.embedding_api_key = os.getenv("DEEPSEEK_API_KEY")
            elif self.settings.embedding_provider == "openai":
                self.settings.embedding_api_key = os.getenv("OPENAI_API_KEY")
    
    def get_embedding_config(self) -> EmbeddingConfig:
        """Get embedding service configuration."""
        return EmbeddingConfig(
            provider=self.settings.embedding_provider,
            model=self.settings.embedding_model,
            api_key=self.settings.embedding_api_key,
            base_url=self.settings.embedding_base_url,
            max_tokens=self.settings.embedding_max_tokens,
            batch_size=self.settings.embedding_batch_size,
        )
    
    def get_storage_config(self) -> StorageConfig:
        """Get storage configuration."""
        return StorageConfig(
            vector_db_url=self.settings.vector_db_url,
            collection_name=self.settings.collection_name,
            vector_size=self.settings.vector_size,
            distance_metric=self.settings.distance_metric,
        )
    
    def get_retrieval_config(self) -> RetrievalConfig:
        """Get retrieval configuration."""
        return RetrievalConfig(
            top_k=self.settings.retrieval_top_k,
            rerank_top_n=self.settings.retrieval_rerank_top_n,
            semantic_weight=self.settings.retrieval_semantic_weight,
            keyword_weight=self.settings.retrieval_keyword_weight,
            category_weight=self.settings.retrieval_category_weight,
            threshold=self.settings.retrieval_threshold,
            use_cache=self.settings.retrieval_use_cache,
        )
    
    def get_rag_config(self) -> FunctionRAGConfig:
        """Get complete RAG system configuration."""
        return FunctionRAGConfig(
            embedding=self.get_embedding_config(),
            storage=self.get_storage_config(),
            retrieval=self.get_retrieval_config(),
        )
    
    @property
    def api_config(self) -> dict:
        """Get API configuration."""
        return {
            "title": self.settings.api_title,
            "version": self.settings.api_version,
            "description": self.settings.api_description,
            "debug": self.settings.debug,
        }
    
    @property
    def server_config(self) -> dict:
        """Get server configuration."""
        return {
            "host": self.settings.host,
            "port": self.settings.port,
            "workers": self.settings.workers,
        }
    
    @property
    def cors_config(self) -> dict:
        """Get CORS configuration."""
        return {
            "allow_origins": self.settings.cors_origins,
            "allow_methods": self.settings.cors_methods,
            "allow_headers": self.settings.cors_headers,
        }
    
    @property
    def log_config(self) -> dict:
        """Get logging configuration."""
        return {
            "level": self.settings.log_level,
            "format": self.settings.log_format,
        }
    
    def validate_config(self) -> bool:
        """Validate the configuration."""
        errors = []
        
        # Check required API key
        if not self.settings.embedding_api_key:
            errors.append(f"Missing API key for {self.settings.embedding_provider}")
        
        # Check vector DB URL
        if not self.settings.vector_db_url:
            errors.append("Missing vector database URL")
        
        # Check weights sum to reasonable value
        total_weight = (
            self.settings.retrieval_semantic_weight + 
            self.settings.retrieval_keyword_weight + 
            self.settings.retrieval_category_weight
        )
        if abs(total_weight - 1.0) > 0.1:
            errors.append(f"Retrieval weights sum to {total_weight}, should be close to 1.0")
        
        if errors:
            for error in errors:
                print(f"Configuration Error: {error}")
            return False
        
        return True