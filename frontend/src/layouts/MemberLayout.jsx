import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/profile", label: "個人資料" },
  { to: "/orders", label: "我的訂單" },
  { to: "/favorites", label: "收藏商品" },
  { to: "/follow-list", label: "跟團清單" },
  { to: "/notifications", label: "通知中心" },
  { to: "/group-leader-application", label: "團主申請" },
];

export default function MemberLayout() {
  const { isAuthenticated, initializing, logout } = useAuth();
  const navigate = useNavigate();

  if (initializing) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="member-layout">
      <aside className="member-sidebar">
        <nav>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="member-sidebar-logout" onClick={handleLogout}>
          登出
        </button>
      </aside>
      <div className="member-content">
        <Outlet />
      </div>
    </div>
  );
}
