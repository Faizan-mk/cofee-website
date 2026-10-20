-- ============================================================
-- Bean Scene RAG: vector store for the chatbot
-- Run in Supabase: SQL Editor -> New query -> paste -> Run
-- ============================================================

-- 1) pgvector extension
create extension if not exists vector with schema extensions;

-- 2) Chunks of the knowledge file + their embeddings
--    (768 must match embedding_dim in src/bean_rag/config.py)
create table if not exists public.bean_documents (
  id         uuid primary key default gen_random_uuid(),
  content    text not null,
  metadata   jsonb not null default '{}'::jsonb,
  embedding  extensions.vector(768) not null,
  created_at timestamptz default now()
);

-- Fast cosine search
create index if not exists bean_documents_embedding_idx
  on public.bean_documents using hnsw (embedding extensions.vector_cosine_ops);

-- Re-ingest deletes by source file
create index if not exists bean_documents_source_idx
  on public.bean_documents ((metadata->>'source'));

-- 3) Similarity search used by LangChain's SupabaseVectorStore
create or replace function public.match_bean_documents(
  query_embedding extensions.vector(768),
  match_count int default null,  -- LangChain applies .limit(k) itself
  filter jsonb default '{}'::jsonb
)
returns table (id uuid, content text, metadata jsonb, similarity float)
language sql stable
set search_path = public, extensions
as $$
  select d.id, d.content, d.metadata, 1 - (d.embedding <=> query_embedding) as similarity
  from public.bean_documents d
  where d.metadata @> filter
  order by d.embedding <=> query_embedding
  limit match_count;
$$;

-- 4) Lock it down: no policies = the browser (anon key) can't read or write.
--    Only the Python server, using the service_role key, can.
alter table public.bean_documents enable row level security;
revoke execute on function public.match_bean_documents(extensions.vector, int, jsonb) from anon, authenticated, public;
grant execute on function public.match_bean_documents(extensions.vector, int, jsonb) to service_role;
