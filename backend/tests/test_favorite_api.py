from tests.factories import create_activity, create_product
from tests.utils import auth_headers, register_and_login


def test_add_and_list_favorite(client, db_session):
    activity = create_activity(db_session)
    product = create_product(db_session, activity=activity)
    _, token = register_and_login(client)
    headers = auth_headers(token)

    add_response = client.post(f"/api/v1/favorites/products/{product.id}", headers=headers)
    assert add_response.status_code == 201
    assert add_response.json()["data"] == {"product_id": str(product.id), "is_favorited": True}

    list_response = client.get("/api/v1/favorites/products", headers=headers)
    assert list_response.status_code == 200
    data = list_response.json()["data"]
    assert len(data) == 1
    assert data[0]["product"]["id"] == str(product.id)


def test_add_favorite_idempotent(client, db_session):
    activity = create_activity(db_session)
    product = create_product(db_session, activity=activity)
    _, token = register_and_login(client)
    headers = auth_headers(token)

    client.post(f"/api/v1/favorites/products/{product.id}", headers=headers)
    second = client.post(f"/api/v1/favorites/products/{product.id}", headers=headers)
    assert second.status_code == 201

    list_response = client.get("/api/v1/favorites/products", headers=headers)
    assert len(list_response.json()["data"]) == 1


def test_favorite_inactive_product_still_listed(client, db_session):
    activity = create_activity(db_session)
    product = create_product(db_session, activity=activity, is_active=False)
    _, token = register_and_login(client)
    headers = auth_headers(token)

    client.post(f"/api/v1/favorites/products/{product.id}", headers=headers)
    list_response = client.get("/api/v1/favorites/products", headers=headers)
    assert list_response.json()["data"][0]["product"]["is_active"] is False


def test_remove_favorite(client, db_session):
    activity = create_activity(db_session)
    product = create_product(db_session, activity=activity)
    _, token = register_and_login(client)
    headers = auth_headers(token)

    client.post(f"/api/v1/favorites/products/{product.id}", headers=headers)
    remove_response = client.delete(f"/api/v1/favorites/products/{product.id}", headers=headers)
    assert remove_response.status_code == 204

    list_response = client.get("/api/v1/favorites/products", headers=headers)
    assert list_response.json()["data"] == []


def test_remove_favorite_idempotent_when_not_favorited(client, db_session):
    activity = create_activity(db_session)
    product = create_product(db_session, activity=activity)
    _, token = register_and_login(client)

    response = client.delete(
        f"/api/v1/favorites/products/{product.id}", headers=auth_headers(token)
    )
    assert response.status_code == 204


def test_favorite_requires_authentication(client, db_session):
    product = create_product(db_session)
    response = client.post(f"/api/v1/favorites/products/{product.id}")
    assert response.status_code == 401
