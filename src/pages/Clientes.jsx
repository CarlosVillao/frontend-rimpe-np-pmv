import { useState, useEffect } from 'react';
import { fetchClientes, createCliente, updateCliente, deleteCliente } from '../api/clientesApi';
import ClienteForm from '../components/ClienteForm';
import LoadingOverlay from '../components/LoadingOverlay';
import SuccessModal from '../components/SuccessModal';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [editingCliente, setEditingCliente] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorField, setErrorField] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  const loadClientes = async () => {
    const data = await fetchClientes();
    setClientes(data);
  };

  useEffect(() => {
    loadClientes();
  }, []);

  const handleCreate = async (cliente) => {
    try {
      setLoading(true);
      await createCliente(cliente);
      setSuccessMessage("Cliente creado con éxito");
      setShowModal(false);
      setErrorMessage('');
      setErrorField('');
      loadClientes();
    } catch (err) {
      setErrorMessage(err.message);
      if (err.message.toLowerCase().includes('identificación')) {
        setErrorField('identificacion');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (cliente) => {
    try {
      setLoading(true);
      await updateCliente(editingCliente.id, cliente);
      setSuccessMessage("Cliente actualizado con éxito");
      setEditingCliente(null);
      setShowModal(false);
      setErrorMessage('');
      setErrorField('');
      loadClientes();
    } catch (err) {
      setErrorMessage(err.message);
      if (err.message.toLowerCase().includes('identificación')) {
        setErrorField('identificacion');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteCliente(id);
      setSuccessMessage("Cliente eliminado con éxito");
      loadClientes();
    } catch (err) {
      if (err.status === 404) {
        setErrorMessage("El cliente ya no existe en la base de datos.");
      } else if (err.status === 400) {
        setErrorMessage("No se puede eliminar el cliente porque tiene cotizaciones asociadas.");
      } else {
        setErrorMessage(err.message || "Error al eliminar cliente");
      }
    } finally {
      setLoading(false);
    }
  };

  // Filtrar clientes por identificación o nombre
  const filteredClientes = clientes.filter((c) =>
    (c.identificacion && c.identificacion.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.nombre && c.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Clientes</h1>

      {/* Campo de búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por cédula/RUC o nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <button
        onClick={() => {
          setEditingCliente(null);
          setShowModal(true);
          setErrorMessage('');
          setErrorField('');
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4"
      >
        Nuevo Cliente
      </button>

      {/* Tabla de clientes */}
      <table className="w-full border-collapse border border-gray-300 shadow-lg">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="border p-3 text-left">Cédula/RUC</th>
            <th className="border p-3 text-left">Nombre</th>
            <th className="border p-3 text-left">Teléfono</th>
            <th className="border p-3 text-left">Email</th>
            <th className="border p-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredClientes.map((c, index) => (
            <tr
              key={c.id}
              className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
            >
              <td className="border p-2">{c.identificacion || 'Sin identificación'}</td>
              <td className="border p-2">{c.nombre}</td>
              <td className="border p-2">{c.telefono || 'Sin teléfono'}</td>
              <td className="border p-2">{c.email || 'Sin email'}</td>
              <td className="border p-2">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingCliente(c);
                      setShowModal(true);
                      setErrorMessage('');
                      setErrorField('');
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
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
              {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>

            {errorMessage && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {errorMessage}
              </div>
            )}

            <ClienteForm
              onSubmit={editingCliente ? handleUpdate : handleCreate}
              initialData={editingCliente}
              errorField={errorField}
              errorMessage={errorMessage}
            />

            <div className="mt-6 flex justify-center space-x-4">
              <button
                type="submit"
                form="cliente-form"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCliente(null);
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

      {/* Pantalla de carga */}
      {loading && <LoadingOverlay message="Procesando cliente..." />}

      {/* Modal de éxito */}
      <SuccessModal message={successMessage} onClose={() => setSuccessMessage('')} />

      {/* Modal de error (fallback) */}
      {errorMessage && !showModal && (
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
    </div>
  );
};

export default Clientes;