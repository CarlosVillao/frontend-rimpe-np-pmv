import { useState, useEffect } from 'react';
import { fetchProductosPorCodigo } from '../api/productosApi';
import { fetchClientePorIdentificacion } from '../api/clientesApi';

const NotaVentaForm = ({ onSubmit, initialData, allowEditPrice = true }) => {
  const [identificacion, setIdentificacion] = useState('');
  const [cliente, setCliente] = useState(null);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', telefono: '', email: '' });
  const [productos, setProductos] = useState([]);
  const [codigoProducto, setCodigoProducto] = useState('');
  const [cantidad, setCantidad] = useState(1);

  // Estados
  const [formaPago, setFormaPago] = useState('EFECTIVO');
  const [observacion, setObservacion] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [consumidorFinal, setConsumidorFinal] = useState(false); // 🔧 nuevo estado

  useEffect(() => {
    if (initialData) {
      // Adaptar cliente desde initialData
      const clienteAdaptado = {
        id: initialData.cliente_id,
        identificacion: initialData.cliente_identificacion || '',
        nombre: initialData.cliente_nombre || '',
        telefono: initialData.cliente_telefono || '',
        email: initialData.cliente_email || ''
      };
      setCliente(clienteAdaptado);

      // Adaptar productos
      const adaptados = (initialData.productos || []).map(p => {
        const precio = Number(p.precio_unitario || p.pvp);
        const cant = Number(p.cantidad);
        return {
          producto_id: p.producto_id,
          descripcion: p.descripcion || p.nombre, // 👈 ahora usamos descripcion
          pvp: precio,
          cantidad: cant,
          subtotal: Number(p.subtotal) || cant * precio
        };
      });
      setProductos(adaptados);

      // Inicializar identificación, forma de pago y observación
      setIdentificacion(clienteAdaptado.identificacion);
      setFormaPago(initialData.forma_pago || 'EFECTIVO');
      setObservacion(initialData.observacion || '');
    }
  }, [initialData]);

  // Buscar cliente
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

  // Añadir producto con precio según forma de pago
  const handleAddProducto = async () => {
    if (!codigoProducto) return;
    const codigoNormalizado = codigoProducto.padStart(5, '0');
    const producto = await fetchProductosPorCodigo(codigoNormalizado);

    if (producto) {
      let precioUnitario = producto.pvp;
      if (formaPago === 'EFECTIVO') precioUnitario = producto.efectivo;
      if (formaPago === 'DEBITO') precioUnitario = producto.pvp;
      if (formaPago === 'CREDITO_1') precioUnitario = producto.cred_10;
      if (formaPago === 'CREDITO_2') precioUnitario = producto.cred_15;

      const subtotal = precioUnitario * cantidad;

      const existente = productos.find(p => p.producto_id === producto.id);
      if (existente) {
        const nuevos = productos.map(p =>
          p.producto_id === producto.id
            ? { ...p, cantidad: p.cantidad + cantidad, subtotal: (p.cantidad + cantidad) * p.pvp }
            : p
        );
        setProductos(nuevos);
      } else {
        setProductos([...productos, {
          producto_id: producto.id,
          descripcion: producto.descripcion || producto.nombre, // 👈 aquí también usamos descripcion
          pvp: precioUnitario,
          cantidad,
          subtotal
        }]);
      }
      setCodigoProducto('');
      setCantidad(1);
    } else {
      setErrorMessage('Producto no encontrado');
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

  // Cambiar precio
  const handleChangePrecio = (index, nuevoPrecio) => {
    const nuevos = [...productos];
    nuevos[index].pvp = nuevoPrecio;
    nuevos[index].subtotal = nuevos[index].cantidad * nuevoPrecio;
    setProductos(nuevos);
  };

  const total = productos.reduce((acc, p) => acc + p.subtotal, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (productos.length === 0) {
      setErrorMessage('Debe añadir al menos un producto');
      return;
    }

    let tipo_precio = formaPago;

    const productosAdaptados = productos.map(p => ({
      producto_id: p.producto_id,
      cantidad: p.cantidad,
      precio_unitario: p.pvp,   // 👈 enviar el precio editado
      subtotal: p.subtotal      // 👈 enviar el subtotal calculado
    }));

    let payload;

    if (consumidorFinal) {
      payload = {
        cliente: {
          identificacion: '9999999999',
          nombre: 'CONSUMIDOR FINAL',
          telefono: '',
          email: ''
        },
        productos: productosAdaptados,
        forma_pago: formaPago,
        tipo_precio,
        observacion
      };
    } else if (cliente) {
      payload = {
        cliente_id: cliente.id,
        productos: productosAdaptados,
        forma_pago: formaPago,
        tipo_precio,
        observacion
      };
    } else {
      payload = {
        cliente: {
          identificacion,
          nombre: nuevoCliente.nombre,
          telefono: nuevoCliente.telefono || null,
          email: nuevoCliente.email?.trim() !== '' ? nuevoCliente.email : null,
          direccion: nuevoCliente.direccion?.trim() !== '' ? nuevoCliente.direccion : null
        },
        productos: productosAdaptados,
        forma_pago: formaPago,
        tipo_precio,
        observacion
      };
    }

    try {
      await onSubmit(payload);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error al guardar');
    }
  };

  return (
    <>
      {/* Checkbox Consumidor Final */}
      <div className="mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={consumidorFinal}
            onChange={(e) => setConsumidorFinal(e.target.checked)}
            className="mr-2"
          />
          Nota de venta a Consumidor Final
        </label>
      </div>

      <form id="nota-venta-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Identificación solo si NO es consumidor final */}
        {!consumidorFinal && (
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
        )}

        {/* Datos cliente */}
        {cliente && !consumidorFinal && (
          <div className="p-3 bg-green-100 rounded">
            <p><b>Cliente encontrado:</b> {cliente.nombre}</p>
            <p>Tel: {cliente.telefono}</p>
            <p>Email: {cliente.email}</p>
          </div>
        )}

        {!cliente && identificacion && !consumidorFinal && (
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

        {/* Forma de pago */}
        <div>
          <label className="block font-semibold">Forma de pago</label>
          <select value={formaPago} onChange={(e) => setFormaPago(e.target.value)} className="border p-2 rounded w-full">
            <option value="EFECTIVO">Efectivo</option>
            <option value="DEBITO">Débito</option>
            <option value="CREDITO_1">Crédito 10%</option>
            <option value="CREDITO_2">Crédito 15%</option>
          </select>
        </div>

        {/* Observación solo en edición/anulación */}
        {initialData && (
          <div>
            <label className="block font-semibold">Observación</label>
            <textarea
              placeholder="Observación"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        )}

        {/* Añadir producto */}
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

        {/* Tabla productos */}
        <table className="w-full border-collapse border border-gray-300 mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Cantidad</th>
              <th className="border p-2">Descripción</th>
              <th className="border p-2">P. Unitario</th>
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
                {/* 👇 ahora usamos descripcion en lugar de nombre */}
                <td className="border p-2">{p.descripcion}</td>
                <td className="border p-2 text-right">
                  {allowEditPrice ? (
                    <input
                      type="number"
                      step="0.01"
                      value={p.pvp}
                      onChange={(e) => handleChangePrecio(index, Number(e.target.value))}
                      className="w-24 border p-1 rounded text-right"
                    />
                  ) : (
                    new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(p.pvp)
                  )}
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
        <div className="text-right font-bold text-xl mt-4 text-green-700">
          Total: {new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(total)}
        </div>
      </form>

      {/* Modal de error */}
      {errorMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold text-red-600 mb-4">Error</h2>
            <p>{errorMessage}</p>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setErrorMessage('')}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotaVentaForm;