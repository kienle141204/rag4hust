from src.loader import Loader
from src.vectorstore import VectorStore

if __name__ == "__main__":
    directory = "data/raw_data/doc/"
    loader = Loader()
    docs = loader.run(directory)
    vectorstore = VectorStore()
    vectorstore.save(docs)
    print("Save Completed!!!!!")