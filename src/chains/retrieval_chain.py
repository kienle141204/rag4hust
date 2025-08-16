from typing import List, Any
from src.utils.llm_model import get_llm
from src.chains.genarate_queries_chain import genarate_queries
from langchain.storage import LocalFileStore
from langchain.retrievers.multi_vector import MultiVectorRetriever
from langchain_core.output_parsers import StrOutputParser
from langchain.prompts import PromptTemplate

class RetrievalChain:
    def __init__(self, vectorstore):
        self.vectorstore = vectorstore
        self.llm = get_llm()

        self.template = """
        Dựa vào tài liệu sau và hãy trả lời cho câu hỏi dưới đây:
        Tài liệu: {context}
        Câu hỏi: {question}
        """

        self.genarate_queries_chain = genarate_queries(self.llm)
        self.store = LocalFileStore("data/processed/store/")

        self.retriever = MultiVectorRetriever(
            vectorstore=vectorstore,
            byte_store=self.store,
            id_key="doc_id"
        )
        self.prompt = PromptTemplate(
            template=self.template,
            input_variables=["context", "question"]
        )
        self.genarate_answer_chain = self.prompt | self.llm | StrOutputParser()

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
        doc_ids = [doc.metadata["doc_id"] for doc, _ in reranked_docs[:3]]
        # doc_ids = [doc.metadata["doc_id"] for doc, _ in reranked_docs[:1]]

        docs = [self.retriever.docstore.mget([doc_id])[0].page_content for doc_id in doc_ids]
        
        answer = self.genarate_answer_chain.invoke({"context": docs, "question": question})
        
        return answer