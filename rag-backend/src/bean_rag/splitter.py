"""Turn markdown into chunks with metadata.

Step 1 cuts on headings, and each heading becomes metadata
(e.g. section="Menu", category="Cold Coffee", item="Iced Latte").
Step 2 cuts anything still longer than chunk_size.
"""

import re

from langchain_core.documents import Document
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter

from .config import settings

HEADERS = [("#", "title"), ("##", "section"), ("###", "topic"), ("####", "item")]

# Top-level section -> chunk type, used for filtering and for the chat UI.
SECTION_TYPES = {
    "About Bean Scene": "about",
    "Menu": "menu",
    "Dietary Information": "dietary",
    "Recommendations": "recommendation",
    "Ordering and Delivery": "order",
    "Contact and Visit": "contact",
    "Account": "account",
    "Website Guide": "website",
    "Coffee Guide": "guide",
    "Frequently Asked Questions": "faq",
}

PRICE = re.compile(r"Price:\s*\$(\d+(?:\.\d+)?)")


def _metadata(source: str, headers: dict, content: str, index: int) -> dict:
    section = headers.get("section", "")
    path = [headers[k] for k in ("section", "topic", "item") if headers.get(k)]
    meta = {
        "source": source,
        "section": section,
        "path": " > ".join(path),
        "type": SECTION_TYPES.get(section, "general"),
        "chunk_index": index,
    }
    if meta["type"] == "menu" and headers.get("item"):
        meta["item_name"] = headers["item"]
        meta["category"] = headers.get("topic", "")
        if m := PRICE.search(content):
            meta["price"] = float(m.group(1))
    return meta


def split_text(
    text: str,
    source: str,
    chunk_size: int = settings.chunk_size,
    chunk_overlap: int = settings.chunk_overlap,
) -> list[Document]:
    by_heading = MarkdownHeaderTextSplitter(headers_to_split_on=HEADERS, strip_headers=True)
    by_size = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
        keep_separator="end",  # a sentence keeps its own full stop
    )

    chunks: list[Document] = []
    for part in by_heading.split_text(text):
        for piece in by_size.split_text(part.page_content):
            path = " > ".join(part.metadata[k] for k in ("section", "topic", "item") if part.metadata.get(k))
            # Prefix the heading path so the chunk is self-explanatory to the
            # embedding model and the LLM ("Menu > Cold Coffee > Iced Latte: ...").
            content = f"{path}\n{piece}" if path else piece
            chunks.append(
                Document(page_content=content, metadata=_metadata(source, part.metadata, piece, len(chunks)))
            )
    return chunks


def split_files(files: list[tuple[str, str]], **kwargs) -> list[Document]:
    return [doc for name, text in files for doc in split_text(text, name, **kwargs)]
