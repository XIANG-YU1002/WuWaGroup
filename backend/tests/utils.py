import uuid

from fastapi.testclient import TestClient


def unique_email() -> str:
    return f"test-{uuid.uuid4().hex}@example.com"


def register_payload(**overrides) -> dict:
    payload = {
        "email": unique_email(),
        "password": "Passw0rd1",
        "password_confirmation": "Passw0rd1",
        "nickname": "測試會員",
        "discord_contact": "tester_discord",
    }
    payload.update(overrides)
    return payload


def register(client: TestClient, **overrides) -> dict:
    payload = register_payload(**overrides)
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201, response.text
    return {**response.json()["data"], "email": payload["email"], "password": payload["password"]}


def login(client: TestClient, email: str, password: str = "Passw0rd1") -> str:
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    return response.json()["data"]["access_token"]


def register_and_login(client: TestClient, **overrides) -> tuple[dict, str]:
    user = register(client, **overrides)
    token = login(client, user["email"], user["password"])
    return user, token


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}
