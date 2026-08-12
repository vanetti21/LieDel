import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Download, ShoppingBag, Calendar, Layers, DollarSign, RefreshCw, FileText, ClipboardCheck, TrendingUp, Clock, Ban, Truck } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#3b82f6"];

const ReporteCompras = () => {
  const hoy = new Date().toISOString().split("T")[0];
  const haceUnAno = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split("T")[0];

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(haceUnAno);
  const [fechaFin, setFechaFin] = useState(hoy);

  const fetchCompras = async () => {
    try {
      setLoading(true);
      const url = `http://localhost:5000/api/reporte-compras?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error obteniendo datos de compras");
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Error cargando reporte de compras:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompras();
  }, []);

  const generatePDF = () => {
    const input = document.getElementById("reporteCompras");
    const downloadBtn = document.querySelector(".download-btn-container");
    if (downloadBtn) downloadBtn.style.display = "none";

    html2canvas(input, { scale: 1.5, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Auditoria_Avanzada_Compras_${fechaInicio}_to_${fechaFin}.pdf`);
      if (downloadBtn) downloadBtn.style.display = "block";
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getStatusBadge = (estado) => {
    const est = estado?.toLowerCase();
    if (est === "completada" || est === "recibida") return "bg-green-50 text-green-700 border-green-200";
    if (est === "pendiente" || est === "solicitada") return "bg-amber-50 text-amber-700 border-amber-200";
    if (est === "en transito") return "bg-indigo-50 text-indigo-700 border-indigo-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  return (
    <div className="p-6 bg-white min-h-screen text-gray-800 font-sans">
      
      {/* SECTOR FILTRADO DE FECHAS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 border border-gray-200 p-5 rounded-xl" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"> Auditoría Dinámica de Compras y Abastecimiento</h2>
          <p className="text-xs text-gray-500">Monitoreo corporativo y control de egresos financieros por rango de fecha analítico.</p>
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
          <button onClick={fetchCompras} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95 ml-auto lg:ml-0">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Consultar Periodo
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-20 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-indigo-600 font-medium">Procesando y cruzando cubos analíticos de compras...</p>
        </div>
      )}

      {data && !loading && (
        <div id="reporteCompras" className="space-y-8 bg-white p-6 rounded-2xl border border-gray-200">
          
          {/* GRIDS DE METRICAS AVANZADAS */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-xl border border-gray-200 flex items-center gap-3 shadow-sm" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-2.5 bg-green-100 text-green-600 rounded-lg"><DollarSign size={18} /></div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Inversión Total</span>
                <span className="text-sm font-black text-green-600 font-mono">${data.inversion_total.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 flex items-center gap-3 shadow-sm" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-lg"><ShoppingBag size={18} /></div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Volumen</span>
                <span className="text-sm font-black text-indigo-600 font-mono">{data.unidades_compradas.toLocaleString()} u.</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 flex items-center gap-3 shadow-sm" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-2.5 bg-amber-100 text-amber-600 rounded-lg"><ClipboardCheck size={18} /></div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Órdenes Emitidas</span>
                <span className="text-sm font-black text-amber-600 font-mono">{data.total_ordenes} OC</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 flex items-center gap-3 shadow-sm" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-2.5 bg-purple-100 text-purple-600 rounded-lg"><TrendingUp size={18} /></div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Ticket Promedio</span>
                <span className="text-sm font-black text-purple-600 font-mono">${data.ticket_promedio.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            {/* NUEVO KPI: LEAD TIME DEL PERIODO */}
            <div className="p-4 rounded-xl border border-gray-200 flex items-center gap-3 shadow-sm" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg"><Clock size={18} /></div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Lead Time Medio</span>
                <span className="text-sm font-black text-blue-600 font-mono">{data.lead_time_promedio || 0} días</span>
              </div>
            </div>

            {/* NUEVO KPI: TASA DE CANCELACIÓN */}
            <div className="p-4 rounded-xl border border-gray-200 flex items-center gap-3 shadow-sm" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-2.5 bg-red-100 text-red-600 rounded-lg"><Ban size={18} /></div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">% Cancelaciones</span>
                <span className="text-sm font-black text-red-600 font-mono">{data.tasa_cancelacion}%</span>
              </div>
            </div>
          </div>

          {/* TENDENCIA DEL FLUJO DE COMPRAS */}
          <div className="p-5 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
            <h3 className="text-sm font-bold mb-1 text-gray-900 flex items-center gap-2"><TrendingUp size={16} className="text-indigo-600"/> Histórico y Evolución Mensual del Gasto</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={data.evolucion_gasto}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Gasto Realizado']} />
                <Line type="monotone" dataKey="monto" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* PARTE INTERMEDIA: GRÁFICOS COMPLEMENTARIOS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <h3 className="text-sm font-bold mb-3 text-gray-900 flex items-center gap-2"><ClipboardCheck size={16} className="text-indigo-600"/> Distribución por Estado</h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={data.estados_ordenes} dataKey="valor_total" nameKey="estado" cx="50%" cy="50%" outerRadius={50} label={({ estado }) => estado}>
                    {data.estados_ordenes.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Flujo Contable']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="p-5 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <h3 className="text-sm font-bold mb-3 text-gray-900 flex items-center gap-2"><Layers size={16} className="text-indigo-600"/> Presupuesto por Categoría</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data.categorias_top}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="categoria" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Invertido']} />
                  <Bar dataKey="total_invertido" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* NUEVO GRÁFICO: CONCENTRACIÓN DEL GASTO POR PROVEEDOR */}
            <div className="p-5 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <h3 className="text-sm font-bold mb-3 text-gray-900 flex items-center gap-2"><Truck size={16} className="text-indigo-600"/> Top 5 Proveedores por Inversión</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data.top_proveedores_gasto} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis type="number" tick={{ fontSize: 9 }} />
                  <YAxis dataKey="proveedor" type="category" tick={{ fontSize: 9 }} width={70} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Comprado']} />
                  <Bar dataKey="monto_total" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TABLA: AUDITORÍA GENERAL */}
          <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
            <div className="p-4 bg-white/50 border-b border-gray-200 flex items-center gap-2">
              <FileText size={16} className="text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-900">Auditoría Operativa de Órdenes de Compra ({formatDate(fechaInicio)} - {formatDate(fechaFin)})</h3>
            </div>
            <div className="overflow-x-auto bg-white">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="p-3">Código OC</th>
                    <th className="p-3">Proveedor Logístico</th>
                    <th className="p-3 text-center">Fecha Emisión</th>
                    <th className="p-3 text-center">Estado de Flujo</th>
                    <th className="p-3 text-right">Monto Neto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-mono text-gray-600">
                  {data.historial_ordenes.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-gray-400 font-sans">❌ Ninguna orden registrada dentro de este rango de fechas.</td>
                    </tr>
                  ) : (
                    data.historial_ordenes.map((ord, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-3 text-gray-400">#OC-0{ord.Id_orden_compra}</td>
                        <td className="p-3 font-sans text-gray-900 font-semibold">{ord.proveedor}</td>
                        <td className="p-3 text-center text-gray-500">{formatDate(ord.Fecha_orden)}</td>
                        <td className="p-3 text-center font-sans">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(ord.Estado)}`}>
                            {ord.Estado}
                          </span>
                        </td>
                        <td className="p-3 text-right text-gray-900 font-black">${ord.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* BOTÓN EXPORTAR */}
          <div className="download-btn-container pt-4 flex justify-end border-t border-gray-200">
            <button onClick={generatePDF} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95">
              <Download size={14} /> Exportar Reporte de Compras Completo
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default ReporteCompras;