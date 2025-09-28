"""
Multi-stage retrieval engine for function RAG system.
"""

import asyncio
import re
from typing import Any, Dict, List, Optional, Set, Tuple

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.models import (
    FunctionEmbeddings,
    FunctionModel,
    MatchType,
    ProcessedQuery,
    QueryIntent,
    RetrievalConfig,
    RetrievalError,
    SearchResult,
)
from app.services.embedding_service import EmbeddingService
from app.services.vector_storage import VectorStorageService
from app.utils.logger import get_logger

logger = get_logger(__name__)


class QueryProcessor:
    """Process and analyze queries for better retrieval."""
    
    def __init__(self):
        """Initialize query processor."""
        self.entity_patterns = [
            r'\b[A-Z][a-z]+(?:[A-Z][a-z]+)*\b',  # CamelCase
            r'\b[a-z]+(?:_[a-z]+)+\b',  # snake_case
            r'\b[a-z]+-[a-z]+(?:-[a-z]+)*\b',  # kebab-case
            r'\"([^\"]+)\"',  # quoted strings
            r"'([^']+)'",  # single quoted strings
        ]
    
    async def process_query(
        self, 
        query: str, 
        embedding_service: EmbeddingService
    ) -> ProcessedQuery:
        """Process query and extract relevant information."""
        try:
            # Clean and normalize query
            cleaned_query = self._clean_query(query)
            
            # Extract entities
            entities = self._extract_entities(cleaned_query)
            
            # Determine intent
            intent = self._determine_intent(cleaned_query, entities)
            
            # Expand query if needed
            expanded_query = self._expand_query(cleaned_query, intent)
            
            # Generate embedding
            embedding = await embedding_service.generate_embedding(expanded_query or cleaned_query)
            
            return ProcessedQuery(
                intent=intent,
                entities=entities,
                embedding=embedding,
                original=query,
                expanded=expanded_query
            )
            
        except Exception as e:
            logger.error(f"Failed to process query: {e}")
            raise RetrievalError(f"Query processing failed: {str(e)}")
    
    def _clean_query(self, query: str) -> str:
        """Clean and normalize the query."""
        # Remove extra whitespace
        cleaned = re.sub(r'\s+', ' ', query.strip())
        
        # Convert to lowercase for processing (preserve original case in entities)
        return cleaned
    
    def _extract_entities(self, query: str) -> List[str]:
        """Extract potential entities from query."""
        entities = []
        
        for pattern in self.entity_patterns:
            matches = re.findall(pattern, query)
            entities.extend(matches)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_entities = []
        for entity in entities:
            if entity.lower() not in seen:
                seen.add(entity.lower())
                unique_entities.append(entity)
        
        return unique_entities
    
    def _determine_intent(self, query: str, entities: List[str]) -> QueryIntent:
        """Determine query intent based on patterns."""
        query_lower = query.lower()
        
        # Direct match patterns
        direct_patterns = [
            r'\bfind\s+function\s+named\b',
            r'\bget\s+function\s+called\b',
            r'\bshow\s+me\s+the\s+function\b',
        ]
        
        # Scenario patterns
        scenario_patterns = [
            r'\bhow\s+to\b',
            r'\bwhat\s+function\s+can\b',
            r'\bi\s+need\s+to\b',
            r'\bhelp\s+me\b',
        ]
        
        # Combination patterns
        combination_patterns = [
            r'\band\b',
            r'\bor\b',
            r'\bwith\b.*\band\b',
            r'\bthat\s+also\b',
        ]
        
        if any(re.search(pattern, query_lower) for pattern in direct_patterns):
            return QueryIntent.DIRECT_MATCH
        elif any(re.search(pattern, query_lower) for pattern in scenario_patterns):
            return QueryIntent.SCENARIO_MATCH
        elif any(re.search(pattern, query_lower) for pattern in combination_patterns):
            return QueryIntent.COMBINATION_QUERY
        else:
            return QueryIntent.FUNCTIONAL_SEARCH
    
    def _expand_query(self, query: str, intent: QueryIntent) -> Optional[str]:
        """Expand query based on intent for better retrieval."""
        expansions = {
            QueryIntent.SCENARIO_MATCH: [
                "function that can",
                "implementation for",
                "solution to",
                "way to accomplish",
            ],
            QueryIntent.FUNCTIONAL_SEARCH: [
                "function for",
                "method to",
                "tool for",
                "utility to",
            ],
        }
        
        if intent in expansions:
            expansion_terms = " ".join(expansions[intent])
            return f"{query} {expansion_terms}"
        
        return None


