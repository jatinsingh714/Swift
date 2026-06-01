import api from "./client";

export function createProduct(payload) {
  return api.post("/products", payload);
}

export function getProducts() {
  return api.get("/products");
}

export function getProduct(id) {
  return api.get(`/products/${id}`);
}

export function updateProduct(id, payload) {
  return api.put(`/products/${id}`, payload);
}

export function deleteProduct(id) {
  return api.delete(`/products/${id}`);
}
