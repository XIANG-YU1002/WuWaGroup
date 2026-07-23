import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../api/notifications.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Button from "../../components/common/Button.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import PageLoader from "../../components/common/PageLoader.jsx";
import Pagination from "../../components/common/Pagination.jsx";

const TYPE_LABELS = { system: "系統通知", group_leader: "團主公告" };

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Taipei",
  });
}

export default function NotificationsPage() {
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  function load() {
    setError(false);
    setItems(null);
    getNotifications(token, { page })
      .then((response) => {
        setItems(response.data);
        setPagination(response.pagination);
      })
      .catch(() => setError(true));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function handleItemClick(notification) {
    if (!notification.is_read) {
      try {
        await markNotificationRead(notification.id, token);
        setItems((prev) =>
          prev.map((item) => (item.id === notification.id ? { ...item, is_read: true } : item)),
        );
      } catch {
        // ignore, non-critical
      }
    }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead(token);
      setItems((prev) => prev.map((item) => ({ ...item, is_read: true })));
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="group-buy-card-row">
          <div>
            <h1>通知中心</h1>
            <p className="helper-text">查看系統通知與團主公告。</p>
          </div>
          <Button variant="secondary" loading={markingAll} onClick={handleMarkAllRead}>
            全部標記為已讀
          </Button>
        </div>
      </div>

      {error ? (
        <ErrorState onRetry={load} />
      ) : items === null ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState title="目前沒有通知。" />
      ) : (
        <>
          {items.map((notification) => {
            const content = (
              <div
                className="group-buy-card"
                style={{ opacity: notification.is_read ? 0.7 : 1, cursor: notification.target_url ? "pointer" : "default" }}
                onClick={() => handleItemClick(notification)}
              >
                <div className="group-buy-card-row">
                  <span className="status-badge status-badge-info">
                    {TYPE_LABELS[notification.notification_type] ?? notification.notification_type}
                  </span>
                  {!notification.is_read && <span className="status-badge status-badge-danger">未讀</span>}
                  <span className="helper-text" style={{ marginLeft: "auto" }}>
                    {formatDateTime(notification.created_at)}
                  </span>
                </div>
                <h3 style={{ margin: "0.4rem 0" }}>{notification.title}</h3>
                <p style={{ margin: 0 }}>{notification.message}</p>
              </div>
            );
            return notification.target_url ? (
              <Link key={notification.id} to={notification.target_url} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                {content}
              </Link>
            ) : (
              <div key={notification.id}>{content}</div>
            );
          })}
          <Pagination page={pagination.page} totalPages={pagination.total_pages} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
