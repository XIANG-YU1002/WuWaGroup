import { Link, NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

const NAV_ITEMS = [
  { to: "/admin", label: "儀表板", end: true },
  { to: "/admin/group-leader-applications", label: "團主申請" },
  { to: "/admin/activities", label: "活動管理" },
  { to: "/admin/products", label: "商品管理" },
  { to: "/admin/announcements", label: "平台公告" },
];

export default function AdminLayout() {
  const { user, initializing, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (initializing) {
    return <PageLoader label="正在載入使用者資訊..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ redirectPath: "/admin" }} />;
  }

  if (!user.permissions?.is_admin) {
    return <Navigate to="/" replace />;
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <>
      <header className="admin-header">
        <div className="admin-header-inner">
          <Link to="/admin" className="app-logo">
            WuWaGroup
          </Link>
          <span className="admin-badge">管理員後台</span>
          <nav className="header-nav" style={{ marginLeft: "auto" }}>
            <Link to="/">查看前台</Link>
            <button type="button" onClick={handleLogout}>
              登出
            </button>
          </nav>
        </div>
      </header>
      <main className="container">
        <div className="member-layout">
          <aside className="member-sidebar">
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
          </aside>
          <div className="member-content">
            <Outlet />
          </div>
        </div>
      </main>
    </>
  );
}
