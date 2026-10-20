"""RAG: question -> rewritten search query -> top-k chunks from pgvector -> Gemini answer."""

import logging
import re
from dataclasses import dataclass, field
from functools import lru_cache

from langchain_core.documents import Document
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI

from .config import settings
from .loader import load_files
from .prompts import prompt, rewrite_prompt
from .splitter import split_files
from .vectorstore import get_vectorstore

log = logging.getLogger("bean_rag")

HISTORY_TURNS = 6


@dataclass
class Answer:
    answer: str
    items: list[str] = field(default_factory=list)  # menu items to show as cards
    sources: list[dict] = field(default_factory=list)
    query: str = ""  # the rewritten search query (for debugging)


@lru_cache
def get_llm() -> ChatGoogleGenerativeAI:
    settings.require("google_api_key")
    return ChatGoogleGenerativeAI(
        model=settings.llm_model, google_api_key=settings.google_api_key, timeout=30, max_retries=1
    )


@lru_cache
def get_chain():
    return prompt | get_llm() | StrOutputParser()


@lru_cache
def get_rewriter():
    return rewrite_prompt | get_llm() | StrOutputParser()


def format_context(docs: list[Document]) -> str:
    return "\n\n".join(f"[{d.metadata.get('path', '')}]\n{d.page_content}" for d in docs)


def to_messages(history: list[dict]) -> list[BaseMessage]:
    msgs: list[BaseMessage] = []
    for m in history[-HISTORY_TURNS:]:
        text = (m.get("text") or "").strip()
        if text:
            msgs.append(HumanMessage(text) if m.get("role") == "user" else AIMessage(text))
    return msgs


def search_query(question: str, history: list[dict] | None = None) -> str:
    """Clean English search query: fixes typos, translates Roman Urdu, resolves follow-ups."""
    try:
        query = get_rewriter().invoke({"history": to_messages(history or []), "question": question}).strip()
        return query or question
    except Exception:
        log.warning("query rewrite failed; searching with the raw question", exc_info=True)
        return question


def retrieve(question: str, history: list[dict] | None = None, k: int = settings.top_k) -> list[Document]:
    return get_vectorstore().similarity_search(search_query(question, history), k=k)


def answer(question: str, history: list[dict] | None = None) -> Answer:
    query = search_query(question, history)
    docs = get_vectorstore().similarity_search(query, k=settings.top_k)
    text = get_chain().invoke(
        {"context": format_context(docs), "history": to_messages(history or []), "question": question}
    )
    sources = [{"path": d.metadata.get("path"), "type": d.metadata.get("type")} for d in docs]
    return Answer(answer=text, items=mentioned_items(text), sources=sources, query=query)


@lru_cache
def menu_item_names() -> tuple[str, ...]:
    """Menu item names from the knowledge file, longest first ("Iced Cappuccino" before "Cappuccino")."""
    names = {d.metadata["item_name"] for d in split_files(load_files()) if d.metadata.get("item_name")}
    return tuple(sorted(names, key=len, reverse=True))


def mentioned_items(text: str) -> list[str]:
    """Menu items to show as cards: the ones the answer recommends.

    The prompt asks the LLM to bold recommended items, so items it advises against
    (e.g. dairy desserts for an allergy) don't get an Order card. If nothing is bolded,
    fall back to every item named in the answer.
    """
    bold = " ".join(re.findall(r"\*\*(.+?)\*\*", text))
    return _find_items(bold) or _find_items(text)


def _find_items(text: str) -> list[str]:
    """Menu items named in text, in the order they appear."""
    found: list[tuple[int, str]] = []
    rest = text.lower()
    for name in menu_item_names():
        pos = rest.find(name.lower())
        if pos >= 0:
            found.append((pos, name))
            # Blank it out so "Cappuccino" doesn't also match inside "Iced Cappuccino".
            rest = rest.replace(name.lower(), " " * len(name))
    return [name for _, name in sorted(found)]
