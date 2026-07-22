import { apiRequest } from "./client.js";

export function getFollowList(token) {
  return apiRequest("/follow-list", { token });
}

export function addFollowListItem(payload, token) {
  return apiRequest("/follow-list/items", { method: "POST", body: payload, token });
}
