import { apiRequest } from "./client.js";

export function getGroupBuyDetail(groupBuyId) {
  return apiRequest(`/group-buys/${groupBuyId}`);
}

export function getGroupBuyRules(groupBuyId) {
  return apiRequest(`/group-buys/${groupBuyId}/rules`);
}

export function getGroupBuyAnnouncements(groupBuyId) {
  return apiRequest(`/group-buys/${groupBuyId}/announcements`);
}

export function getGroupBuyProductAvailability(groupBuyProductId) {
  return apiRequest(`/group-buy-products/${groupBuyProductId}/availability`);
}
