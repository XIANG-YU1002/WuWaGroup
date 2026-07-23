import { apiRequest } from "./client.js";

export function getAdminDashboard(token) {
  return apiRequest("/admin/dashboard", { token });
}
