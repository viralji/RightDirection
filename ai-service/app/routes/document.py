import json
import boto3
import os
from fastapi import APIRouter
from app.models.schemas import DocumentFraudRequest
from app.models.prompts import DOCUMENT_FRAUD_PROMPT
from app.services.llm import claude_complete

router = APIRouter()

AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET")


def extract_text_from_s3(s3_key: str) -> str:
    """Use AWS Textract to extract text from a document stored in S3."""
    if not all([AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET]):
        return "[Textract credentials not configured]"

    try:
        textract = boto3.client(
            "textract",
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        )

        response = textract.detect_document_text(
            Document={
                "S3Object": {
                    "Bucket": AWS_S3_BUCKET,
                    "Name": s3_key,
                }
            }
        )

        blocks = response.get("Blocks", [])
        lines = [
            b["Text"] for b in blocks
            if b["BlockType"] == "LINE" and "Text" in b
        ]
        return "\n".join(lines)

    except Exception as e:
        return f"[Textract extraction failed: {str(e)}]"


def get_document_metadata(s3_key: str) -> dict:
    """Get S3 object metadata (size, last modified, content type)."""
    if not all([AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET]):
        return {}

    try:
        s3 = boto3.client(
            "s3",
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        )
        head = s3.head_object(Bucket=AWS_S3_BUCKET, Key=s3_key)
        return {
            "size_bytes": head.get("ContentLength", 0),
            "content_type": head.get("ContentType", ""),
            "last_modified": str(head.get("LastModified", "")),
            "etag": head.get("ETag", "").strip('"'),
        }
    except Exception:
        return {}


@router.post("/fraud-check")
async def fraud_check(req: DocumentFraudRequest):
    # Extract text via Textract if s3_key provided
    if req.s3_key:
        extracted_text = extract_text_from_s3(req.s3_key)
        metadata = get_document_metadata(req.s3_key)
        metadata_str = json.dumps(metadata)
    else:
        extracted_text = "[No S3 key provided — cannot extract text]"
        metadata_str = "{}"

    try:
        prompt = DOCUMENT_FRAUD_PROMPT.format(
            category=req.category,
            extracted_text=extracted_text,
            metadata=metadata_str,
        )
        result_text = await claude_complete(prompt, max_tokens=500)
        try:
            result = json.loads(result_text)
        except json.JSONDecodeError:
            result = {"fraud_score": 0, "risk_level": "LOW", "flags": [], "summary": "Analysis pending"}
    except RuntimeError as e:
        # AI key not configured — return safe default
        result = {"fraud_score": 0, "risk_level": "LOW", "flags": [], "summary": f"AI analysis unavailable: {e}"}

    return {
        "document_id": req.document_id,
        "s3_key": req.s3_key,
        "fraud_score": result.get("fraud_score", 0),
        "risk_level": result.get("risk_level", "LOW"),
        "flags": result.get("flags", []),
        "summary": result.get("summary", ""),
        "extracted_text_preview": extracted_text[:300] if extracted_text else None,
    }


@router.post("/batch-fraud-check")
async def batch_fraud_check(docs: list[DocumentFraudRequest]):
    """Check multiple documents in sequence (rate-limit friendly)."""
    results = []
    for doc in docs[:10]:  # cap at 10 per call
        result = await fraud_check(doc)
        results.append(result)
    return {"results": results, "checked": len(results)}
