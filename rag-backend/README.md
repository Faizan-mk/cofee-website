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
| `src/bean_rag/vectorstore.py` | LangChain `SupabaseVectorStore` on the pgvector table. |
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

## Deploy

The frontend is on Vercel; this server needs a Python host, for example **Render** (free web service):

- Root directory: `rag-backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn bean_rag.api:app --host 0.0.0.0 --port $PORT`
- Environment: `GOOGLE_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGINS=https://<your-site>.vercel.app`

Or use the Blueprint: `render.yaml` in the repo root sets all of this up (Render -> New -> Blueprint); you only paste the two secret keys. The free plan sleeps after ~15 idle minutes, so the first question after a break can take ~50 seconds.

Then in Vercel set `VITE_CHAT_API_URL=https://<your-render-app>.onrender.com/api` and redeploy the frontend.

## Notes

- Models are set in `config.py` / `.env` (`LLM_MODEL`, default `gemini-3.5-flash-lite`, fast and no long "thinking"; `EMBEDDING_MODEL`, default `gemini-embedding-001`). If you change the embedding model or its size, update `vector(768)` in the SQL and re-ingest.
- `langchain-community` (home of `SupabaseVectorStore`) is being sunset upstream, so `requirements.txt` pins it to the tested version.
- To regenerate the notebooks: `python notebooks/_build_notebooks.py`.
