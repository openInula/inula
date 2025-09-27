"""
Logging utilities for Function RAG system.
"""

import logging
import sys
from typing import Optional

from loguru import logger


class InterceptHandler(logging.Handler):
    """Intercept standard logging and route to loguru."""
    
    def emit(self, record):
        """Emit a log record."""
        # Get corresponding Loguru level if it exists
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno
        
        # Find caller from where originated the logged message
        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1
        
        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


def setup_logging(level: str = "INFO", format_type: str = "standard") -> None:
    """Setup logging configuration."""
    # Remove default loguru handler
    logger.remove()
    
    # Define formats
    if format_type == "json":
        log_format = (
            "{"
            '"time": "{time:YYYY-MM-DD HH:mm:ss.SSS}", '
            '"level": "{level}", '
            '"module": "{module}", '
            '"function": "{function}", '
            '"line": {line}, '
            '"message": "{message}"'
            "}"
        )
    else:
        log_format = (
            "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
            "<level>{message}</level>"
        )
    
    # Add new handler
    logger.add(
        sys.stdout,
        format=log_format,
        level=level.upper(),
        colorize=True if format_type != "json" else False,
        serialize=True if format_type == "json" else False,
    )
    
    # Intercept standard logging
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)
    
    # Set specific loggers
    for logger_name in ["uvicorn", "uvicorn.error", "uvicorn.access"]:
        logging_logger = logging.getLogger(logger_name)
        logging_logger.handlers = [InterceptHandler()]


def get_logger(name: Optional[str] = None) -> "Logger":
    """Get a logger instance."""
    return logger.bind(name=name or __name__)


# Initialize default logging
setup_logging()