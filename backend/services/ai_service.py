import os
import json
import httpx
from dotenv import load_dotenv
from .session_service import get_session, add_to_history, update_last_entry

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# ── Company Interview Styles ──────────────────────────────────────

COMPANY_STYLES = {
    "google": {
        "name": "Google",
        "style": "analytical, algorithmic, deep reasoning",
        "system_note": """You are a Google interviewer. Follow Google's interview style:
- Focus on algorithms, data structures, and system design
- Ask analytical questions requiring deep reasoning
- Expect candidates to think through problems out loud
- Emphasize time/space complexity analysis
- Include edge cases and optimization questions""",
    },
    "amazon": {
        "name": "Amazon",
        "style": "behavioral, leadership principles, follow-ups",
        "system_note": """You are an Amazon interviewer. Follow Amazon's interview style:
- Center questions around Amazon's Leadership Principles
- Use the STAR method for behavioral questions
- Ask frequent follow-up questions to dig deeper
- Mix behavioral with technical deep-dives
- Evaluate ownership, customer obsession, and bias for action""",
    },
    "meta": {
        "name": "Meta",
        "style": "coding-heavy, system design, product sense",
        "system_note": """You are a Meta interviewer. Follow Meta's interview style:
- Focus on coding problems and system design
- Ask about scalability and distributed systems
- Include product-sense questions
- Value clean, efficient code
- Expect trade-off discussions""",
    },
    "microsoft": {
        "name": "Microsoft",
        "style": "problem-solving, collaborative coding",
        "system_note": """You are a Microsoft interviewer. Follow Microsoft's interview style:
- Focus on problem-solving and collaborative thinking
- Ask design questions focused on real Microsoft products
- Value understanding of fundamentals
- Include questions about growth mindset
- Expect structured approaches""",
    },
    "startup": {
        "name": "Startup",
        "style": "practical, fast-paced, real-world problems",
        "system_note": """You are a startup interviewer. Follow startup interview style:
- Ask practical, real-world problem-solving questions
- Focus on speed of delivery and pragmatic decisions
- Value versatility and full-stack thinking
- Ask about trade-offs between speed and quality
- Evaluate culture fit and ownership mentality""",
    },
    "corporate": {
        "name": "Corporate",
        "style": "structured, traditional, process-oriented",
        "system_note": """You are a corporate enterprise interviewer. Follow traditional corporate style:
- Use structured, formal interview questions
- Focus on teamwork, process adherence, and stability
- Ask about experience with enterprise-scale projects
- Include methodology questions (Agile, Waterfall)
- Value structured communication""",
    },
}

# ── Difficulty Configurations ──────────────────────────────────────

DIFFICULTY_CONFIGS = {
    "easy": {
        "label": "Easy",
        "system_note": """Difficulty Level: EASY
- Ask simple, beginner-friendly questions
- Focus on fundamental concepts
- If the candidate struggles, gently guide them with hints
- Avoid complex edge cases
- Be encouraging and supportive""",
    },
    "medium": {
        "label": "Medium",
        "system_note": """Difficulty Level: MEDIUM
- Ask standard interview-level questions
- Cover important concepts with reasonable depth
- Expect decent explanations but not perfection
- Balance between theory and practical knowledge""",
    },
    "hard": {
        "label": "Hard",
        "system_note": """Difficulty Level: HARD
- Ask challenging, in-depth questions
- Include complex scenarios and edge cases
- Use follow-up questions frequently to test depth
- Expect detailed, nuanced answers
- Probe for weaknesses in understanding""",
    },
    "expert": {
        "label": "Expert",
        "system_note": """Difficulty Level: EXPERT
- Simulate a high-pressure, senior-level interview
- Ask about advanced topics, architecture decisions, trade-offs
- Include edge cases, performance analysis, and system design
- Expect production-level thinking
- Challenge every answer with harder follow-ups""",
    },
}


