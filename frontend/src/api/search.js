import { apiRequest } from "./client.js";

export function globalSearchPreview(q, limitPerType = 5) {
  return apiRequest("/search", { params: { q, limit_per_type: limitPerType } });
}

export function searchActivities(q, { page = 1, pageSize = 20 } = {}) {
  return apiRequest("/search/activities", { params: { q, page, page_size: pageSize } });
}

export function searchProducts(q, { characterId, page = 1, pageSize = 20 } = {}) {
  return apiRequest("/search/products", {
    params: { q, character_id: characterId, page, page_size: pageSize },
  });
}

export function searchCharacters(q, { page = 1, pageSize = 20 } = {}) {
  return apiRequest("/search/characters", { params: { q, page, page_size: pageSize } });
}
