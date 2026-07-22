import { apiRequest } from "./client.js";

export function getGroupLeaderProfile(groupLeaderId) {
  return apiRequest(`/group-leaders/${groupLeaderId}`);
}

export function getGroupLeaderGroupBuys(groupLeaderId, { status, page = 1, pageSize = 20 } = {}) {
  return apiRequest(`/group-leaders/${groupLeaderId}/group-buys`, {
    params: { status, page, page_size: pageSize },
  });
}

export function getGroupLeaderAnnouncements(groupLeaderId) {
  return apiRequest(`/group-leaders/${groupLeaderId}/announcements`);
}