async def _call_openrouter(messages: list[dict], temperature: float = 0.7) -> str:
    """Make a request to OpenRouter API and return the response text."""
    if not OPENROUTER_API_KEY:
        last_message = messages[-1]["content"] if messages else ""
        if "general" in last_message.lower() or "background" in last_message.lower():
            return "Tell me about yourself and your experience. What motivated you to pursue this career path?"
        elif "behavioral" in last_message.lower() or "hr" in last_message.lower():
            return "Describe a time when you faced a significant challenge in a project. How did you overcome it?"
        elif "scenario" in last_message.lower() or "problem" in last_message.lower():
            return "Your production system is experiencing intermittent slowdowns during peak hours. Walk me through how you would diagnose and resolve this issue."
        else:
            return "Explain the difference between REST and GraphQL APIs. When would you choose one over the other, and what are the trade-offs?"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Mock Interview Simulator",
    }
    payload = {
        "model": OPENROUTER_MODEL,
        "messages": messages,
        "temperature": temperature,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(OPENROUTER_URL, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


def _build_system_prompt(session: dict, question_mode: str) -> str:
    """Build the system prompt based on company, difficulty, and mode."""
    parts = []

    # Base interviewer persona
    parts.append("You are a professional technical interviewer conducting a realistic mock interview.")

    # Company style (if selected)
    company = session.get("company")
    if company and company.lower() in COMPANY_STYLES:
        style = COMPANY_STYLES[company.lower()]
        parts.append(f"\n{style['system_note']}")

    # Difficulty
    difficulty = session.get("current_difficulty", "medium")
    if difficulty in DIFFICULTY_CONFIGS:
        parts.append(f"\n{DIFFICULTY_CONFIGS[difficulty]['system_note']}")

    # Tech stack context
    tech_stack = session.get("tech_stack", "")
    if tech_stack:
        parts.append(f"\nThe candidate's tech stack: {tech_stack}. Tailor questions to these technologies when relevant.")

    # Mode-specific instructions
    if question_mode == "hr" or question_mode == "behavioral":
        parts.append("""
Focus on behavioral/HR questions:
- Communication and teamwork
- Conflict resolution
- Leadership and initiative
- Use real-world scenarios""")
    elif question_mode == "general":
        parts.append("""
Focus on background/introductory questions:
- Experience and career path
- Motivation and goals
- Basic fit for the role
Be welcoming and conversational.""")
    elif question_mode == "scenario":
        parts.append("""
Ask a challenging real-world scenario or problem-solving question:
- Present a realistic production issue or design challenge
- Expect the candidate to walk through their thought process
- Focus on practical problem-solving ability""")
    else:
        parts.append("""
Focus on technical questions:
- Test knowledge relevant to the role
- Cover concepts, tools, and practical experience
- Be appropriately challenging for the difficulty level""")

    # Core rules
    parts.append("""
RULES:
- Ask only ONE question at a time
- Start directly with the question — no preamble, labels, or evaluation
- Keep questions concise and clear
- Do NOT give feedback on previous answers""")

    return "\n".join(parts)


async def generate_question(session: dict, question_mode: str) -> str:
    """Generate a single interview question based on session context."""
    system_prompt = _build_system_prompt(session, question_mode)

    role = session["role"]
    level = session["level"]
    tech_stack = session.get("tech_stack", "")

    user_prompt = f"Role: {role}\nLevel: {level}"
    if tech_stack:
        user_prompt += f"\nTech Stack: {tech_stack}"
    user_prompt += f"\nQuestion Type: {question_mode}\n\nAsk one interview question for this candidate."

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    return await _call_openrouter(messages)


async def evaluate_answer(session: dict, question: str, answer: str) -> dict:
    """Evaluate a candidate's answer and return structured feedback as JSON."""
    role = session["role"]
    level = session["level"]
    difficulty = session.get("current_difficulty", "medium")

    system_prompt = f"""You are a professional interviewer evaluating an answer.

Role: {role} | Level: {level} | Difficulty: {difficulty}

Evaluation criteria:
- Clarity and communication
- Technical accuracy and depth
- Problem-solving ability
- Relevance to the role

Tone: Professional, slightly strict (like a real interviewer). Be constructive but realistic.
Do NOT be overly nice. Be honest about weaknesses.

Return ONLY valid JSON (no markdown fences):
{{
  "score": number (0-10),
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "improved_answer": "..."
}}"""

    user_prompt = f"""Interview Question:
{question}

Candidate Answer:
{answer}

Evaluate the answer."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    response_text = await _call_openrouter(messages, temperature=0.4)

    # Parse JSON — strip markdown fences if present
    cleaned = response_text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[1]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

    if not OPENROUTER_API_KEY:
        score = 7 if len(answer) > 50 else 4
        return {
            "score": score,
            "strengths": ["Good understanding of the topic", "Clear explanation"] if score > 5 else ["Attempted to answer"],
            "weaknesses": ["Could be more detailed", "Missed some edge cases"] if score > 5 else ["Answer was quite brief", "Consider providing more specific examples"],
            "improved_answer": "A more detailed answer with real examples and edge-case analysis."
        }

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {
            "score": 0,
            "strengths": [],
            "weaknesses": ["Could not parse AI evaluation response."],
            "improved_answer": response_text,
        }


async def generate_followup(session: dict, question: str, answer: str) -> str:
    """Generate a follow-up question based on the previous Q&A."""
    system_prompt = _build_system_prompt(session, "technical")
    system_prompt += """

Based on the previous answer, ask a deeper follow-up question.
- Go deeper into the topic
- Adapt difficulty based on answer quality
- Ask only ONE question"""

    user_prompt = f"""Previous Question:
{question}

Candidate's Answer:
{answer}

Ask a follow-up question."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    return await _call_openrouter(messages)


async def generate_hint(session: dict, question: str, answer: str) -> str:
    """Generate a subtle hint for a struggling candidate."""
    system_prompt = """You are a helpful interviewer providing gentle guidance.

The candidate is struggling. Provide a subtle hint that points them in the right direction.

Rules:
- Be encouraging and supportive
- Give a hint, NOT the answer
- Keep it brief (1-2 sentences)
- Start directly with the hint"""

    user_prompt = f"""Question: {question}

Their Answer: {answer}

Provide a subtle hint."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    if not OPENROUTER_API_KEY:
        return "Consider thinking about the key differences in how data is requested and returned. What are the trade-offs?"

    return await _call_openrouter(messages)


async def start_interview(session_id: str) -> dict:
    """Start the interview with an introduction and first question."""
    session = get_session(session_id)
    if not session:
        raise ValueError("Session not found")

    role = session["role"]
    level = session["level"]
    company = session.get("company")
    difficulty = session.get("difficulty", "medium")
    tech_stack = session.get("tech_stack", "")

    # Build introduction
    company_part = ""
    if company and company.lower() in COMPANY_STYLES:
        company_name = COMPANY_STYLES[company.lower()]["name"]
        company_style = COMPANY_STYLES[company.lower()]["style"]
        company_part = f" at {company_name}. This interview will follow {company_name}'s style: {company_style}"

    tech_part = f" We'll focus on your experience with {tech_stack}." if tech_stack else ""

    introduction = (
        f"Hello! I'm your AI interviewer today. I'll be conducting your mock interview "
        f"for the {role} position at the {level} level{company_part}."
        f"{tech_part} "
        f"The difficulty is set to {difficulty}. We'll cover background, technical, "
        f"behavioral questions, and a scenario-based challenge. Let's begin!"
    )

    # First question: general background
    first_question = await generate_question(session, "general")
    add_to_history(session_id, first_question, phase="background")

    return {
        "introduction": introduction,
        "question": first_question,
        "phase": "background",
        "difficulty": difficulty,
    }


async def get_next_question(session_id: str) -> dict | None:
    """Get the next question based on interview progress and performance."""
    session = get_session(session_id)
    if not session:
        raise ValueError("Session not found")

    history = session["history"]
    num_answered = len([e for e in history if e.get("answer")])

    # Define phases based on answered question count
    if num_answered < 2:
        phase = "background"
        question_mode = "general"
    elif num_answered < 5:
        phase = "technical"
        question_mode = "technical"
    elif num_answered < 7:
        phase = "behavioral"
        question_mode = "behavioral"
    elif num_answered < 9:
        phase = "scenario"
        question_mode = "scenario"
    else:
        # End interview
        return None

    question = await generate_question(session, question_mode)
    add_to_history(session_id, question, phase=phase)

    return {
        "question": question,
        "phase": phase,
        "difficulty": session.get("current_difficulty", "medium"),
    }


async def submit_answer(session_id: str, answer: str) -> dict:
    """Submit an answer, evaluate it, and optionally provide hint or follow-up."""
    session = get_session(session_id)
    if not session or not session["history"]:
        raise ValueError("Session not found or no active question")

    last_entry = session["history"][-1]
    question = last_entry["question"]

    # Evaluate the answer
    evaluation = await evaluate_answer(session, question, answer)

    # Update history (also adjusts difficulty dynamically)
    update_last_entry(session_id, answer, evaluation)

    # Decide on response strategy
    response = None
    score = evaluation.get("score", 5)
    difficulty = session.get("current_difficulty", "medium")
    num_answered = len([e for e in session["history"] if e.get("answer")])

    if score < 4 and difficulty in ("easy", "medium"):
        # Struggling candidate → provide hint
        hint = await generate_hint(session, question, answer)
        response = {"type": "hint", "content": hint}
    elif score >= 7 and difficulty in ("hard", "expert") and num_answered % 2 == 0 and num_answered < 10:
        # Strong answer at high difficulty → follow-up to dig deeper
        followup = await generate_followup(session, question, answer)
        add_to_history(session_id, followup, phase="followup")
        response = {"type": "followup", "content": followup}

    return {
        "evaluation": evaluation,
        "response": response,
        "current_difficulty": session.get("current_difficulty", "medium"),
    }


async def end_interview(session_id: str) -> dict:
    """End the interview and provide comprehensive final feedback."""
    session = get_session(session_id)
    if not session:
        raise ValueError("Session not found")

    history = session["history"]
    role = session["role"]
    level = session["level"]
    company = session.get("company", "")
    tech_stack = session.get("tech_stack", "")

    # Compile Q&A history
    history_text = "\n\n".join([
        f"Q{i+1}: {entry['question']}\nA{i+1}: {entry.get('answer', 'No answer')}\nScore: {entry.get('evaluation', {}).get('score', 'N/A')}"
        for i, entry in enumerate(history) if entry.get("answer")
    ])

    company_context = f"\nCompany: {company}" if company else ""
    tech_context = f"\nTech Stack: {tech_stack}" if tech_stack else ""

    system_prompt = """You are a senior technical interviewer providing comprehensive final feedback after a complete interview.

Based on the entire interview history, provide honest, realistic, and structured feedback.

Be slightly strict — this should feel like real interview feedback. Do not sugarcoat.

Return ONLY valid JSON (no markdown fences):
{
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "technical_level": "description of technical proficiency",
  "communication_skills": "description of communication quality",
  "confidence_estimation": "low/medium/high — based on answer depth and clarity",
  "final_score": number (0-10),
  "suggestions": ["...", "..."]
}"""

    user_prompt = f"""Role: {role}
Level: {level}{company_context}{tech_context}

Interview History:
{history_text}

Provide final feedback."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    response_text = await _call_openrouter(messages, temperature=0.4)

    # Parse JSON
    cleaned = response_text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[1]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

    if not OPENROUTER_API_KEY:
        return {
            "strengths": ["Good technical knowledge", "Clear communication"],
            "weaknesses": ["Could improve on system design", "More depth needed on edge cases"],
            "technical_level": "Mid-level developer with solid fundamentals",
            "communication_skills": "Clear and concise, but could be more confident",
            "confidence_estimation": "medium",
            "final_score": 7,
            "suggestions": ["Practice system design", "Work on behavioral stories", "Review advanced topics"]
        }

    try:
        feedback = json.loads(cleaned)
    except json.JSONDecodeError:
        feedback = {
            "strengths": ["Good effort"],
            "weaknesses": ["Could not parse feedback"],
            "technical_level": "Unknown",
            "communication_skills": "Unknown",
            "confidence_estimation": "unknown",
            "final_score": 5,
            "suggestions": ["Practice more"]
        }

    session["status"] = "ended"
    return feedback
