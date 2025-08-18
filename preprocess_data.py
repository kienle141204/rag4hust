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
    crawler = WebCrawler(headless=True, delay=3)
    urls = crawler._collect_urls("https://sv-ctt.hust.edu.vn/#/so-tay-sv")  
    urls.remove("https://sv-ctt.hust.edu.vn/#/so-tay-sv/69/ban-dao-tao-huong-dan-thu-tuc-bieu-mau-thac-mac-ve-hoc-tap-hoc-phi")
    docs = crawler.run(urls)
    # print(docs)
    vectorstore = VectorStore()
    vectorstore.save(docs)
    print("Save Completed!!!!!")

