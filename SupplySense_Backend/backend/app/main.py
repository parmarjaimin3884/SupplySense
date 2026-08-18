"""
SupplySense — FastAPI Application Exporter (backend.app.main)
Re-exports the core FastAPI `app` instance from root `main.py`.
"""

import sys
import os

# Ensure backend root is on sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from main import app

__all__ = ["app"]
