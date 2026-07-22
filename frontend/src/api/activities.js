import { apiRequest } from "./client.js";

export function getActivities({ status, page = 1, pageSize = 20 } = {}) {
  return apiRequest("/activities", { params: { status, page, page_size: pageSize } });
}

export function getActivityDetail(activityId) {
  return apiRequest(`/activities/${activityId}`);
}

export function getActivityProducts(activityId) {
  return apiRequest(`/activities/${activityId}/products`);
}
