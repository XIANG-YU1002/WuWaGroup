import { apiRequest } from "./client.js";

export function register(payload) {
  return apiRequest("/auth/register", { method: "POST", body: payload });
}

export function login(payload) {
  return apiRequest("/auth/login", { method: "POST", body: payload });
}

export function getCurrentSession(token) {
  return apiRequest("/auth/me", { token });
}
