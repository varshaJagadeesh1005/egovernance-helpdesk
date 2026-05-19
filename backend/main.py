from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_service import query_helpdesk

app = FastAPI(title="E-Governance Helpdesk API for Senior Citizens")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    language: str = "en"

class QueryResponse(BaseModel):
    response: str
    intent: str
    confidence: float
    language: str
    requires_clarification: str
    clarification_question: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the E-Governance Helpdesk API"}

@app.post("/api/chat", response_model=QueryResponse)
def chat_endpoint(request: QueryRequest):
    result = query_helpdesk(request.query, request.language)
    return {
        "response": result["response"],
        "intent": result["intent"],
        "confidence": result["confidence"],
        "language": result["language"],
        "requires_clarification": result["requires_clarification"],
        "clarification_question": result["clarification_question"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
