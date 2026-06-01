import api from "./client";

export function createOrder(payload) {
  return api.post("/orders", payload);
}

export function getOrders() {
  return api.get("/orders");
}

export function getOrder(id) {
  return api.get(`/orders/${id}`);
}

export function deleteOrder(id) {
  return api.delete(`/orders/${id}`);
}
