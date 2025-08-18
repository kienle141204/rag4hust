from typing import List, Any
from src.utils.llm_model import get_llm, get_llm_answer
from src.chains.genarate_queries_chain import genarate_queries
from langchain.storage import LocalFileStore
from langchain.retrievers.multi_vector import MultiVectorRetriever
from langchain_core.output_parsers import StrOutputParser
from langchain.prompts import PromptTemplate, ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from langchain_core.exceptions import OutputParserException
from pydantic import BaseModel, Field

class OutputSchema(BaseModel):
    answer: str = Field(..., description="Câu trả lời cho câu hỏi.")
    sources: List[str] = Field(..., description="Tài liệu nguồn được sử dụng để trả lời câu hỏi. " \
    "Trả về nếu nó thực sự liên quan đến câu trả lời, còn không thì để trống")

class RetrievalChain:
    def __init__(self, vectorstore):
        self.vectorstore = vectorstore
        self.llm = get_llm()
        self.llm_answer = get_llm_answer()

        self.template = (
            "Bạn là trợ lý RAG. Dựa vào tài liệu sau hãy trả lời câu hỏi và liệt kê nguồn."
            "Tài liệu: {context}"
            "Nguồn tương ứng: {sources}"
            "Câu hỏi: {question}"
            "YÊU CẦU QUAN TRỌNG:"
            " - Câu trả lời trả về dạng Markdown"
            " - Chỉ trả về JSON hợp lệ theo đúng schema bên dưới, không thêm bất kỳ chữ nào khác."
            "{format_instructions}"
        )

        self.genarate_queries_chain = genarate_queries(self.llm)
        self.store = LocalFileStore("data/processed/store/")

        self.retriever = MultiVectorRetriever(
            vectorstore=vectorstore,
            byte_store=self.store,
            id_key="doc_id"
        )
        self.parser = PydanticOutputParser(pydantic_object=OutputSchema)
        self.format_instructions = self.parser.get_format_instructions()
        self.prompt = ChatPromptTemplate.from_template(self.template)
        self.genarate_answer_chain = self.prompt | self.llm_answer | self.parser

    def reciprocal_rank_fusion(self, results: List[List[Any]], k: int = 60):
        fused_scores = {}
        doc_lookup = {}

        for docs in results:
            for rank, doc in enumerate(docs):
                doc_id = doc.metadata["doc_id"]
                fused_scores[doc_id] = fused_scores.get(doc_id, 0) + 1 / (rank + k)
                doc_lookup[doc_id] = doc  # Lưu để lấy lại sau

        reranked_results = [
            (doc_lookup[doc_id], score)
            for doc_id, score in sorted(fused_scores.items(), key=lambda x: x[1], reverse=True)
        ]

        return reranked_results

    def run(self, question: str):
        retriever = self.vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 5}
        )

        queries = self.genarate_queries_chain.invoke({"question": question})
        results = [retriever.invoke(q) for q in queries]

        reranked_docs = self.reciprocal_rank_fusion(results)
        doc_ids = [doc.metadata["doc_id"] for doc, _ in reranked_docs[:3]] # thông thường là 3 
        # doc_ids = [doc.metadata["doc_id"] for doc, _ in reranked_docs[:1]]

        docs = [self.retriever.docstore.mget([doc_id])[0].page_content for doc_id in doc_ids]
        sources = [self.retriever.docstore.mget([doc_id])[0].metadata.get("source", "unknown") for doc_id in doc_ids]
        # print(sources)
        
        answer = self.genarate_answer_chain.invoke({"context": docs, "question": question, 
                                                    "sources": sources, "format_instructions": self.format_instructions})
        
        return answer