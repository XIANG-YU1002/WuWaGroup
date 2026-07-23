import { apiRequest } from "./client.js";

export function getAdminAnnouncements(token, { keyword, page = 1, pageSize = 20 } = {}) {
  return apiRequest("/admin/announcements", { token, params: { keyword, page, page_size: pageSize } });
}

export function createAdminAnnouncement(payload, token) {
  return apiRequest("/admin/announcements", { method: "POST", body: payload, token });
}

export function updateAdminAnnouncement(announcementId, payload, token) {
  return apiRequest(`/admin/announcements/${announcementId}`, { method: "PATCH", body: payload, token });
}

export function deleteAdminAnnouncement(announcementId, token) {
  return apiRequest(`/admin/announcements/${announcementId}`, { method: "DELETE", token });
}
