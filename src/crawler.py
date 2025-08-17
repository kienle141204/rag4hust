from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from docx import Document
import time
import re
from datetime import datetime

class SimpleCrawler:
    def __init__(self, headless=True, delay=2):
        """
        Args:
            headless (bool): Chạy browser ẩn
            delay (int): Thời gian nghỉ giữa các request (giây)
        """
        self.delay = delay
        self.chrome_options = Options()
        if headless:
            self.chrome_options.add_argument('--headless')
        self.chrome_options.add_argument('--no-sandbox')
        self.chrome_options.add_argument('--disable-dev-shm-usage')
        self.chrome_options.add_argument('--disable-gpu')
        self.driver = None
        self.header = ""
        
    def _setup_driver(self):
        """Khởi tạo Chrome driver"""
        self.driver = webdriver.Chrome(options=self.chrome_options)
        
    def _close_driver(self):
        """Đóng driver"""
        if self.driver:
            self.driver.quit()
    
    def _replace_hidden_links(self, element):
        """
        Thay thế các từ 'TẠI ĐÂY' bằng link thực tế
        """
        try:
            # Tìm tất cả các thẻ <a> trong element
            links = element.find_elements(By.TAG_NAME, "a")
            
            for link in links:
                link_text = link.text.strip().upper()
                # Kiểm tra nếu text của link chứa "TẠI ĐÂY" hoặc các biến thể
                if any(keyword in link_text for keyword in ["TẠI ĐÂY", "TẠI ĐÂY.", "TẠI ĐÂY,"]):
                    href = link.get_attribute("href")
                    if href:
                        self.driver.execute_script(
                            "arguments[0].textContent = arguments[1];",
                            link,
                            f"[Link: {href}]"
                        )
            
            return True
        except Exception as e:
            print(f"Lỗi khi xử lý link ẩn: {e}")
            return False
    
    def _get_text_with_links(self, element):
        """
        Lấy text từ element và thay thế các link ẩn
        """
        try:
            # Xử lý các link ẩn trước
            self._replace_hidden_links(element)
            
            # Lấy text sau khi đã xử lý
            return element.text.strip()
        except Exception as e:
            print(f"Lỗi khi lấy text: {e}")
            return ""
    
    def _crawl_single_url(self, url):
        """Crawl nội dung từ một URL"""
        try:
            self.driver.get(url)
            time.sleep(2)  
            
            content_parts = []
            
            # Lấy header
            try:
                header_selectors = [
                    'div[class="header"] h2',
                    'h1', 'h2', '.header h2',
                ]
                for selector in header_selectors:
                    try:
                        header = self.driver.find_element(By.CSS_SELECTOR, selector)
                        if header.text.strip():
                            self.header = header.text.strip()
                            break
                    except:
                        continue
            except:
                pass
            
            # Lấy nội dung chính
            try:
                main_selectors = [
                    'div[class="tip-detail"]',
                    '.tip-detail',
                    '.main-content',
                    '.content'
                ]
                for selector in main_selectors:
                    try:
                        main_div = self.driver.find_element(By.CSS_SELECTOR, selector)
                        if main_div.text.strip():
                            processed_content = self._get_text_with_links(main_div)
                            if processed_content:
                                content_parts.append(processed_content)
                                break
                    except:
                        continue
            except:
                pass
            
            final_content = "\n".join(content_parts) if content_parts else "Không thể lấy nội dung"
            return final_content
            
        except Exception as e:
            print(f"Lỗi khi crawl {url}: {e}")
            return f"Lỗi: {str(e)}"
    
    def _save_to_docx(self, content, filename):
        """Lưu nội dung vào file DOCX"""
        try:
            doc = Document()
            doc.add_paragraph(content)
            doc.save(filename)
            return True
        except Exception as e:
            print(f"Lỗi khi lưu file {filename}: {e}")
            return False
    
    def _create_filename(self):
        """Tạo tên file"""
        clean_header = re.sub(r'[<>:"/\\|?*]', '', self.header)
        return f"{clean_header}.docx" if clean_header else f"content_{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx"
    
    def run(self, urls):
        """
        Crawl danh sách URLs và lưu thành các file DOCX
        
        Args:
            urls (list): Danh sách các URL cần crawl
            
        Returns:
            list: Danh sách dict chứa metadata của từng file
            [{"url": "...", "filename": "...", "success": True/False}]
        """
        results = []
        
        print(f"Bắt đầu crawl {len(urls)} trang web...")
        self._setup_driver()
        
        try:
            for i, url in enumerate(urls, 1):
                print(f"[{i}/{len(urls)}] Crawling: {url}")
                
                # Reset header cho mỗi URL
                self.header = ""
                
                # Crawl nội dung
                content = self._crawl_single_url(url)
                filename = self._create_filename()
                success = self._save_to_docx(content, filename)

                result = {
                    "url": url,
                    "filename": filename,
                    "success": success
                }
                results.append(result)
                
                if success:
                    print(f"✓ Đã lưu: {filename}")
                else:
                    print(f"✗ Lỗi khi lưu: {filename}")
                # Nghỉ giữa các request
                if i < len(urls):
                    time.sleep(self.delay)
                    
        except Exception as e:
            print(f"Lỗi trong quá trình crawl: {e}")
        
        finally:
            self._close_driver()
            
        print(f"\nHoàn thành! Crawl thành công {sum(1 for r in results if r['success'])}/{len(urls)} trang")
        return results

# Ví dụ sử dụng
if __name__ == "__main__":
    # Danh sách URL cần crawl
    urls = [
        "https://sv-ctt.hust.edu.vn/#/so-tay-sv/61/hoc-bong",
        "https://sv-ctt.hust.edu.vn/#/so-tay-sv/62/huong-dan-ho-so-che-do-chinh-sach-mien-giam-hoc-phi-vay-von-ngan-hang"
        # Thêm các URL khác...
    ]
    
    # Tạo crawler và chạy
    crawler = SimpleCrawler(headless=True, delay=3)
    results = crawler.run(urls)
    
    # In kết quả
    print("\n=== KẾT QUẢ ===")
    for result in results:
        status = "✓" if result["success"] else "✗"
        print(f"{status} {result['url']} -> {result['filename']}")