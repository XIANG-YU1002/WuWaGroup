from app.models.enums import UserRole
from tests.factories import create_activity, create_character, create_product, link_product_character, create_user
from tests.utils import auth_headers, login


def _admin_headers(client, db_session):
    admin = create_user(db_session, role=UserRole.ADMIN)
    return auth_headers(login(client, admin.email, "Passw0rd1"))


def test_create_character(client, db_session):
    headers = _admin_headers(client, db_session)
    response = client.post("/api/v1/admin/characters", json={"name": "今汐"}, headers=headers)
    assert response.status_code == 201
    assert response.json()["data"]["name"] == "今汐"
    assert response.json()["data"]["related_product_count"] == 0


def test_create_character_duplicate_case_insensitive(client, db_session):
    headers = _admin_headers(client, db_session)
    create_character(db_session, name="今汐")

    response = client.post("/api/v1/admin/characters", json={"name": "今汐"}, headers=headers)
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "CHARACTER_NAME_ALREADY_EXISTS"


def test_get_suggestions(client, db_session):
    headers = _admin_headers(client, db_session)
    character = create_character(db_session, name="今汐")
    product = create_product(db_session)
    link_product_character(db_session, product, character)

    response = client.get(
        "/api/v1/admin/characters/suggestions", params={"q": "今"}, headers=headers
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) == 1
    assert data[0]["related_product_count"] == 1


def test_update_character_name(client, db_session):
    headers = _admin_headers(client, db_session)
    character = create_character(db_session, name="舊名字")

    response = client.patch(
        f"/api/v1/admin/characters/{character.id}", json={"name": "新名字"}, headers=headers
    )
    assert response.status_code == 200
    assert response.json()["data"]["name"] == "新名字"


def test_delete_character_without_products(client, db_session):
    headers = _admin_headers(client, db_session)
    character = create_character(db_session)

    response = client.delete(f"/api/v1/admin/characters/{character.id}", headers=headers)
    assert response.status_code == 204


def test_delete_character_with_products_blocked(client, db_session):
    headers = _admin_headers(client, db_session)
    character = create_character(db_session)
    product = create_product(db_session)
    link_product_character(db_session, product, character)

    response = client.delete(f"/api/v1/admin/characters/{character.id}", headers=headers)
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "CHARACTER_HAS_PRODUCT_RELATIONS"
