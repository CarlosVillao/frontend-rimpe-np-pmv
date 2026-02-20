import { useState, useEffect } from 'react';
import { fetchProductos, createProducto, updateProducto, deleteProducto } from '../api/productosApi';
import ProductoForm from '../components/ProductoForm';
import LoadingOverlay from '../components/LoadingOverlay';
import SuccessModal from '../components/SuccessModal';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [editingProducto, setEditingProducto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorField, setErrorField] = useState('');

  // Estados nuevos para confirmación y notificación
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Estados de carga y éxito
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  const loadProductos = async () => {
    const data = await fetchProductos();
    setProductos(data);
  };

  useEffect(() => {
    loadProductos();
  }, []);

  const handleCreate = async (producto) => {
    try {
      setLoading(true);
      await createProducto(producto);
      setSuccessMessage("Producto creado con éxito");
      setShowModal(false);
      setErrorMessage('');
      setErrorField('');
      loadProductos();
    } catch (err) {
      setErrorMessage(err.message);
      if (err.message.toLowerCase().includes('código')) {
        setErrorField('codigo');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (producto) => {
    try {
      setLoading(true);
      await updateProducto(editingProducto.id, producto);
      setSuccessMessage("Producto actualizado con éxito");
      setEditingProducto(null);
      setShowModal(false);
      setErrorMessage('');
      setErrorField('');
      loadProductos();
    } catch (err) {
      setErrorMessage(err.message);
      if (err.message.toLowerCase().includes('código')) {
        setErrorField('codigo');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteProducto(id);
      setSuccessMessage("Producto eliminado con éxito");
      loadProductos();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error al eliminar producto');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos por código o nombre
  const filteredProductos = productos.filter((p) =>
    p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Productos</h1>

      {/* Campo de búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por código o nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <button
        onClick={() => {
          setEditingProducto(null);
          setShowModal(true);
          setErrorMessage('');
          setErrorField('');
        }}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mb-4"
      >
        Nuevo Producto
      </button>

      {/* Tabla de productos */}
      <table className="w-full border-collapse border border-gray-300 shadow-lg">
        <thead>
          <tr className="bg-green-600 text-white">
            <th className="border p-3 text-left">Código</th>
            <th className="border p-3 text-left">Nombre</th>
            <th className="border p-3 text-right">Efectivo</th>
            <th className="border p-3 text-right">PVP</th>
            <th className="border p-3 text-right">Crédito 10%</th>
            <th className="border p-3 text-right">Crédito 15%</th>
            <th className="border p-3 text-right">Stock</th>
            <th className="border p-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredProductos.map((p, index) => (
            <tr
              key={p.id}
              className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
            >
              <td className="border p-2">{p.codigo}</td>
              <td className="border p-2">{p.nombre}</td>
              <td className="border p-2 text-right">
                {new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(p.efectivo)}
              </td>
              <td className="border p-2 text-right">
                {new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(p.pvp)}
              </td>
              <td className="border p-2 text-right">
                {new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(p.cred_10)}
              </td>
              <td className="border p-2 text-right">
                {new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(p.cred_15)}
              </td>
              <td className="border p-2 text-right">{p.stock}</td>
              <td className="border p-2">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingProducto(p);
                      setShowModal(true);
                      setErrorMessage('');
                      setErrorField('');
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setProductoAEliminar(p);
                      setShowConfirmModal(true);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de creación/edición */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>

            {errorMessage && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {errorMessage}
              </div>
            )}

            <ProductoForm
              onSubmit={editingProducto ? handleUpdate : handleCreate}
              initialData={editingProducto}
              errorField={errorField}
              errorMessage={errorMessage}
            />

            <div className="mt-6 flex justify-center space-x-4">
              <button
                type="submit"
                form="producto-form"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProducto(null);
                  setErrorMessage('');
                  setErrorField('');
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Confirmar eliminación</h2>
            <p>¿Estás seguro de que deseas eliminar el producto <b>{productoAEliminar?.nombre}</b>?</p>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={async () => {
                  try {
                    await handleDelete(productoAEliminar.id);
                    setShowConfirmModal(false);
                  } catch (err) {
                    setErrorMessage(err.response?.data?.message || 'Error al eliminar producto');
                    setShowConfirmModal(false);
                    setShowErrorModal(true);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de notificación de error */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">No se puede eliminar</h2>
            <p className="text-red-600">{errorMessage}</p>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowErrorModal(false)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pantalla de carga */}
      {loading && <LoadingOverlay message="Procesando producto..." />}

      {/* Modal de éxito */}
      <SuccessModal message={successMessage} onClose={() => setSuccessMessage('')} />
    </div>
  );
};

export default Productos;