from src.loader import Loader
from src.vectorstore import VectorStore
from src.crawler import WebCrawler

if __name__ == "__main__":
    # directory = "data/raw_data/doc/"
    # loader = Loader()
    # docs = loader.run(directory)
    # vectorstore = VectorStore()
    # vectorstore.save(docs)
    # print("Save Completed!!!!!")
    urls = [
        "https://sv-ctt.hust.edu.vn/#/so-tay-sv/61/hoc-bong",
        "https://sv-ctt.hust.edu.vn/#/so-tay-sv/62/huong-dan-ho-so-che-do-chinh-sach-mien-giam-hoc-phi-vay-von-ngan-hang",
        "https://sv-ctt.hust.edu.vn/#/so-tay-sv/130/huong-dan-viet-email-chuyen-nghiep-danh-cho-sinh-vien",
    ]
    crawler = WebCrawler(headless=True, delay=3)
    docs = crawler.run(urls)
    # print(docs)
    vectorstore = VectorStore()
    vectorstore.save(docs)
    print("Save Completed!!!!!")

