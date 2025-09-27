"""
Function management and search endpoints.
"""

from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.rag_system import FunctionRAGSystem
from app.models import (
    AddFunctionRequest,
    AddFunctionResponse,
    BatchAddRequest,
    BatchAddResponse,
    FunctionSummary,
    SearchRequest,
    SearchResponse,
    SearchResult,
)
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/functions", tags=["functions"])


def get_rag_system() -> FunctionRAGSystem:
    """Dependency to get RAG system instance."""
    from app.api.main import rag_system
    return rag_system


@router.post("/", response_model=AddFunctionResponse)
async def add_function(
    request: AddFunctionRequest,
    rag_system: FunctionRAGSystem = Depends(get_rag_system)
) -> AddFunctionResponse:
    """Add a new function to the RAG system."""
    try:
        function_id = await rag_system.add_function(request)
        
        return AddFunctionResponse(function_id=function_id)
        
    except Exception as e:
        logger.error(f"Failed to add function: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch", response_model=BatchAddResponse)
async def batch_add_functions(
    request: BatchAddRequest,
    rag_system: FunctionRAGSystem = Depends(get_rag_system)
) -> BatchAddResponse:
    """Add multiple functions in batch."""
    try:
        function_ids = await rag_system.batch_add_functions(request.functions)
        
        return BatchAddResponse(function_ids=function_ids)
        
    except Exception as e:
        logger.error(f"Failed to batch add functions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search", response_model=SearchResponse)
async def search_functions(
    request: SearchRequest,
    rag_system: FunctionRAGSystem = Depends(get_rag_system)
) -> SearchResponse:
    """Search for functions using natural language query."""
    try:
        results = await rag_system.search_functions(request)
        
        # Convert SearchResult objects to dictionaries
        result_dicts = []
        for result in results:
            result_dict = {
                "function": result.function.dict() if hasattr(result.function, 'dict') else result.function.__dict__,
                "score": result.score,
                "match_type": result.match_type.value,
                "explanation": result.explanation
            }
            result_dicts.append(result_dict)
        
        return SearchResponse(
            query=request.query,
            total_found=len(results),
            returned_count=len(results),
            results=result_dicts
        )
        
    except Exception as e:
        logger.error(f"Failed to search functions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search")
async def search_functions_get(
    q: str = Query(..., description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Result limit"),
    include_scores: bool = Query(True, description="Include similarity scores"),
    rag_system: FunctionRAGSystem = Depends(get_rag_system)
) -> SearchResponse:
    """Search for functions using GET method (for simple queries)."""
    try:
        request = SearchRequest(
            query=q,
            limit=limit,
            include_scores=include_scores
        )
        
        results = await rag_system.search_functions(request)
        
        # Convert SearchResult objects to dictionaries
        result_dicts = []
        for result in results:
            result_dict = {
                "function": result.function.dict() if hasattr(result.function, 'dict') else result.function.__dict__,
                "score": result.score if include_scores else None,
                "match_type": result.match_type.value,
                "explanation": result.explanation if include_scores else None
            }
            result_dicts.append(result_dict)
        
        return SearchResponse(
            query=q,
            total_found=len(results),
            returned_count=len(results),
            results=result_dicts
        )
        
    except Exception as e:
        logger.error(f"Failed to search functions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summaries")
async def get_all_function_summaries(
    rag_system: FunctionRAGSystem = Depends(get_rag_system)
) -> List[Dict]:
    """Get all function summaries with name, category, and description."""
    try:
        summaries = await rag_system.get_all_function_summaries()
        return summaries
        
    except Exception as e:
        logger.error(f"Failed to get function summaries: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/names")
async def get_all_function_names(
    rag_system: FunctionRAGSystem = Depends(get_rag_system)
) -> List[str]:
    """Get all function names in the system."""
    try:
        names = await rag_system.get_all_function_names()
        return names
        
    except Exception as e:
        logger.error(f"Failed to get function names: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{function_id}")
async def get_function(
    function_id: str,
    rag_system: FunctionRAGSystem = Depends(get_rag_system)
) -> Dict:
    """Get a specific function by ID."""
    try:
        result = await rag_system.get_function_by_id(function_id)
        
        if not result:
            raise HTTPException(status_code=404, detail="Function not found")
        
        return {
            "function": result.function.dict() if hasattr(result.function, 'dict') else result.function.__dict__,
            "score": result.score,
            "match_type": result.match_type.value,
            "explanation": result.explanation
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get function: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{function_id}/similar")
async def get_similar_functions(
    function_id: str,
    limit: int = Query(5, ge=1, le=20, description="Result limit"),
    rag_system: FunctionRAGSystem = Depends(get_rag_system)
) -> List[Dict]:
    """Get functions similar to a given function."""
    try:
        results = await rag_system.get_similar_functions(function_id, limit)
        
        # Convert to dictionaries
        result_dicts = []
        for result in results:
            result_dict = {
                "function": result.function.dict() if hasattr(result.function, 'dict') else result.function.__dict__,
                "score": result.score,
                "match_type": result.match_type.value,
                "explanation": result.explanation
            }
            result_dicts.append(result_dict)
        
        return result_dicts
        
    except Exception as e:
        logger.error(f"Failed to get similar functions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/category/{category}")
async def get_functions_by_category(
    category: str,
    subcategory: Optional[str] = Query(None, description="Optional subcategory filter"),
    limit: int = Query(10, ge=1, le=50, description="Result limit"),
    rag_system: FunctionRAGSystem = Depends(get_rag_system)
) -> Dict:
    """Get functions by category."""
    try:
        results = await rag_system.get_functions_by_category(
            category=category,
            subcategory=subcategory,
            limit=limit
        )
        
        # Convert to dictionaries
        result_dicts = []
        for result in results:
            result_dict = {
                "function": result.function.dict() if hasattr(result.function, 'dict') else result.function.__dict__,
                "score": result.score,
                "match_type": result.match_type.value,
                "explanation": result.explanation
            }
            result_dicts.append(result_dict)
        
        return {
            "category": category,
            "subcategory": subcategory,
            "total_found": len(results),
            "returned_count": len(results),
            "results": result_dicts
        }
        
    except Exception as e:
        logger.error(f"Failed to get functions by category: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{function_id}")
async def delete_function(
    function_id: str,
    rag_system: FunctionRAGSystem = Depends(get_rag_system)
) -> Dict[str, str]:
    """Delete a function from the system."""
    try:
        success = await rag_system.delete_function(function_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Function not found")
        
        return {"message": f"Function {function_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete function: {e}")
        raise HTTPException(status_code=500, detail=str(e))