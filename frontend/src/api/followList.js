import { apiRequest } from "./client.js";

export function getFollowList(token) {
  return apiRequest("/follow-list", { token });
}

export function addFollowListItem(payload, token) {
  return apiRequest("/follow-list/items", { method: "POST", body: payload, token });
}

export function updateFollowListItemQuantity(itemId, quantity, token) {
  return apiRequest(`/follow-list/items/${itemId}`, {
    method: "PATCH",
    body: { quantity },
    token,
  });
}

export function removeFollowListItem(itemId, token) {
  return apiRequest(`/follow-list/items/${itemId}`, { method: "DELETE", token });
}

export function clearFollowList(token) {
  return apiRequest("/follow-list", { method: "DELETE", token });
}
