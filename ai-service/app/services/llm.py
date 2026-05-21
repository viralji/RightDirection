import os
import anthropic
from openai import AsyncOpenAI

_anthropic = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
_openai = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def claude_complete(prompt: str, max_tokens: int = 2000) -> str:
    """Single-turn Claude completion."""
    message = _anthropic.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text


async def claude_stream(prompt: str, max_tokens: int = 2000):
    """Stream Claude response as SSE chunks."""
    with _anthropic.messages.stream(
        model="claude-sonnet-4-6",
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        for text in stream.text_stream:
            yield text


async def openai_embed(text: str) -> list[float]:
    """Generate embedding for pgvector similarity search."""
    resp = await _openai.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    return resp.data[0].embedding
