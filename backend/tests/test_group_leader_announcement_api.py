from app.models.enums import OrderStatus
from tests.factories import (
    create_activity,
    create_group_buy,
    create_group_buy_product,
    create_group_leader_profile,
    create_order_with_item,
    create_product,
    create_user,
)
from tests.utils import auth_headers, login


def _setup_leader_with_recipient(db_session, *, order_status=OrderStatus.PENDING_CONFIRMATION):
    leader_user = create_user(db_session)
    leader_profile = create_group_leader_profile(db_session, user=leader_user, complete=True)
    activity = create_activity(db_session)
    product = create_product(db_session, activity=activity)
    group_buy = create_group_buy(db_session, group_leader_profile=leader_profile, activity=activity)
    group_buy_product = create_group_buy_product(db_session, group_buy, product, max_quantity=5)
    buyer = create_user(db_session)
    create_order_with_item(
        db_session, buyer, group_buy, group_buy_product, quantity=1, status=order_status
    )
    return leader_user, leader_profile, group_buy, buyer


def _leader_headers(client, leader_user):
    return auth_headers(login(client, leader_user.email, "Passw0rd1"))


def test_create_leader_unfinished_announcement_with_recipient(client, db_session):
    leader_user, profile, _group_buy, buyer = _setup_leader_with_recipient(db_session)
    headers = _leader_headers(client, leader_user)

    response = client.post(
        "/api/v1/group-leader/announcements",
        json={
            "audience_scope": "leader_unfinished",
            "title": "近期團務說明",
            "content": "完整公告內容。",
            "is_public": True,
        },
        headers=headers,
    )

    assert response.status_code == 201
    data = response.json()["data"]
    assert data["recipient_count"] == 1

    buyer_token = login(client, buyer.email, "Passw0rd1")
    notifications = client.get(
        "/api/v1/notifications", headers=auth_headers(buyer_token)
    ).json()["data"]
    assert len(notifications) == 1
    assert notifications[0]["notification_type"] == "group_leader"
    assert notifications[0]["source"] == {"type": "announcement", "id": data["id"]}
    assert notifications[0]["target_url"] == f"/group-leaders/{profile.id}"


def test_create_announcement_zero_recipients_not_public_blocked(client, db_session):
    leader_user = create_user(db_session)
    create_group_leader_profile(db_session, user=leader_user, complete=True)
    headers = _leader_headers(client, leader_user)

    response = client.post(
        "/api/v1/group-leader/announcements",
        json={
            "audience_scope": "leader_unfinished",
            "title": "測試",
            "content": "內容",
            "is_public": False,
        },
        headers=headers,
    )

    assert response.status_code == 409
    assert response.json()["error"]["code"] == "ANNOUNCEMENT_NO_RECIPIENTS"


def test_create_announcement_zero_recipients_public_allowed(client, db_session):
    leader_user = create_user(db_session)
    create_group_leader_profile(db_session, user=leader_user, complete=True)
    headers = _leader_headers(client, leader_user)

    response = client.post(
        "/api/v1/group-leader/announcements",
        json={
            "audience_scope": "leader_unfinished",
            "title": "測試",
            "content": "內容",
            "is_public": True,
        },
        headers=headers,
    )

    assert response.status_code == 201
    assert response.json()["data"]["recipient_count"] == 0


def test_create_announcement_scope_group_buy_id_mismatch(client, db_session):
    leader_user = create_user(db_session)
    create_group_leader_profile(db_session, user=leader_user, complete=True)
    headers = _leader_headers(client, leader_user)

    response = client.post(
        "/api/v1/group-leader/announcements",
        json={
            "audience_scope": "group_buy_unfinished",
            "group_buy_id": None,
            "title": "測試",
            "content": "內容",
            "is_public": True,
        },
        headers=headers,
    )

    assert response.status_code == 422


def test_create_group_buy_announcement_not_owned(client, db_session):
    _leader_user, _profile, group_buy, _buyer = _setup_leader_with_recipient(db_session)
    other_leader_user = create_user(db_session)
    create_group_leader_profile(db_session, user=other_leader_user, complete=True)
    headers = _leader_headers(client, other_leader_user)

    response = client.post(
        "/api/v1/group-leader/announcements",
        json={
            "audience_scope": "group_buy_unfinished",
            "group_buy_id": str(group_buy.id),
            "title": "測試",
            "content": "內容",
            "is_public": True,
        },
        headers=headers,
    )

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "GROUP_BUY_NOT_OWNED"


