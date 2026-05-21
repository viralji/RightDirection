from pydantic import BaseModel
from typing import Optional, List


class ProposalRequest(BaseModel):
    student_id: str
    tenant_id: str
    grade_pct: Optional[float] = None
    ielts_score: Optional[float] = None
    pte_score: Optional[float] = None
    annual_budget_inr: Optional[int] = None
    preferred_countries: List[str] = []
    preferred_field: List[str] = []
    preferred_intake: Optional[str] = None
    education_level: Optional[str] = None


class MatchedUniversity(BaseModel):
    university_id: str
    university_name: str
    country: str
    course_id: str
    course_name: str
    tuition_fee_usd: float
    commission_pct: float
    roi_score: float
    visa_success_rate: Optional[float] = None
    qs_rank: Optional[int] = None
    explanation: str


class ProposalResponse(BaseModel):
    universities: List[MatchedUniversity]
    ai_explanation: str
    student_id: str


class SOPRequest(BaseModel):
    student_id: str
    tenant_id: str
    university_name: str
    course_name: str
    academic_background: str
    work_experience: Optional[str] = None
    motivation: str
    career_goals: str
    tone: str = "FORMAL"  # FORMAL, SEMI_FORMAL, NARRATIVE
    stream: bool = False  # True = SSE streaming


class SOPResponse(BaseModel):
    content: str
    word_count: int


class DocumentFraudRequest(BaseModel):
    document_id: str
    s3_key: Optional[str] = None
    category: str
    tenant_id: str
    student_id: str
