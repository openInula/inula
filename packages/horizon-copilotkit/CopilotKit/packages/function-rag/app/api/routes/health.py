"""
Health check endpoints.
"""

from datetime import datetime
from typing import Dict

from fastapi import APIRouter, Depends

from app.core.rag_system import FunctionRAGSystem
from app.models import HealthStatus, SystemStats
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/health", tags=["health"])


def get_rag_system() -> FunctionRAGSystem:
    """Dependency to get RAG system instance."""
    # This would be injected via dependency injection in a real app
    from app.api.main import rag_system
    return rag_system


@router.get("/", response_model=HealthStatus)
async def health_check(
    rag_system: FunctionRAGSystem = Depends(get_rag_system)
) -> HealthStatus:
    """Perform comprehensive health check."""
    try:
        health_data = await rag_system.health_check()
        
        return HealthStatus(
            status=health_data["status"],
            details=health_data,
            timestamp=datetime.utcnow()
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthStatus(
            status="unhealthy",
            details={"error": str(e)},
            timestamp=datetime.utcnow()
        )


@router.get("/stats", response_model=SystemStats)
async def get_system_stats(
    rag_system: FunctionRAGSystem = Depends(get_rag_system)
) -> SystemStats:
    """Get system statistics."""
    try:
        stats = await rag_system.get_system_stats()
        
        return SystemStats(
            total_functions=stats.get("total_functions", 0),
            vector_storage_stats=stats.get("vector_storage_stats", {}),
            cache_stats=stats.get("cache_stats", {}),
            embedding_cache_size=stats.get("embedding_cache_size", 0)
        )
        
    except Exception as e:
        logger.error(f"Failed to get system stats: {e}")
        return SystemStats(
            total_functions=0,
            vector_storage_stats={"error": str(e)},
            cache_stats={"error": str(e)},
            embedding_cache_size=0
        )


@router.get("/ready")
async def readiness_probe(
    rag_system: FunctionRAGSystem = Depends(get_rag_system)
) -> Dict[str, str]:
    """Readiness probe for Kubernetes."""
    try:
        health_data = await rag_system.health_check()
        
        if health_data["status"] == "healthy":
            return {"status": "ready"}
        else:
            return {"status": "not ready", "details": str(health_data.get("error", ""))}
            
    except Exception as e:
        logger.error(f"Readiness probe failed: {e}")
        return {"status": "not ready", "error": str(e)}


@router.get("/alive")
async def liveness_probe() -> Dict[str, str]:
    """Liveness probe for Kubernetes."""
    return {"status": "alive"}