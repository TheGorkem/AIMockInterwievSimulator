from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ai_service import (
    start_interview as ai_start_interview,
    get_next_question,
    submit_answer as ai_submit_answer,
    end_interview as ai_end_interview,
    COMPANY_STYLES,
    DIFFICULTY_CONFIGS,
)
from services.session_service import create_session, get_session

router = APIRouter()


# ── Request / Response Models ──────────────────────────────────────

class StartRequest(BaseModel):
    role: str
    level: str
    mode: str = "technical"
    tech_stack: str = ""
    company: str | None = None
    difficulty: str | None = None


class StartResponse(BaseModel):
    session_id: str
    introduction: str
    question: str
    phase: str
    difficulty: str


class AnswerRequest(BaseModel):
    session_id: str
    answer: str


class AnswerResponse(BaseModel):
    evaluation: dict
    response: dict | None = None
    current_difficulty: str = "medium"


class NextQuestionRequest(BaseModel):
    session_id: str


class NextQuestionResponse(BaseModel):
    question: str | None = None
    phase: str | None = None
    difficulty: str | None = None


class EndRequest(BaseModel):
    session_id: str


class EndResponse(BaseModel):
    strengths: list[str]
    weaknesses: list[str]
    technical_level: str
    communication_skills: str
    confidence_estimation: str = "medium"
    final_score: int | float
    suggestions: list[str]


class CompanyInfo(BaseModel):
    id: str
    name: str
    style: str


class ConfigResponse(BaseModel):
    companies: list[CompanyInfo]
    difficulties: list[str]


# ── Endpoints ──────────────────────────────────────────────────────

@router.get("/config", response_model=ConfigResponse)
async def get_config():
    """Return available companies and difficulties for the frontend."""
    companies = [
        CompanyInfo(id=key, name=val["name"], style=val["style"])
        for key, val in COMPANY_STYLES.items()
    ]
    difficulties = list(DIFFICULTY_CONFIGS.keys())
    return ConfigResponse(companies=companies, difficulties=difficulties)


@router.post("/start", response_model=StartResponse)
async def start_interview(req: StartRequest):
    """Start a new interview session with optional company and difficulty."""
    session = create_session(
        role=req.role,
        level=req.level,
        mode=req.mode,
        tech_stack=req.tech_stack,
        company=req.company,
        difficulty=req.difficulty,
    )

    result = await ai_start_interview(session["id"])

    return StartResponse(
        session_id=session["id"],
        introduction=result["introduction"],
        question=result["question"],
        phase=result["phase"],
        difficulty=result.get("difficulty", "medium"),
    )


@router.post("/answer", response_model=AnswerResponse)
async def submit_answer(req: AnswerRequest):
    """Submit an answer for evaluation."""
    result = await ai_submit_answer(req.session_id, req.answer)

    return AnswerResponse(
        evaluation=result["evaluation"],
        response=result.get("response"),
        current_difficulty=result.get("current_difficulty", "medium"),
    )


@router.post("/next", response_model=NextQuestionResponse)
async def get_next_question_endpoint(req: NextQuestionRequest):
    """Get the next question in the interview."""
    result = await get_next_question(req.session_id)

    if result is None:
        return NextQuestionResponse(question=None, phase=None, difficulty=None)

    return NextQuestionResponse(
        question=result["question"],
        phase=result["phase"],
        difficulty=result.get("difficulty"),
    )


@router.post("/end", response_model=EndResponse)
async def end_interview(req: EndRequest):
    """End the interview and provide final feedback."""
    feedback = await ai_end_interview(req.session_id)

    return EndResponse(**feedback)
