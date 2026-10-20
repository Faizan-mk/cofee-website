"""Vercel Python function: serves the chatbot's FastAPI app (rag-backend/) at /api/*."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "rag-backend" / "src"))

from bean_rag.api import app  # noqa: E402,F401  (Vercel picks up the ASGI `app`)
