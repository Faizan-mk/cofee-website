"""Supabase pgvector store (table + match function from sql/001_pgvector.sql)."""

from functools import lru_cache

from langchain_community.vectorstores import SupabaseVectorStore
from supabase import Client, create_client

from .config import settings
from .embeddings import GeminiEmbeddings


@lru_cache
def get_client() -> Client:
    settings.require("supabase_url", "supabase_key")
    return create_client(settings.supabase_url, settings.supabase_key)


@lru_cache
def get_vectorstore() -> SupabaseVectorStore:
    return SupabaseVectorStore(
        client=get_client(),
        embedding=GeminiEmbeddings(),
        table_name=settings.table_name,
        query_name=settings.query_name,
    )


def delete_source(source: str) -> None:
    """Remove every chunk that came from one knowledge file (so re-ingesting never duplicates)."""
    get_client().table(settings.table_name).delete().eq("metadata->>source", source).execute()
