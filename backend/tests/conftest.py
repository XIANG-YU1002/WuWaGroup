import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# Stage 2 起，API 整合測試需要真正的 PostgreSQL 連線（依使用者決議直接使用現有 Supabase
# 專案，見 docs/目前進度.txt），因此需要本機存在有效的 backend/.env。
# 每個測試都在一個交易內執行，測試結束後 rollback，不會在 Supabase 留下任何資料。

from app.core.database import engine, get_db  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture()
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture()
def client(db_session: Session):
    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.pop(get_db, None)
