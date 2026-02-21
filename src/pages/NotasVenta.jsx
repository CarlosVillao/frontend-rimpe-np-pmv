import { useState, useEffect } from 'react';
import {
  fetchNotasVenta,
  createNotaVenta,
  updateNotaVenta,
  deleteNotaVenta,
  descargarNotaVentaPDF,
  anularNotaVenta,
  fetchNotaVentaById
} from '../api/notasVentaApi';
import NotaVentaForm from '../components/NotaVentaForm';
import LoadingOverlay from '../components/LoadingOverlay';
import SuccessModal from '../components/SuccessModal';

const NotasVenta = () => {
  const [notas, setNotas] = useState([]);
  const [editingNota, setEditingNota] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [notaSeleccionada, setNotaSeleccionada] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  // Estados de carga y éxito
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadNotas = async () => {
    const data = await fetchNotasVenta();
    setNotas(data);
  };

  useEffect(() => {
    loadNotas();
  }, []);

  const handleCreate = async (nota) => {
    try {
      console.log("Payload enviado al backend:", nota);
      setLoading(true);
      await createNotaVenta(nota);
      setSuccessMessage("Nota de venta creada con éxito");
      setShowModal(false);
      loadNotas();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (nota) => {
    try {
      console.log("Payload enviado al backend (update):", nota);
      setLoading(true);
      await updateNotaVenta(editingNota.id, nota);
      setSuccessMessage("Nota de venta actualizada con éxito");
      setEditingNota(null);
      setShowModal(false);
      loadNotas();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (nota) => {
    try {
      const notaCompleta = await fetchNotaVentaById(nota.id);
      setEditingNota(notaCompleta);
      setShowModal(true);
    } catch (error) {
      console.error('Error al obtener nota completa:', error);
      alert('No se pudo cargar la nota para edición');
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteNotaVenta(id);
      setSuccessMessage("Nota de venta eliminada con éxito");
      setShowConfirmDelete(false);
      setNotaSeleccionada(null);
      loadNotas();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPDF = async (id, numero) => {
    try {
      await descargarNotaVentaPDF(id, numero);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('No se pudo descargar el PDF');
    }
  };

  const handleAnular = async (id) => {
    try {
      setLoading(true);
      await anularNotaVenta(id, 'Anulación desde frontend');
      setSuccessMessage("Nota de venta anulada con éxito");
      loadNotas();
    } catch (error) {
      console.error('Error al anular nota:', error);
      alert('No se pudo anular la nota');
    } finally {
      setLoading(false);
    }
  };

  const filteredNotas = notas.filter((n) =>
    n.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Notas de Venta</h1>

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
            setEditingNota(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Nueva Nota de Venta
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300 shadow-lg rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="border p-3">Número</th>
            <th className="border p-3">Cliente</th>
            <th className="border p-3">Total</th>
            <th className="border p-3">Estado</th>
            <th className="border p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredNotas.map((n, index) => (
            <tr
              key={n.id}
              className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
            >
              <td className="border p-2">{n.numero}</td>
              <td className="border p-2">{n.cliente_nombre}</td>
              <td className="border p-2 font-semibold text-green-700">
                {new Intl.NumberFormat('es-EC', {
                  style: 'currency',
                  currency: 'USD'
                }).format(n.total)}
              </td>

              <td className="border p-2 text-center">
                <span
                  className={`px-2 py-1 rounded text-white text-xs font-semibold ${n.estado === 'ACTIVA'
                    ? 'bg-green-600'
                    : 'bg-red-600'
                    }`}
                >
                  {n.estado}
                </span>
              </td>

              <td className="border p-2">
                <div className="flex justify-center space-x-2">
                  {n.estado === 'ACTIVA' && (
                    <>
                      <button
                        onClick={() => handleEdit(n)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => handleAnular(n.id)}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded"
                      >
                        Anular
                      </button>

                      <button
                        onClick={() => handleDescargarPDF(n.id, n.numero)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                      >
                        PDF
                      </button>
                    </>
                  )}

                  {n.estado === 'ANULADA' && (
                    <>
                      <button
                        onClick={() => handleDescargarPDF(n.id, n.numero)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                      >
                        PDF
                      </button>

                      <button
                        onClick={() => {
                          setNotaSeleccionada(n);
                          setShowConfirmDelete(true);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Crear / Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              {editingNota ? 'Editar Nota de Venta' : 'Nueva Nota de Venta'}
            </h2>

            <NotaVentaForm
              onSubmit={editingNota ? handleUpdate : handleCreate}
              initialData={editingNota}
              allowEditPrice={true}
            />

            <div className="mt-6 flex justify-center space-x-4">
              <button
                type="submit"
                form="nota-venta-form"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                {editingNota ? 'Guardar cambios' : 'Crear Nota de Venta'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingNota(null);
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Modal Confirmar Eliminación */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4 text-red-600">
              Confirmar eliminación
            </h2>
            <p>
              ¿Estás seguro de eliminar la nota de venta{' '}
              <b>{notaSeleccionada?.numero}</b>? Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    await handleDelete(notaSeleccionada.id);
                    setSuccessMessage("Nota de venta eliminada con éxito");
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setLoading(false);
                    setShowConfirmDelete(false);
                  }
                }}
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
      {loading && <LoadingOverlay message="Procesando nota de venta..." />}

      {/* Modal de éxito */}
      <SuccessModal message={successMessage} onClose={() => setSuccessMessage('')} />
    </div>
  );
};

export default NotasVenta;