from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.trust_score import TrustScoreInput, compute_trust_score

router = APIRouter()


class TrustScoreRequest(BaseModel):
    student_id: str
    document_fraud_scores: list[float] = []
    num_documents_verified: int = 0
    num_documents_total: int = 0
    bank_statement_score: Optional[float] = None
    stated_family_income_inr: Optional[float] = None
    academic_gpa_stated: Optional[float] = None
    academic_transcript_score: Optional[float] = None
    profile_completeness: float = 0.5


class TrustScoreResponse(BaseModel):
    student_id: str
    overall_score: float
    document_score: float
    financial_score: float
    academic_score: float
    profile_score: float
    grade: str
    flags: list[str]
    recommendation: str


@router.post("", response_model=TrustScoreResponse)
async def compute_student_trust_score(req: TrustScoreRequest):
    inp = TrustScoreInput(
        student_id=req.student_id,
        document_fraud_scores=req.document_fraud_scores,
        num_documents_verified=req.num_documents_verified,
        num_documents_total=req.num_documents_total,
        bank_statement_score=req.bank_statement_score,
        stated_family_income_inr=req.stated_family_income_inr,
        academic_gpa_stated=req.academic_gpa_stated,
        academic_transcript_score=req.academic_transcript_score,
        profile_completeness=req.profile_completeness,
    )
    result = compute_trust_score(inp)
    return TrustScoreResponse(
        student_id=req.student_id,
        overall_score=result.overall_score,
        document_score=result.document_score,
        financial_score=result.financial_score,
        academic_score=result.academic_score,
        profile_score=result.profile_score,
        grade=result.grade,
        flags=result.flags,
        recommendation=result.recommendation,
    )
