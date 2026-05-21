from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db import get_db
from app.models.schemas import ProposalRequest, ProposalResponse, MatchedUniversity
from app.models.prompts import PROPOSAL_EXPLANATION_PROMPT
from app.services.llm import claude_complete

router = APIRouter()

INR_TO_USD = 0.012  # approx conversion


@router.post("", response_model=ProposalResponse)
async def generate_proposal(req: ProposalRequest, db: AsyncSession = Depends(get_db)):
    eligible = await _get_eligible_courses(req, db)
    scored = _score_courses(eligible, req)
    top5 = _apply_diversity_filter(scored, n=5)
    explanation = await _generate_explanation(top5, req)
    return ProposalResponse(universities=top5, ai_explanation=explanation, student_id=req.student_id)


async def _get_eligible_courses(req: ProposalRequest, db: AsyncSession):
    conditions = ["c.is_active = true"]
    params = {}

    if req.grade_pct:
        conditions.append("(c.min_grade_percent IS NULL OR c.min_grade_percent <= :grade)")
        params["grade"] = req.grade_pct

    if req.ielts_score:
        conditions.append("(c.min_ielts IS NULL OR c.min_ielts <= :ielts)")
        params["ielts"] = req.ielts_score
    elif req.pte_score:
        conditions.append("(c.min_pte IS NULL OR c.min_pte <= :pte)")
        params["pte"] = req.pte_score

    if req.annual_budget_inr:
        budget_usd = req.annual_budget_inr * INR_TO_USD * 1.2  # 20% buffer
        conditions.append("(c.tuition_fee_usd IS NULL OR c.tuition_fee_usd <= :budget)")
        params["budget"] = budget_usd

    if req.preferred_countries:
        conditions.append("u.country = ANY(:countries)")
        params["countries"] = req.preferred_countries

    where = " AND ".join(conditions)
    query = text(f"""
        SELECT c.id as course_id, c.name as course_name, c.tuition_fee_usd,
               c.commission_pct, c.duration_months,
               u.id as university_id, u.name as university_name,
               u.country, u.qs_world_rank, u.visa_success_rate,
               u.avg_post_study_salary_usd, u.living_cost_annual_usd
        FROM courses c
        JOIN universities u ON u.id = c.university_id
        WHERE {where}
        LIMIT 100
    """)
    result = await db.execute(query, params)
    return result.mappings().all()


def _score_courses(courses: list, req: ProposalRequest) -> list:
    scored = []
    for c in courses:
        roi = _compute_roi(c, req)
        scored.append({**dict(c), "roi_score": roi})
    return sorted(scored, key=lambda x: x["roi_score"], reverse=True)


def _compute_roi(course: dict, req: ProposalRequest) -> float:
    salary = (course.get("avg_post_study_salary_usd") or 40000) / 100000
    tuition = course.get("tuition_fee_usd") or 20000
    budget_usd = (req.annual_budget_inr or 2000000) * INR_TO_USD
    affordability = max(0, 1 - (tuition / (budget_usd + 1)))
    rank = course.get("qs_world_rank")
    ranking_score = (1 - rank / 1000) if rank else 0.3
    visa = course.get("visa_success_rate") or 0.7

    return salary * 0.4 + affordability * 0.3 + ranking_score * 0.2 + visa * 0.1


def _apply_diversity_filter(scored: list, n: int = 5) -> list:
    country_count: dict[str, int] = {}
    result = []
    for c in scored:
        country = c["country"]
        if country_count.get(country, 0) >= 2:
            continue
        country_count[country] = country_count.get(country, 0) + 1
        result.append(c)
        if len(result) >= n:
            break
    return [
        MatchedUniversity(
            university_id=c["university_id"],
            university_name=c["university_name"],
            country=c["country"],
            course_id=c["course_id"],
            course_name=c["course_name"],
            tuition_fee_usd=float(c.get("tuition_fee_usd") or 0),
            commission_pct=float(c.get("commission_pct") or 15),
            roi_score=round(c["roi_score"], 3),
            visa_success_rate=c.get("visa_success_rate"),
            qs_rank=c.get("qs_world_rank"),
            explanation="",  # filled below
        )
        for c in result
    ]


async def _generate_explanation(universities: list[MatchedUniversity], req: ProposalRequest) -> str:
    uni_list = "\n".join(
        f"- {u.university_name} ({u.country}): {u.course_name}, ${u.tuition_fee_usd:,.0f}/year, ROI score {u.roi_score}"
        for u in universities
    )
    prompt = PROPOSAL_EXPLANATION_PROMPT.format(
        education_level=req.education_level or "Graduate",
        grade_pct=req.grade_pct or "N/A",
        english_score=f"IELTS {req.ielts_score}" if req.ielts_score else "Not provided",
        budget_inr=f"{req.annual_budget_inr:,}" if req.annual_budget_inr else "N/A",
        countries=", ".join(req.preferred_countries) or "Any",
        field=", ".join(req.preferred_field) or "Any",
        university_list=uni_list,
    )
    return await claude_complete(prompt, max_tokens=400)
