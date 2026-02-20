import { useState, useEffect } from 'react';
import { fetchProductosPorCodigo } from '../api/productosApi';
import { fetchClientePorIdentificacion } from '../api/clientesApi';

const CotizacionForm = ({ onSubmit, initialData }) => {
  const [identificacion, setIdentificacion] = useState('');
  const [cliente, setCliente] = useState(null);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', telefono: '', email: '' });
  const [productos, setProductos] = useState([]);
  const [codigoProducto, setCodigoProducto] = useState('');
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    if (initialData) {
      setCliente(initialData.cliente || null);
      // Adaptar productos: usar precio_unitario como pvp
      const adaptados = (initialData.productos || []).map(p => ({
        producto_id: p.producto_id,
        nombre: p.nombre,
        pvp: p.precio_unitario,
        cantidad: p.cantidad,
        subtotal: p.subtotal
      }));
      setProductos(adaptados);
      setIdentificacion(initialData.cliente?.identificacion || '');
    }
  }, [initialData]);

  // Buscar cliente por cédula/RUC
  const buscarCliente = async () => {
    if (!identificacion) return;
    try {
      const data = await fetchClientePorIdentificacion(identificacion);
      setCliente(data);
      setNuevoCliente({ nombre: '', telefono: '', email: '' });
    } catch {
      setCliente(null);
    }
  };

  // Añadir producto por código (normalizando con ceros a la izquierda)
  const handleAddProducto = async () => {
    if (!codigoProducto) return;

    // Normalizar a 5 dígitos con ceros a la izquierda
    const codigoNormalizado = codigoProducto.padStart(5, '0');

    const producto = await fetchProductosPorCodigo(codigoNormalizado);
    if (producto) {
      const subtotal = producto.pvp * cantidad;
      setProductos([
        ...productos,
        { producto_id: producto.id, nombre: producto.nombre, pvp: producto.pvp, cantidad, subtotal }
      ]);
      setCodigoProducto('');
      setCantidad(1);
    } else {
      alert('Producto no encontrado');
    }
  };

  // Eliminar producto
  const handleRemoveProducto = (index) => {
    const nuevos = [...productos];
    nuevos.splice(index, 1);
    setProductos(nuevos);
  };

  // Cambiar cantidad
  const handleChangeCantidad = (index, nuevaCantidad) => {
    const nuevos = [...productos];
    nuevos[index].cantidad = nuevaCantidad;
    nuevos[index].subtotal = nuevaCantidad * nuevos[index].pvp;
    setProductos(nuevos);
  };

  const total = productos.reduce((acc, p) => acc + p.subtotal, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cliente) {
      onSubmit({ cliente_id: cliente.id, productos, total });
    } else {
      onSubmit({ cliente: { identificacion, ...nuevoCliente }, productos, total });
    }
  };

  return (
    <form id="cotizacion-form" onSubmit={handleSubmit} className="space-y-4">
      {/* Campo identificación */}
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Cédula/RUC"
          value={identificacion}
          onChange={(e) => setIdentificacion(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <button
          type="button"
          onClick={buscarCliente}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Buscar
        </button>
      </div>

      {/* Mostrar datos del cliente */}
      {cliente && (
        <div className="p-3 bg-green-100 rounded">
          <p><b>Cliente encontrado:</b> {cliente.nombre}</p>
          <p>Tel: {cliente.telefono}</p>
          <p>Email: {cliente.email}</p>
        </div>
      )}

      {/* Si no existe, formulario para crear */}
      {!cliente && identificacion && (
        <div className="p-3 bg-yellow-100 rounded space-y-2">
          <p><b>Cliente no encontrado, crear nuevo:</b></p>
          <input
            type="text"
            placeholder="Nombre"
            value={nuevoCliente.nombre}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={nuevoCliente.telefono}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
            className="w-full border p-2 rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={nuevoCliente.email}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Dirección (opcional)"   // 👈 nuevo campo
            value={nuevoCliente.direccion || ''}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>
      )}

      {/* Añadir producto por código */}
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Código producto"
          value={codigoProducto}
          onChange={(e) => setCodigoProducto(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <input
          type="number"
          min="1"
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
          className="w-20 border p-2 rounded"
        />
        <button
          type="button"
          onClick={handleAddProducto}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Añadir
        </button>
      </div>

      {/* Tabla de productos añadidos */}
      <table className="w-full border-collapse border border-gray-300 mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Cantidad</th>
            <th className="border p-2">Descripción</th>
            <th className="border p-2">PVP</th>
            <th className="border p-2">Subtotal</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p, index) => (
            <tr key={index}>
              <td className="border p-2 text-center">
                <input
                  type="number"
                  min="1"
                  value={p.cantidad}
                  onChange={(e) => handleChangeCantidad(index, Number(e.target.value))}
                  className="w-16 border p-1 rounded text-center"
                />
              </td>
              <td className="border p-2">{p.nombre}</td>
              <td className="border p-2 text-right">
                {new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(p.pvp)}
              </td>
              <td className="border p-2 text-right">
                {new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(p.subtotal)}
              </td>
              <td className="border p-2 text-center">
                <button
                  type="button"
                  onClick={() => handleRemoveProducto(index)}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div className="text-right font-bold text-lg mt-4">
        Total: {new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(total)}
      </div>
    </form>
  );
};

export default CotizacionForm;