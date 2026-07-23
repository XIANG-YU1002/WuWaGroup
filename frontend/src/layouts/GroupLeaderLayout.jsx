import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/group-leader", label: "儀表板", end: true },
  { to: "/group-leader/group-buys", label: "我的開團" },
  { to: "/group-leader/group-buys/new", label: "建立開團" },
  { to: "/group-leader/orders", label: "訂單管理" },
  { to: "/group-leader/announcements", label: "公告管理" },
  { to: "/group-leader/profile", label: "團主資料" },
];

export default function GroupLeaderLayout() {
  const { user, initializing, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (initializing) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ redirectPath: location.pathname }} />;
  }

  if (!user.group_leader) {
    return <Navigate to="/" replace />;
  }

  if (!user.group_leader.is_profile_complete && location.pathname !== "/group-leader/profile") {
    return <Navigate to="/group-leader/profile" replace />;
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="member-layout">
      <aside className="member-sidebar">
        <p className="helper-text" style={{ margin: "0.25rem 0.5rem", fontWeight: 700 }}>
          團主後台
        </p>
        <nav>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
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
