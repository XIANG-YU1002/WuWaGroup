import { apiRequest } from "./client.js";

export function addFavorite(productId, token) {
  return apiRequest(`/favorites/products/${productId}`, { method: "POST", token });
}

export function removeFavorite(productId, token) {
  return apiRequest(`/favorites/products/${productId}`, { method: "DELETE", token });
}
