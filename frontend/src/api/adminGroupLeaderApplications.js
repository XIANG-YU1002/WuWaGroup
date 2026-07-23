import { apiRequest } from "./client.js";

export function getAdminApplications(token, { status, keyword, page = 1, pageSize = 20 } = {}) {
  return apiRequest("/admin/group-leader-applications", {
    token,
    params: { status, keyword, page, page_size: pageSize },
  });
}

export function getAdminApplicationDetail(applicationId, token) {
  return apiRequest(`/admin/group-leader-applications/${applicationId}`, { token });
}

export function approveAdminApplication(applicationId, token) {
  return apiRequest(`/admin/group-leader-applications/${applicationId}/approve`, {
    method: "POST",
    token,
  });
}

export function rejectAdminApplication(applicationId, token) {
  return apiRequest(`/admin/group-leader-applications/${applicationId}/reject`, {
    method: "POST",
    token,
  });
}
