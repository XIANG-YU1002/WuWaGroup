from app.models.group_leader import GroupLeaderProfile


def is_profile_complete(profile: GroupLeaderProfile | None) -> bool:
    """依 Business Rules §3.4 / §9.1：需同時具備公開名稱及至少一項公開聯絡方式。"""
    if profile is None:
        return False
    has_display_name = bool(profile.display_name and profile.display_name.strip())
    has_contact = bool(profile.facebook_url or profile.discord_contact or profile.line_contact)
    return has_display_name and has_contact
