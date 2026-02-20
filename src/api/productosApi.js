// src/api/productosApi.js
import axiosInstance from './axiosConfig';

const API_URL = `${process.env.REACT_APP_API_URL}/productos`;

export const fetchProductos = async () => {
  const res = await axiosInstance.get(API_URL);
  return res.data;
};

export const createProducto = async (producto) => {
  const res = await axiosInstance.post(API_URL, producto);
  return res.data;
};

export const updateProducto = async (id, producto) => {
  const res = await axiosInstance.put(`${API_URL}/${id}`, producto);
  return res.data;
};

export const deleteProducto = async (id) => {
  const res = await axiosInstance.delete(`${API_URL}/${id}`);
  return res.data;
};

export const fetchProductosPorCodigo = async (codigo) => {
  const res = await axiosInstance.get(`${API_URL}/codigo/${codigo}`);
  return res.data;
};