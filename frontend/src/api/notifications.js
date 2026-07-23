import { apiRequest } from "./client.js";

export function getNotifications(token, { page = 1, pageSize = 20 } = {}) {
  return apiRequest("/notifications", { token, params: { page, page_size: pageSize } });
}

export function getUnreadCount(token) {
  return apiRequest("/notifications/unread-count", { token });
}

export function markNotificationRead(notificationId, token) {
  return apiRequest(`/notifications/${notificationId}/read`, { method: "PATCH", token });
}

export function markAllNotificationsRead(token) {
  return apiRequest("/notifications/read-all", { method: "PATCH", token });
}
