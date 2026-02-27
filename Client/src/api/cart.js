import api from './axios';

export const addToCart = (data) => api.post('/cart/add', data);
export const fetchCart = (userId) => api.get(`/cart/${userId}`);
export const updateCartItem = (id, quantity) => api.patch(`/cart/item/${id}`, { quantity });
export const removeCartItem = (id) => api.delete(`/cart/item/${id}`);
export const clearCart = (userId) => api.delete(`/cart/clear/${userId}`);
