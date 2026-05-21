from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.schemas import SOPRequest, SOPResponse
from app.models.prompts import SOP_PROMPT
from app.services.llm import claude_complete, claude_stream

router = APIRouter()


@router.post("", response_model=SOPResponse)
async def generate_sop(req: SOPRequest):
    prompt = SOP_PROMPT.format(
        course_name=req.course_name,
        university_name=req.university_name,
        academic_background=req.academic_background,
        work_experience=req.work_experience or "None",
        motivation=req.motivation,
        career_goals=req.career_goals,
        tone=req.tone,
    )

    if req.stream:
        async def event_stream():
            async for chunk in claude_stream(prompt):
                yield f"data: {chunk}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(event_stream(), media_type="text/event-stream")

    content = await claude_complete(prompt, max_tokens=1500)
    return SOPResponse(content=content, word_count=len(content.split()))
