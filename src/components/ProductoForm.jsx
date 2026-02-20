import { useState, useEffect } from 'react';

const ProductoForm = ({ onSubmit, initialData, errorField, errorMessage }) => {
  const [nombre, setNombre] = useState('');
  const [costo, setCosto] = useState(0);
  const [stock, setStock] = useState(0);

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre || '');
      setCosto(initialData.costo || 0);
      setStock(initialData.stock || 0);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nombre,
      costo,
      stock,
    });

    // Solo limpiar si es creación, no edición
    if (!initialData) {
      setNombre('');
      setCosto(0);
      setStock(0);
    }
  };

  return (
    <form id="producto-form" onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre del producto:</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div className="flex space-x-4">
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-1">Costo:</label>
          <input
            type="number"
            step="0.01"
            value={costo}
            onChange={(e) => setCosto(Number(e.target.value))}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div className="w-1/2">
          <label className="block text-sm font-medium mb-1">Stock:</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="w-full border p-2 rounded"
            required
          />
        </div>
      </div>

      {/* Mensaje de error general */}
      {errorMessage && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}
    </form>
  );
};

export default ProductoForm;