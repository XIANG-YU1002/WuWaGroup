"""initial schema: 18 core tables + enums + constraints + indexes

依據 04_Database_Design_v2.1 建立第一版完整資料庫結構，並包含需求追蹤矩陣
（docs/00_Requirements_Traceability_Matrix.md）衝突解法 #2 的擴充欄位：
- product.official_currency（TWD／CNY／JPY，選填，與 official_price 同進退）

（衝突解法 #1 的 activity.category 擴充欄位已於 2026-07-23 撤回並移除，
不在此結構內。）

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-07-21

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ------------------------------------------------------------------
    # 0. Extensions
    # ------------------------------------------------------------------
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")

    # ------------------------------------------------------------------
    # 1. Enum types
    # ------------------------------------------------------------------
    op.execute("CREATE TYPE user_role AS ENUM ('member', 'admin');")
    op.execute(
        "CREATE TYPE group_leader_application_status AS ENUM "
        "('pending', 'approved', 'rejected');"
    )
    op.execute("CREATE TYPE activity_status AS ENUM ('open', 'ended');")
    op.execute("CREATE TYPE group_buy_status AS ENUM ('open', 'closed');")
    op.execute(
        "CREATE TYPE payment_method AS ENUM "
        "('bank_transfer', 'cash_on_delivery', 'other');"
    )
    op.execute("CREATE TYPE contact_platform AS ENUM ('facebook', 'discord', 'line');")
    op.execute(
        "CREATE TYPE order_status AS ENUM ("
        "'pending_confirmation', 'pending_payment', 'paid', 'shipped', "
        "'completed', 'cancelled', 'rejected');"
    )
    op.execute(
        "CREATE TYPE cancellation_status AS ENUM ('pending', 'approved', 'rejected');"
    )
    op.execute("CREATE TYPE announcement_type AS ENUM ('platform', 'group_leader');")
    op.execute(
        "CREATE TYPE announcement_audience_scope AS ENUM "
        "('leader_unfinished', 'group_buy_unfinished');"
    )
    op.execute("CREATE TYPE notification_type AS ENUM ('system', 'group_leader');")
    # 擴充 Enum（衝突解法 #2）：僅用於 product.official_currency。
    op.execute("CREATE TYPE currency AS ENUM ('TWD', 'CNY', 'JPY');")

    # ------------------------------------------------------------------
    # 2. app_user
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE app_user (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            nickname VARCHAR(50) NOT NULL,
            avatar_url TEXT,
            facebook_contact TEXT,
            discord_contact TEXT,
            line_contact TEXT,
            role user_role NOT NULL DEFAULT 'member',
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT ck_app_user_nickname_not_blank CHECK (length(trim(nickname)) > 0),
            CONSTRAINT ck_app_user_contact_required CHECK (
                facebook_contact IS NOT NULL
                OR discord_contact IS NOT NULL
                OR line_contact IS NOT NULL
            )
        );
        """
    )
    op.execute(
        "CREATE UNIQUE INDEX uq_app_user_email_lower ON app_user (LOWER(email));"
    )
    op.execute("CREATE INDEX idx_app_user_role ON app_user (role);")

    # ------------------------------------------------------------------
    # 3. group_leader_application
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE group_leader_application (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE RESTRICT,
            status group_leader_application_status NOT NULL DEFAULT 'pending',
            reviewed_by_user_id UUID REFERENCES app_user(id) ON DELETE RESTRICT,
            reviewed_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT ck_group_leader_application_review_state CHECK (
                (
                    status = 'pending'
                    AND reviewed_by_user_id IS NULL
                    AND reviewed_at IS NULL
                )
                OR
                (
                    status IN ('approved', 'rejected')
                    AND reviewed_by_user_id IS NOT NULL
                    AND reviewed_at IS NOT NULL
                )
            )
        );
        """
    )
    op.execute(
        "CREATE UNIQUE INDEX uq_group_leader_application_pending_user "
        "ON group_leader_application (user_id) WHERE status = 'pending';"
    )
    op.execute(
        "CREATE INDEX idx_group_leader_application_status_created "
        "ON group_leader_application (status, created_at ASC);"
    )
    op.execute(
        "CREATE INDEX idx_group_leader_application_user_created "
        "ON group_leader_application (user_id, created_at DESC);"
    )

    # ------------------------------------------------------------------
    # 4. group_leader_profile
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE group_leader_profile (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL UNIQUE REFERENCES app_user(id) ON DELETE RESTRICT,
            display_name VARCHAR(50),
            introduction TEXT,
            default_rules TEXT,
            facebook_url TEXT,
            discord_contact TEXT,
            line_contact TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        """
    )
    op.execute(
        "CREATE UNIQUE INDEX uq_group_leader_display_name_lower "
        "ON group_leader_profile (LOWER(display_name)) WHERE display_name IS NOT NULL;"
    )

    # ------------------------------------------------------------------
    # 5. activity
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE activity (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(150) NOT NULL,
            description TEXT,
            image_url TEXT NOT NULL,
            status activity_status NOT NULL DEFAULT 'open',
            has_full_gift BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT ck_activity_name_not_blank CHECK (length(trim(name)) > 0),
            CONSTRAINT ck_activity_image_url_not_blank CHECK (length(trim(image_url)) > 0)
        );
        """
    )
    op.execute(
        "CREATE INDEX idx_activity_status_created ON activity (status, created_at DESC);"
    )
    op.execute(
        "CREATE INDEX idx_activity_name_trgm ON activity USING GIN (name gin_trgm_ops);"
    )

    # ------------------------------------------------------------------
    # 6. product（含擴充欄位 official_currency，見衝突解法 #2）
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE product (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            activity_id UUID NOT NULL REFERENCES activity(id) ON DELETE RESTRICT,
            name VARCHAR(150) NOT NULL,
            official_price NUMERIC(12, 2),
            official_currency currency,
            primary_image_url TEXT NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT uq_product_activity_name UNIQUE (activity_id, name),
            CONSTRAINT ck_product_name_not_blank CHECK (length(trim(name)) > 0),
            CONSTRAINT ck_product_primary_image_url_not_blank
                CHECK (length(trim(primary_image_url)) > 0),
            CONSTRAINT ck_product_official_price_non_negative
                CHECK (official_price IS NULL OR official_price >= 0),
            CONSTRAINT ck_product_official_price_currency_pair CHECK (
                (official_price IS NULL AND official_currency IS NULL)
                OR (official_price IS NOT NULL AND official_currency IS NOT NULL)
            )
        );
        """
    )
    op.execute(
        "CREATE INDEX idx_product_activity_active ON product (activity_id, is_active);"
    )
    op.execute(
        "CREATE INDEX idx_product_active_created ON product (is_active, created_at DESC);"
    )
    op.execute(
        "CREATE INDEX idx_product_name_trgm ON product USING GIN (name gin_trgm_ops);"
    )

    # ------------------------------------------------------------------
    # 7. product_image
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE product_image (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
            image_url TEXT NOT NULL,
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT uq_product_image_product_sort_order UNIQUE (product_id, sort_order),
            CONSTRAINT ck_product_image_sort_order_non_negative CHECK (sort_order >= 0),
            CONSTRAINT ck_product_image_image_url_not_blank CHECK (length(trim(image_url)) > 0)
        );
        """
    )
    op.execute(
        "CREATE INDEX idx_product_image_product_sort ON product_image (product_id, sort_order);"
    )

    # ------------------------------------------------------------------
    # 8. character
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE character (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT ck_character_name_not_blank CHECK (length(trim(name)) > 0)
        );
        """
    )
    op.execute(
        "CREATE UNIQUE INDEX uq_character_name_lower ON character (LOWER(name));"
    )
    op.execute(
        "CREATE INDEX idx_character_name_trgm ON character USING GIN (name gin_trgm_ops);"
    )

    # ------------------------------------------------------------------
    # 9. product_character
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE product_character (
            product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
            character_id UUID NOT NULL REFERENCES character(id) ON DELETE RESTRICT,
            PRIMARY KEY (product_id, character_id)
        );
        """
    )
    op.execute(
        "CREATE INDEX idx_product_character_character ON product_character (character_id);"
    )

    # ------------------------------------------------------------------
    # 10. group_buy
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE group_buy (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            group_leader_profile_id UUID NOT NULL
                REFERENCES group_leader_profile(id) ON DELETE RESTRICT,
            activity_id UUID NOT NULL REFERENCES activity(id) ON DELETE RESTRICT,
            payment_method payment_method NOT NULL,
            payment_method_note TEXT,
            requires_second_payment BOOLEAN NOT NULL DEFAULT false,
            includes_full_gift BOOLEAN NOT NULL DEFAULT false,
            deadline_at TIMESTAMPTZ NOT NULL,
            rules TEXT NOT NULL,
            contact_platform contact_platform NOT NULL,
            contact_value TEXT NOT NULL,
            status group_buy_status NOT NULL DEFAULT 'open',
            closed_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT ck_group_buy_deadline_after_created CHECK (deadline_at > created_at),
            CONSTRAINT ck_group_buy_rules_not_blank CHECK (length(trim(rules)) > 0),
            CONSTRAINT ck_group_buy_contact_value_not_blank CHECK (length(trim(contact_value)) > 0),
            CONSTRAINT ck_group_buy_payment_method_note_pair CHECK (
                (
                    payment_method = 'other'
                    AND payment_method_note IS NOT NULL
                    AND length(trim(payment_method_note)) > 0
                )
                OR
                (
                    payment_method <> 'other'
                    AND payment_method_note IS NULL
                )
            ),
            CONSTRAINT ck_group_buy_status_closed_at_pair CHECK (
                (status = 'open' AND closed_at IS NULL)
                OR
                (status = 'closed' AND closed_at IS NOT NULL)
            )
        );
        """
    )
    op.execute(
        "CREATE INDEX idx_group_buy_activity_status_deadline "
        "ON group_buy (activity_id, status, deadline_at);"
    )
    op.execute(
        "CREATE INDEX idx_group_buy_leader_status_created "
        "ON group_buy (group_leader_profile_id, status, created_at DESC);"
    )
    op.execute("CREATE INDEX idx_group_buy_deadline ON group_buy (deadline_at);")

    # ------------------------------------------------------------------
    # 11. group_buy_product
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE group_buy_product (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            group_buy_id UUID NOT NULL REFERENCES group_buy(id) ON DELETE RESTRICT,
            product_id UUID NOT NULL REFERENCES product(id) ON DELETE RESTRICT,
            unit_price NUMERIC(12, 2) NOT NULL,
            max_quantity INTEGER NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT uq_group_buy_product_group_buy_product UNIQUE (group_buy_id, product_id),
            CONSTRAINT ck_group_buy_product_unit_price_non_negative CHECK (unit_price >= 0),
            CONSTRAINT ck_group_buy_product_max_quantity_positive CHECK (max_quantity > 0)
        );
        """
    )
    op.execute(
        "CREATE INDEX idx_group_buy_product_product ON group_buy_product (product_id);"
    )
    op.execute(
        "CREATE INDEX idx_group_buy_product_group_buy ON group_buy_product (group_buy_id);"
    )

    # ------------------------------------------------------------------
    # 12. follow_list
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE follow_list (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL UNIQUE REFERENCES app_user(id) ON DELETE CASCADE,
            group_buy_id UUID NOT NULL REFERENCES group_buy(id) ON DELETE RESTRICT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        """
    )
    op.execute("CREATE INDEX idx_follow_list_group_buy ON follow_list (group_buy_id);")

    # ------------------------------------------------------------------
    # 13. follow_list_item
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE follow_list_item (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            follow_list_id UUID NOT NULL REFERENCES follow_list(id) ON DELETE CASCADE,
            group_buy_product_id UUID NOT NULL
                REFERENCES group_buy_product(id) ON DELETE RESTRICT,
            quantity INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT uq_follow_list_item_list_product
                UNIQUE (follow_list_id, group_buy_product_id),
            CONSTRAINT ck_follow_list_item_quantity_positive CHECK (quantity > 0)
        );
        """
    )
    op.execute(
        "CREATE INDEX idx_follow_list_item_group_buy_product "
        "ON follow_list_item (group_buy_product_id);"
    )

    # ------------------------------------------------------------------
    # 14. group_order
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE group_order (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            order_number VARCHAR(30) NOT NULL UNIQUE,
            user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE RESTRICT,
            group_buy_id UUID NOT NULL REFERENCES group_buy(id) ON DELETE RESTRICT,
            status order_status NOT NULL DEFAULT 'pending_confirmation',
            rejection_reason TEXT,
            product_total_amount NUMERIC(12, 2) NOT NULL,
            group_leader_name_snapshot VARCHAR(50) NOT NULL,
            activity_name_snapshot VARCHAR(150) NOT NULL,
            payment_method_snapshot payment_method NOT NULL,
            payment_method_note_snapshot TEXT,
            requires_second_payment_snapshot BOOLEAN NOT NULL DEFAULT false,
            includes_full_gift_snapshot BOOLEAN NOT NULL DEFAULT false,
            rules_snapshot TEXT NOT NULL,
            leader_contact_platform_snapshot contact_platform NOT NULL,
            leader_contact_value_snapshot TEXT NOT NULL,
            member_facebook_contact_snapshot TEXT,
            member_discord_contact_snapshot TEXT,
            member_line_contact_snapshot TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT ck_group_order_product_total_amount_non_negative
                CHECK (product_total_amount >= 0),
            CONSTRAINT ck_group_order_rules_snapshot_not_blank
                CHECK (length(trim(rules_snapshot)) > 0),
            CONSTRAINT ck_group_order_leader_contact_value_snapshot_not_blank
                CHECK (length(trim(leader_contact_value_snapshot)) > 0),
            CONSTRAINT ck_group_order_rejection_reason_pair CHECK (
                (
                    status = 'rejected'
                    AND rejection_reason IS NOT NULL
                    AND length(trim(rejection_reason)) > 0
                )
                OR
                (
                    status <> 'rejected'
                    AND rejection_reason IS NULL
                )
            ),
            CONSTRAINT ck_group_order_payment_method_note_snapshot_pair CHECK (
                (
                    payment_method_snapshot = 'other'
                    AND payment_method_note_snapshot IS NOT NULL
                    AND length(trim(payment_method_note_snapshot)) > 0
                )
                OR
                (
                    payment_method_snapshot <> 'other'
                    AND payment_method_note_snapshot IS NULL
                )
            ),
            CONSTRAINT ck_group_order_member_contact_snapshot_required CHECK (
                member_facebook_contact_snapshot IS NOT NULL
                OR member_discord_contact_snapshot IS NOT NULL
                OR member_line_contact_snapshot IS NOT NULL
            )
        );
        """
    )
    op.execute(
        "CREATE INDEX idx_group_order_user_created ON group_order (user_id, created_at DESC);"
    )
    op.execute(
        "CREATE INDEX idx_group_order_group_buy_queue "
        "ON group_order (group_buy_id, created_at ASC, id ASC);"
    )
    op.execute(
        "CREATE INDEX idx_group_order_group_buy_status_created "
        "ON group_order (group_buy_id, status, created_at ASC);"
    )
    op.execute(
        "CREATE INDEX idx_group_order_status_created ON group_order (status, created_at DESC);"
    )

    # ------------------------------------------------------------------
    # 15. order_item
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE order_item (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            order_id UUID NOT NULL REFERENCES group_order(id) ON DELETE CASCADE,
            group_buy_product_id UUID NOT NULL
                REFERENCES group_buy_product(id) ON DELETE RESTRICT,
            product_name_snapshot VARCHAR(150) NOT NULL,
            image_url_snapshot TEXT NOT NULL,
            unit_price NUMERIC(12, 2) NOT NULL,
            quantity INTEGER NOT NULL,
            subtotal NUMERIC(12, 2) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT uq_order_item_order_product UNIQUE (order_id, group_buy_product_id),
            CONSTRAINT ck_order_item_unit_price_non_negative CHECK (unit_price >= 0),
            CONSTRAINT ck_order_item_quantity_positive CHECK (quantity > 0),
            CONSTRAINT ck_order_item_subtotal_non_negative CHECK (subtotal >= 0),
            CONSTRAINT ck_order_item_subtotal_matches CHECK (subtotal = unit_price * quantity)
        );
        """
    )
    op.execute(
        "CREATE INDEX idx_order_item_group_buy_product ON order_item (group_buy_product_id);"
    )
    op.execute("CREATE INDEX idx_order_item_order ON order_item (order_id);")

    # ------------------------------------------------------------------
    # 16. cancellation_request
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE cancellation_request (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            order_id UUID NOT NULL REFERENCES group_order(id) ON DELETE CASCADE,
            reason TEXT,
            status cancellation_status NOT NULL DEFAULT 'pending',
            response_note TEXT,
            processed_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT ck_cancellation_request_reason_not_blank
                CHECK (reason IS NULL OR length(trim(reason)) > 0),
            CONSTRAINT ck_cancellation_request_response_note_not_blank
                CHECK (response_note IS NULL OR length(trim(response_note)) > 0),
            CONSTRAINT ck_cancellation_request_status_processed_pair CHECK (
                (status = 'pending' AND response_note IS NULL AND processed_at IS NULL)
                OR
                (status IN ('approved', 'rejected') AND processed_at IS NOT NULL)
            )
        );
        """
    )
    op.execute(
        "CREATE UNIQUE INDEX uq_cancellation_request_pending_order "
        "ON cancellation_request (order_id) WHERE status = 'pending';"
    )
    op.execute(
        "CREATE INDEX idx_cancellation_request_status_created "
        "ON cancellation_request (status, created_at ASC);"
    )
    op.execute(
        "CREATE INDEX idx_cancellation_request_order_created "
        "ON cancellation_request (order_id, created_at DESC);"
    )

    # ------------------------------------------------------------------
    # 17. product_favorite
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE product_favorite (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
            product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT uq_product_favorite_user_product UNIQUE (user_id, product_id)
        );
        """
    )
    op.execute(
        "CREATE INDEX idx_product_favorite_user_created "
        "ON product_favorite (user_id, created_at DESC);"
    )
    op.execute(
        "CREATE INDEX idx_product_favorite_product ON product_favorite (product_id);"
    )

    # ------------------------------------------------------------------
    # 18. announcement
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE announcement (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            announcement_type announcement_type NOT NULL,
            audience_scope announcement_audience_scope,
            group_leader_profile_id UUID REFERENCES group_leader_profile(id) ON DELETE RESTRICT,
            group_buy_id UUID REFERENCES group_buy(id) ON DELETE RESTRICT,
            created_by_user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE RESTRICT,
            title VARCHAR(150) NOT NULL,
            content TEXT NOT NULL,
            is_public BOOLEAN NOT NULL DEFAULT false,
            published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT ck_announcement_title_not_blank CHECK (length(trim(title)) > 0),
            CONSTRAINT ck_announcement_content_not_blank CHECK (length(trim(content)) > 0),
            CONSTRAINT ck_announcement_type_scope_pair CHECK (
                (
                    announcement_type = 'platform'
                    AND audience_scope IS NULL
                    AND group_leader_profile_id IS NULL
                    AND group_buy_id IS NULL
                    AND is_public = false
                )
                OR
                (
                    announcement_type = 'group_leader'
                    AND audience_scope = 'leader_unfinished'
                    AND group_leader_profile_id IS NOT NULL
                    AND group_buy_id IS NULL
                )
                OR
                (
                    announcement_type = 'group_leader'
                    AND audience_scope = 'group_buy_unfinished'
                    AND group_leader_profile_id IS NOT NULL
                    AND group_buy_id IS NOT NULL
                )
            )
        );
        """
    )
    op.execute(
        "CREATE INDEX idx_announcement_public_leader_published "
        "ON announcement (group_leader_profile_id, published_at DESC) "
        "WHERE announcement_type = 'group_leader' AND is_public = true;"
    )
    op.execute(
        "CREATE INDEX idx_announcement_group_buy_published "
        "ON announcement (group_buy_id, published_at DESC) WHERE group_buy_id IS NOT NULL;"
    )
    op.execute(
        "CREATE INDEX idx_announcement_type_published "
        "ON announcement (announcement_type, published_at DESC);"
    )

    # ------------------------------------------------------------------
    # 19. notification
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE notification (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
            notification_type notification_type NOT NULL,
            title VARCHAR(150) NOT NULL,
            message TEXT NOT NULL,
            order_id UUID REFERENCES group_order(id) ON DELETE RESTRICT,
            announcement_id UUID REFERENCES announcement(id) ON DELETE CASCADE,
            group_leader_application_id UUID
                REFERENCES group_leader_application(id) ON DELETE RESTRICT,
            is_read BOOLEAN NOT NULL DEFAULT false,
            read_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT ck_notification_title_not_blank CHECK (length(trim(title)) > 0),
            CONSTRAINT ck_notification_message_not_blank CHECK (length(trim(message)) > 0),
            CONSTRAINT ck_notification_single_source CHECK (
                num_nonnulls(order_id, announcement_id, group_leader_application_id) = 1
            ),
            CONSTRAINT ck_notification_read_state_pair CHECK (
                (is_read = false AND read_at IS NULL)
                OR
                (is_read = true AND read_at IS NOT NULL)
            )
        );
        """
    )
    op.execute(
        "CREATE UNIQUE INDEX uq_notification_user_announcement "
        "ON notification (user_id, announcement_id) WHERE announcement_id IS NOT NULL;"
    )
    op.execute(
        "CREATE INDEX idx_notification_user_read_created "
        "ON notification (user_id, is_read, created_at DESC);"
    )
    op.execute(
        "CREATE INDEX idx_notification_order ON notification (order_id) "
        "WHERE order_id IS NOT NULL;"
    )
    op.execute(
        "CREATE INDEX idx_notification_announcement ON notification (announcement_id) "
        "WHERE announcement_id IS NOT NULL;"
    )
    op.execute(
        "CREATE INDEX idx_notification_application "
        "ON notification (group_leader_application_id) "
        "WHERE group_leader_application_id IS NOT NULL;"
    )


def downgrade() -> None:
    # 依外鍵相依性反向刪除，使用 CASCADE 一併移除相關 Constraint 與 Index。
    op.execute("DROP TABLE IF EXISTS notification CASCADE;")
    op.execute("DROP TABLE IF EXISTS announcement CASCADE;")
    op.execute("DROP TABLE IF EXISTS product_favorite CASCADE;")
    op.execute("DROP TABLE IF EXISTS cancellation_request CASCADE;")
    op.execute("DROP TABLE IF EXISTS order_item CASCADE;")
    op.execute("DROP TABLE IF EXISTS group_order CASCADE;")
    op.execute("DROP TABLE IF EXISTS follow_list_item CASCADE;")
    op.execute("DROP TABLE IF EXISTS follow_list CASCADE;")
    op.execute("DROP TABLE IF EXISTS group_buy_product CASCADE;")
    op.execute("DROP TABLE IF EXISTS group_buy CASCADE;")
    op.execute("DROP TABLE IF EXISTS product_character CASCADE;")
    op.execute("DROP TABLE IF EXISTS character CASCADE;")
    op.execute("DROP TABLE IF EXISTS product_image CASCADE;")
    op.execute("DROP TABLE IF EXISTS product CASCADE;")
    op.execute("DROP TABLE IF EXISTS activity CASCADE;")
    op.execute("DROP TABLE IF EXISTS group_leader_profile CASCADE;")
    op.execute("DROP TABLE IF EXISTS group_leader_application CASCADE;")
    op.execute("DROP TABLE IF EXISTS app_user CASCADE;")

    op.execute("DROP TYPE IF EXISTS currency;")
    op.execute("DROP TYPE IF EXISTS notification_type;")
    op.execute("DROP TYPE IF EXISTS announcement_audience_scope;")
    op.execute("DROP TYPE IF EXISTS announcement_type;")
    op.execute("DROP TYPE IF EXISTS cancellation_status;")
    op.execute("DROP TYPE IF EXISTS order_status;")
    op.execute("DROP TYPE IF EXISTS contact_platform;")
    op.execute("DROP TYPE IF EXISTS payment_method;")
    op.execute("DROP TYPE IF EXISTS group_buy_status;")
    op.execute("DROP TYPE IF EXISTS activity_status;")
    op.execute("DROP TYPE IF EXISTS group_leader_application_status;")
    op.execute("DROP TYPE IF EXISTS user_role;")

    # 保留 pgcrypto／pg_trgm extension，避免影響同一資料庫中其他物件。
