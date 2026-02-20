import { useState, useEffect } from 'react';
import { reporteDiario, reporteMensual, reporteComisiones } from '../api/reportesApi';

const Dashboard = () => {
  const [diario, setDiario] = useState(null);
  const [mensual, setMensual] = useState(null);
  const [comisiones, setComisiones] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const d = await reporteDiario();
        const m = await reporteMensual();
        const c = await reporteComisiones(); // 👈 comisiones correctas
        setDiario(d);
        setMensual(m);
        setComisiones(c);
      } catch (err) {
        console.error('Error cargando reportes:', err);
        setError('No se pudo cargar la información. Verifica tu sesión.');
      }
    };
    loadData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-6">Bienvenido al sistema RIMPE NP</p>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Ventas del día */}
        <div className="bg-blue-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Ventas del día</h2>
          <p className="text-2xl font-bold">
            {diario ? `$ ${diario.total_vendido ?? 0}` : 'Cargando...'}
          </p>
          <p>Notas generadas: {diario?.notas_generadas ?? 0}</p>
          <p>Notas anuladas: {diario?.notas_anuladas ?? 0}</p>
        </div>

        {/* Ventas del mes (con comisión correcta) */}
        <div className="bg-green-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Ventas del mes</h2>
          <p className="text-2xl font-bold">
            {mensual ? `$ ${mensual.total_vendido ?? 0}` : 'Cargando...'}
          </p>
          <p>Notas generadas: {mensual?.notas_generadas ?? 0}</p>
          <p>Notas anuladas: {mensual?.notas_anuladas ?? 0}</p>
          <p>Notas activas: {mensual?.notas_activas ?? 0}</p>
          <p>
            Comisión: $
            {comisiones ? Number(comisiones.total_comision).toFixed(2) : 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;