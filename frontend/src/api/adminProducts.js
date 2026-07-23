import { apiRequest } from "./client.js";

export function getAdminProducts(token, { activityId, isActive, characterId, keyword, page = 1, pageSize = 20 } = {}) {
  return apiRequest("/admin/products", {
    token,
    params: {
      activity_id: activityId,
      is_active: isActive,
      character_id: characterId,
      keyword,
      page,
      page_size: pageSize,
    },
  });
}

export function createAdminProduct(payload, token) {
  return apiRequest("/admin/products", { method: "POST", body: payload, token });
}

export function getAdminProductDetail(productId, token) {
  return apiRequest(`/admin/products/${productId}`, { token });
}

export function updateAdminProduct(productId, payload, token) {
  return apiRequest(`/admin/products/${productId}`, { method: "PATCH", body: payload, token });
}

export function deactivateAdminProduct(productId, token) {
  return apiRequest(`/admin/products/${productId}/deactivate`, { method: "POST", token });
}

export function reactivateAdminProduct(productId, token) {
  return apiRequest(`/admin/products/${productId}/reactivate`, { method: "POST", token });
}

export function addAdminProductImage(productId, imageUrl, token) {
  return apiRequest(`/admin/products/${productId}/images`, {
    method: "POST",
    body: { image_url: imageUrl },
    token,
  });
}

export function updateAdminProductImage(productId, imageId, imageUrl, token) {
  return apiRequest(`/admin/products/${productId}/images/${imageId}`, {
    method: "PATCH",
    body: { image_url: imageUrl },
    token,
  });
}

export function deleteAdminProductImage(productId, imageId, token) {
  return apiRequest(`/admin/products/${productId}/images/${imageId}`, { method: "DELETE", token });
}

export function reorderAdminProductImages(productId, orderedImageIds, token) {
  return apiRequest(`/admin/products/${productId}/images/reorder`, {
    method: "PATCH",
    body: { ordered_image_ids: orderedImageIds },
    token,
  });
}
