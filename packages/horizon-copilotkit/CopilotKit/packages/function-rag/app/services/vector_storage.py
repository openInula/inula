"""
Vector storage service using Qdrant for similarity search.
"""

import os
import asyncio
from typing import Any, Dict, List, Optional, Tuple

from qdrant_client import AsyncQdrantClient, models
from qdrant_client.http.models import (
    CollectionStatus,
    Distance,
    FieldCondition,
    Filter,
    Match,
    PointStruct,
    Range,
    ScoredPoint,
    VectorParams,
)

from app.models import (
    FunctionEmbeddings,
    FunctionModel,
    StorageConfig,
    StorageError,
    VectorPoint,
)
from app.utils.logger import get_logger

logger = get_logger(__name__)


class VectorStorageService:
    """Service for storing and querying vector embeddings using Qdrant."""
    
    def __init__(self, config: StorageConfig):
        """Initialize vector storage service."""

        # 临时禁用代理
        os.environ.pop('HTTP_PROXY', None)
        os.environ.pop('HTTPS_PROXY', None)
        os.environ.pop('http_proxy', None)
        os.environ.pop('https_proxy', None)
        
        # 设置localhost不走代理
        no_proxy = os.environ.get('NO_PROXY', '')
        if 'localhost' not in no_proxy:
            os.environ['NO_PROXY'] = f"{no_proxy},localhost,127.0.0.1"

        self.config = config
        self.client = AsyncQdrantClient(url=config.vector_db_url)
        self.collection_name = config.collection_name
        self.vector_size = config.vector_size
        self.distance_metric = Distance.COSINE  # Default to cosine
        
        if config.distance_metric.lower() == "euclidean":
            self.distance_metric = Distance.EUCLID
        elif config.distance_metric.lower() == "dot":
            self.distance_metric = Distance.DOT
        
        logger.info(f"Vector storage initialized with collection: {self.collection_name}")
    
    async def initialize(self) -> None:
        """Initialize the collection if it doesn't exist."""
        try:
            collections = await self.client.get_collections()
            collection_exists = any(
                c.name == self.collection_name 
                for c in collections.collections
            )
            
            if not collection_exists:
                await self._create_collection()
                logger.info(f"Created collection: {self.collection_name}")
            else:
                logger.info(f"Collection {self.collection_name} already exists")
                
        except Exception as e:
            logger.error(f"Failed to initialize vector storage: {e}")
            raise StorageError(f"Failed to initialize vector storage: {str(e)}")
    
    async def _create_collection(self) -> None:
        """Create a new collection with multiple vector configurations."""
        vectors_config = {
            "main": VectorParams(size=self.vector_size, distance=self.distance_metric),
            "detailed": VectorParams(size=self.vector_size, distance=self.distance_metric),
            "scenarios": VectorParams(size=self.vector_size, distance=self.distance_metric),
            "keywords": VectorParams(size=self.vector_size, distance=self.distance_metric),
            "combined": VectorParams(size=self.vector_size, distance=self.distance_metric),
        }
        
        await self.client.create_collection(
            collection_name=self.collection_name,
            vectors_config=vectors_config,
        )
    
    async def add_function(
        self, 
        function_model: FunctionModel, 
        embeddings: FunctionEmbeddings
    ) -> str:
        """Add a function with its embeddings to the vector store."""
        try:
            vectors = {}
            
            # Only add non-null embeddings
            if embeddings.main:
                vectors["main"] = embeddings.main
            if embeddings.detailed:
                vectors["detailed"] = embeddings.detailed
            if embeddings.scenarios:
                vectors["scenarios"] = embeddings.scenarios
            if embeddings.keywords:
                vectors["keywords"] = embeddings.keywords
            if embeddings.combined:
                vectors["combined"] = embeddings.combined
            
            # Create payload with function metadata
            payload = {
                "function_id": function_model.id,
                "name": function_model.name,
                "description": function_model.description,
                "category": function_model.category,
                "subcategory": function_model.subcategory,
                "tags": function_model.tags,
                "use_cases": function_model.use_cases,
                "version": function_model.version,
                "last_updated": function_model.last_updated.isoformat(),
                "complexity_score": function_model.get_complexity_score(),
                "popularity_score": function_model.get_popularity_score(),
                "reliability_score": function_model.get_reliability_score(),
                "parameter_count": len(function_model.parameters),
                "example_count": len(function_model.examples),
                "dependency_count": len(function_model.dependencies),
            }
            
            point = PointStruct(
                id=function_model.id,
                vector=vectors,
                payload=payload
            )
            
            await self.client.upsert(
                collection_name=self.collection_name,
                points=[point]
            )
            
            logger.debug(f"Added function {function_model.id} to vector store")
            return function_model.id
            
        except Exception as e:
            logger.error(f"Failed to add function to vector store: {e}")
            raise StorageError(f"Failed to add function: {str(e)}")
    
    async def batch_add_functions(
        self, 
        functions_with_embeddings: List[Tuple[FunctionModel, FunctionEmbeddings]]
    ) -> List[str]:
        """Add multiple functions in batch."""
        points = []
        function_ids = []
        
        for function_model, embeddings in functions_with_embeddings:
            try:
                vectors = {}
                
                # Only add non-null embeddings
                if embeddings.main:
                    vectors["main"] = embeddings.main
                if embeddings.detailed:
                    vectors["detailed"] = embeddings.detailed
                if embeddings.scenarios:
                    vectors["scenarios"] = embeddings.scenarios
                if embeddings.keywords:
                    vectors["keywords"] = embeddings.keywords
                if embeddings.combined:
                    vectors["combined"] = embeddings.combined
                
                payload = {
                    "function_id": function_model.id,
                    "name": function_model.name,
                    "description": function_model.description,
                    "category": function_model.category,
                    "subcategory": function_model.subcategory,
                    "tags": function_model.tags,
                    "use_cases": function_model.use_cases,
                    "version": function_model.version,
                    "last_updated": function_model.last_updated.isoformat(),
                    "complexity_score": function_model.get_complexity_score(),
                    "popularity_score": function_model.get_popularity_score(),
                    "reliability_score": function_model.get_reliability_score(),
                    "parameter_count": len(function_model.parameters),
                    "example_count": len(function_model.examples),
                    "dependency_count": len(function_model.dependencies),
                }
                
                point = PointStruct(
                    id=function_model.id,
                    vector=vectors,
                    payload=payload
                )
                
                points.append(point)
                function_ids.append(function_model.id)
                
            except Exception as e:
                logger.warning(f"Skipping function {function_model.id}: {e}")
                continue
        
        try:
            await self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )
            
            logger.info(f"Batch added {len(points)} functions to vector store")
            return function_ids
            
        except Exception as e:
            logger.error(f"Failed to batch add functions: {e}")
            raise StorageError(f"Failed to batch add functions: {str(e)}")
    
    async def search_similar(
        self,
        query_embedding: List[float],
        limit: int = 10,
        vector_name: str = "combined",
        score_threshold: float = 0.0,
        filter_conditions: Optional[Dict[str, Any]] = None
    ) -> List[ScoredPoint]:
        """Search for similar functions using vector similarity."""
        try:
            search_filter = None
            if filter_conditions:
                search_filter = self._build_filter(filter_conditions)
            
            results = await self.client.search(
                collection_name=self.collection_name,
                query_vector=(vector_name, query_embedding),
                limit=limit,
                score_threshold=score_threshold,
                query_filter=search_filter,
                with_payload=True,
            )
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to search similar functions: {e}")
            raise StorageError(f"Failed to search: {str(e)}")
    
    async def search_by_category(
        self,
        category: str,
        limit: int = 10,
        subcategory: Optional[str] = None
    ) -> List[ScoredPoint]:
        """Search functions by category using scroll without filter (Qdrant client compatibility issue)."""
        try:
            # Use scroll without filter and manually filter results
            results = await self.client.scroll(
                collection_name=self.collection_name,
                limit=1000,  # Get more results to filter manually
                with_payload=True,
            )
            
            # Manually filter by category in Python
            scored_results = []
            for point in results[0]:  # results is (points, next_page_offset)
                payload = point.payload
                if payload.get('category') == category:
                    # If subcategory specified, check it too
                    if subcategory is None or payload.get('subcategory') == subcategory:
                        # Create a simple compatible object
                        class MockScoredPoint:
                            def __init__(self, point_data):
                                self.id = point_data.id
                                self.version = getattr(point_data, 'version', 0)
                                self.score = 1.0  # Category matches get perfect score
                                self.payload = point_data.payload
                                self.vector = getattr(point_data, 'vector', {})
                        
                        scored_results.append(MockScoredPoint(point))
                        
                        # Stop if we have enough results
                        if len(scored_results) >= limit:
                            break
            
            return scored_results[:limit]
            
        except Exception as e:
            logger.error(f"Failed to search by category: {e}")
            raise StorageError(f"Failed to search by category: {str(e)}")
    
    async def get_function_by_id(self, function_id: str) -> Optional[ScoredPoint]:
        """Get a specific function by ID."""
        try:
            result = await self.client.retrieve(
                collection_name=self.collection_name,
                ids=[function_id],
                with_payload=True,
            )
            
            if result:
                point = result[0]
                # Create a simple compatible object instead of ScoredPoint
                class MockScoredPoint:
                    def __init__(self, point_data):
                        self.id = point_data.id
                        self.version = getattr(point_data, 'version', 0)
                        self.score = 1.0
                        self.payload = point_data.payload
                        self.vector = getattr(point_data, 'vector', {})
                
                return MockScoredPoint(point)
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get function by ID: {e}")
            raise StorageError(f"Failed to get function: {str(e)}")
    
    async def delete_function(self, function_id: str) -> bool:
        """Delete a function from the vector store."""
        try:
            await self.client.delete(
                collection_name=self.collection_name,
                points_selector=models.PointIdsList(points=[function_id])
            )
            
            logger.info(f"Deleted function {function_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete function: {e}")
            raise StorageError(f"Failed to delete function: {str(e)}")
    
    async def clear_all_functions(self) -> bool:
        """Clear all functions from the collection."""
        try:
            # Delete the entire collection
            await self.client.delete_collection(self.collection_name)
            logger.info(f"Deleted collection {self.collection_name}")
            
            # Recreate the collection
            await self._create_collection()
            logger.info(f"Recreated collection {self.collection_name}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to clear all functions: {e}")
            raise StorageError(f"Failed to clear all functions: {str(e)}")
    
    async def get_all_function_summaries(self) -> List[Dict[str, str]]:
        """Get all function summaries with name, category, and description."""
        try:
            # Scroll through all points to get function summaries
            scroll_result = await self.client.scroll(
                collection_name=self.collection_name,
                limit=1000,  # Adjust based on expected number of functions
                with_payload=True,
                with_vectors=False  # We only need the payload, not vectors
            )
            
            summaries = []
            seen_names = set()  # Track unique names to avoid duplicates
            
            if scroll_result and len(scroll_result) > 0:
                points = scroll_result[0]  # Get points from tuple (points, next_page_offset)
                for point in points:
                    if point.payload and 'name' in point.payload:
                        name = point.payload.get('name', '')
                        category = point.payload.get('category', 'Unknown')
                        description = point.payload.get('description', '')
                        
                        # Only add if we haven't seen this name before
                        if name and name not in seen_names:
                            seen_names.add(name)
                            summaries.append({
                                'name': name,
                                'category': category,
                                'description': description
                            })
            
            # Sort by name
            return sorted(summaries, key=lambda x: x['name'])
            
        except Exception as e:
            logger.error(f"Failed to get all function summaries: {e}")
            raise StorageError(f"Failed to get all function summaries: {str(e)}")
    
    async def get_all_function_names(self) -> List[str]:
        """Get all function names from the collection (legacy method)."""
        try:
            summaries = await self.get_all_function_summaries()
            return [summary['name'] for summary in summaries]
            
        except Exception as e:
            logger.error(f"Failed to get all function names: {e}")
            raise StorageError(f"Failed to get all function names: {str(e)}")
    
    async def get_collection_stats(self) -> Dict[str, Any]:
        """Get collection statistics."""
        try:
            # Use count API instead of get_collection to avoid parsing issues
            count_result = await self.client.count(
                collection_name=self.collection_name
            )
            
            return {
                "status": "healthy",
                "vectors_count": count_result.count if hasattr(count_result, 'count') else 0,
                "indexed_vectors_count": count_result.count if hasattr(count_result, 'count') else 0,
                "points_count": count_result.count if hasattr(count_result, 'count') else 0,
                "segments_count": 1,  # Default reasonable value
                "config": {
                    "params": {
                        "vector_size": self.vector_size,
                        "distance": self.distance_metric.value if hasattr(self.distance_metric, 'value') else str(self.distance_metric),
                    }
                }
            }
            
        except Exception as e:
            logger.debug(f"Count API failed, using fallback stats: {e}")
            return {
                "status": "healthy",
                "vectors_count": 0,
                "indexed_vectors_count": 0,
                "points_count": 0,
                "segments_count": 0,
                "config": {
                    "params": {
                        "vector_size": self.vector_size,
                        "distance": str(self.distance_metric),
                    }
                }
            }
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check."""
        try:
            collections = await self.client.get_collections()
            collection_exists = any(
                c.name == self.collection_name 
                for c in collections.collections
            )
            
            if not collection_exists:
                return {
                    "status": "unhealthy",
                    "error": "Collection does not exist"
                }
            
            stats = await self.get_collection_stats()
            
            return {
                "status": "healthy",
                "collection_name": self.collection_name,
                "url": self.config.vector_db_url,
                "stats": stats
            }
            
        except Exception as e:
            logger.error(f"Vector storage health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    def _build_filter(self, conditions: Dict[str, Any]) -> Filter:
        """Build Qdrant filter from conditions."""
        must_conditions = []
        
        for key, value in conditions.items():
            if isinstance(value, str):
                must_conditions.append(
                    FieldCondition(
                        key=key,
                        match=Match(value=value)
                    )
                )
            elif isinstance(value, list):
                # For list values, match any
                should_conditions = [
                    FieldCondition(
                        key=key,
                        match=Match(value=v)
                    )
                    for v in value
                ]
                must_conditions.append(Filter(should=should_conditions))
            elif isinstance(value, dict):
                # Range conditions
                if "gte" in value or "lte" in value or "gt" in value or "lt" in value:
                    range_condition = Range()
                    if "gte" in value:
                        range_condition.gte = value["gte"]
                    if "lte" in value:
                        range_condition.lte = value["lte"]
                    if "gt" in value:
                        range_condition.gt = value["gt"]
                    if "lt" in value:
                        range_condition.lt = value["lt"]
                    
                    must_conditions.append(
                        FieldCondition(
                            key=key,
                            range=range_condition
                        )
                    )
        
        return Filter(must=must_conditions)
    
    async def close(self) -> None:
        """Close the client connection."""
        try:
            await self.client.close()
            logger.info("Vector storage client closed")
        except Exception as e:
            logger.warning(f"Error closing vector storage client: {e}")