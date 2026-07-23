import { apiRequest } from "./client.js";

export function getMyGroupLeaderProfile(token) {
  return apiRequest("/group-leader/profile", { token });
}

export function updateMyGroupLeaderProfile(payload, token) {
  return apiRequest("/group-leader/profile", { method: "PATCH", body: payload, token });
}

export function updateMyDefaultRules(defaultRules, token) {
  return apiRequest("/group-leader/profile/default-rules", {
    method: "PATCH",
    body: { default_rules: defaultRules },
    token,
  });
}

export function getGroupLeaderDashboard(token) {
  return apiRequest("/group-leader/dashboard", { token });
}
