from langchain.schema import Document
from langchain_docling import DoclingLoader
from langchain_docling.loader import ExportType

import os 

class Loader:
    def __init__(self):
        self.documents = []

    def load_documents(self, directory) -> list[Document]:
        documents = self.documents
        for file in os.listdir(directory):
            loader = DoclingLoader(
                file_path=os.path.join(directory, file),
                export_type=ExportType.MARKDOWN,
                # chunker=HybridChunker(tokenizer="sentence-transformers/all-MiniLM-L6-v2")
            )
            documents.extend(loader.load())
        return documents
    def run(self, directory) -> list[Document]:
        return self.load_documents(directory)
