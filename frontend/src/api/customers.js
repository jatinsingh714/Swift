import api from "./client";

export function createCustomer(payload) {
  return api.post("/customers", payload);
}

export function getCustomers() {
  return api.get("/customers");
}

export function getCustomer(id) {
  return api.get(`/customers/${id}`);
}

export function deleteCustomer(id) {
  return api.delete(`/customers/${id}`);
}
