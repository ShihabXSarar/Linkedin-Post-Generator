"""
LinkedIn Post Generator — AI Agent with LangChain & Google Gemini
FastAPI backend that serves the frontend and exposes a /generate endpoint.
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uvicorn

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# ---------------------------------------------------------------------------
# Environment & Configuration
# ---------------------------------------------------------------------------
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError(
        "GOOGLE_API_KEY not found. "
        "Create a .env file with your key (see .env.example)."
    )

# ---------------------------------------------------------------------------
# LangChain Agent Setup
# ---------------------------------------------------------------------------

# 1. LLM — Google Gemini
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GOOGLE_API_KEY,
    temperature=0.8,
    max_output_tokens=1024,
)

# 2. Prompt Template — crafted for professional LinkedIn posts
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a professional LinkedIn content strategist and copywriter. "
            "Your job is to create engaging, insightful, and professional LinkedIn "
            "posts that drive engagement. Follow these rules strictly:\n"
            "- Write the ENTIRE post in {language}.\n"
            "- Structure the post in 2–4 short paragraphs.\n"
            "- Start with a compelling hook (first line) that grabs attention.\n"
            "- Include actionable insights or a thought-provoking perspective.\n"
            "- Use a conversational yet professional tone.\n"
            "- End with a call-to-action or question to encourage comments.\n"
            "- Add 3–5 relevant hashtags at the very end.\n"
            "- Do NOT include any subject line, title, or greeting.\n"
            "- Do NOT use markdown formatting — output plain text only.\n"
            "- Use line breaks between paragraphs for readability.",
        ),
        (
            "human",
            "Write a LinkedIn post about the following topic: {topic}",
        ),
    ]
)

# 3. Output Parser
parser = StrOutputParser()

# 4. LLM Chain: Prompt → LLM → Parser
chain = prompt | llm | parser

# ---------------------------------------------------------------------------
# FastAPI Application
# ---------------------------------------------------------------------------

app = FastAPI(title="LinkedIn Post Generator")


class GenerateRequest(BaseModel):
    """Request body for post generation."""
    topic: str
    language: str = "English"


class GenerateResponse(BaseModel):
    """Response body containing the generated post."""
    post: str
    topic: str
    language: str


@app.post("/generate", response_model=GenerateResponse)
async def generate_post(req: GenerateRequest):
    """Generate a LinkedIn post using the LangChain agent."""
    if not req.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")

    try:
        result = chain.invoke({"topic": req.topic.strip(), "language": req.language})
        return GenerateResponse(
            post=result,
            topic=req.topic.strip(),
            language=req.language,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {e}")


# Serve static frontend files
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def serve_frontend():
    """Serve the main HTML page."""
    return FileResponse("static/index.html")


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
