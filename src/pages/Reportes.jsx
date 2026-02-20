import { useState, useEffect } from 'react';
import {
  reporteDiario,
  reporteMensual,
  //reportePorRango,
  exportarExcel,
  detalleDiario,
  detalleMensual,
  reporteComisiones
} from '../api/reportesApi';

const Reportes = () => {
  const [diario, setDiario] = useState(null);
  const [mensual, setMensual] = useState(null);

  // Estado para modales
  const [showDiarioModal, setShowDiarioModal] = useState(false);
  const [showMensualModal, setShowMensualModal] = useState(false);
  const [showComisionesModal, setShowComisionesModal] = useState(false);
  const [comisiones, setComisiones] = useState(null);

  // Estado para detalle
  const [detalleNotas, setDetalleNotas] = useState([]);
  const [totalCosto, setTotalCosto] = useState(0);
  const [totalMonto, setTotalMonto] = useState(0);
  const [totalGanancia, setTotalGanancia] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const d = await reporteDiario();
      const m = await reporteMensual();
      const c = await reporteComisiones(); // 👈 carga comisiones
      
      setDiario(d);
      setMensual(m);
      setComisiones(c);
    };
    loadData();
  }, []);

  // Abrir modal diario con datos reales
  const handleOpenDiario = async () => {
    const data = await detalleDiario();
    setDetalleNotas(data);

    const costo = data.reduce((acc, n) => acc + (Number(n.costo) * Number(n.cantidad)), 0);
    const venta = data.reduce((acc, n) => acc + Number(n.venta), 0);
    const ganancia = data.reduce((acc, n) => acc + Number(n.ganancia), 0);

    setTotalCosto(costo);
    setTotalMonto(venta);
    setTotalGanancia(ganancia);

    setShowDiarioModal(true);
  };

  // Abrir modal mensual con datos reales
  const handleOpenMensual = async () => {
    const data = await detalleMensual();
    setDetalleNotas(data);

    const costo = data.reduce((acc, n) => acc + (Number(n.costo) * Number(n.cantidad)), 0);
    const venta = data.reduce((acc, n) => acc + Number(n.venta), 0);
    const ganancia = data.reduce((acc, n) => acc + Number(n.ganancia), 0);

    setTotalCosto(costo);
    setTotalMonto(venta);
    setTotalGanancia(ganancia);

    setShowMensualModal(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Reportes</h1>

      {/* Tarjetas de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Reporte Diario */}
        <div className="bg-blue-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Reporte Diario</h2>
          {diario && (
            <>
              <p className="text-xl font-bold">Total vendido: ${diario.total_vendido ?? 0}</p>
              <p>Notas generadas: {diario.notas_generadas ?? 0}</p>
              <p>Notas anuladas: {diario.notas_anuladas ?? 0}</p>
            </>
          )}
          <button
            onClick={handleOpenDiario}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Ver Detalle
          </button>
        </div>

        {/* Reporte Mensual */}
        <div className="bg-green-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Reporte Mensual</h2>
          {mensual && (
            <>
              <p className="text-xl font-bold">Total vendido: ${mensual.total_vendido ?? 0}</p>
              <p>Notas generadas: {mensual.notas_generadas ?? 0}</p>
              <p>Notas anuladas: {mensual.notas_anuladas ?? 0}</p>
              <p>Notas activas: {mensual.notas_activas ?? 0}</p>
            </>
          )}
          <button
            onClick={handleOpenMensual}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Ver Detalle
          </button>
        </div>

        {/* Comisiones Mensuales */}
        <div className="bg-purple-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Comisiones Mensuales</h2>
          {comisiones && (
            <>
              <p className="text-xl font-bold">Notas emitidas: {comisiones.notas_generadas}</p>
              <p>Tarifa aplicada: ${Number(comisiones.tarifa_aplicada).toFixed(2)}</p>
              <p>Total comisión: ${Number(comisiones.total_comision).toFixed(2)}</p>
            </>
          )}
          <button
            onClick={() => setShowComisionesModal(true)}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Ver Detalle
          </button>
        </div>
      </div>
      {/* Modal Detalle Diario */}
      {showDiarioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-3xl">
            <h2 className="text-xl font-semibold mb-4">Detalle Reporte Diario</h2>
            <table className="w-full border-collapse border border-gray-300 mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Número Nota</th>
                  <th className="border p-2">Producto</th>
                  <th className="border p-2">Cantidad</th>
                  <th className="border p-2">Costo</th>
                  <th className="border p-2">Venta</th>
                  <th className="border p-2">Ganancia</th>
                </tr>
              </thead>
              <tbody>
                {detalleNotas.map((n, i) => (
                  <tr key={i}>
                    <td className="border p-2">{n.numero}</td>
                    <td className="border p-2">{n.producto}</td>
                    <td className="border p-2">{n.cantidad}</td>
                    <td className="border p-2">${(Number(n.costo) * Number(n.cantidad)).toFixed(2)}</td>
                    <td className="border p-2">${Number(n.venta).toFixed(2)}</td>
                    <td className="border p-2">${Number(n.ganancia).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p><strong>Total Costos:</strong> ${Number(totalCosto).toFixed(2)}</p>
            <p><strong>Total Ventas:</strong> ${Number(totalMonto).toFixed(2)}</p>
            <p><strong>Total Ganancia:</strong> ${Number(totalGanancia).toFixed(2)}</p>

            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => setShowDiarioModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Mensual */}
      {showMensualModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-3xl">
            <h2 className="text-xl font-semibold mb-4">Detalle Reporte Mensual</h2>
            <table className="w-full border-collapse border border-gray-300 mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Nota Venta</th>
                  <th className="border p-2">Producto</th>
                  <th className="border p-2">Cantidad</th>
                  <th className="border p-2">Costo</th>
                  <th className="border p-2">Venta</th>
                  <th className="border p-2">Ganancia</th>
                </tr>
              </thead>
              <tbody>
                {detalleNotas.map((n, i) => (
                  <tr key={i}>
                    <td className="border p-2">{n.numero}</td>
                    <td className="border p-2">{n.producto}</td>
                    <td className="border p-2">{n.cantidad}</td>
                    <td className="border p-2">${(Number(n.costo) * Number(n.cantidad)).toFixed(2)}</td>
                    <td className="border p-2">${Number(n.venta).toFixed(2)}</td>
                    <td className="border p-2">${Number(n.ganancia).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p><strong>Total Costos:</strong> ${Number(totalCosto).toFixed(2)}</p>
            <p><strong>Total Ventas:</strong> ${Number(totalMonto).toFixed(2)}</p>
            <p><strong>Total Ganancia:</strong> ${Number(totalGanancia).toFixed(2)}</p>

            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={async () => {
                  const fecha = new Date();
                  const anio = fecha.getFullYear();
                  const mes = fecha.getMonth() + 1;

                  const desde = `${anio}-${String(mes).padStart(2, '0')}-01`;
                  const ultimoDia = new Date(anio, mes, 0);
                  const hasta = `${anio}-${String(mes).padStart(2, '0')}-${String(ultimoDia.getDate()).padStart(2, '0')}`;

                  const blob = await exportarExcel(desde, hasta);
                  const url = window.URL.createObjectURL(new Blob([blob]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', `reporte_mensual_${anio}_${mes}.xlsx`);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                Exportar Excel
              </button>
              <button
                onClick={() => setShowMensualModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Comisiones */}
      {showComisionesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Detalle Comisiones Mensuales</h2>

            <p><strong>Cantidad de Notas de Venta:</strong> {comisiones?.notas_generadas ?? 0}</p>
            <p><strong>Tarifa aplicada por factura:</strong> ${Number(comisiones?.tarifa_aplicada ?? 0).toFixed(2)}</p>
            <p><strong>Total de Comisiones:</strong> ${Number(comisiones?.total_comision ?? 0).toFixed(2)}</p>

            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => setShowComisionesModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
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

export default Reportes;