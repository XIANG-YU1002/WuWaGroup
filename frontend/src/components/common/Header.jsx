import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import AvatarMenu from "./AvatarMenu.jsx";
import SearchInput from "./SearchInput.jsx";

export default function Header() {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link to="/" className="app-logo">
          WuWaGroup
        </Link>
        <SearchInput />
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
              <Link to="/follow-list" onClick={() => setMobileOpen(false)}>
                跟團清單
              </Link>
              <Link to="/notifications" onClick={() => setMobileOpen(false)}>
                通知
              </Link>
              <Link to="/favorites" onClick={() => setMobileOpen(false)}>
                收藏
              </Link>
              <AvatarMenu />
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                登入
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}>
                註冊
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
