# RAG4HUST Chatbot

Một chatbot sử dụng Retrieval-Augmented Generation (RAG) cho Trường Đại học Bách khoa Hà Nội (HUST).

## Cấu trúc dự án

```
rag4hust/
├── backend_main.py       # File chính để chạy backend API
├── main.py              # File chạy chatbot trong terminal
├── src/                 # Source code cho agent và graph
├── frontend/            # Ứng dụng React frontend
├── data/                # Dữ liệu đã xử lý và thô
└── requirements.txt     # Dependencies của Python
```

## Cài đặt

1. **Cài đặt dependencies cho backend:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Cài đặt dependencies cho frontend:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Cài đặt concurrently (để chạy cả backend và frontend cùng lúc):**
   ```bash
   npm install
   ```

## Chạy ứng dụng

### Chạy cả backend và frontend cùng lúc:
```bash
npm run dev
```

### Chạy backend riêng:
```bash
npm run backend
# hoặc
python backend_main.py
```

### Chạy frontend riêng:
```bash
npm run frontend
# hoặc
cd frontend
npm run dev
```

Backend sẽ chạy trên `http://localhost:8000`
Frontend sẽ chạy trên `http://localhost:5173`

## API Endpoints

- `GET /` - Kiểm tra trạng thái API
- `POST /chat` - Gửi tin nhắn để chat với bot

## Sử dụng

1. Truy cập `http://localhost:5173` trong trình duyệt để sử dụng giao diện chat.
2. Nhập câu hỏi của bạn vào ô chat và nhấn Enter hoặc nút gửi.
3. Bot sẽ trả lời dựa trên kiến thức đã được huấn luyện và dữ liệu HUST.

## Tính năng

- Hỗ trợ hiển thị markdown trong chat với định dạng code, danh sách, bảng biểu, v.v.
- Hiển thị tài liệu tham khảo đã được trích xuất để tạo ra câu trả lời
- Giao diện thân thiện với người dùng
- Lưu trữ lịch sử cuộc trò chuyện trong localStorage