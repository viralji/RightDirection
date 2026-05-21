import os
import anthropic
from openai import AsyncOpenAI

# Lazy clients — only instantiated when the key is present.
# Routes that call these will get a clear error if no key is set.
_anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
_openai_key = os.getenv("OPENAI_API_KEY", "")

_anthropic_client: anthropic.Anthropic | None = None
_openai_client: AsyncOpenAI | None = None


def _get_anthropic() -> anthropic.Anthropic:
    global _anthropic_client
    if _anthropic_client is None:
        key = os.getenv("ANTHROPIC_API_KEY", "")
        if not key:
            raise RuntimeError("ANTHROPIC_API_KEY not set — AI features unavailable")
        _anthropic_client = anthropic.Anthropic(api_key=key)
    return _anthropic_client


def _get_openai() -> AsyncOpenAI:
    global _openai_client
    if _openai_client is None:
        key = os.getenv("OPENAI_API_KEY", "")
        if not key:
            raise RuntimeError("OPENAI_API_KEY not set — embedding features unavailable")
        _openai_client = AsyncOpenAI(api_key=key)
    return _openai_client


async def claude_complete(prompt: str, max_tokens: int = 2000) -> str:
    message = _get_anthropic().messages.create(
        model="claude-sonnet-4-6",
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text


async def claude_stream(prompt: str, max_tokens: int = 2000):
    with _get_anthropic().messages.stream(
        model="claude-sonnet-4-6",
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        for text in stream.text_stream:
            yield text


async def openai_embed(text: str) -> list[float]:
    resp = await _get_openai().embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    return resp.data[0].embedding
