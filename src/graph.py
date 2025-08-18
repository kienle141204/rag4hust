from langgraph.graph import END, StateGraph, START
from typing import TypedDict, Annotated, Sequence
from langchain_chroma import Chroma
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langchain_core.messages import RemoveMessage
from src.chains.retrieval_chain import RetrievalChain
from src.chains.search_chain import search_chain
from src.utils.llm_model import get_llm
from src.utils.embedding_model import get_embedding
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser


class State(TypedDict):
    question: str
    answer: str
    summary: str 
    source: str | None

class StateGraph(StateGraph[State]):
    def __init__(self, state_type: type[State]):
        super().__init__(state_type)
        self.llm = get_llm()
        self.embeddings = get_embedding()
        self.vectorstore = Chroma(
            collection_name="summaries",
            embedding_function=self.embeddings,
            persist_directory="data/processed/chroma_db/"
        )
        self.qa_chain = RetrievalChain(self.vectorstore)
        self.search_chain = search_chain()

    def router_question(self, state: State) -> str:
        template = """
            Hãy phân tích câu hỏi sau và trả lời xem câu hỏi này có phải tiếp nối của câu hỏi trước đó không.
            Câu hỏi: {question}
            Hội thoại trước đó tóm tắt: {summary}
            Trả về **yes** nếu là tiếp nối của câu hỏi trước đó.
            Trả về **no** nếu không phải tiếp nối của câu hỏi trước đó.
            Lưu ý: chỉ trả về **yes** hoặc **no**.
        """
        prompt = PromptTemplate(
            template=template,
            input_variables=["question", "summary"]
        )
        
        chain = prompt | self.llm | StrOutputParser()
        result = chain.invoke({"question": state["question"], "summary": state["summary"]})

        return result 
    
    def rewrite_question(self, state: State):
        template = """
            Bạn là một chuyên gia viết lại câu hỏi dựa trên ngữ cảnh hội thoại trước đó.
            Hãy dựa vào ngữ cảnh cuộc hội thoại trước đó và câu hỏi hiện tại để viết lại câu hỏi với đầy đủ ngữ cảnh.
            Câu hỏi: {question}
            Tóm tắt trước đó: {summary}
            Lưu ý: Chỉ trả về câu hỏi.Viết câu hỏi tiết kiệm token nhất có thể nhưng vẫn phải đủ ngữ cảnh.
        """
        prompt = PromptTemplate(
            template=template,
            input_variables=["question", "summary"]
        )
        chain = prompt | self.llm | StrOutputParser()
        question = chain.invoke({"question": state["question"], "summary": state["summary"]})
        state["question"] = question

        return state
    
    def get_answer(self, state: State):
        question = state["question"]
        result = self.qa_chain.run(question)
        state["answer"] = result.answer
        state["source"] = result.sources if result.sources else None
        return state 
    
    def get_search(self, state: State):
        question = state["question"]
        result = self.search_chain.invoke({"question": question})
        state["answer"] = result
        return state 
    def router(self, state: State):
        answer = state["answer"]
        question = state["question"]
        template = """
            Bạn là một chuyên gia trả lời câu hỏi từ dữ liệu nội bộ.
            Với câu hỏi và câu trả lời như dưới đây thì có nên tìm kiếm câu trả lời trên internet không.
            Chỉ trả về **yes** hoặc **no**.
            Câu hỏi: {question}
            Câu trả lời: {answer}
        """
        prompt = PromptTemplate(
            template=template,
            input_variables=["question", "answer"]
        )

        chain = prompt | self.llm | StrOutputParser()
        return chain.invoke({"question": question, "answer": answer})
    
    def get_summary(self, state: State):
        template = """
            Bạn là một chuyên gia tóm tắt cuộc hội thoại giữa người và AI.
            Hãy tóm tắt câu hỏi và câu trả lời sau, cố gắng giữ lại những ngữ cảnh quan trọng.
            Câu hỏi: {question}
            Câu trả lời: {answer}
            Ở đây cũng có tóm tắt của của phần trước đó nữa, hãy giữ lại ngữ cảnh của nó, bỏ qua nó nếu không tồn tại.
            Tóm tắt hội thoại trước đó: {summary}
        """
        prompt = PromptTemplate(
            template=template,
            input_variables=["question", "answer", "summary"]
        )

        chain = prompt | self.llm | StrOutputParser()
        summary = chain.invoke({"question": state["question"], "answer": state["answer"], "summary": state["summary"]})
        state["summary"] = summary

        return state
    
    def create_graph(self):
        graph = StateGraph(State)

        graph.add_node("node_rewrite_question", self.rewrite_question)
        graph.add_node("node_answer", self.get_answer)
        graph.add_node("node_search", self.get_search)
        graph.add_node("node_summary", self.get_summary)

        graph.add_conditional_edges(
            START,
            self.router_question,
            {
                "yes": "node_rewrite_question",
                "no": "node_answer"
            }
        )
        graph.add_edge("node_rewrite_question", "node_answer")
        graph.add_conditional_edges(
            "node_answer",
            self.router,
            {
                "yes": "node_search",
                "no": "node_summary"
            }
        )
        graph.add_edge("node_search", "node_summary")
        graph.add_edge("node_summary", END)
        return graph