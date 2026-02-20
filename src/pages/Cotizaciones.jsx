import { useState, useEffect } from 'react';
import {
  fetchCotizaciones,
  fetchCotizacionById,
  createCotizacion,
  updateCotizacion,
  deleteCotizacion,
  descargarCotizacionPDF
} from '../api/cotizacionesApi';
import CotizacionForm from '../components/CotizacionForm';
import LoadingOverlay from '../components/LoadingOverlay';
import SuccessModal from '../components/SuccessModal';

const Cotizaciones = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [editingCotizacion, setEditingCotizacion] = useState(null);

  // Estados para modales
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);

  // Estados de carga y éxito
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  const loadCotizaciones = async () => {
    const data = await fetchCotizaciones();
    setCotizaciones(data);
  };

  useEffect(() => {
    loadCotizaciones();
  }, []);

  const handleCreate = async (cotizacion) => {
    try {
      setLoading(true);
      await createCotizacion(cotizacion);
      setSuccessMessage("Cotización creada con éxito");
      setShowModal(false);
      loadCotizaciones();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (cotizacion) => {
    try {
      setLoading(true);
      await updateCotizacion(editingCotizacion.id, cotizacion);
      setSuccessMessage("Cotización actualizada con éxito");
      setEditingCotizacion(null);
      setShowModal(false);
      loadCotizaciones();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    const data = await fetchCotizacionById(id);
    setEditingCotizacion(data);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteCotizacion(id);
      setSuccessMessage("Cotización eliminada con éxito");
      setShowConfirmDelete(false);
      setCotizacionSeleccionada(null);
      loadCotizaciones();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar cotizaciones por número o cliente
  const filteredCotizaciones = cotizaciones.filter((c) =>
    c.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Cotizaciones</h1>

      {/* Barra de búsqueda */}
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Buscar por número o cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-1/3"
        />
        <button
          onClick={() => {
            setEditingCotizacion(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Nueva Cotización
        </button>
      </div>

      {/* Tabla de cotizaciones */}
      <table className="w-full border-collapse border border-gray-300 shadow-lg rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="border p-3">Número</th>
            <th className="border p-3">Cliente</th>
            <th className="border p-3">Total</th>
            <th className="border p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredCotizaciones.map((c, index) => (
            <tr
              key={c.id}
              className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
            >
              <td className="border p-2">{c.numero}</td>
              <td className="border p-2">{c.cliente_nombre}</td>
              <td className="border p-2 font-semibold text-green-700">
                {new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(c.total)}
              </td>
              <td className="border p-2">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => handleEdit(c.id)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setCotizacionSeleccionada(c);
                      setShowConfirmDelete(true);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => descargarCotizacionPDF(c.id, c.numero)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition"
                  >
                    Descargar PDF
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
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              {editingCotizacion ? 'Editar Cotización' : 'Nueva Cotización'}
            </h2>

            <CotizacionForm
              onSubmit={editingCotizacion ? handleUpdate : handleCreate}
              initialData={editingCotizacion}
            />

            <div className="mt-6 flex justify-center space-x-4">
              <button
                type="submit"
                form="cotizacion-form"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCotizacion(null);
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Confirmar eliminación</h2>
            <p>¿Estás seguro de eliminar la cotización <b>{cotizacionSeleccionada?.numero}</b>? Esta acción no se puede deshacer.</p>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => handleDelete(cotizacionSeleccionada.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pantalla de carga */}
      {loading && <LoadingOverlay message="Procesando cotización..." />}

      {/* Modal de éxito */}
      <SuccessModal message={successMessage} onClose={() => setSuccessMessage('')} />
    </div>
  );
};

export default Cotizaciones;