def test_get_my_announcements_filter_by_scope(client, db_session):
    leader_user, _profile, group_buy, _buyer = _setup_leader_with_recipient(db_session)
    headers = _leader_headers(client, leader_user)

    client.post(
        "/api/v1/group-leader/announcements",
        json={
            "audience_scope": "leader_unfinished",
            "title": "整體公告",
            "content": "內容",
            "is_public": True,
        },
        headers=headers,
    )
    client.post(
        "/api/v1/group-leader/announcements",
        json={
            "audience_scope": "group_buy_unfinished",
            "group_buy_id": str(group_buy.id),
            "title": "開團公告",
            "content": "內容",
            "is_public": True,
        },
        headers=headers,
    )

    response = client.get(
        "/api/v1/group-leader/announcements",
        params={"audience_scope": "group_buy_unfinished"},
        headers=headers,
    )
    items = response.json()["data"]
    assert len(items) == 1
    assert items[0]["title"] == "開團公告"


def test_get_announcement_detail_not_owned(client, db_session):
    leader_user, _profile, _group_buy, _buyer = _setup_leader_with_recipient(db_session)
    headers = _leader_headers(client, leader_user)
    announcement_id = client.post(
        "/api/v1/group-leader/announcements",
        json={
            "audience_scope": "leader_unfinished",
            "title": "測試",
            "content": "內容",
            "is_public": True,
        },
        headers=headers,
    ).json()["data"]["id"]

    other_leader_user = create_user(db_session)
    create_group_leader_profile(db_session, user=other_leader_user, complete=True)
    other_headers = _leader_headers(client, other_leader_user)

    response = client.get(
        f"/api/v1/group-leader/announcements/{announcement_id}", headers=other_headers
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "ANNOUNCEMENT_NOT_FOUND"


def test_update_announcement_syncs_notification_content(client, db_session):
    leader_user, _profile, _group_buy, buyer = _setup_leader_with_recipient(db_session)
    headers = _leader_headers(client, leader_user)
    announcement_id = client.post(
        "/api/v1/group-leader/announcements",
        json={
            "audience_scope": "leader_unfinished",
            "title": "原標題",
            "content": "原內容",
            "is_public": True,
        },
        headers=headers,
    ).json()["data"]["id"]

    update_response = client.patch(
        f"/api/v1/group-leader/announcements/{announcement_id}",
        json={"title": "新標題", "content": "新內容"},
        headers=headers,
    )
    assert update_response.status_code == 200
    assert update_response.json()["data"]["title"] == "新標題"

    buyer_headers = auth_headers(login(client, buyer.email, "Passw0rd1"))
    notifications = client.get("/api/v1/notifications", headers=buyer_headers).json()["data"]
    assert notifications[0]["title"] == "新標題"
    assert notifications[0]["message"] == "新內容"


def test_update_announcement_cannot_go_private_with_zero_recipients(client, db_session):
    leader_user = create_user(db_session)
    create_group_leader_profile(db_session, user=leader_user, complete=True)
    headers = _leader_headers(client, leader_user)
    announcement_id = client.post(
        "/api/v1/group-leader/announcements",
        json={
            "audience_scope": "leader_unfinished",
            "title": "測試",
            "content": "內容",
            "is_public": True,
        },
        headers=headers,
    ).json()["data"]["id"]

    response = client.patch(
        f"/api/v1/group-leader/announcements/{announcement_id}",
        json={"is_public": False},
        headers=headers,
    )
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "ANNOUNCEMENT_NO_RECIPIENTS"


def test_delete_announcement_removes_notification(client, db_session):
    leader_user, _profile, _group_buy, buyer = _setup_leader_with_recipient(db_session)
    headers = _leader_headers(client, leader_user)
    announcement_id = client.post(
        "/api/v1/group-leader/announcements",
        json={
            "audience_scope": "leader_unfinished",
            "title": "測試",
            "content": "內容",
            "is_public": True,
        },
        headers=headers,
    ).json()["data"]["id"]

    delete_response = client.delete(
        f"/api/v1/group-leader/announcements/{announcement_id}", headers=headers
    )
    assert delete_response.status_code == 204

    buyer_headers = auth_headers(login(client, buyer.email, "Passw0rd1"))
    notifications = client.get("/api/v1/notifications", headers=buyer_headers).json()["data"]
    assert notifications == []

    detail_response = client.get(
        f"/api/v1/group-leader/announcements/{announcement_id}", headers=headers
    )
    assert detail_response.status_code == 404
