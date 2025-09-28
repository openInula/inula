#!/usr/bin/env python3
"""
Function RAG System entry point.
"""

import asyncio
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from app.api.main import app, config_manager


def main():
    """Main entry point."""
    import uvicorn
    
    server_config = config_manager.server_config
    
    uvicorn.run(
        "app.api.main:app",
        host=server_config["host"],
        port=server_config["port"],
        workers=server_config["workers"] if server_config["workers"] > 1 else None,
        reload=config_manager.settings.debug,
        log_config=None,  # We handle logging ourselves
        access_log=False,  # We handle access logging through loguru
    )


if __name__ == "__main__":
    main()