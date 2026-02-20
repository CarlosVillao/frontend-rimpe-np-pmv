// src/api/clientesApi.js
import axios from './axiosConfig';

const API_URL = `${process.env.REACT_APP_API_URL}/clientes`;

export const fetchClientes = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener clientes');
  }
};

export const createCliente = async (cliente) => {
  try {
    const response = await axios.post(API_URL, cliente);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al crear cliente');
  }
};

export const updateCliente = async (id, cliente) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, cliente);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al actualizar cliente');
  }
};

export const deleteCliente = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Error al eliminar cliente';
    const err = new Error(message);
    err.status = status;
    throw err;
  }
};

export const fetchClientePorIdentificacion = async (identificacion) => {
  try {
    const response = await axios.get(`${API_URL}/identificacion/${identificacion}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al buscar cliente por identificación');
  }
};