import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Download, Users, Calendar, DollarSign, RefreshCw, FileText, ShoppingBag, TrendingUp, Award, Phone } from "lucide-react";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ec4899"];

const ReporteClientes = () => {
  const hoy = new Date().toISOString().split("T")[0];
  const haceUnAno = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split("T")[0];

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(haceUnAno);
  const [fechaFin, setFechaFin] = useState(hoy);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const url = `http://localhost:5000/api/reporte-clientes?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error cargando analítica de clientes");
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Error cargando reporte:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const generatePDF = () => {
    const input = document.getElementById("reporteClientesCanvas");
    const downloadBtn = document.querySelector(".download-btn-container");
    if (downloadBtn) downloadBtn.style.display = "none";

    html2canvas(input, { scale: 1.5, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Auditoria_Clientes_${fechaInicio}_a_${fechaFin}.pdf`);
      if (downloadBtn) downloadBtn.style.display = "block";
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="p-6 bg-white min-h-screen text-gray-800 font-sans">
      
      {/* PANEL SUPERIOR DE FILTRADO POR FECHAS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 border border-gray-200 p-5 rounded-xl" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"> Auditoría Comercial y Retención de Clientes</h2>
          <p className="text-xs text-gray-500">Análisis del valor financiero aportado por rango de fechas y segmentación de cartera.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200 w-full lg:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 px-2">
            <Calendar size={14} /> Desde:
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="bg-gray-100 p-1.5 rounded-md text-gray-800 font-mono border border-gray-200 outline-none" />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 px-2">
            Hasta:
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="bg-gray-100 p-1.5 rounded-md text-gray-800 font-mono border border-gray-200 outline-none" />
          </div>
          <button onClick={fetchClientes} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95 ml-auto lg:ml-0">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Analizar Periodo
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-20 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-indigo-600 font-medium">Extrayendo transacciones y calculando flujos de consumo comercial...</p>
        </div>
      )}

      {data && !loading && (
        <div id="reporteClientesCanvas" className="space-y-8 bg-white p-6 rounded-2xl border border-gray-200">
          
          {/* TARJETAS DE KPIs COMERCIALES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-3 bg-green-100 text-green-600 rounded-lg"><DollarSign size={22} /></div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Recaudación Total</span>
                <span className="text-xl font-black text-green-600 font-mono">${data.facturacion_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <p className="text-[9px] text-gray-500 mt-0.5">Ingreso bruto neto facturado.</p>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg"><Users size={22} /></div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Clientes Compradores</span>
                <span className="text-xl font-black text-indigo-600 font-mono">{data.clientes_activos.toLocaleString()} Únicos</span>
                <p className="text-[9px] text-gray-500 mt-0.5">Clientes que generaron ingresos.</p>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><ShoppingBag size={22} /></div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Transacciones Totales</span>
                <span className="text-xl font-black text-amber-600 font-mono">{data.total_transacciones} Ventas</span>
                <p className="text-[9px] text-gray-500 mt-0.5">Volumen de tickets emitidos.</p>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><TrendingUp size={22} /></div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Consumo Promedio</span>
                <span className="text-xl font-black text-purple-600 font-mono">${data.ticket_promedio_general.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <p className="text-[9px] text-gray-500 mt-0.5">Valor medio del ticket emitido.</p>
              </div>
            </div>
          </div>

          {/* EVOLUCIÓN HISTÓRICA DEL MES */}
          <div className="p-5 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
            <h3 className="text-sm font-bold mb-1 text-gray-900 flex items-center gap-2"><TrendingUp size={16} className="text-indigo-600"/> Tendencia de Ingresos y Tráfico de Compradores</h3>
            <p className="text-[11px] text-gray-500 mb-4">Comportamiento financiero temporal según el ciclo de ventas.</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={data.evolucion_clientes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Ingreso Neto Realizado']} />
                <Line type="monotone" dataKey="ingresos" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* SECCIÓN INTERMEDIA: GRÁFICO DE SEGMENTACIÓN */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 p-5 rounded-xl border border-gray-200 flex flex-col justify-between" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div>
                <h3 className="text-sm font-bold mb-1 text-gray-900 flex items-center gap-2"><Award size={16} className="text-indigo-600"/> Cartera por Segmento</h3>
                <p className="text-[11px] text-gray-500 mb-4">División por volumen de capital inyectado.</p>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={data.segmentacion} dataKey="aporte_financiero" nameKey="segmento" cx="50%" cy="50%" outerRadius={45} label={({ segmento }) => segmento.split(' ')[0]}>
                    {data.segmentacion.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Total Aportado']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* TABLA DE AUDITORÍA: TOP 10 CLIENTES (ORDENADA EN TABLA ESTRUCTURADA) */}
            <div className="lg:col-span-2 rounded-xl border border-gray-200 overflow-hidden flex flex-col" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-4 bg-white/50 border-b border-gray-200 flex items-center gap-2">
                <Award size={16} className="text-amber-500" />
                <h3 className="text-sm font-bold text-gray-900">Ranking Top Clientes de Mayor Valor (CLV)</h3>
              </div>
              <div className="overflow-x-auto bg-white flex-grow">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="p-2.5 pl-4">Cliente</th>
                      <th className="p-2.5 text-center">Frecuencia</th>
                      <th className="p-2.5 text-right">Ticket Promedio</th>
                      <th className="p-2.5 text-right pr-4">Total Aportado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-mono text-gray-600">
                    {data.top_clientes.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-6 text-center text-gray-400 font-sans">❌ Ninguna transacción registrada en este rango temporal.</td>
                      </tr>
                    ) : (
                      data.top_clientes.map((cl, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-2.5 pl-4 font-sans text-gray-900 font-semibold flex flex-col">
                            <span>{cl.cliente}</span>
                            <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1"><Phone size={10}/> {cl.Telefono || "S/N"}</span>
                          </td>
                          <td className="p-2.5 text-center font-sans text-gray-600 font-medium">{cl.compras_realizadas} trans.</td>
                          <td className="p-2.5 text-right text-indigo-600 font-bold">${cl.ticket_promedio.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="p-2.5 text-right text-green-600 font-black pr-4">${cl.total_gastado.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* BOTÓN EXPORTAR */}
          <div className="download-btn-container pt-4 flex justify-end border-t border-gray-200">
            <button onClick={generatePDF} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95">
              <Download size={14} /> Exportar Auditoría de Clientes ({fechaInicio} a {fechaFin})
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default ReporteClientes;