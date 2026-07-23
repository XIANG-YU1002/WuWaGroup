import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getNotifications, getUnreadCount, markNotificationRead } from "../../api/notifications.js";
import { BellIcon } from "./icons.jsx";

function formatRelativeTime(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "剛剛";
  if (minutes < 60) return `${minutes} 分鐘前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小時前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}

export default function NotificationBell() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState(null);
  const containerRef = useRef(null);

  function loadUnreadCount() {
    getUnreadCount(token)
      .then((response) => setUnreadCount(response.data.unread_count))
      .catch(() => setUnreadCount(0));
  }

  useEffect(() => {
    loadUnreadCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleToggle() {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        setItems(null);
        getNotifications(token, { page: 1, pageSize: 6 })
          .then((response) => setItems(response.data))
          .catch(() => setItems([]));
      }
      return next;
    });
  }

  async function handleItemClick(notification) {
    setOpen(false);
    if (!notification.is_read) {
      try {
        await markNotificationRead(notification.id, token);
        loadUnreadCount();
      } catch {
        // 非關鍵操作，失敗不影響導頁
      }
    }
    navigate(notification.target_url || "/notifications");
  }

  return (
    <div className="notification-bell" ref={containerRef}>
      <button
        type="button"
        className="notification-bell-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="通知"
        onClick={handleToggle}
      >
        <BellIcon className="icon-bell" />
        {unreadCount > 0 && <span className="notification-bell-badge">{unreadCount}</span>}
      </button>
      {open && (
        <div className="notification-bell-dropdown" role="menu">
          <div className="notification-bell-header">通知</div>
          {items === null ? (
            <div className="notification-bell-empty">載入中...</div>
          ) : items.length === 0 ? (
            <div className="notification-bell-empty">目前沒有通知。</div>
          ) : (
            <ul className="notification-bell-list">
              {items.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    className={`notification-bell-item${notification.is_read ? "" : " unread"}`}
                    onClick={() => handleItemClick(notification)}
                  >
                    <span className="notification-bell-item-title">{notification.title}</span>
                    <span className="notification-bell-item-message">{notification.message}</span>
                    <span className="notification-bell-item-time">
                      {formatRelativeTime(notification.created_at)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link to="/notifications" className="notification-bell-footer" onClick={() => setOpen(false)}>
            看所有通知
          </Link>
        </div>
      )}
    </div>
  );
}
