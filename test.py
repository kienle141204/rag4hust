from src.chains.retrieval_chain import RetrievalChain
from langchain_chroma import Chroma
from src.utils.embedding_model import get_embedding

embeddings = get_embedding()
vectorstore = Chroma(
            collection_name="summaries",
            embedding_function=embeddings,
            persist_directory="data/processed/chroma_db/"
        )


if __name__ == "__main__":
    retrieval_chain = RetrievalChain(vectorstore)

    # Example state to test the router_question method
    while True:
        question = input("👽👽👽 Enter a question (or 'q' to quit): ")
        if question.lower() == 'q':
            break

        
        result, docs = retrieval_chain.run(question)
        # print(f"Router Question Result: {result}")
        for doc in docs:
            print(doc)
            print("______________________________________")