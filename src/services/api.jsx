// src/services/api.ts
import axios from "axios";

const API_URL = "http://localhost:8080/api";

export const productApi = {
  getByCode: (code) => axios.get(`${API_URL}/products/${code}`),
  addProduct: (product) => axios.post(`${API_URL}/products`, product),
};

export const cartApi = {
  addToCart: (userId, code) =>
    axios.post(`${API_URL}/cart/${userId}/add/${code}`),
  updateQuantity: (userId, code, quantity) =>
    axios.put(`${API_URL}/cart/${userId}/update`, { code, quantity }),
};
