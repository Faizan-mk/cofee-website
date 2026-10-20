"""Supabase pgvector store (table + match function from sql/001_pgvector.sql).

A small LangChain VectorStore on top of the Supabase client. It replaces
langchain-community's SupabaseVectorStore, which pulls in a large dependency
tree and is being sunset — this keeps the serverless bundle small.
"""

from collections.abc import Iterable
from functools import lru_cache
from typing import Any

from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain_core.vectorstores import VectorStore
from supabase import Client, create_client

from .config import settings
from .embeddings import GeminiEmbeddings

INSERT_BATCH = 100


class SupabasePgVector(VectorStore):
    def __init__(self, client: Client, embedding: Embeddings, table_name: str, query_name: str):
        self._client = client
        self._embedding = embedding
        self.table_name = table_name
        self.query_name = query_name

    @property
    def embeddings(self) -> Embeddings:
        return self._embedding

    def add_texts(
        self,
        texts: Iterable[str],
        metadatas: list[dict] | None = None,
        ids: list[str] | None = None,
        **kwargs: Any,
    ) -> list[str]:
        texts = list(texts)
        metadatas = metadatas or [{} for _ in texts]
        vectors = self._embedding.embed_documents(texts)
        rows = [
            {"content": t, "metadata": m, "embedding": v, **({"id": ids[i]} if ids else {})}
            for i, (t, m, v) in enumerate(zip(texts, metadatas, vectors))
        ]
        stored: list[str] = []
        for i in range(0, len(rows), INSERT_BATCH):
            res = self._client.table(self.table_name).insert(rows[i : i + INSERT_BATCH]).execute()
            stored.extend(str(r["id"]) for r in res.data)
        return stored

    def similarity_search_with_score(
        self, query: str, k: int = 4, filter: dict | None = None, **kwargs: Any
    ) -> list[tuple[Document, float]]:
        """Top-k chunks with cosine similarity (1 = identical meaning)."""
        res = self._client.rpc(
            self.query_name,
            {"query_embedding": self._embedding.embed_query(query), "match_count": k, "filter": filter or {}},
        ).execute()
        return [
            (Document(id=str(r["id"]), page_content=r["content"], metadata=r["metadata"]), r["similarity"])
            for r in res.data
        ]

    def similarity_search(self, query: str, k: int = 4, filter: dict | None = None, **kwargs: Any) -> list[Document]:
        return [doc for doc, _ in self.similarity_search_with_score(query, k, filter)]

    def _select_relevance_score_fn(self):
        # match function already returns cosine similarity in [0, 1]
        return lambda score: score

    def delete(self, ids: list[str] | None = None, **kwargs: Any) -> bool | None:
        if ids:
            self._client.table(self.table_name).delete().in_("id", ids).execute()
        return True

    @classmethod
    def from_texts(
        cls, texts: list[str], embedding: Embeddings, metadatas: list[dict] | None = None, **kwargs: Any
    ) -> "SupabasePgVector":
        store = cls(
            kwargs.get("client") or get_client(),
            embedding,
            kwargs.get("table_name", settings.table_name),
            kwargs.get("query_name", settings.query_name),
        )
        store.add_texts(texts, metadatas)
        return store


@lru_cache
def get_client() -> Client:
    settings.require("supabase_url", "supabase_key")
    return create_client(settings.supabase_url, settings.supabase_key)


@lru_cache
def get_vectorstore() -> SupabasePgVector:
    return SupabasePgVector(
        client=get_client(),
        embedding=GeminiEmbeddings(),
        table_name=settings.table_name,
        query_name=settings.query_name,
    )


def delete_source(source: str) -> None:
    """Remove every chunk that came from one knowledge file (so re-ingesting never duplicates)."""
    get_client().table(settings.table_name).delete().eq("metadata->>source", source).execute()