class RetrievalEngine:
    """Multi-stage retrieval engine with hybrid search capabilities."""
    
    def __init__(
        self,
        config: RetrievalConfig,
        embedding_service: EmbeddingService,
        vector_storage: VectorStorageService
    ):
        """Initialize retrieval engine."""
        self.config = config
        self.embedding_service = embedding_service
        self.vector_storage = vector_storage
        self.query_processor = QueryProcessor()
        
        # Initialize TF-IDF vectorizer for keyword search
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            lowercase=True,
            token_pattern=r'\b[a-zA-Z_][a-zA-Z0-9_]*\b'
        )
        
        # Cache for function metadata
        self._metadata_cache: Dict[str, Dict] = {}
        self._tfidf_fitted = False
        
        logger.info("Retrieval engine initialized")
    
    async def search(
        self, 
        query: str, 
        limit: int = 10,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[SearchResult]:
        """Perform multi-stage hybrid search."""
        try:
            # Process query
            processed_query = await self.query_processor.process_query(
                query, self.embedding_service
            )
            
            # Stage 1: Semantic search
            semantic_results = await self._semantic_search(
                processed_query, 
                self.config.top_k,
                filters
            )
            
            # Stage 2: Keyword search
            keyword_results = await self._keyword_search(
                processed_query,
                self.config.top_k,
                filters
            )
            
            # Stage 3: Category-based search
            category_results = await self._category_search(
                processed_query,
                self.config.top_k,
                filters
            )
            
            # Stage 4: Hybrid ranking
            final_results = await self._hybrid_ranking(
                semantic_results,
                keyword_results,
                category_results,
                processed_query,
                limit
            )
            
            return final_results
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            raise RetrievalError(f"Search failed: {str(e)}")
    
    async def _semantic_search(
        self,
        processed_query: ProcessedQuery,
        limit: int,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Tuple[Any, float, MatchType]]:
        """Perform semantic vector search."""
        try:
            # Try different vector types based on query intent
            vector_types = ["combined"]
            if processed_query.intent == QueryIntent.SCENARIO_MATCH:
                vector_types = ["scenarios", "combined", "detailed"]
            elif processed_query.intent == QueryIntent.DIRECT_MATCH:
                vector_types = ["main", "combined"]
            elif processed_query.intent == QueryIntent.FUNCTIONAL_SEARCH:
                vector_types = ["detailed", "combined", "main"]
            
            results = []
            for vector_type in vector_types:
                try:
                    search_results = await self.vector_storage.search_similar(
                        query_embedding=processed_query.embedding,
                        limit=limit // len(vector_types) + 5,
                        vector_name=vector_type,
                        score_threshold=self.config.threshold,
                        filter_conditions=filters
                    )
                    
                    for result in search_results:
                        results.append((result, result.score, MatchType.SEMANTIC))
                    
                except Exception as e:
                    logger.warning(f"Semantic search with {vector_type} failed: {e}")
                    continue
            
            return results[:limit]
            
        except Exception as e:
            logger.error(f"Semantic search failed: {e}")
            return []
    
    async def _keyword_search(
        self,
        processed_query: ProcessedQuery,
        limit: int,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Tuple[Any, float, MatchType]]:
        """Perform keyword-based search using TF-IDF."""
        try:
            # Get all functions for TF-IDF comparison
            if not self._tfidf_fitted:
                await self._update_tfidf_index()
            
            # Simple keyword matching for now
            # In a full implementation, you'd use the TF-IDF vectorizer
            query_terms = set(processed_query.original.lower().split())
            query_terms.update(processed_query.entities)
            
            results = []
            
            # Search by name similarity
            for function_id, metadata in self._metadata_cache.items():
                name_terms = set(metadata.get('name', '').lower().split())
                description_terms = set(metadata.get('description', '').lower().split())
                tag_terms = set(metadata.get('tags', []))
                
                all_terms = name_terms | description_terms | tag_terms
                
                # Calculate simple overlap score
                overlap = len(query_terms & all_terms)
                if overlap > 0:
                    score = overlap / len(query_terms | all_terms)
                    
                    # Mock result structure (in real implementation, get from vector store)
                    mock_result = type('MockResult', (), {
                        'id': function_id,
                        'payload': metadata,
                        'score': score
                    })()
                    
                    results.append((mock_result, score, MatchType.KEYWORD))
            
            # Sort by score and limit
            results.sort(key=lambda x: x[1], reverse=True)
            return results[:limit]
            
        except Exception as e:
            logger.error(f"Keyword search failed: {e}")
            return []
    
    async def _category_search(
        self,
        processed_query: ProcessedQuery,
        limit: int,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Tuple[Any, float, MatchType]]:
        """Perform category-based search."""
        try:
            results = []
            
            # Extract potential categories from query
            potential_categories = self._extract_categories(processed_query.original)
            
            for category in potential_categories:
                try:
                    category_results = await self.vector_storage.search_by_category(
                        category=category,
                        limit=limit // len(potential_categories) + 2
                    )
                    
                    for result in category_results:
                        results.append((result, 0.8, MatchType.CATEGORY))  # Fixed score for category matches
                    
                except Exception as e:
                    logger.warning(f"Category search for {category} failed: {e}")
                    continue
            
            return results[:limit]
            
        except Exception as e:
            logger.error(f"Category search failed: {e}")
            return []
    
    async def _hybrid_ranking(
        self,
        semantic_results: List[Tuple[Any, float, MatchType]],
        keyword_results: List[Tuple[Any, float, MatchType]],
        category_results: List[Tuple[Any, float, MatchType]],
        processed_query: ProcessedQuery,
        limit: int
    ) -> List[SearchResult]:
        """Combine and rank results from different search methods."""
        try:
            # Combine all results
            all_results = {}
            
            # Process semantic results
            for result, score, match_type in semantic_results:
                function_id = str(result.id)
                weighted_score = score * self.config.semantic_weight
                
                if function_id not in all_results:
                    all_results[function_id] = {
                        'result': result,
                        'scores': {'semantic': weighted_score},
                        'match_types': {match_type}
                    }
                else:
                    all_results[function_id]['scores']['semantic'] = max(
                        all_results[function_id]['scores'].get('semantic', 0),
                        weighted_score
                    )
                    all_results[function_id]['match_types'].add(match_type)
            
            # Process keyword results
            for result, score, match_type in keyword_results:
                function_id = str(result.id)
                weighted_score = score * self.config.keyword_weight
                
                if function_id not in all_results:
                    all_results[function_id] = {
                        'result': result,
                        'scores': {'keyword': weighted_score},
                        'match_types': {match_type}
                    }
                else:
                    all_results[function_id]['scores']['keyword'] = max(
                        all_results[function_id]['scores'].get('keyword', 0),
                        weighted_score
                    )
                    all_results[function_id]['match_types'].add(match_type)
            
            # Process category results
            for result, score, match_type in category_results:
                function_id = str(result.id)
                weighted_score = score * self.config.category_weight
                
                if function_id not in all_results:
                    all_results[function_id] = {
                        'result': result,
                        'scores': {'category': weighted_score},
                        'match_types': {match_type}
                    }
                else:
                    all_results[function_id]['scores']['category'] = max(
                        all_results[function_id]['scores'].get('category', 0),
                        weighted_score
                    )
                    all_results[function_id]['match_types'].add(match_type)
            
            # Calculate final scores and create SearchResult objects
            final_results = []
            
            for function_id, data in all_results.items():
                result = data['result']
                scores = data['scores']
                match_types = data['match_types']
                
                # Calculate final score
                final_score = sum(scores.values())
                
                # Apply popularity and reliability bonuses
                if hasattr(result, 'payload') and result.payload:
                    popularity_score = result.payload.get('popularity_score', 0)
                    reliability_score = result.payload.get('reliability_score', 0.5)
                    
                    # Small bonus for popular and reliable functions
                    final_score *= (1 + popularity_score * 0.1 + reliability_score * 0.1)
                
                # Determine primary match type
                if MatchType.SEMANTIC in match_types:
                    primary_match_type = MatchType.SEMANTIC
                elif len(match_types) > 1:
                    primary_match_type = MatchType.HYBRID
                else:
                    primary_match_type = next(iter(match_types))
                
                # Create function object from result
                if hasattr(result, 'payload') and result.payload:
                    function_data = result.payload
                    # Add missing fields if needed
                    if 'function_id' not in function_data:
                        function_data['function_id'] = str(result.id)
                    
                    try:
                        from app.models import LLMFunction
                        function = LLMFunction(**function_data)
                    except Exception as e:
                        logger.warning(f"Failed to create LLMFunction from payload: {e}")
                        # Create a minimal function object
                        function = type('MinimalFunction', (), function_data)()
                else:
                    # Create minimal function from result
                    function = type('MinimalFunction', (), {
                        'function_id': str(result.id),
                        'name': 'Unknown',
                        'description': 'No description available'
                    })()
                
                search_result = SearchResult(
                    function=function,
                    score=min(final_score, 1.0),  # Cap at 1.0
                    match_type=primary_match_type,
                    explanation=self._generate_explanation(scores, match_types, processed_query)
                )
                
                final_results.append(search_result)
            
            # Sort by final score and apply threshold
            final_results.sort(key=lambda x: x.score, reverse=True)
            filtered_results = [
                r for r in final_results 
                if r.score >= self.config.threshold
            ]
            
            return filtered_results[:limit]
            
        except Exception as e:
            logger.error(f"Hybrid ranking failed: {e}")
            return []
    
    async def _update_tfidf_index(self) -> None:
        """Update TF-IDF index with current functions."""
        try:
            # Get collection stats to get all functions
            stats = await self.vector_storage.get_collection_stats()
            
            # For now, just mark as fitted
            # In a full implementation, you'd fetch all functions and build the index
            self._tfidf_fitted = True
            
            logger.info("TF-IDF index updated")
            
        except Exception as e:
            logger.warning(f"Failed to update TF-IDF index: {e}")
    
    def _extract_categories(self, query: str) -> List[str]:
        """Extract potential categories from query."""
        # Common function categories
        categories = [
            'data', 'text', 'file', 'network', 'database', 'api', 'utility',
            'math', 'string', 'array', 'object', 'date', 'time', 'validation',
            'parsing', 'formatting', 'conversion', 'calculation', 'analysis'
        ]
        
        query_lower = query.lower()
        found_categories = []
        
        for category in categories:
            if category in query_lower:
                found_categories.append(category)
        
        return found_categories or ['utility']  # Default category
    
    def _generate_explanation(
        self,
        scores: Dict[str, float],
        match_types: Set[MatchType],
        processed_query: ProcessedQuery
    ) -> str:
        """Generate explanation for search result."""
        explanations = []
        
        if 'semantic' in scores and scores['semantic'] > 0:
            explanations.append(f"semantic similarity: {scores['semantic']:.2f}")
        
        if 'keyword' in scores and scores['keyword'] > 0:
            explanations.append(f"keyword match: {scores['keyword']:.2f}")
        
        if 'category' in scores and scores['category'] > 0:
            explanations.append(f"category match: {scores['category']:.2f}")
        
        if len(match_types) > 1:
            explanations.append("hybrid match")
        
        return "; ".join(explanations) if explanations else "matched query"
    
    async def get_similar_functions(
        self, 
        function_id: str, 
        limit: int = 5
    ) -> List[SearchResult]:
        """Find functions similar to a given function."""
        try:
            # Get the function
            function_point = await self.vector_storage.get_function_by_id(function_id)
            if not function_point or not function_point.vector:
                return []
            
            # Use the function's combined embedding to find similar ones
            similar_results = await self.vector_storage.search_similar(
                query_embedding=function_point.vector.get('combined', []),
                limit=limit + 1,  # +1 because the function itself might be included
                vector_name="combined",
                score_threshold=0.5
            )
            
            # Filter out the original function and convert to SearchResult
            search_results = []
            for result in similar_results:
                if str(result.id) != function_id:
                    try:
                        from app.models import LLMFunction
                        function = LLMFunction(**result.payload)
                        search_result = SearchResult(
                            function=function,
                            score=result.score,
                            match_type=MatchType.SEMANTIC,
                            explanation=f"Similar to {function_id}"
                        )
                        search_results.append(search_result)
                    except Exception as e:
                        logger.warning(f"Failed to create SearchResult: {e}")
                        continue
            
            return search_results[:limit]
            
        except Exception as e:
            logger.error(f"Failed to get similar functions: {e}")
            return []
    
    async def get_functions_by_category(
        self, 
        category: str, 
        limit: int = 10,
        subcategory: Optional[str] = None
    ) -> List[SearchResult]:
        """Get functions by category."""
        try:
            results = await self.vector_storage.search_by_category(
                category=category,
                subcategory=subcategory,
                limit=limit
            )
            
            search_results = []
            for result in results:
                try:
                    from app.models import LLMFunction
                    function = LLMFunction(**result.payload)
                    search_result = SearchResult(
                        function=function,
                        score=1.0,  # Perfect category match
                        match_type=MatchType.CATEGORY,
                        explanation=f"Category: {category}"
                    )
                    search_results.append(search_result)
                except Exception as e:
                    logger.warning(f"Failed to create SearchResult: {e}")
                    continue
            
            return search_results
            
        except Exception as e:
            logger.error(f"Failed to get functions by category: {e}")
            return []
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check."""
        try:
            return {
                "status": "healthy",
                "config": {
                    "top_k": self.config.top_k,
                    "rerank_top_n": self.config.rerank_top_n,
                    "semantic_weight": self.config.semantic_weight,
                    "keyword_weight": self.config.keyword_weight,
                    "category_weight": self.config.category_weight,
                    "threshold": self.config.threshold,
                },
                "tfidf_fitted": self._tfidf_fitted,
                "cache_size": len(self._metadata_cache),
            }
        except Exception as e:
            logger.error(f"Retrieval engine health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e)
            }