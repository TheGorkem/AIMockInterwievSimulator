import uuid
from datetime import datetime


# In-memory session store
_sessions: dict[str, dict] = {}


def create_session(
    role: str,
    level: str,
    mode: str = "technical",
    tech_stack: str = "",
    company: str | None = None,
    difficulty: str | None = None,
) -> dict:
    """Create a new interview session and return session data."""
    session_id = str(uuid.uuid4())
    session = {
        "id": session_id,
        "role": role,
        "level": level,
        "mode": mode,
        "tech_stack": tech_stack,
        "company": company,  # None means no company simulation
        "difficulty": difficulty or "medium",  # Default to medium
        "current_difficulty": difficulty or "medium",  # Dynamic difficulty
        "history": [],
        "created_at": datetime.now().isoformat(),
        "status": "active",
        "internal_scores": [],  # Track scores for dynamic adjustment
    }
    _sessions[session_id] = session
    return session


def get_session(session_id: str) -> dict | None:
    """Retrieve a session by ID."""
    return _sessions.get(session_id)


def add_to_history(
    session_id: str,
    question: str,
    answer: str | None = None,
    evaluation: dict | None = None,
    phase: str | None = None,
) -> None:
    """Add a Q&A entry to the session history."""
    session = _sessions.get(session_id)
    if not session:
        return

    entry = {
        "question": question,
        "answer": answer,
        "evaluation": evaluation,
        "phase": phase,
    }
    session["history"].append(entry)


def update_last_entry(
    session_id: str, answer: str, evaluation: dict
) -> None:
    """Update the last history entry with the answer and evaluation."""
    session = _sessions.get(session_id)
    if not session or not session["history"]:
        return

    session["history"][-1]["answer"] = answer
    session["history"][-1]["evaluation"] = evaluation

    # Track score for dynamic difficulty
    if evaluation and evaluation.get("score"):
        session["internal_scores"].append(evaluation["score"])
        _adjust_difficulty(session)


def _adjust_difficulty(session: dict) -> None:
    """Dynamically adjust difficulty based on recent performance."""
    scores = session["internal_scores"]
    if len(scores) < 2:
        return

    # Use last 3 scores for adjustment
    recent = scores[-3:] if len(scores) >= 3 else scores
    avg = sum(recent) / len(recent)

    levels = ["easy", "medium", "hard", "expert"]
    current_idx = levels.index(session["current_difficulty"])

    if avg >= 8.0 and current_idx < 3:
        session["current_difficulty"] = levels[current_idx + 1]
    elif avg <= 4.0 and current_idx > 0:
        session["current_difficulty"] = levels[current_idx - 1]
    # Otherwise keep current difficulty


def end_session(session_id: str) -> dict | None:
    """Mark session as completed and return the full session data."""
    session = _sessions.get(session_id)
    if not session:
        return None

    session["status"] = "completed"

    # Calculate summary stats
    scores = [
        entry["evaluation"]["score"]
        for entry in session["history"]
        if entry.get("evaluation") and entry["evaluation"].get("score")
    ]
    session["summary"] = {
        "total_questions": len(session["history"]),
        "answered_questions": len(
            [e for e in session["history"] if e.get("answer")]
        ),
        "average_score": round(sum(scores) / len(scores), 1) if scores else 0,
        "highest_score": max(scores) if scores else 0,
        "lowest_score": min(scores) if scores else 0,
    }

    return session
