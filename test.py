# from src.chains.retrieval_chain import RetrievalChain
# from langchain_chroma import Chroma
# from src.utils.embedding_model import get_embedding

# if __name__ == "__main__":
#     q = "thu vien mo cua luc may gio"
#     vectorstore = Chroma(
#             collection_name="summaries",
#             embedding_function=get_embedding(),
#             persist_directory="data/processed/chroma_db/"
#         )
#     chain = RetrievalChain(vectorstore)
#     ans = chain.run(q)
#     print(ans)