import { apiRequest } from "./client.js";

export function getMyProfile(token) {
  return apiRequest("/users/me", { token });
}

export function updateMyProfile(payload, token) {
  return apiRequest("/users/me", { method: "PATCH", body: payload, token });
}

export function updateMyContacts(payload, token) {
  return apiRequest("/users/me/contacts", { method: "PATCH", body: payload, token });
}
