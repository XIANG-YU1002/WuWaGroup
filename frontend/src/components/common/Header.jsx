import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getUnreadCount } from "../../api/notifications.js";
import AvatarMenu from "./AvatarMenu.jsx";
import SearchInput from "./SearchInput.jsx";

export default function Header() {
  const { isAuthenticated, user, token } = useAuth();
  const isAdmin = user?.permissions?.is_admin ?? false;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || isAdmin) {
      setUnreadCount(0);
      return;
    }
    getUnreadCount(token)
      .then((response) => setUnreadCount(response.data.unread_count))
      .catch(() => setUnreadCount(0));
  }, [isAuthenticated, isAdmin, token]);

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link to="/" className="app-logo">
          WuWaGroup
        </Link>
        <button
          type="button"
          className="btn btn-ghost mobile-menu-toggle"
          aria-label="開啟選單"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          選單
        </button>
        <nav className={`header-nav ${mobileOpen ? "mobile-open" : ""}`}>
          {isAuthenticated ? (
            <>
              <SearchInput />
              <Link to="/group-leaders" onClick={() => setMobileOpen(false)}>
                團主
              </Link>
              {!isAdmin && (
                <Link to="/notifications" onClick={() => setMobileOpen(false)}>
                  通知
                  {unreadCount > 0 && <span className="header-badge">{unreadCount}</span>}
                </Link>
              )}
              <AvatarMenu />
            </>
          ) : (
            <>
              <Link to="/" onClick={() => setMobileOpen(false)}>
                首頁
              </Link>
              <Link to="/group-leaders" onClick={() => setMobileOpen(false)}>
                團主
              </Link>
              <SearchInput />
              <Link to="/register" onClick={() => setMobileOpen(false)}>
                註冊
              </Link>
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                登入
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
