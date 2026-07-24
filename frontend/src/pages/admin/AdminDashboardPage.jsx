import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboard } from "../../api/admin.js";
import { getAdminApplications } from "../../api/adminGroupLeaderApplications.js";
import { resolveMediaUrl } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import PageLoader from "../../components/common/PageLoader.jsx";
import {
  UsersIcon,
  CalendarIcon,
  BagIcon,
  MegaphoneIcon,
  ChevronRightIcon,
} from "../../components/common/icons.jsx";

// 統計卡：key -> 圖示與配色
const STAT_META = {
  pending_group_leader_applications: { Icon: UsersIcon, tone: "purple" },
  open_activities: { Icon: CalendarIcon, tone: "green" },
  active_products: { Icon: BagIcon, tone: "blue" },
  current_group_buys: { Icon: UsersIcon, tone: "orange" },
};

// 快速操作捷徑
const QUICK_ACTIONS = [
  { to: "/admin/group-leader-applications", label: "管理團主申請", Icon: UsersIcon, tone: "purple" },
  { to: "/admin/activities/new", label: "新增活動", Icon: CalendarIcon, tone: "green" },
  { to: "/admin/products", label: "管理商品", Icon: BagIcon, tone: "blue" },
  { to: "/admin/announcements", label: "發布平台公告", Icon: MegaphoneIcon, tone: "orange" },
];

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Taipei",
  });
}

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [cards, setCards] = useState(null);
  const [pendingApps, setPendingApps] = useState([]);
  const [error, setError] = useState(false);

  async function load() {
    setError(false);
    setCards(null);
    try {
      const response = await getAdminDashboard(token);
      setCards(response.data.cards);
    } catch {
      setError(true);
      return;
    }
    // 最近待審核申請（best-effort，失敗不影響整頁）
    try {
      const apps = await getAdminApplications(token, { status: "pending", page: 1, pageSize: 5 });
      setPendingApps(apps.data ?? []);
    } catch {
      setPendingApps([]);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <ErrorState onRetry={load} />;
  }

  if (!cards) {
    return <PageLoader />;
  }

  return (
    <>
      <div className="page-header">
        <h1>管理員儀表板</h1>
        <p className="helper-text">平台營運總覽與快速管理</p>
      </div>

      {/* 統計卡 */}
      <div className="stat-grid">
        {cards.map((card) => {
          const meta = STAT_META[card.key] ?? { Icon: UsersIcon, tone: "purple" };
          const { Icon } = meta;
          const inner = (
            <>
              <span className={`dash-icon ${meta.tone}`}>
                <Icon className="dash-icon-svg" />
              </span>
              <span className="stat-card-text">
                <span className="stat-card-label">{card.label}</span>
                <span className="stat-card-value">{card.count}</span>
              </span>
            </>
          );
          return card.key === "current_group_buys" ? (
            <div key={card.key} className="stat-card stat-card--icon">
              {inner}
            </div>
          ) : (
            <Link key={card.key} to={card.target_url} className="stat-card stat-card--icon">
              {inner}
            </Link>
          );
        })}
      </div>

      {/* 快速操作 */}
      <section className="dash-section">
        <div className="dash-section-head">
          <h2>快速操作</h2>
        </div>
        <div className="quick-actions">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.to} to={action.to} className="quick-action">
              <span className={`dash-icon ${action.tone}`}>
                <action.Icon className="dash-icon-svg" />
              </span>
              <span className="quick-action-label">{action.label}</span>
              <ChevronRightIcon className="quick-action-chevron" />
            </Link>
          ))}
        </div>
      </section>

      {/* 最近待審核申請 */}
      <section className="dash-section">
        <div className="dash-section-head">
          <h2>最近待審核申請</h2>
          <Link className="dash-section-link" to="/admin/group-leader-applications?status=pending">
            查看全部 <ChevronRightIcon className="dash-section-link-chevron" />
          </Link>
        </div>
        {pendingApps.length === 0 ? (
          <div className="dash-empty">目前沒有待審核的團主申請。</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>申請人</th>
                  <th>提交時間</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {pendingApps.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <span className="dash-applicant">
                        {app.user.avatar_url ? (
                          <img className="avatar-circle avatar-circle-sm" src={resolveMediaUrl(app.user.avatar_url)} alt="" />
                        ) : (
                          <span className="avatar-circle avatar-circle-sm" aria-hidden="true">
                            {app.user.nickname?.[0]?.toUpperCase() ?? "?"}
                          </span>
                        )}
                        {app.user.nickname}
                      </span>
                    </td>
                    <td>{formatDateTime(app.created_at)}</td>
                    <td>
                      <Link className="btn btn-secondary" to={`/admin/group-leader-applications/${app.id}`}>
                        查看審核
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
