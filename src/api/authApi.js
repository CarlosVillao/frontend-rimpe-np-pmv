// src/api/authApi.js
import api from './axiosInstance';

const API_URL = process.env.REACT_APP_API_URL;

export const loginUser = async (email, password) => {
  try {
    const res = await api.post(`${API_URL}/auth/login`, { email, password });
    return res.data;
  } catch (error) {
    console.error('Error en loginUser:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const res = await api.post(`${API_URL}/auth/logout`);
    return res.data;
  } catch (error) {
    console.error('Error en logoutUser:', error);
    throw error;
  }
};