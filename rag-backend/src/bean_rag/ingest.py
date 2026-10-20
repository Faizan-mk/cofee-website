"""Pipeline: data/ files -> chunks -> embeddings -> Supabase.

Run:  python -m bean_rag.ingest            (replace stored chunks)
      python -m bean_rag.ingest --dry-run  (only print the chunks)
"""

import argparse
import sys
from collections import Counter

from .loader import load_files
from .splitter import split_files


def main() -> None:
    parser = argparse.ArgumentParser(description="Embed the knowledge files into Supabase pgvector.")
    parser.add_argument("--dry-run", action="store_true", help="show chunks without embedding or saving")
    args = parser.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")  # Windows consoles default to cp1252

    files = load_files()
    chunks = split_files(files)
    print(f"{len(files)} file(s) -> {len(chunks)} chunks")
    print("by type:", dict(Counter(c.metadata["type"] for c in chunks)))

    if args.dry_run:
        for c in chunks:
            print(f"\n--- #{c.metadata['chunk_index']} {c.metadata['path']} ({len(c.page_content)} chars)")
            print(c.page_content)
        return

    # Imported here so --dry-run works without any keys.
    from .vectorstore import delete_source, get_vectorstore

    store = get_vectorstore()
    for name, _ in files:
        delete_source(name)
    store.add_documents(chunks)
    print(f"Stored {len(chunks)} chunks in Supabase.")


if __name__ == "__main__":
    main()
