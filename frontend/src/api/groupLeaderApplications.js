import { apiRequest } from "./client.js";

export function submitApplication(token) {
  return apiRequest("/group-leader-applications", { method: "POST", token });
}

export function getMyApplication(token) {
  return apiRequest("/group-leader-applications/me", { token });
}
