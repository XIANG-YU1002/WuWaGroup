import { apiRequest } from "./client.js";

export function getMyAnnouncements(token, { page = 1, pageSize = 20 } = {}) {
  return apiRequest("/group-leader/announcements", { token, params: { page, page_size: pageSize } });
}

export function createAnnouncement(payload, token) {
  return apiRequest("/group-leader/announcements", { method: "POST", body: payload, token });
}

export function updateAnnouncement(announcementId, payload, token) {
  return apiRequest(`/group-leader/announcements/${announcementId}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function deleteAnnouncement(announcementId, token) {
  return apiRequest(`/group-leader/announcements/${announcementId}`, { method: "DELETE", token });
}
