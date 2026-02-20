// src/api/notasVentaApi.js
import axiosInstance from './axiosConfig';

const API_URL = `${process.env.REACT_APP_API_URL}/notas-venta`;

export const fetchNotasVenta = async () => {
  const res = await axiosInstance.get(API_URL);
  return res.data;
};

export const fetchNotaVentaById = async (id) => {
  const res = await axiosInstance.get(`${API_URL}/${id}`);
  return res.data;
};

export const createNotaVenta = async (nota) => {
  const res = await axiosInstance.post(API_URL, nota);
  return res.data;
};

export const createNotaDesdeCotizacion = async (data) => {
  const res = await axiosInstance.post(`${API_URL}/desde-cotizacion`, data);
  return res.data;
};

export const updateNotaVenta = async (id, nota) => {
  const res = await axiosInstance.put(`${API_URL}/${id}`, nota);
  return res.data;
};

export const anularNotaVenta = async (id, motivo) => {
  const res = await axiosInstance.put(`${API_URL}/${id}/anular`, { motivo });
  return res.data;
};

export const deleteNotaVenta = async (id) => {
  const res = await axiosInstance.delete(`${API_URL}/${id}`);
  return res.data;
};

export const descargarNotaVentaPDF = async (id, numero) => {
  const res = await axiosInstance.get(`${API_URL}/${id}/pdf`, {
    responseType: 'blob'
  });

  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${numero}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};