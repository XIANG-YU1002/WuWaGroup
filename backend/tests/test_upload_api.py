import io

from PIL import Image

from app.models.enums import UserRole
from tests.factories import create_user
from tests.utils import auth_headers, login, register_and_login


def _png_bytes() -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (10, 10), color="red").save(buffer, format="PNG")
    return buffer.getvalue()


def test_upload_requires_authentication(client):
    files = {"file": ("avatar.png", _png_bytes(), "image/png")}
    response = client.post("/api/v1/uploads/images", files=files, data={"category": "avatar"})
    assert response.status_code == 401


def test_upload_avatar_success(client):
    _, token = register_and_login(client)
    files = {"file": ("avatar.png", _png_bytes(), "image/png")}

    response = client.post(
        "/api/v1/uploads/images",
        files=files,
        data={"category": "avatar"},
        headers=auth_headers(token),
    )

    assert response.status_code == 201
    data = response.json()["data"]
    assert data["category"] == "avatar"
    assert data["content_type"] == "image/webp"
    assert data["url"].startswith("/uploads/avatar/")
    assert data["size"] > 0


def test_upload_activity_requires_admin(client):
    _, token = register_and_login(client)
    files = {"file": ("activity.png", _png_bytes(), "image/png")}

    response = client.post(
        "/api/v1/uploads/images",
        files=files,
        data={"category": "activity"},
        headers=auth_headers(token),
    )

    assert response.status_code == 403
    assert response.json()["error"]["code"] == "UPLOAD_PERMISSION_DENIED"


def test_upload_activity_success_for_admin(client, db_session):
    admin = create_user(db_session, role=UserRole.ADMIN)
    token = login(client, admin.email, "Passw0rd1")
    files = {"file": ("activity.png", _png_bytes(), "image/png")}

    response = client.post(
        "/api/v1/uploads/images",
        files=files,
        data={"category": "activity"},
        headers=auth_headers(token),
    )

    assert response.status_code == 201
    assert response.json()["data"]["url"].startswith("/uploads/activity/")


def test_upload_invalid_category(client):
    _, token = register_and_login(client)
    files = {"file": ("banner.png", _png_bytes(), "image/png")}

    response = client.post(
        "/api/v1/uploads/images",
        files=files,
        data={"category": "banner"},
        headers=auth_headers(token),
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "UPLOAD_CATEGORY_INVALID"


def test_upload_unsupported_content_type(client):
    _, token = register_and_login(client)
    files = {"file": ("notes.txt", b"just some text", "text/plain")}

    response = client.post(
        "/api/v1/uploads/images",
        files=files,
        data={"category": "avatar"},
        headers=auth_headers(token),
    )

    assert response.status_code == 415
    assert response.json()["error"]["code"] == "UPLOAD_FILE_TYPE_NOT_SUPPORTED"


def test_upload_corrupt_image_rejected(client):
    _, token = register_and_login(client)
    files = {"file": ("avatar.png", b"not-really-a-png-file", "image/png")}

    response = client.post(
        "/api/v1/uploads/images",
        files=files,
        data={"category": "avatar"},
        headers=auth_headers(token),
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "UPLOAD_FILE_INVALID"
