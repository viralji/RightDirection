from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routes import proposal, sop, document, trust_score

app = FastAPI(title="RightDirection AI Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY", "")


def verify_internal_key(x_internal_api_key: str = Header(...)):
    if x_internal_api_key != INTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")


app.include_router(proposal.router, prefix="/ai/proposal", tags=["Proposal"], dependencies=[Depends(verify_internal_key)])
app.include_router(sop.router, prefix="/ai/sop", tags=["SOP"], dependencies=[Depends(verify_internal_key)])
app.include_router(document.router, prefix="/ai/document", tags=["Document"], dependencies=[Depends(verify_internal_key)])
app.include_router(trust_score.router, prefix="/ai/trust-score", tags=["TrustScore"], dependencies=[Depends(verify_internal_key)])


@app.get("/health")
async def health():
    return {"status": "ok"}
