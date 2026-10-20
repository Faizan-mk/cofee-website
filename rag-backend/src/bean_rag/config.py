"""All settings in one place. Secrets come from rag-backend/.env."""

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data"

load_dotenv(ROOT / ".env")


def _env(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


@dataclass(frozen=True)
class Settings:
    # Secrets
    google_api_key: str = field(default_factory=lambda: _env("GOOGLE_API_KEY"))
    supabase_url: str = field(default_factory=lambda: _env("SUPABASE_URL"))
    supabase_key: str = field(default_factory=lambda: _env("SUPABASE_SERVICE_ROLE_KEY"))

    # Models
    llm_model: str = field(default_factory=lambda: _env("LLM_MODEL", "gemini-3.5-flash-lite"))
    # Search-query rewriting uses a different model on purpose: the Gemini free tier limits
    # requests per minute *per model* (15), so splitting the two calls spreads the load.
    rewrite_model: str = field(default_factory=lambda: _env("REWRITE_MODEL", "gemini-flash-lite-latest"))
    embedding_model: str = field(default_factory=lambda: _env("EMBEDDING_MODEL", "gemini-embedding-001"))
    # Must match vector(768) in sql/001_pgvector.sql.
    embedding_dim: int = 768

    # Chunking: headings already cut the file into topic-sized sections (longest
    # is ~650 chars), so 800 keeps every section whole — one menu item / FAQ per
    # chunk — without merging topics. 100 (~12%) overlap only kicks in if a
    # section grows past 800, keeping sentences across the cut readable.
    # Compare settings in notebooks/01_chunking.ipynb.
    chunk_size: int = 800
    chunk_overlap: int = 100

    # Retrieval
    table_name: str = "bean_documents"
    query_name: str = "match_bean_documents"
    top_k: int = 4

    # API
    cors_origins: list[str] = field(
        default_factory=lambda: [
            o.strip()
            for o in _env("CORS_ORIGINS", "http://localhost:5173,http://localhost:4173").split(",")
            if o.strip()
        ]
    )

    def require(self, *names: str) -> None:
        missing = [n for n in names if not getattr(self, n)]
        if missing:
            env_names = {
                "google_api_key": "GOOGLE_API_KEY",
                "supabase_url": "SUPABASE_URL",
                "supabase_key": "SUPABASE_SERVICE_ROLE_KEY",
            }
            raise RuntimeError(
                "Missing in rag-backend/.env: " + ", ".join(env_names.get(n, n) for n in missing)
            )


settings = Settings()
