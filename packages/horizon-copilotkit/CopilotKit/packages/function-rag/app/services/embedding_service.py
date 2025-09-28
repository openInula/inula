"""
Embedding service for generating vector representations of functions.
"""

import asyncio
from typing import Dict, List, Optional, Tuple

import numpy as np
from openai import AsyncOpenAI

from app.models import (
    EmbeddingConfig,
    EmbeddingError,
    FunctionEmbeddings,
    FunctionModel,
)
from app.utils.logger import get_logger

logger = get_logger(__name__)


class EmbeddingService:
    """Service for generating embeddings from text using OpenAI-compatible APIs."""
    
    def __init__(self, config: EmbeddingConfig):
        """Initialize embedding service."""
        self.config = config
        self.cache: Dict[str, List[float]] = {}
        
        # Set base URL based on provider
        base_url = config.base_url
        if not base_url:
            if config.provider == "deepseek":
                base_url = "https://api.deepseek.com"
            elif config.provider == "openai":
                base_url = "https://api.openai.com/v1"
            else:
                raise EmbeddingError(f"Unsupported provider: {config.provider}")
        
        # Initialize OpenAI client (works for DeepSeek too due to API compatibility)
        self.client = AsyncOpenAI(
            api_key=config.api_key,
            base_url=base_url,
        )
        
        logger.info(f"Embedding service initialized with {config.provider} provider")
    
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text."""
        # Check cache first
        cache_key = self._get_cache_key(text)
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        try:
            response = await self.client.embeddings.create(
                model=self.config.model,
                input=text,
                encoding_format="float"
            )
            
            embedding = response.data[0].embedding
            
            # Cache the result
            self.cache[cache_key] = embedding
            
            return embedding
            
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise EmbeddingError(f"Failed to generate embedding: {str(e)}")
    
    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts in batches."""
        embeddings = []
        batch_size = self.config.batch_size
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_embeddings = await self._generate_batch_embeddings(batch)
            embeddings.extend(batch_embeddings)
        
        return embeddings
    
    async def generate_function_embeddings(self, function_model: FunctionModel) -> FunctionEmbeddings:
        """Generate multiple embeddings for a function (multi-layer approach)."""
        texts = {
            "main": function_model.get_main_text(),
            "detailed": function_model.get_detailed_text(),
            "scenarios": function_model.get_scenarios_text(),
            "keywords": function_model.get_keywords_text(),
        }
        
        # Generate embeddings for each text representation
        embeddings = {}
        tasks = []
        
        for key, text in texts.items():
            if text.strip():
                task = self.generate_embedding(text)
                tasks.append((key, task))
        
        # Execute all embedding tasks concurrently
        results = await asyncio.gather(
            *[task for _, task in tasks],
            return_exceptions=True
        )
        
        # Process results
        for i, (key, _) in enumerate(tasks):
            result = results[i]
            if isinstance(result, Exception):
                logger.warning(f"Failed to generate {key} embedding: {result}")
                continue
            embeddings[key] = result
        
        # Generate combined embedding using weighted average
        combined = self._generate_combined_embedding(embeddings)
        if combined is not None:
            embeddings["combined"] = combined
        
        return FunctionEmbeddings(**embeddings)
    
    async def _generate_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a batch of texts."""
        # Check cache for all texts
        uncached_texts = []
        cached_results = {}
        
        for i, text in enumerate(texts):
            cache_key = self._get_cache_key(text)
            if cache_key in self.cache:
                cached_results[i] = self.cache[cache_key]
            else:
                uncached_texts.append((i, text))
        
        # Generate embeddings for uncached texts
        uncached_embeddings = []
        if uncached_texts:
            try:
                response = await self.client.embeddings.create(
                    model=self.config.model,
                    input=[text for _, text in uncached_texts],
                    encoding_format="float"
                )
                
                uncached_embeddings = [item.embedding for item in response.data]
                
                # Cache the results
                for (i, text), embedding in zip(uncached_texts, uncached_embeddings):
                    cache_key = self._get_cache_key(text)
                    self.cache[cache_key] = embedding
                
            except Exception as e:
                logger.error(f"Failed to generate batch embeddings: {e}")
                raise EmbeddingError(f"Failed to generate batch embeddings: {str(e)}")
        
        # Combine cached and uncached results in the correct order
        result = []
        uncached_index = 0
        
        for i in range(len(texts)):
            if i in cached_results:
                result.append(cached_results[i])
            else:
                result.append(uncached_embeddings[uncached_index])
                uncached_index += 1
        
        return result
    
    def _generate_combined_embedding(self, embeddings: Dict[str, List[float]]) -> Optional[List[float]]:
        """Generate combined embedding using weighted average."""
        weights = {
            "main": 0.4,
            "detailed": 0.3,
            "scenarios": 0.2,
            "keywords": 0.1,
        }
        
        valid_embeddings = [
            (embeddings[key], weights.get(key, 0.1))
            for key in embeddings
            if key in weights and embeddings[key]
        ]
        
        if not valid_embeddings:
            return None
        
        # Convert to numpy arrays for easier computation
        embedding_arrays = [(np.array(emb), weight) for emb, weight in valid_embeddings]
        
        # Calculate weighted average
        total_weight = sum(weight for _, weight in embedding_arrays)
        if total_weight == 0:
            return None
        
        dimension = len(embedding_arrays[0][0])
        combined = np.zeros(dimension)
        
        for embedding, weight in embedding_arrays:
            combined += embedding * weight
        
        combined /= total_weight
        
        return combined.tolist()
    
    def cosine_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings."""
        if len(embedding1) != len(embedding2):
            raise ValueError("Embedding dimensions must match")
        
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        dot_product = np.dot(vec1, vec2)
        magnitude1 = np.linalg.norm(vec1)
        magnitude2 = np.linalg.norm(vec2)
        
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        
        return float(dot_product / (magnitude1 * magnitude2))
    
    def euclidean_distance(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate euclidean distance between two embeddings."""
        if len(embedding1) != len(embedding2):
            raise ValueError("Embedding dimensions must match")
        
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        return float(np.linalg.norm(vec1 - vec2))
    
    def get_embedding_dimension(self) -> int:
        """Get embedding dimension based on model."""
        dimension_map = {
            "text-embedding-3-large": 3072,
            "text-embedding-3-small": 1536,
            "text-embedding-ada-002": 1536,
        }
        
        return dimension_map.get(self.config.model, 1536)
    
    def _get_cache_key(self, text: str) -> str:
        """Generate cache key for text."""
        return f"{self.config.model}:{hash(text)}"
    
    def clear_cache(self) -> None:
        """Clear embedding cache."""
        self.cache.clear()
        logger.info("Embedding cache cleared")
    
    def get_cache_size(self) -> int:
        """Get cache size."""
        return len(self.cache)
    
    async def health_check(self) -> Dict[str, any]:
        """Perform health check."""
        try:
            # Test with a simple embedding
            test_embedding = await self.generate_embedding("test")
            
            return {
                "status": "healthy",
                "provider": self.config.provider,
                "model": self.config.model,
                "dimension": len(test_embedding),
                "cache_size": self.get_cache_size(),
            }
        except Exception as e:
            logger.error(f"Embedding service health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "provider": self.config.provider,
                "model": self.config.model,
            }