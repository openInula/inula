"""
Data models and schemas for the Function RAG system.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, validator


class ParameterType(str, Enum):
    """Parameter type enumeration."""
    STRING = "string"
    NUMBER = "number"
    BOOLEAN = "boolean"
    OBJECT = "object"
    ARRAY = "array"


class Parameter(BaseModel):
    """Function parameter definition."""
    type: ParameterType
    description: str
    required: bool = True
    default: Optional[Any] = None
    enum: Optional[List[Any]] = None
    items: Optional[Dict[str, Any]] = None  # For array types


class FunctionExample(BaseModel):
    """Function usage example."""
    input: str = Field(..., description="Example input")
    output: str = Field(..., description="Expected output")
    context: Optional[str] = Field(None, description="Usage context")


class PerformanceMetrics(BaseModel):
    """Function performance metrics."""
    avg_execution_time: Optional[float] = Field(None, description="Average execution time in ms")
    success_rate: Optional[float] = Field(None, ge=0.0, le=1.0, description="Success rate (0-1)")
    usage_frequency: Optional[int] = Field(None, ge=0, description="Usage frequency count")
    last_used: Optional[datetime] = Field(None, description="Last usage timestamp")


class LLMFunction(BaseModel):
    """Main LLM Function model."""
    function_id: str = Field(default_factory=lambda: str(uuid4()))
    name: str = Field(..., description="Function name")
    description: str = Field(..., description="Function description")
    category: str = Field(..., description="Function category")
    subcategory: Optional[str] = Field(None, description="Function subcategory")
    parameters: Dict[str, Parameter] = Field(default_factory=dict)
    use_cases: List[str] = Field(default_factory=list)
    examples: List[FunctionExample] = Field(default_factory=list)
    dependencies: List[str] = Field(default_factory=list)
    performance_metrics: Optional[PerformanceMetrics] = None
    tags: List[str] = Field(default_factory=list)
    version: str = Field(default="1.0.0")
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    
    # Additional metadata
    implementation: Optional[str] = Field(None, description="Function implementation code")
    documentation_url: Optional[str] = Field(None, description="Documentation URL")
    maintainer: Optional[str] = Field(None, description="Function maintainer")
    license: str = Field(default="MIT", description="Function license")

    @validator('tags')
    def validate_tags(cls, v):
        """Ensure tags are unique and lowercase."""
        return list(set(tag.lower().strip() for tag in v if tag.strip()))

    @validator('name')
    def validate_name(cls, v):
        """Validate function name format."""
        if not v or not v.strip():
            raise ValueError("Function name cannot be empty")
        return v.strip()

    class Config:
        """Pydantic configuration."""
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v),
        }


class FunctionEmbeddings(BaseModel):
    """Function embeddings representation."""
    main: Optional[List[float]] = None
    detailed: Optional[List[float]] = None
    scenarios: Optional[List[float]] = None
    keywords: Optional[List[float]] = None
    combined: Optional[List[float]] = None


class QueryIntent(str, Enum):
    """Query intent types."""
    DIRECT_MATCH = "direct_match"
    FUNCTIONAL_SEARCH = "functional_search"
    SCENARIO_MATCH = "scenario_match"
    COMBINATION_QUERY = "combination_query"


class ProcessedQuery(BaseModel):
    """Processed query result."""
    intent: QueryIntent
    entities: List[str]
    embedding: List[float]
    original: str
    expanded: Optional[str] = None


class MatchType(str, Enum):
    """Search result match types."""
    SEMANTIC = "semantic"
    KEYWORD = "keyword"
    CATEGORY = "category"
    HYBRID = "hybrid"


class SearchResult(BaseModel):
    """Search result item."""
    function: LLMFunction
    score: float = Field(..., ge=0.0, le=1.0)
    match_type: MatchType
    explanation: Optional[str] = None


class VectorPoint(BaseModel):
    """Vector database point structure."""
    id: str
    vector: List[float]
    payload: Dict[str, Any]


# Configuration models

class EmbeddingConfig(BaseModel):
    """Embedding service configuration."""
    provider: str = Field(default="deepseek", description="Embedding provider")
    model: str = Field(default="text-embedding-3-large", description="Embedding model")
    api_key: Optional[str] = Field(None, description="API key")
    base_url: Optional[str] = Field(None, description="Base URL")
    max_tokens: int = Field(default=8191, description="Max tokens")
    batch_size: int = Field(default=100, description="Batch size")


class StorageConfig(BaseModel):
    """Vector storage configuration."""
    vector_db_url: str = Field(default="http://localhost:6333", description="Qdrant URL")
    collection_name: str = Field(default="llm_functions", description="Collection name")
    vector_size: int = Field(default=3072, description="Vector dimension")
    distance_metric: str = Field(default="cosine", description="Distance metric")


class RetrievalConfig(BaseModel):
    """Retrieval configuration."""
    top_k: int = Field(default=50, description="Initial retrieval count")
    rerank_top_n: int = Field(default=10, description="Final results count")
    semantic_weight: float = Field(default=0.7, description="Semantic search weight")
    keyword_weight: float = Field(default=0.2, description="Keyword search weight")
    category_weight: float = Field(default=0.1, description="Category search weight")
    threshold: float = Field(default=0.1, description="Score threshold")
    use_cache: bool = Field(default=True, description="Enable caching")


class FunctionRAGConfig(BaseModel):
    """Main system configuration."""
    embedding: EmbeddingConfig = Field(default_factory=EmbeddingConfig)
    storage: StorageConfig = Field(default_factory=StorageConfig)
    retrieval: RetrievalConfig = Field(default_factory=RetrievalConfig)


# API request/response models

class SearchRequest(BaseModel):
    """Search request model."""
    query: str = Field(..., description="Search query")
    limit: int = Field(default=10, ge=1, le=50, description="Result limit")
    include_scores: bool = Field(default=True, description="Include similarity scores")


class SearchResponse(BaseModel):
    """Search response model."""
    query: str
    total_found: int
    returned_count: int
    results: List[Dict[str, Any]]


class AddFunctionRequest(BaseModel):
    """Add function request model."""
    name: str
    description: str
    category: str
    subcategory: Optional[str] = None
    parameters: Optional[Dict[str, Parameter]] = None
    use_cases: Optional[List[str]] = None
    examples: Optional[List[FunctionExample]] = None
    dependencies: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    implementation: Optional[str] = None
    documentation_url: Optional[str] = None
    maintainer: Optional[str] = None
    license: Optional[str] = None


class AddFunctionResponse(BaseModel):
    """Add function response model."""
    function_id: str


class BatchAddRequest(BaseModel):
    """Batch add functions request."""
    functions: List[AddFunctionRequest]


class BatchAddResponse(BaseModel):
    """Batch add functions response."""
    function_ids: List[str]


class FunctionSummary(BaseModel):
    """Function summary with basic information."""
    name: str
    category: str
    description: str


class SystemStats(BaseModel):
    """System statistics model."""
    total_functions: int
    vector_storage_stats: Dict[str, Any]
    cache_stats: Dict[str, Any]
    embedding_cache_size: int


class HealthStatus(BaseModel):
    """System health status."""
    status: str = Field(..., description="Overall status")
    details: Dict[str, Any] = Field(..., description="Detailed status info")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# Error models

class ErrorResponse(BaseModel):
    """Error response model."""
    error: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    request_id: Optional[str] = None


# Custom exceptions

class FunctionRAGError(Exception):
    """Base exception for Function RAG system."""
    
    def __init__(self, message: str, code: str = "INTERNAL_ERROR", details: Any = None):
        self.message = message
        self.code = code
        self.details = details
        super().__init__(message)


class EmbeddingError(FunctionRAGError):
    """Embedding service error."""
    
    def __init__(self, message: str, details: Any = None):
        super().__init__(message, "EMBEDDING_ERROR", details)


class StorageError(FunctionRAGError):
    """Storage service error."""
    
    def __init__(self, message: str, details: Any = None):
        super().__init__(message, "STORAGE_ERROR", details)


class RetrievalError(FunctionRAGError):
    """Retrieval service error."""
    
    def __init__(self, message: str, details: Any = None):
        super().__init__(message, "RETRIEVAL_ERROR", details)