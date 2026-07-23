import { apiRequest } from "./client.js";

export function createOrder(rulesAccepted, token) {
  return apiRequest("/orders", { method: "POST", body: { rules_accepted: rulesAccepted }, token });
}

export function getMyOrders(token, { status, page = 1, pageSize = 20 } = {}) {
  return apiRequest("/orders", { token, params: { status, page, page_size: pageSize } });
}

export function getMyOrderDetail(orderId, token) {
  return apiRequest(`/orders/${orderId}`, { token });
}

export function createCancellationRequest(orderId, reason, token) {
  return apiRequest(`/orders/${orderId}/cancellation-requests`, {
    method: "POST",
    body: { reason: reason || null },
    token,
  });
}
