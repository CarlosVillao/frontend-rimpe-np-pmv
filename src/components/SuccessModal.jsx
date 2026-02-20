const SuccessModal = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-semibold text-green-600 mb-4">Éxito</h2>
        <p>{message}</p>
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;