from app.models.enums import UserRole
from tests.factories import create_group_leader_profile, create_user
from tests.utils import auth_headers, login, register_and_login


def _admin_headers(client, db_session):
    admin = create_user(db_session, role=UserRole.ADMIN)
    return auth_headers(login(client, admin.email, "Passw0rd1"))


def test_get_users_list_and_detail(client, db_session):
    admin_headers = _admin_headers(client, db_session)
    member, _token = register_and_login(client)

    list_response = client.get("/api/v1/admin/users", headers=admin_headers)
    assert list_response.status_code == 200
    ids = [item["id"] for item in list_response.json()["data"]]
    assert member["id"] in ids

    detail_response = client.get(f"/api/v1/admin/users/{member['id']}", headers=admin_headers)
    assert detail_response.status_code == 200
    assert detail_response.json()["data"]["email"] == member["email"]
    assert detail_response.json()["data"]["group_leader_profile"] is None


def test_get_user_detail_shows_group_leader_profile(client, db_session):
    admin_headers = _admin_headers(client, db_session)
    leader_user = create_user(db_session)
    create_group_leader_profile(db_session, user=leader_user, complete=True)

    response = client.get(f"/api/v1/admin/users/{leader_user.id}", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["data"]["group_leader_profile"]["is_profile_complete"] is True


def test_get_user_detail_not_found(client, db_session):
    import uuid

    admin_headers = _admin_headers(client, db_session)
    response = client.get(f"/api/v1/admin/users/{uuid.uuid4()}", headers=admin_headers)
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "USER_NOT_FOUND"


def test_get_group_leaders_list_and_detail(client, db_session):
    admin_headers = _admin_headers(client, db_session)
    profile = create_group_leader_profile(db_session, complete=True)

    list_response = client.get("/api/v1/admin/group-leaders", headers=admin_headers)
    assert list_response.status_code == 200
    ids = [item["id"] for item in list_response.json()["data"]]
    assert str(profile.id) in ids

    detail_response = client.get(
        f"/api/v1/admin/group-leaders/{profile.id}", headers=admin_headers
    )
    assert detail_response.status_code == 200
    data = detail_response.json()["data"]
    assert data["display_name"] == profile.display_name
    assert data["public_contacts"]["discord"] == "leader_discord"
    assert data["current_group_buys"] == []


def test_readonly_endpoints_require_admin(client):
    _, token = register_and_login(client)
    response = client.get("/api/v1/admin/users", headers=auth_headers(token))
    assert response.status_code == 403
