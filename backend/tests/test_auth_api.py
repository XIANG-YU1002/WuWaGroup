from tests.utils import auth_headers, login, register, register_payload


def test_register_success(client):
    payload = register_payload()
    response = client.post("/api/v1/auth/register", json=payload)

    assert response.status_code == 201
    data = response.json()["data"]
    assert data["email"] == payload["email"]
    assert data["nickname"] == payload["nickname"]
    assert data["avatar_url"] is None


def test_register_duplicate_email_returns_conflict(client):
    payload = register_payload()
    first = client.post("/api/v1/auth/register", json=payload)
    assert first.status_code == 201

    second = client.post("/api/v1/auth/register", json={**payload, "nickname": "另一個暱稱"})
    assert second.status_code == 409
    assert second.json()["error"]["code"] == "EMAIL_ALREADY_EXISTS"


def test_register_email_is_case_insensitive_unique(client):
    payload = register_payload()
    first = client.post("/api/v1/auth/register", json=payload)
    assert first.status_code == 201

    upper_email_payload = register_payload(email=payload["email"].upper())
    second = client.post("/api/v1/auth/register", json=upper_email_payload)
    assert second.status_code == 409


def test_register_password_confirmation_mismatch(client):
    payload = register_payload(password_confirmation="Different123")
    response = client.post("/api/v1/auth/register", json=payload)

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_register_requires_at_least_one_contact(client):
    payload = register_payload(discord_contact=None)
    response = client.post("/api/v1/auth/register", json=payload)

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_register_blank_contact_is_normalized_to_none(client):
    payload = register_payload(discord_contact="   ", line_contact="tester_line")
    response = client.post("/api/v1/auth/register", json=payload)

    assert response.status_code == 201


def test_login_success(client):
    user = register(client)
    response = client.post(
        "/api/v1/auth/login", json={"email": user["email"], "password": user["password"]}
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["token_type"] == "bearer"
    assert data["expires_in"] == 8 * 60 * 60
    assert data["access_token"]


def test_login_invalid_password(client):
    user = register(client)
    response = client.post(
        "/api/v1/auth/login", json={"email": user["email"], "password": "WrongPass1"}
    )

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTH_INVALID_CREDENTIALS"


def test_login_unknown_email_does_not_leak_existence(client):
    response = client.post(
        "/api/v1/auth/login", json={"email": "unknown@example.com", "password": "WrongPass1"}
    )

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTH_INVALID_CREDENTIALS"


def test_get_current_session_requires_token(client):
    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTH_TOKEN_MISSING"


def test_get_current_session_rejects_invalid_token(client):
    response = client.get("/api/v1/auth/me", headers=auth_headers("not-a-real-token"))

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTH_TOKEN_INVALID"


def test_get_current_session_success(client):
    user = register(client)
    token = login(client, user["email"], user["password"])

    response = client.get("/api/v1/auth/me", headers=auth_headers(token))

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["id"] == user["id"]
    assert data["email"] == user["email"]
    assert data["role"] == "member"
    assert data["group_leader"] is None
    assert data["permissions"] == {
        "is_admin": False,
        "has_group_leader_profile": False,
        "can_manage_group_buys": False,
    }
