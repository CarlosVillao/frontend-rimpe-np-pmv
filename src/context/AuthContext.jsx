// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { loginUser, logoutUser } from '../api/authApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Restaurar sesión al recargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        setUser({ token, user: JSON.parse(userData) });
      } catch (err) {
        console.warn('Error al parsear userData:', err.message);
        localStorage.removeItem('user'); // limpiar datos corruptos
      }
    }
  }, []);

  // Login: guardar token y usuario
  const login = async (email, password) => {
    try {
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser({ token: data.token, user: data.user });
    } catch (err) {
      console.error('Error en login:', err.message);
      throw err; // para que el frontend muestre mensaje
    }
  };

  // Logout: limpiar todo
  const logout = async () => {
    try {
      await logoutUser(); // opcional, si tu backend tiene endpoint de logout
    } catch (err) {
      console.warn('Error en logout del backend:', err.message);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};