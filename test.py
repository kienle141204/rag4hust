# from src.chains.retrieval_chain import RetrievalChain
# from src.utils.llm_model import get_llm
# from src.utils.embedding_model import get_embedding
# from langchain_chroma import Chroma


# if __name__ == "__main__":
#     embeddings = get_embedding()
#     vectorstore = Chroma(
#         collection_name="summaries",
#         embedding_function=embeddings,
#         persist_directory="data/processed/chroma_db/"
#     )
#     retrieval_chain = RetrievalChain(vectorstore)
#     question = "có những loại học bổng nào "
#     answer = retrieval_chain.run(question)
#     print("Answer:", answer.answer)
#     print("Sources:", answer.sources)