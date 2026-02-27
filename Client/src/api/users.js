import api from './axios';

export const registerUser = (data) => api.post('/users/register', data);
export const loginUser = (data) => api.post('/users/login', data);
export const fetchUserById = (id) => api.get(`/users/${id}`);
export const updateUserProfile = (id, data) => api.patch(`/users/${id}`, data);
export const deleteUserAccount = (id) => api.delete(`/users/${id}`);
