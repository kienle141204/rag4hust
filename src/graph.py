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
    # summary: str 

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
    
    def get_answer(self, state: State):
        question = state["question"]
        result = self.qa_chain.run(question)
        state["answer"] = result
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
    
    def create_graph(self):
        graph = StateGraph(State)

        graph.add_node("node_answer", self.get_answer)
        graph.add_node("node_search", self.get_search)

        graph.add_edge(START, "node_answer")
        graph.add_conditional_edges(
            "node_answer",
            self.router,
            {
                "yes": "node_search",
                "no": END
            }
        )
        graph.add_edge("node_search", END)
        return graph