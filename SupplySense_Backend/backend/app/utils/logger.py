"""
SupplySense — Centralized Logging Foundation
Configures Loguru logger with console and rotating file sinks.
"""

import sys
import logging
from pathlib import Path

try:
    from loguru import logger
    from backend.app.config.settings import settings

    # Create logs directory
    LOGS_DIR = Path("logs")
    LOGS_DIR.mkdir(exist_ok=True)

    # Remove default handlers
    logger.remove()

    # Console handler with color
    logger.add(
        sys.stdout,
        colorize=True,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="DEBUG" if getattr(settings, "DEBUG", True) else "INFO",
    )

    # File handler with rotation and retention
    logger.add(
        LOGS_DIR / "supplysense_{time:YYYY-MM-DD}.log",
        rotation="10 MB",
        retention="30 days",
        compression="zip",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level="INFO",
    )
except ImportError:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(name)s - %(message)s")
    logger = logging.getLogger("supplysense")

__all__ = ["logger"]
