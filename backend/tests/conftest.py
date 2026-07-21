import os

# Stage 1 測試不需要連線到真正的資料庫（僅檢查 metadata 與健康檢查端點），
# 因此在載入 app 之前，先提供假的必填環境變數，避免要求開發者先建立 .env。
os.environ.setdefault(
    "DATABASE_URL", "postgresql+psycopg://test:test@localhost:5432/test"
)
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key")
