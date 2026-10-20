"""Gemini embeddings as a LangChain Embeddings class.

Uses the google-genai SDK directly so we can request a fixed 768-dim output
(pgvector indexes cap out at 2000 dims; gemini-embedding-001 defaults to 3072)
and the right task type for documents vs. questions.
"""

import math

from google import genai
from google.genai import types
from langchain_core.embeddings import Embeddings

from .config import settings

BATCH = 50


def _normalize(v: list[float]) -> list[float]:
    # Truncated Gemini embeddings are not unit length; normalize for cosine search.
    n = math.sqrt(sum(x * x for x in v)) or 1.0
    return [x / n for x in v]


class GeminiEmbeddings(Embeddings):
    def __init__(self, model: str = settings.embedding_model, dim: int = settings.embedding_dim):
        settings.require("google_api_key")
        self.client = genai.Client(api_key=settings.google_api_key)
        self.model = model
        self.dim = dim

    def _embed(self, texts: list[str], task: str) -> list[list[float]]:
        out: list[list[float]] = []
        for i in range(0, len(texts), BATCH):
            res = self.client.models.embed_content(
                model=self.model,
                contents=texts[i : i + BATCH],
                config=types.EmbedContentConfig(task_type=task, output_dimensionality=self.dim),
            )
            out.extend(_normalize(e.values) for e in res.embeddings)
        return out

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return self._embed(texts, "RETRIEVAL_DOCUMENT")

    def embed_query(self, text: str) -> list[float]:
        return self._embed([text], "RETRIEVAL_QUERY")[0]
