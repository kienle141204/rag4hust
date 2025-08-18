from src.loader import Loader
from src.utils.llm_model import get_llm
from src.utils.embedding_model import get_embedding
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.documents import Document
from langchain_chroma import Chroma
from langchain.storage import LocalFileStore
from langchain.retrievers.multi_vector import MultiVectorRetriever
import uuid
import time

class VectorStore:
    def __init__(self):
        self.llm = get_llm()
        self.embedding = get_embedding()

    def summaries_docs(self, docs):
        template = """
            Bạn là một chuyên gia tóm tắt văn bản.
            Hãy tóm tắt văn bản sau và phải giữ lại những ý chính nhất.
            Giới hạn là 200 tokens.
            Văn bản: {doc}
        """
        prompt = PromptTemplate(
            template=template,
            input_variables=["doc"]
            )
        chain = (
            {"doc": lambda x: x.page_content}
            | prompt 
            | self.llm
            | StrOutputParser()
        )

        summaries = []
        for doc in docs:
            summary = chain.invoke(doc)
            summaries.append(summary)
            time.sleep(4)
        return summaries
    
    def create_vectorstore(self, docs, summaries):
        vectorstore = Chroma(collection_name="summaries",
                             embedding_function=self.embedding,
                             persist_directory="data/processed/chroma_db/")
        store = LocalFileStore("data/processed/store/")
        doc_ids = [str(uuid.uuid4()) for _ in docs]
        summaries_docs = [
            Document(page_content=s, metadata={"doc_id": doc_ids[i], "source": docs[i].metadata.get("source", "unknown")})
            for i, s in enumerate(summaries)
        ]

        retrievers = MultiVectorRetriever(
            vectorstore=vectorstore,
            byte_store=store,
            id_key="doc_id"
        )

        retrievers.vectorstore.add_documents(summaries_docs)
        retrievers.docstore.mset(list(zip(doc_ids, docs)))

    def save(self, docs):
        summaries = self.summaries_docs(docs)
        self.create_vectorstore(docs, summaries)

    
