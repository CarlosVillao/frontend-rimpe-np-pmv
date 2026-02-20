import { useState, useEffect } from 'react';

const ClienteForm = ({ onSubmit, initialData, errorField, errorMessage }) => {
  const [nombre, setNombre] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre || '');
      setIdentificacion(initialData.identificacion || '');
      setTelefono(initialData.telefono || '');
      setDireccion(initialData.direccion || '');
      setEmail(initialData.email || '');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      nombre,
      identificacion,
      telefono: telefono?.trim() !== '' ? telefono : null,
      direccion: direccion?.trim() !== '' ? direccion : null,   // 👈 opcional
      email: email?.trim() !== '' ? email : null               // 👈 null si está vacío
    });

    if (!initialData) {
      setNombre('');
      setIdentificacion('');
      setTelefono('');
      setDireccion('');
      setEmail('');
    }
  };

  return (
    <form id="cliente-form" onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nombres y apellidos:</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      {/* Identificación y Teléfono en la misma fila */}
      <div className="flex space-x-4">
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-1">Identificación:</label>
          {errorField === 'identificacion' && (
            <p className="text-red-600 text-sm mb-1">{errorMessage}</p>
          )}
          <input
            type="text"
            value={identificacion}
            onChange={(e) => setIdentificacion(e.target.value)}
            className={`w-full border p-2 rounded ${errorField === 'identificacion' ? 'border-red-500 bg-red-50' : ''
              }`}
            required
          />
        </div>

        <div className="w-1/2">
          <label className="block text-sm font-medium mb-1">Teléfono:</label>
          <input
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Dirección (opcional):</label>
        <input
          type="text"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
      </div>
    </form>
  );
};

export default ClienteForm;