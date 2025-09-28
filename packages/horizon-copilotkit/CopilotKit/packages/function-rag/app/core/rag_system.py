"""
Main Function RAG system orchestrator.
"""

import asyncio
from typing import Dict, List, Optional, Tuple

from app.models import (
    AddFunctionRequest,
    FunctionModel,
    FunctionRAGConfig,
    SearchRequest,
    SearchResult,
)
from app.services import (
    EmbeddingService,
    RetrievalEngine,
    VectorStorageService,
)
from app.utils.logger import get_logger

logger = get_logger(__name__)


class FunctionRAGSystem:
    """Main orchestrator for the Function RAG system."""
    
    def __init__(self, config: FunctionRAGConfig):
        """Initialize the RAG system."""
        self.config = config
        
        # Initialize services
        self.embedding_service = EmbeddingService(config.embedding)
        self.vector_storage = VectorStorageService(config.storage)
        self.retrieval_engine = RetrievalEngine(
            config.retrieval,
            self.embedding_service,
            self.vector_storage
        )
        
        self._initialized = False
        logger.info("Function RAG system created")
    
    async def initialize(self) -> None:
        """Initialize all services."""
        if self._initialized:
            return
        
        try:
            # Initialize vector storage
            await self.vector_storage.initialize()
            
            # Mark as initialized
            self._initialized = True
            logger.info("Function RAG system initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize RAG system: {e}")
            raise
    
    async def add_function(self, request: AddFunctionRequest) -> str:
        """Add a single function to the system."""
        if not self._initialized:
            await self.initialize()
        
        try:
            # Create function model
            function_data = request.dict(exclude_unset=True)
            function_model = FunctionModel(function_data)
            
            # Generate embeddings
            embeddings = await self.embedding_service.generate_function_embeddings(
                function_model
            )
            
            # Store in vector database
            function_id = await self.vector_storage.add_function(
                function_model, embeddings
            )
            
            logger.info(f"Added function {function_id}")
            return function_id
            
        except Exception as e:
            logger.error(f"Failed to add function: {e}")
            raise
    
    async def batch_add_functions(self, requests: List[AddFunctionRequest]) -> List[str]:
        """Add multiple functions in batch."""
        if not self._initialized:
            await self.initialize()
        
        try:
            # Create function models and generate embeddings concurrently
            tasks = []
            for request in requests:
                task = self._process_function_request(request)
                tasks.append(task)
            
            # Execute all tasks concurrently
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Filter successful results
            successful_functions = []
            for result in results:
                if isinstance(result, Exception):
                    logger.warning(f"Failed to process function: {result}")
                    continue
                successful_functions.append(result)
            
            if not successful_functions:
                logger.warning("No functions were processed successfully")
                return []
            
            # Batch store in vector database
            function_ids = await self.vector_storage.batch_add_functions(
                successful_functions
            )
            
            logger.info(f"Batch added {len(function_ids)} functions")
            return function_ids
            
        except Exception as e:
            logger.error(f"Failed to batch add functions: {e}")
            raise
    
    async def _process_function_request(
        self, request: AddFunctionRequest
    ) -> Tuple[FunctionModel, any]:
        """Process a single function request."""
        # Create function model
        function_data = request.dict(exclude_unset=True)
        function_model = FunctionModel(function_data)
        
        # Generate embeddings
        embeddings = await self.embedding_service.generate_function_embeddings(
            function_model
        )
        
        return function_model, embeddings
    
    async def search_functions(self, request: SearchRequest) -> List[SearchResult]:
        """Search for functions."""
        if not self._initialized:
            await self.initialize()
        
        try:
            results = await self.retrieval_engine.search(
                query=request.query,
                limit=request.limit
            )
            
            logger.debug(f"Found {len(results)} results for query: {request.query}")
            return results
            
        except Exception as e:
            logger.error(f"Failed to search functions: {e}")
            raise
    
    async def get_similar_functions(
        self, 
        function_id: str, 
        limit: int = 5
    ) -> List[SearchResult]:
        """Get functions similar to a given function."""
        if not self._initialized:
            await self.initialize()
        
        try:
            results = await self.retrieval_engine.get_similar_functions(
                function_id=function_id,
                limit=limit
            )
            
            logger.debug(f"Found {len(results)} similar functions to {function_id}")
            return results
            
        except Exception as e:
            logger.error(f"Failed to get similar functions: {e}")
            raise
    
    async def get_functions_by_category(
        self, 
        category: str, 
        limit: int = 10,
        subcategory: Optional[str] = None
    ) -> List[SearchResult]:
        """Get functions by category."""
        if not self._initialized:
            await self.initialize()
        
        try:
            results = await self.retrieval_engine.get_functions_by_category(
                category=category,
                subcategory=subcategory,
                limit=limit
            )
            
            logger.debug(f"Found {len(results)} functions in category {category}")
            return results
            
        except Exception as e:
            logger.error(f"Failed to get functions by category: {e}")
            raise
    
    async def get_function_by_id(self, function_id: str) -> Optional[SearchResult]:
        """Get a specific function by ID."""
        if not self._initialized:
            await self.initialize()
        
        try:
            result = await self.vector_storage.get_function_by_id(function_id)
            
            if result:
                from app.models import LLMFunction, MatchType
                function = LLMFunction(**result.payload)
                return SearchResult(
                    function=function,
                    score=1.0,
                    match_type=MatchType.SEMANTIC,
                    explanation="Direct ID match"
                )
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get function by ID: {e}")
            raise
    
    async def get_all_function_summaries(self) -> List[Dict[str, str]]:
        """Get all function summaries with name, category, and description."""
        if not self._initialized:
            await self.initialize()
        
        try:
            summaries = await self.vector_storage.get_all_function_summaries()
            logger.info(f"Retrieved {len(summaries)} function summaries")
            return summaries
            
        except Exception as e:
            logger.error(f"Failed to get all function summaries: {e}")
            raise
    
    async def get_all_function_names(self) -> List[str]:
        """Get all function names in the system."""
        if not self._initialized:
            await self.initialize()
        
        try:
            names = await self.vector_storage.get_all_function_names()
            logger.info(f"Retrieved {len(names)} function names")
            return names
            
        except Exception as e:
            logger.error(f"Failed to get all function names: {e}")
            raise
    
    async def delete_function(self, function_id: str) -> bool:
        """Delete a function from the system."""
        if not self._initialized:
            await self.initialize()
        
        try:
            success = await self.vector_storage.delete_function(function_id)
            
            if success:
                logger.info(f"Deleted function {function_id}")
            else:
                logger.warning(f"Function {function_id} not found for deletion")
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to delete function: {e}")
            raise
    
    async def clear_all_functions(self) -> bool:
        """Clear all functions from the system."""
        if not self._initialized:
            await self.initialize()
        
        try:
            success = await self.vector_storage.clear_all_functions()
            
            if success:
                # Clear embedding service cache
                self.embedding_service.clear_cache()
                logger.info("Cleared all functions and caches")
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to clear all functions: {e}")
            raise
    
    async def get_system_stats(self) -> Dict[str, any]:
        """Get system statistics."""
        if not self._initialized:
            await self.initialize()
        
        try:
            # Get storage stats
            storage_stats = await self.vector_storage.get_collection_stats()
            
            # Get embedding cache stats
            embedding_cache_size = self.embedding_service.get_cache_size()
            
            return {
                "initialized": self._initialized,
                "total_functions": storage_stats.get("points_count", 0),
                "vector_storage_stats": storage_stats,
                "embedding_cache_size": embedding_cache_size,
                "cache_stats": {
                    "embedding_cache_size": embedding_cache_size
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get system stats: {e}")
            return {"error": str(e)}
    
    async def health_check(self) -> Dict[str, any]:
        """Perform comprehensive health check."""
        try:
            health_status = {
                "status": "healthy",
                "details": {},
                "initialized": self._initialized
            }
            
            if not self._initialized:
                await self.initialize()
            
            # Check embedding service
            embedding_health = await self.embedding_service.health_check()
            health_status["details"]["embedding_service"] = embedding_health
            
            # Check vector storage
            storage_health = await self.vector_storage.health_check()
            health_status["details"]["vector_storage"] = storage_health
            
            # Check retrieval engine
            retrieval_health = await self.retrieval_engine.health_check()
            health_status["details"]["retrieval_engine"] = retrieval_health
            
            # Determine overall status
            if (embedding_health.get("status") != "healthy" or 
                storage_health.get("status") != "healthy" or
                retrieval_health.get("status") != "healthy"):
                health_status["status"] = "unhealthy"
            
            return health_status
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "initialized": self._initialized
            }
    
    async def close(self) -> None:
        """Close all connections and cleanup resources."""
        try:
            # Close vector storage
            await self.vector_storage.close()
            
            # Clear caches
            self.embedding_service.clear_cache()
            
            self._initialized = False
            logger.info("Function RAG system closed")
            
        except Exception as e:
            logger.warning(f"Error during cleanup: {e}")
    
    async def __aenter__(self):
        """Async context manager entry."""
        await self.initialize()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()