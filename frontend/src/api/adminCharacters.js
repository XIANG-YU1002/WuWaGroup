import { apiRequest } from "./client.js";

export function getCharacterSuggestions(q, limit, token) {
  return apiRequest("/admin/characters/suggestions", { token, params: { q, limit } });
}
