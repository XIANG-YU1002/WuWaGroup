"""一次性示範資料腳本，供 Stage 6 前端頁面在瀏覽器實際檢視畫面效果使用。

寫入真實 Supabase 資料庫（非自動 rollback 的測試資料庫）。
執行方式：於 backend/ 目錄啟用 venv 後執行 `python scripts/seed_demo_data.py`。

帳號密碼皆為 Passw0rd1，僅供本機開發測試使用。
"""

from datetime import datetime, timedelta, timezone

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.activity import Activity
from app.models.enums import (
    ActivityStatus,
    ContactPlatform,
    GroupBuyStatus,
    PaymentMethod,
    UserRole,
)
from app.models.group_buy import GroupBuy, GroupBuyProduct
from app.models.group_leader import GroupLeaderProfile
from app.models.product import Character, Product, ProductCharacter
from app.models.user import AppUser

PASSWORD = "Passw0rd1"


def main() -> None:
    db = SessionLocal()
    try:
        admin = AppUser(
            email="demo-admin@example.com",
            password_hash=hash_password(PASSWORD),
            nickname="示範管理員",
            discord_contact="demo_admin",
            role=UserRole.ADMIN,
        )
        leader_user = AppUser(
            email="demo-leader@example.com",
            password_hash=hash_password(PASSWORD),
            nickname="示範團主帳號",
            discord_contact="demo_leader",
            role=UserRole.MEMBER,
        )
        db.add_all([admin, leader_user])
        db.flush()

        leader_profile = GroupLeaderProfile(
            user_id=leader_user.id,
            display_name="月影團（示範）",
            introduction="主要協助官方周邊開團，示範資料。",
            default_rules="1. 團規僅供示範。\n2. 請勿正式下單。",
            discord_contact="moon_group_demo",
        )
        db.add(leader_profile)
        db.flush()

        open_activity = Activity(
            name="3.4 官方周邊（示範）",
            description="示範用活動說明文字。",
            image_url="https://placehold.co/960x540?text=Activity",
            status=ActivityStatus.OPEN,
            has_full_gift=True,
        )
        ended_activity = Activity(
            name="Solar5 主題周邊（示範，已結束）",
            description="示範用已結束活動。",
            image_url="https://placehold.co/960x540?text=Ended+Activity",
            status=ActivityStatus.ENDED,
            has_full_gift=False,
        )
        db.add_all([open_activity, ended_activity])
        db.flush()

        character_jinhsi = Character(name="今汐")
        character_changli = Character(name="長離")
        db.add_all([character_jinhsi, character_changli])
        db.flush()

        product1 = Product(
            activity_id=open_activity.id,
            name="今汐壓克力立牌（示範）",
            official_price="59.00",
            official_currency="CNY",
            primary_image_url="https://placehold.co/600x600?text=Product+1",
            is_active=True,
        )
        product2 = Product(
            activity_id=open_activity.id,
            name="長離資料夾（示範）",
            official_price="39.00",
            official_currency="CNY",
            primary_image_url="https://placehold.co/600x600?text=Product+2",
            is_active=True,
        )
        db.add_all([product1, product2])
        db.flush()

        db.add_all(
            [
                ProductCharacter(product_id=product1.id, character_id=character_jinhsi.id),
                ProductCharacter(product_id=product2.id, character_id=character_changli.id),
            ]
        )

        group_buy = GroupBuy(
            group_leader_profile_id=leader_profile.id,
            activity_id=open_activity.id,
            payment_method=PaymentMethod.CASH_ON_DELIVERY,
            requires_second_payment=False,
            includes_full_gift=True,
            deadline_at=datetime.now(timezone.utc) + timedelta(days=14),
            rules="1. 團規僅供示範。\n2. 請勿正式下單。\n3. 逾期未付款視為放棄。",
            contact_platform=ContactPlatform.DISCORD,
            contact_value="moon_group_demo",
            status=GroupBuyStatus.OPEN,
        )
        db.add(group_buy)
        db.flush()

        db.add_all(
            [
                GroupBuyProduct(
                    group_buy_id=group_buy.id,
                    product_id=product1.id,
                    unit_price="65.00",
                    max_quantity=20,
                ),
                GroupBuyProduct(
                    group_buy_id=group_buy.id,
                    product_id=product2.id,
                    unit_price="45.00",
                    max_quantity=15,
                ),
            ]
        )

        db.commit()

        print("示範資料建立完成：")
        print(f"  管理員帳號：{admin.email} / {PASSWORD}")
        print(f"  團主帳號：  {leader_user.email} / {PASSWORD}")
        print(f"  開放活動 id：{open_activity.id}")
        print(f"  商品1 id：  {product1.id}")
        print(f"  商品2 id：  {product2.id}")
        print(f"  團主 profile id：{leader_profile.id}")
        print(f"  開團 id：   {group_buy.id}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
