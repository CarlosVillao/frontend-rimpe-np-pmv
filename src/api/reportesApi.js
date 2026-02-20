// src/api/reportesApi.js
import axiosInstance from './axiosConfig';

const API_URL = `${process.env.REACT_APP_API_URL}/reportes`;

export const reporteDiario = async () => {
  const res = await axiosInstance.get(`${API_URL}/diario`);
  return res.data;
};

export const reporteMensual = async () => {
  const res = await axiosInstance.get(`${API_URL}/mensual`);
  return res.data;
};

export const reportePorRango = async (inicio, fin) => {
  const res = await axiosInstance.get(`${API_URL}/rango`, {
    params: { inicio, fin },
  });
  return res.data;
};

export const exportarExcel = async (inicio, fin) => {
  const res = await axiosInstance.get(`${API_URL}/excel`, {
    params: { desde: inicio, hasta: fin },
    responseType: 'blob',
  });
  return res.data;
};

export const detalleDiario = async () => {
  const res = await axiosInstance.get(`${API_URL}/detalle/diario`);
  return res.data;
};

export const detalleMensual = async () => {
  const res = await axiosInstance.get(`${API_URL}/detalle/mensual`);
  return res.data;
};

export const reporteComisiones = async () => {
  const res = await axiosInstance.get(`${API_URL}/comisiones`);
  return res.data;
};