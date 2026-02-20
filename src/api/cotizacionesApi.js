// src/api/cotizacionesApi.js
import axiosInstance from './axiosConfig';

const API_URL = `${process.env.REACT_APP_API_URL}/cotizaciones`;

export const fetchCotizaciones = async () => {
  const res = await axiosInstance.get(API_URL);
  return res.data;
};

export const fetchCotizacionById = async (id) => {
  const res = await axiosInstance.get(`${API_URL}/${id}`);
  return res.data;
};

export const createCotizacion = async (cotizacion) => {
  const res = await axiosInstance.post(API_URL, cotizacion);
  return res.data;
};

export const updateCotizacion = async (id, cotizacion) => {
  const res = await axiosInstance.put(`${API_URL}/${id}`, cotizacion);
  return res.data;
};

export const deleteCotizacion = async (id) => {
  const res = await axiosInstance.delete(`${API_URL}/${id}`);
  return res.data;
};

export const convertirCotizacion = async (id) => {
  const res = await axiosInstance.post(`${API_URL}/${id}/convertir`);
  return res.data;
};

export const fetchCotizacionByNumero = async (numero) => {
  const res = await axiosInstance.get(`${API_URL}/numero/${numero}`);
  return res.data;
};

export const descargarCotizacionPDF = async (id, numero) => {
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