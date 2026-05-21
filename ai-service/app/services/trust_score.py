"""
Trust Score Engine — computes GlobalTrustScore for a student based on:
  - Document authenticity (fraud scores from document checks)
  - Financial credibility (bank statement analysis)
  - Academic consistency (transcript vs declared scores)
  - Profile completeness
"""
from dataclasses import dataclass
from typing import Optional
import math


@dataclass
class TrustScoreInput:
    student_id: str
    # Document sub-scores (0–1, 1=clean)
    document_fraud_scores: list[float]   # one per document checked
    num_documents_verified: int
    num_documents_total: int
    # Financial
    bank_statement_score: Optional[float]   # 0–1; None if not checked
    stated_family_income_inr: Optional[float]
    # Academic
    academic_gpa_stated: Optional[float]    # 0–4
    academic_transcript_score: Optional[float]   # 0–1 consistency check
    # Profile completeness 0–1 (filled fields / total fields)
    profile_completeness: float


@dataclass
class TrustScoreResult:
    overall_score: float      # 0–100
    document_score: float     # 0–100
    financial_score: float    # 0–100
    academic_score: float     # 0–100
    profile_score: float      # 0–100
    grade: str                # A, B, C, D, F
    flags: list[str]
    recommendation: str


def compute_trust_score(inp: TrustScoreInput) -> TrustScoreResult:
    flags = []

    # ── Document Score (35% weight) ───────────────────────────────────────────
    if inp.document_fraud_scores:
        avg_fraud = sum(inp.document_fraud_scores) / len(inp.document_fraud_scores)
        high_fraud_count = sum(1 for s in inp.document_fraud_scores if s > 0.6)
        doc_authenticity = 1 - avg_fraud
        doc_coverage = inp.num_documents_verified / max(inp.num_documents_total, 1)
        document_score = (doc_authenticity * 0.7 + doc_coverage * 0.3) * 100
        if high_fraud_count > 0:
            flags.append(f"{high_fraud_count} document(s) flagged for potential fraud")
    else:
        document_score = 40.0  # default when no docs checked yet
        flags.append("No documents verified yet")

    document_score = min(100.0, max(0.0, document_score))

    # ── Financial Score (25% weight) ─────────────────────────────────────────
    if inp.bank_statement_score is not None:
        financial_score = inp.bank_statement_score * 100
        if inp.stated_family_income_inr and inp.bank_statement_score < 0.3:
            flags.append("Bank statement shows low financial credibility")
    else:
        financial_score = 50.0  # neutral when not checked
        flags.append("Bank statement not verified")

    financial_score = min(100.0, max(0.0, financial_score))

    # ── Academic Score (25% weight) ──────────────────────────────────────────
    if inp.academic_gpa_stated is not None:
        # Normalise GPA to 0-100
        gpa_norm = (inp.academic_gpa_stated / 4.0) * 100
        if inp.academic_transcript_score is not None:
            # Blend declared GPA with transcript consistency
            academic_score = gpa_norm * 0.6 + inp.academic_transcript_score * 100 * 0.4
            if inp.academic_transcript_score < 0.5:
                flags.append("Academic transcript inconsistency detected")
        else:
            academic_score = gpa_norm
    else:
        academic_score = 50.0
        flags.append("Academic records not verified")

    academic_score = min(100.0, max(0.0, academic_score))

    # ── Profile Score (15% weight) ────────────────────────────────────────────
    profile_score = inp.profile_completeness * 100
    if profile_score < 50:
        flags.append("Student profile is incomplete")

    # ── Overall (weighted) ───────────────────────────────────────────────────
    overall = (
        document_score * 0.35 +
        financial_score * 0.25 +
        academic_score * 0.25 +
        profile_score * 0.15
    )

    # ── Grade ────────────────────────────────────────────────────────────────
    if overall >= 80:
        grade = "A"
        recommendation = "High confidence. Fast-track applications recommended."
    elif overall >= 65:
        grade = "B"
        recommendation = "Good profile. Standard verification process."
    elif overall >= 50:
        grade = "C"
        recommendation = "Moderate risk. Additional document review advised."
    elif overall >= 35:
        grade = "D"
        recommendation = "High risk. Manual review required before proceeding."
    else:
        grade = "F"
        recommendation = "Very high risk. Do not proceed without extensive verification."

    return TrustScoreResult(
        overall_score=round(overall, 1),
        document_score=round(document_score, 1),
        financial_score=round(financial_score, 1),
        academic_score=round(academic_score, 1),
        profile_score=round(profile_score, 1),
        grade=grade,
        flags=flags,
        recommendation=recommendation,
    )
