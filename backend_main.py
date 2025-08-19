from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from src.agent import Agent
from typing import List, Optional

# Khởi tạo FastAPI app
app = FastAPI(title="RAG4HUST Chatbot API")

# Cấu hình CORS để cho phép frontend truy cập
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://rag4hust.vercel.app"],  # URL của Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Khởi tạo agent
agent = Agent()
chatbot_app = agent.agent  # Đây là ứng dụng đã được compile từ StateGraph

# Định nghĩa model cho source document
class SourceDocument(BaseModel):
    title: Optional[str] = None
    name: Optional[str] = None
    content: Optional[str] = None
    score: Optional[float] = None

# Định nghĩa model cho request
class ChatRequest(BaseModel):
    message: str
    conversation_id: int = None

# Định nghĩa model cho response
class ChatResponse(BaseModel):
    answer: str
    summary: str
    sources: List[SourceDocument] = None
    conversation_id: int = None

@app.get("/")
async def root():
    return {"message": "RAG4HUST Chatbot API is running!"}

state = {
            "question": "",
            "answer": "",
            "summary": ""
        }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Tạo state từ message của người dùng
        state["question"] = request.message
        
        # Gọi agent để xử lý câu hỏi
        result = chatbot_app.invoke(state)
        state["answer"] = result["answer"]
        state["summary"] = result["summary"]
        
        # Xử lý sources từ kết quả của agent
        sources = []
        if "source" in result and result["source"]:
            # sources từ agent là một danh sách các string
            for source in result["source"]:
                if isinstance(source, str):
                    sources.append(SourceDocument(
                        title=source
                    ))
        
        # Trả về kết quả
        return ChatResponse(
            answer=result["answer"],
            summary=result["summary"],
            sources=sources,
            conversation_id=request.conversation_id
        )
    except Exception as e:
        # Trả về lỗi nếu có vấn đề
        return ChatResponse(
            answer=f"Xin lỗi, có lỗi xảy ra: {str(e)}",
            summary="",
            sources=[],
            conversation_id=request.conversation_id
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)