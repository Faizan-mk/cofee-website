"""FastAPI server for the website chatbot.

Run:  uvicorn bean_rag.api:app --reload --port 8000
"""

import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field

from .chain import answer
from .config import settings

log = logging.getLogger("bean_rag")

app = FastAPI(title="Bean Scene RAG")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class Turn(BaseModel):
    role: str
    text: str = Field(max_length=2000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    history: list[Turn] = Field(default_factory=list, max_length=20)


class ChatResponse(BaseModel):
    answer: str
    items: list[str]
    sources: list[dict]


@app.get("/api/health")
def health() -> dict:
    return {"ok": True}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    try:
        result = await run_in_threadpool(answer, req.message.strip(), [t.model_dump() for t in req.history])
    except Exception:
        log.exception("chat failed")
        raise HTTPException(status_code=502, detail="The assistant is unavailable right now.")
    return ChatResponse(answer=result.answer, items=result.items, sources=result.sources)
