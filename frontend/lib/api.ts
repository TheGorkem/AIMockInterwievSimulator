const API_BASE = "http://localhost:8000/api/interview";

// ── Types ─────────────────────────────────────────────────────────

export interface CompanyInfo {
  id: string;
  name: string;
  style: string;
}

export interface ConfigResponse {
  companies: CompanyInfo[];
  difficulties: string[];
}

export interface StartInterviewRequest {
  role: string;
  level: string;
  mode: string;
  tech_stack?: string;
  company?: string | null;
  difficulty?: string | null;
}

export interface StartInterviewResponse {
  session_id: string;
  introduction: string;
  question: string;
  phase: string;
  difficulty: string;
}

export interface AnswerResponse {
  evaluation: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    improved_answer: string;
  };
  response: {
    type: string;
    content: string;
  } | null;
  current_difficulty: string;
}

export interface NextQuestionResponse {
  question: string | null;
  phase: string | null;
  difficulty: string | null;
}

export interface EndInterviewResponse {
  strengths: string[];
  weaknesses: string[];
  technical_level: string;
  communication_skills: string;
  confidence_estimation: string;
  final_score: number;
  suggestions: string[];
}

// ── API Calls ─────────────────────────────────────────────────────

export async function getConfig(): Promise<ConfigResponse> {
  const res = await fetch(`${API_BASE}/config`);
  if (!res.ok) throw new Error("Failed to load config");
  return res.json();
}

export async function startInterview(
  data: StartInterviewRequest
): Promise<StartInterviewResponse> {
  const res = await fetch(`${API_BASE}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to start interview");
  return res.json();
}

export async function submitAnswer(
  sessionId: string,
  answer: string
): Promise<AnswerResponse> {
  const res = await fetch(`${API_BASE}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, answer }),
  });
  if (!res.ok) throw new Error("Failed to submit answer");
  return res.json();
}

export async function getNextQuestion(
  sessionId: string
): Promise<NextQuestionResponse> {
  const res = await fetch(`${API_BASE}/next`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId }),
  });
  if (!res.ok) throw new Error("Failed to get next question");
  return res.json();
}

export async function endInterview(
  sessionId: string
): Promise<EndInterviewResponse> {
  const res = await fetch(`${API_BASE}/end`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId }),
  });
  if (!res.ok) throw new Error("Failed to end interview");
  return res.json();
}
