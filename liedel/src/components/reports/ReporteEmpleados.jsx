import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { Download, Calendar, DollarSign, RefreshCw, FileText, UserCheck, Briefcase, TrendingUp, Percent, ShieldCheck } from "lucide-react";

const ReporteEmpleados = () => {
  const hoy = new Date().toISOString().split("T")[0];
  const haceUnAno = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split("T")[0];

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(haceUnAno);
  const [fechaFin, setFechaFin] = useState(hoy);

  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      const url = `http://localhost:5000/api/reporte-empleados?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error cargando analítica de rendimiento laboral");
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Error cargando reporte de empleados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const generatePDF = () => {
    const input = document.getElementById("reporteEmpleadosCanvas");
    const downloadBtn = document.querySelector(".download-btn-container");
    if (downloadBtn) downloadBtn.style.display = "none";

    html2canvas(input, { scale: 1.5, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Rendimiento_Personal_${fechaInicio}_a_${fechaFin}.pdf`);
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
      
      {/* CONTROL DE FILTRADO POR RANGO DE FECHAS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 border border-gray-200 p-5 rounded-xl" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">Auditoría de Rendimiento Laboral y Comisiones</h2>
          <p className="text-xs text-gray-500">Evaluación de metas comerciales y métricas operativas por rango de fecha calificado.</p>
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
          <button onClick={fetchEmpleados} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95 ml-auto lg:ml-0">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Filtrar Nómina
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-20 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-indigo-600 font-medium">Consolidando historiales de facturación y calculando comisiones de periodos...</p>
        </div>
      )}

      {data && !loading && (
        <div id="reporteEmpleadosCanvas" className="space-y-8 bg-white p-6 rounded-2xl border border-gray-200">
          
          {/* TARJETAS DE KPIS OPERATIVOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-3 bg-green-100 text-green-600 rounded-lg"><DollarSign size={22} /></div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Volumen Procesado</span>
                <span className="text-xl font-black text-green-600 font-mono">${data.total_recaudado.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <p className="text-[9px] text-gray-500 mt-0.5">Dinero total facturado en caja.</p>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg"><Briefcase size={22} /></div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Tickets Despachados</span>
                <span className="text-xl font-black text-indigo-600 font-mono">{data.total_despachado.toLocaleString()} u.</span>
                <p className="text-[9px] text-gray-500 mt-0.5">Operaciones ejecutadas con éxito.</p>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><UserCheck size={22} /></div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Personal Activo</span>
                <span className="text-xl font-black text-amber-600 font-mono">{data.empleados_activos} Colab.</span>
                <p className="text-[9px] text-gray-500 mt-0.5">Cajeros/Asesores con transacciones.</p>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><TrendingUp size={22} /></div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Media por Colaborador</span>
                <span className="text-xl font-black text-purple-600 font-mono">${data.rendimiento_medio_empleado.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <p className="text-[9px] text-gray-500 mt-0.5">Cuota promedio de recaudación.</p>
              </div>
            </div>
          </div>

          {/* RENDIMIENTO TEMPORAL */}
          <div className="p-5 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
            <h3 className="text-sm font-bold mb-1 text-gray-900 flex items-center gap-2"><TrendingUp size={16} className="text-indigo-600"/> Evolución Mensual de Carga Operativa en Ventas</h3>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={data.evolucion_laboral}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Monto Procesado']} />
                <Line type="monotone" dataKey="monto_procesado" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* SECCIÓN BAJA: TABLA ESTRUCTURADA DE AUDITORÍA LABORAL */}
          <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
            <div className="p-4 bg-white/50 border-b border-gray-200 flex items-center gap-2">
              <FileText size={16} className="text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-900">Tabla de Rendimiento Individual y Liquidación Colectiva ({formatDate(fechaInicio)} - {formatDate(fechaFin)})</h3>
            </div>
            <div className="overflow-x-auto bg-white">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="p-3 pl-5">Colaborador / Asesor</th>
                    <th className="p-3 text-center">Puesto Operativo</th>
                    <th className="p-3 text-center">Transacciones</th>
                    <th className="p-3 text-right">Ticket Promedio</th>
                    <th className="p-3 text-right">Comisión (2%)</th>
                    <th className="p-3 text-right pr-5">Total Facturado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-mono text-gray-600">
                  {data.tabla_empleados.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-gray-400 font-sans">❌ Ningún registro comercial vinculado a empleados en este rango de fechas.</td>
                    </tr>
                  ) : (
                    data.tabla_empleados.map((emp, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-3 pl-5 font-sans text-gray-900 font-bold">
                          {emp.empleado}
                          <span className="block text-[9px] text-gray-400 font-mono">ID: #EMP-0{emp.Id_empleado}</span>
                        </td>
                        <td className="p-3 text-center font-sans">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                            {emp.puesto}
                          </span>
                        </td>
                        <td className="p-3 text-center font-sans font-medium text-gray-700">{emp.operaciones_realizadas} ops.</td>
                        <td className="p-3 text-right text-indigo-600 font-bold">${emp.ticket_promedio.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="p-3 text-right text-amber-600 font-bold flex items-center justify-end gap-1"><Percent size={11}/>${emp.comision_estimada.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="p-3 text-right text-green-600 font-black pr-5">${emp.total_vendido.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
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
              <Download size={14} /> Exportar Reporte de Capital Humano
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default ReporteEmpleados;