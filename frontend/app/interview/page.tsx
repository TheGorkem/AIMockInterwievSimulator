"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  startInterview,
  submitAnswer,
  getNextQuestion,
  endInterview,
  type AnswerResponse,
  type EndInterviewResponse,
} from "@/lib/api";

function InterviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const role = searchParams.get("role") || "";
  const level = searchParams.get("level") || "";
  const mode = searchParams.get("mode") || "technical";

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [introduction, setIntroduction] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentPhase, setCurrentPhase] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Starting your interview...");
  const [lastEvaluation, setLastEvaluation] =
    useState<AnswerResponse["evaluation"] | null>(null);
  const [lastResponse, setLastResponse] = useState<AnswerResponse["response"] | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [summary, setSummary] = useState<EndInterviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00");

  const interviewerPersonality = "professional";

  // Timer effect
  useEffect(() => {
    if (startTime && !summary) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - startTime.getTime();
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setElapsedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, summary]);

  // Start the interview session
  const initSession = useCallback(async () => {
    if (!role || !level) {
      router.push("/");
      return;
    }
    try {
      setIsLoading(true);
      setLoadingMessage("Connecting to AI interviewer...");
      const res = await startInterview({ role, level, mode });
      setSessionId(res.session_id);
      setIntroduction(res.introduction);
      setCurrentQuestion(res.question);
      setCurrentPhase(res.phase);
      setStartTime(new Date());
    } catch {
      setError("Failed to start the interview. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  }, [role, level, mode, router]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  // Submit answer
  const handleSubmit = async () => {
    if (!sessionId || !answer.trim()) return;
    try {
      setIsSubmitting(true);
      setLoadingMessage("AI is analyzing your response...");
      const res = await submitAnswer(sessionId, answer);
      setLastEvaluation(res.evaluation);
      setLastResponse(res.response);
      setShowFeedback(true);
      if (res.response?.type === "followup") {
        setCurrentQuestion(res.response.content);
        setCurrentPhase("followup");
      } else {
        // Get next question
        const nextRes = await getNextQuestion(sessionId);
        if (nextRes.question) {
          setCurrentQuestion(nextRes.question);
          setCurrentPhase(nextRes.phase || "");
        } else {
          // No more questions, end interview
          await handleEnd();
          return;
        }
      }
    } catch {
      setError("Failed to evaluate your answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Move to next question
  const handleNext = () => {
    setShowFeedback(false);
    setLastEvaluation(null);
    setLastResponse(null);
    setAnswer("");
    setQuestionNumber((n) => n + 1);
  };

  // End interview
  const handleEnd = async () => {
    if (!sessionId) return;
    try {
      setIsLoading(true);
      setLoadingMessage("Generating your final feedback...");
      const res = await endInterview(sessionId);
      setSummary(res);
    } catch {
      setError("Failed to end interview.");
    } finally {
      setIsLoading(false);
    }
  };

  // Score color helper
  const scoreClass = (score: number) =>
    score >= 7 ? "text-green-400" : score >= 4 ? "text-yellow-400" : "text-red-400";

  // Interviewer avatar based on personality
  const getInterviewerAvatar = () => {
    const avatars = {
      professional: "👔",
      friendly: "😊",
      strict: "⚖️"
    };
    return avatars[interviewerPersonality as keyof typeof avatars] || "🤖";
  };

  // ── Error State ──
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
            onClick={() => router.push("/")}
          >
            ← Back to Setup
          </button>
        </div>
      </div>
    );
  }

  // ── Loading State ──
  if (isLoading && !summary) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Preparing Your Interview</h2>
          <p className="text-gray-400">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  // ── Summary View ──
  if (summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🏁</div>
              <h1 className="text-3xl font-bold text-white mb-2">Interview Complete!</h1>
              <p className="text-gray-400">{role} • {level} • {mode} Interview</p>
            </div>

            {/* Final Score */}
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6 mb-8 text-center">
              <div className={`text-6xl font-bold mb-2 ${scoreClass(summary.final_score)}`}>
                {summary.final_score}/10
              </div>
              <div className="text-gray-300">Final Score</div>
            </div>

            {/* Feedback Sections */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-700/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {summary.strengths.map((strength, i) => (
                    <li key={i} className="text-gray-300 flex items-start">
                      <span className="text-green-400 mr-2 mt-1">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-700/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="text-yellow-400 mr-2">⚠️</span>
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {summary.weaknesses.map((weakness, i) => (
                    <li key={i} className="text-gray-300 flex items-start">
                      <span className="text-yellow-400 mr-2 mt-1">•</span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Assessment Details */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-700/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{summary.technical_level}</div>
                <div className="text-sm text-gray-400">Technical Level</div>
              </div>
              <div className="bg-gray-700/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{summary.communication_skills}</div>
                <div className="text-sm text-gray-400">Communication</div>
              </div>
              <div className="bg-gray-700/30 rounded-xl p-4 text-center">
                <div className={`text-2xl font-bold mb-1 ${scoreClass(summary.final_score)}`}>
                  {summary.final_score}/10
                </div>
                <div className="text-sm text-gray-400">Overall Score</div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-gray-700/30 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="text-blue-400 mr-2">💡</span>
                Suggestions for Improvement
              </h3>
              <ul className="space-y-2">
                {summary.suggestions.map((suggestion, i) => (
                  <li key={i} className="text-gray-300 flex items-start">
                    <span className="text-blue-400 mr-2 mt-1">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                onClick={() => router.push("/")}
              >
                🔄 Practice Another Interview
              </button>
              <button
                className="px-8 py-4 border border-gray-600 hover:border-purple-400 text-gray-300 hover:text-white rounded-xl transition-all duration-200"
                onClick={() => window.print()}
              >
                📄 Download Report
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Interview Session ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors"
            >
              <span className="text-gray-400">←</span>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-white">{role} Interview</h1>
              <p className="text-gray-400 text-sm">{level} • {mode}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-gray-800/50 rounded-xl px-4 py-2">
              <span className="text-gray-400 text-sm">⏱️ {elapsedTime}</span>
            </div>
            <button
              onClick={handleEnd}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-xl transition-colors"
            >
              End Interview
            </button>
          </div>
        </div>

        {/* Main Interview Interface */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Interviewer */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 h-fit">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                  {getInterviewerAvatar()}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">AI Interviewer</h3>
                <p className="text-gray-400 text-sm mb-4">Senior Technical Interviewer</p>

                {/* Phase Indicator */}
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Current Phase</div>
                  <div className="text-white font-medium capitalize">{currentPhase}</div>
                  <div className="text-gray-400 text-sm mt-2">Question {questionNumber}/10</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Question & Input */}
          <div className="lg:col-span-2 space-y-6">
            {/* Introduction */}
            {introduction && !showFeedback && (
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">{getInterviewerAvatar()}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium mb-2">AI Interviewer</div>
                    <div className="text-gray-300 leading-relaxed">{introduction}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Question */}
            {!showFeedback && currentQuestion && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">{getInterviewerAvatar()}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium mb-2">Question {questionNumber}</div>
                    <div className="text-gray-300 leading-relaxed text-lg">{currentQuestion}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Thinking State */}
            {isSubmitting && (
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-2xl p-6">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-purple-300">{loadingMessage}</span>
                </div>
              </div>
            )}

            {/* Input Area */}
            {!showFeedback && !isSubmitting && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Answer
                  </label>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here... Be specific and provide examples where relevant."
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={6}
                  />
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
                    <span>{answer.length} characters</span>
                    <span>Press Enter to submit</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button className="p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl transition-colors">
                      <span className="text-gray-400">🎤</span>
                    </button>
                    <span className="text-gray-400 text-sm">Voice input (coming soon)</span>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!answer.trim() || isSubmitting}
                    className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 transform ${answer.trim() && !isSubmitting
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105 shadow-lg hover:shadow-purple-500/25'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {isSubmitting ? 'Analyzing...' : 'Submit Answer'}
                  </button>
                </div>
              </div>
            )}

            {/* Feedback Panel */}
            {showFeedback && lastEvaluation && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 animate-in slide-in-from-bottom-4 duration-300">
                {/* Score */}
                <div className="text-center mb-6">
                  <div className={`text-4xl font-bold mb-2 ${scoreClass(lastEvaluation.score)}`}>
                    {lastEvaluation.score}/10
                  </div>
                  <div className="text-gray-400">Your Score</div>
                </div>

                {/* Strengths */}
                {lastEvaluation.strengths.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-green-400 font-medium mb-2 flex items-center">
                      <span className="mr-2">✓</span>
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {lastEvaluation.strengths.map((strength, i) => (
                        <li key={i} className="text-gray-300 text-sm flex items-start">
                          <span className="text-green-400 mr-2 mt-1">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weaknesses */}
                {lastEvaluation.weaknesses.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-yellow-400 font-medium mb-2 flex items-center">
                      <span className="mr-2">⚠️</span>
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-1">
                      {lastEvaluation.weaknesses.map((weakness, i) => (
                        <li key={i} className="text-gray-300 text-sm flex items-start">
                          <span className="text-yellow-400 mr-2 mt-1">•</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improved Answer */}
                {lastEvaluation.improved_answer && (
                  <div className="mb-4">
                    <h4 className="text-blue-400 font-medium mb-2 flex items-center">
                      <span className="mr-2">💡</span>
                      Suggested Improvement
                    </h4>
                    <div className="bg-gray-700/30 rounded-lg p-3 text-gray-300 text-sm">
                      {lastEvaluation.improved_answer}
                    </div>
                  </div>
                )}

                {/* Hint or Follow-up */}
                {lastResponse && (
                  <div className="mb-4">
                    <h4 className={`font-medium mb-2 flex items-center ${lastResponse.type === "hint" ? "text-purple-400" : "text-blue-400"
                      }`}>
                      <span className="mr-2">
                        {lastResponse.type === "hint" ? "💡" : "🔍"}
                      </span>
                      {lastResponse.type === "hint" ? "Hint" : "Follow-up Question"}
                    </h4>
                    <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4 text-gray-300">
                      {lastResponse.content}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    {lastResponse?.type === "followup" ? "Answer Follow-up" : "Next Question"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Interview</h2>
          <p className="text-gray-400">Preparing your AI interviewer...</p>
        </div>
      </div>
    }>
      <InterviewContent />
    </Suspense>
  );
}
