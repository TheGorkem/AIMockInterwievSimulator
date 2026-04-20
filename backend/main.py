import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers.interview import router as interview_router

load_dotenv()

app = FastAPI(
    title="AI Mock Interview Simulator",
    description="AI-powered mock interview platform with question generation, answer evaluation, and intelligent follow-ups.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interview_router, prefix="/api/interview", tags=["interview"])


@app.get("/")
async def root():
    return {
        "message": "AI Mock Interview Simulator API",
        "version": "1.0.0",
        "docs": "/docs",
    }
