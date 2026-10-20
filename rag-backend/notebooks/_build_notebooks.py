"""Generates the two notebooks in this folder. Run: python notebooks/_build_notebooks.py"""

from pathlib import Path

import nbformat as nbf

HERE = Path(__file__).parent
md, code = nbf.v4.new_markdown_cell, nbf.v4.new_code_cell


def save(name: str, cells: list) -> None:
    nb = nbf.v4.new_notebook(cells=cells)
    nb.metadata["kernelspec"] = {"name": "python3", "display_name": "Python 3", "language": "python"}
    nbf.write(nb, HERE / name)


save(
    "01_chunking.ipynb",
    [
        md(
            "# 01 · Chunking experiments\n"
            "Load `data/bean-scene.md`, try different `chunk_size` / `chunk_overlap` values and inspect the chunks "
            "and their metadata **before** anything is embedded. No API keys needed."
        ),
        code(
            "import pandas as pd\n"
            "from bean_rag.config import settings\n"
            "from bean_rag.loader import load_files\n"
            "from bean_rag.splitter import split_files\n\n"
            "pd.set_option('display.max_colwidth', 90)\n"
            "files = load_files()\n"
            "for name, text in files:\n"
            "    print(f'{name}: {len(text):,} characters, {text.count(chr(10)):,} lines')\n"
            "print('current settings -> chunk_size', settings.chunk_size, '| chunk_overlap', settings.chunk_overlap)"
        ),
        md(
            "## Compare settings\n"
            "Small chunks = precise search but less context per chunk. Big chunks = more context but several topics "
            "mixed together, so search gets fuzzier. *split sections* counts headings that were cut into more than one chunk."
        ),
        code(
            "rows = []\n"
            "for size in (300, 500, 800, 1200):\n"
            "    for overlap in (0, 100, 150):\n"
            "        if overlap >= size:\n"
            "            continue\n"
            "        chunks = split_files(files, chunk_size=size, chunk_overlap=overlap)\n"
            "        lengths = [len(c.page_content) for c in chunks]\n"
            "        paths = pd.Series([c.metadata['path'] for c in chunks])\n"
            "        rows.append({'chunk_size': size, 'overlap': overlap, 'chunks': len(chunks),\n"
            "                     'avg_len': round(sum(lengths) / len(lengths)), 'max_len': max(lengths),\n"
            "                     'split_sections': int((paths.value_counts() > 1).sum())})\n"
            "pd.DataFrame(rows)"
        ),
        md(
            "Headings already cut the file into topic-sized pieces, so bigger sizes never merge two topics — they only "
            "stop splitting the few long sections. At 300 or 500 some sections are cut and leave stray fragments "
            "(e.g. *\"You don't need an account to order\"* on its own); from 800 up **no section is split** and the "
            "result stops changing. So we use **800 / 100**: one whole section (one menu item, one FAQ) per chunk, with "
            "100 chars of overlap ready for when a section grows past 800."
        ),
        md("## Chunks with the chosen settings"),
        code(
            "chunks = split_files(files)\n"
            "df = pd.DataFrame([{**c.metadata, 'chars': len(c.page_content)} for c in chunks])\n"
            "print(len(chunks), 'chunks')\n"
            "df[['chunk_index', 'type', 'path', 'item_name', 'price', 'chars']].head(25)"
        ),
        code("df.groupby('type').agg(chunks=('chunk_index', 'count'), avg_chars=('chars', 'mean')).round()"),
        code("df['chars'].describe().round()"),
        md("## Look at a few chunks exactly as they will be embedded"),
        code(
            "for c in chunks[12:15] + chunks[-2:]:\n"
            "    print('─' * 80)\n"
            "    print(c.metadata)\n"
            "    print(c.page_content)"
        ),
        md(
            "## Next\n"
            "Happy with the chunks? Change `chunk_size` / `chunk_overlap` in `src/bean_rag/config.py` if needed, then run "
            "`python -m bean_rag.ingest` to store them in Supabase, and open `02_retrieval.ipynb`."
        ),
    ],
)

save(
    "02_retrieval.ipynb",
    [
        md(
            "# 02 · Retrieval & answers\n"
            "Needs `rag-backend/.env` filled in and `python -m bean_rag.ingest` already run.\n"
            "Checks which chunks pgvector returns for a question, then the final LLM answer."
        ),
        code(
            "from bean_rag.config import settings\n"
            "from bean_rag.vectorstore import get_client, get_vectorstore\n\n"
            "settings.require('google_api_key', 'supabase_url', 'supabase_key')\n"
            "rows = get_client().table(settings.table_name).select('id', count='exact').limit(1).execute()\n"
            "print('chunks stored in Supabase:', rows.count)"
        ),
        md("## What does the vector search find?\nHigher score = closer meaning (cosine similarity)."),
        code(
            "store = get_vectorstore()\n\n"
            "def show(question, k=settings.top_k):\n"
            "    print('Q:', question)\n"
            "    for doc, score in store.similarity_search_with_relevance_scores(question, k=k):\n"
            "        print(f\"  {score:.3f}  {doc.metadata['path']}\")\n"
            "    print()\n\n"
            "for q in ['What is your best cold coffee?', 'kya ap delivery karte ho?', 'coffee without milk',\n"
            "          'what time do you close on sunday', 'cappuccino aur latte me kya farq hai']:\n"
            "    show(q)"
        ),
        md("## Full RAG answers"),
        code(
            "from bean_rag.chain import answer\n\n"
            "for q in ['Recommend something sweet and cold', 'How much is a cappuccino with a croissant delivered?',\n"
            "          'Mujhe allergy hai dairy se, kya order karun?', 'Do you sell pizza?']:\n"
            "    r = answer(q)\n"
            "    print('Q:', q)\n"
            "    print('A:', r.answer)\n"
            "    print('cards:', r.items, '\\n')"
        ),
        md("## Follow-up questions use the chat history"),
        code(
            "history = [{'role': 'user', 'text': 'Tell me about the Mocha Frappe'},\n"
            "           {'role': 'bot', 'text': 'The Mocha Frappe is a blended chocolate and coffee drink for $9.80.'}]\n"
            "print(answer('is it served hot?', history).answer)"
        ),
    ],
)
print("notebooks written")
