import { apiRequest } from "./client.js";

export function getAdminActivities(token, { status, keyword, page = 1, pageSize = 20 } = {}) {
  return apiRequest("/admin/activities", { token, params: { status, keyword, page, page_size: pageSize } });
}

export function createAdminActivity(payload, token) {
  return apiRequest("/admin/activities", { method: "POST", body: payload, token });
}

export function getAdminActivityDetail(activityId, token) {
  return apiRequest(`/admin/activities/${activityId}`, { token });
}

export function updateAdminActivity(activityId, payload, token) {
  return apiRequest(`/admin/activities/${activityId}`, { method: "PATCH", body: payload, token });
}

export function endAdminActivity(activityId, token) {
  return apiRequest(`/admin/activities/${activityId}/end`, { method: "POST", token });
}

export function reopenAdminActivity(activityId, token) {
  return apiRequest(`/admin/activities/${activityId}/reopen`, { method: "POST", token });
}
