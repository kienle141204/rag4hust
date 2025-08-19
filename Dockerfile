# Sử dụng Python 3.10 slim image làm base
FROM python:3.10-slim

# Thiết lập working directory
WORKDIR /app

# Cài đặt hệ thống dependencies cần thiết
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements và cài đặt Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ source code
COPY . .

# Expose port 8000 (port mặc định của FastAPI app)
EXPOSE 8000

# Command để chạy ứng dụng
CMD ["uvicorn", "backend_main:app", "--host", "0.0.0.0", "--port", "8000"]