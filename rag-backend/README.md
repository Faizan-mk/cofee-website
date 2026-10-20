# Bean Scene RAG backend

The Python backend behind **Beanie**, the website's chat assistant. It answers questions only from Bean Scene's own data:

```
data/bean-scene.md ──► chunks + metadata ──► Gemini embeddings ──► Supabase pgvector
                                                                        │
question ──► embedding ──► top 4 similar chunks ◄────────────────────────┘
                                   │
                                   ▼
                     Gemini LLM (answers from those chunks only) ──► FastAPI /api/chat ──► chat UI
```

## Folders

| Path | What it is |
|---|---|
| `data/` | Knowledge files (`.md` / `.txt`). Edit `bean-scene.md` to change what the bot knows. |
| `notebooks/01_chunking.ipynb` | Compare chunk sizes, inspect chunks and metadata (no keys needed). |
| `notebooks/02_retrieval.ipynb` | Test vector search scores and full answers (needs keys + ingest). |
| `sql/001_pgvector.sql` | Creates the `bean_documents` table, index and `match_bean_documents` search function. |
| `src/bean_rag/config.py` | All settings: models, `chunk_size`, `chunk_overlap`, `top_k`. |
| `src/bean_rag/loader.py` | Reads files from `data/`. |
| `src/bean_rag/splitter.py` | Markdown-heading split, then size split; adds metadata. |
| `src/bean_rag/embeddings.py` | Gemini embeddings (768 dims) as a LangChain `Embeddings`. |
| `src/bean_rag/vectorstore.py` | Small LangChain `VectorStore` (`SupabasePgVector`) on the pgvector table. |
| `src/bean_rag/ingest.py` | Pipeline: load → split → embed → store (replaces old chunks). |
| `src/bean_rag/prompts.py` | The assistant's instructions. |
| `src/bean_rag/chain.py` | RAG chain: retrieve → prompt → LLM → answer + menu cards. |
| `src/bean_rag/api.py` | FastAPI server: `POST /api/chat`, `GET /api/health`. |

## Chunking

- **Step 1:** `MarkdownHeaderTextSplitter` cuts on `#` … `####`; the headings become metadata.
- **Step 2:** `RecursiveCharacterTextSplitter` with **`chunk_size=800`, `chunk_overlap=100`**.

Headings already cut the file into topic-sized sections (the longest is ~650 characters), so 800 keeps every section whole: one menu item or one FAQ per chunk. Smaller sizes (300/500) cut a few sections and leave stray fragments; bigger sizes change nothing. See `notebooks/01_chunking.ipynb`.

Each chunk is stored with its heading path at the top (`Menu > Cold Coffee > Iced Latte`) and this metadata:

```json
{ "source": "bean-scene.md", "section": "Menu", "path": "Menu > Cold Coffee > Iced Latte",
  "type": "menu", "chunk_index": 18, "item_name": "Iced Latte", "category": "Cold Coffee", "price": 9.0 }
```

`type` is one of `about, menu, dietary, recommendation, order, contact, account, website, guide, faq`.

## Setup (one time)

1. **Python environment** (from `rag-backend/`):
   ```bash
   python -m venv .venv
   .venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
   pip install -r requirements-dev.txt
   ```
2. **Keys:** copy `.env.example` to `.env` and fill in:
   - `GOOGLE_API_KEY`: free at https://aistudio.google.com/apikey
   - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`: Supabase → Project Settings → API. The service-role key is secret; it lives only in `.env` and never in the frontend.
3. **Database:** Supabase → SQL Editor → paste `sql/001_pgvector.sql` → Run.
4. **Store the chunks:**
   ```bash
   python -m bean_rag.ingest --dry-run   # preview chunks, no keys used
   python -m bean_rag.ingest             # embed + save to pgvector
   ```
   Run it again whenever you edit `data/`; old chunks of that file are replaced, not duplicated.

## Run

```bash
uvicorn bean_rag.api:app --reload --port 8000      # in rag-backend/, venv active
cd ../frontend && npm run dev                      # Vite proxies /api to port 8000
```

Open the site, click the chat button and ask something. If the API is down, Beanie falls back to simple built-in answers.

Quick API test:
```bash
curl -X POST http://localhost:8000/api/chat -H "Content-Type: application/json" -d "{\"message\":\"best cold coffee?\"}"
```

## Deploy (Vercel, same project as the website)

The API runs as a Vercel Python function next to the frontend, so the chat calls `/api/chat` on the same domain (no CORS, no extra host, no card needed):

- `api/index.py` (repo root) imports `bean_rag.api:app`; Vercel serves the ASGI app.
- `requirements.txt` (repo root) installs `rag-backend/requirements.txt` (~100 MB, well under Vercel's limit).
- `vercel.json` rewrites `/api/*` to that function and everything else to the React app.
- Vercel → Project Settings → Environment Variables: `GOOGLE_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Production + Preview, marked sensitive).

Every push to `main` redeploys both the site and the API. Leave `VITE_CHAT_API_URL` unset so the chat uses the same-origin `/api`.

Alternative: `render.yaml` describes the same server for Render (New → Blueprint). Render's free plan needs a card on file and sleeps after ~15 idle minutes; if you use it, set `VITE_CHAT_API_URL=https://<app>.onrender.com/api` in Vercel.

## Notes

- Models are set in `config.py` / `.env` (`LLM_MODEL`, default `gemini-3.5-flash-lite`, fast and no long "thinking"; `EMBEDDING_MODEL`, default `gemini-embedding-001`). If you change the embedding model or its size, update `vector(768)` in the SQL and re-ingest.
- The vector store is our own `SupabasePgVector` instead of `langchain-community`'s `SupabaseVectorStore`: that package is being sunset and its dependencies would bloat the serverless bundle.
- To regenerate the notebooks: `python notebooks/_build_notebooks.py`.
