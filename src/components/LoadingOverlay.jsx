const LoadingOverlay = ({ message = "Procesando..." }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg flex flex-col items-center">
        <div className="loader border-t-4 border-blue-600 rounded-full w-12 h-12 animate-spin"></div>
        <p className="mt-4 text-blue-700 font-semibold">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;