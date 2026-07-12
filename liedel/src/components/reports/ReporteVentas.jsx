import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, ComposedChart, Bar, Line,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from "recharts";
import { Download, Calendar, DollarSign, Table, TrendingUp, Users, BarChart2 } from "lucide-react";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#3b82f6"];

const ReporteVentas = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!startDate || !endDate) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/reporte-ventas?inicio=${startDate}&fin=${endDate}`);
        if (!res.ok) throw new Error("Error en el servidor");
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Error cargando el reporte de ventas: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [startDate, endDate]);

  const generatePDF = () => {
    const input = document.getElementById("reporteVentas");
    const downloadBtn = document.querySelector(".download-btn-container");
    if (downloadBtn) downloadBtn.style.display = "none";

    html2canvas(input, { scale: 1.5, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Reporte_Ventas_${startDate}_A_${endDate}.pdf`);
      if (downloadBtn) downloadBtn.style.display = "block";
    });
  };

  return (
    <div className="p-6 bg-white min-h-screen text-gray-800 font-sans">
      
      {/* HEADER DE CONTROL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border border-gray-200 p-5 rounded-xl" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">💰 Auditoría Comercial y de Ventas</h2>
          <p className="text-xs text-gray-500">Monitoreo de ingresos corrientes, volumen transaccional y rentabilidad de personal.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-300">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-gray-400 px-1">Desde</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-gray-800 text-sm p-1 outline-none cursor-pointer" />
          </div>
          <div className="w-[1px] h-8 bg-gray-300" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-gray-400 px-1">Hasta</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-gray-800 text-sm p-1 outline-none cursor-pointer" />
          </div>
        </div>
      </div>

      {/* ESTADOS INICIALES / CARGA */}
      {!data && !loading && (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-300" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
          <Calendar className="mx-auto text-gray-400 mb-3" size={40} />
          <p className="text-gray-600 font-medium">Establezca un rango de fechas en el panel superior para procesar las métricas de ingresos.</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-16 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-indigo-600 font-medium animate-pulse">Cruzando registros de facturación, clientes y cajeros...</p>
        </div>
      )}

      {/* CUERPO DEL REPORTE */}
      {data && (
        <div id="reporteVentas" className="space-y-8 bg-white p-6 rounded-2xl border border-gray-200">
          
          {/* RESUMEN METADATOS METRICAS CLAVE */}
          <div className="p-4 rounded-xl border border-gray-200 text-xs text-gray-600 flex flex-wrap gap-y-2 justify-between items-center divide-x divide-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
            <div className="px-4">INGRESOS NETOS: <span className="text-green-600 font-bold">${data.ingresos_totales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
            <div className="px-4">TRANSACCIONES: <span className="text-gray-900 font-bold">{data.transacciones_totales} ops</span></div>
            <div className="px-4">TICKET PROMEDIO: <span className="text-indigo-600 font-bold">${data.ticket_promedio.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
            <div className="px-4">CAJERO TOP: <span className="text-amber-600 font-bold">{data.empleado_top}</span></div>
            <div className="px-4">CLIENTE VIP: <span className="text-gray-900 font-bold">{data.cliente_top}</span></div>
          </div>

          {/* GRÁFICAS CLAVE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* TENDENCIA FINANCIERA TEMPORAL */}
            <div className="p-5 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <h3 className="text-base font-bold mb-4 text-gray-900 flex items-center gap-2"><TrendingUp size={18} className="text-indigo-600"/> Curva Temporal de Recaudación Diaria</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.tendencia_ventas}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="fecha" stroke="#718096" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#718096" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Ingresos Base']} />
                  <Area type="monotone" dataKey="ingresos" name="Ingresos ($)" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.1} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* RENDIMIENTO DEL PERSONAL (DESEMPEÑO CAJEROS) */}
            <div className="p-5 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <h3 className="text-base font-bold mb-4 text-gray-900 flex items-center gap-2"><Users size={18} className="text-amber-500" /> Cuota de Facturación por Empleado</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={data.ventas_empleados} dataKey="total_facturado" nameKey="empleado" cx="50%" cy="50%" outerRadius={85} label={({ empleado, percent }) => `${empleado} (${(percent * 100).toFixed(1)}%)`}>
                    {data.ventas_empleados.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Volumen Ventas']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MÉTDRICAS ADICIONALES REQUERIDAS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* TICKET PROMEDIO DESTACADO CARD */}
            <div className="p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm h-full" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                <DollarSign size={24} />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block">Ticket Promedio Global</span>
                <span className="text-2xl font-black text-indigo-600 font-mono">
                  ${data.ticket_promedio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <p className="text-[10px] text-gray-500 mt-0.5">Monto medio neto facturado por cada orden de compra.</p>
              </div>
            </div>

            {/* GRÁFICA COMBINADA REQUERIDA (Ocupa 2 columnas de ancho en layout grande) */}
            <div className="lg:col-span-2 p-5 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <h3 className="text-sm font-bold mb-1 text-gray-900 flex items-center gap-2">
                <BarChart2 size={18} className="text-indigo-600" /> Rendimiento Diario: Volumen de Ventas vs Dinero Recaudado
              </h3>
              <p className="text-[11px] text-gray-500 mb-4">Comparativa directa entre transacciones cobradas (barras) y capital bruto ingresado (línea).</p>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={data.volumen_vs_recaudacion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="fecha" stroke="#718096" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" stroke="#4f46e5" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#fff", borderColor: "#cbd5e1" }}
                    formatter={(value, name) => {
                      if (name === "Recaudación ($)") return [`$${value.toLocaleString()}`, name];
                      return [`${value} ventas`, name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="right" dataKey="transacciones" name="Volumen Transaccional" fill="#10b981" alpha={0.85} radius={[3, 3, 0, 0]} barSize={25} />
                  <Line yAxisId="left" type="monotone" dataKey="recaudacion" name="Recaudación ($)" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SECCIÓN TABULAR DE AUDITORÍA */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* TABLA DE METRICAS OPERATIVAS */}
            <div className="xl:col-span-1 rounded-xl border border-gray-200 overflow-hidden" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-4 bg-white/50 border-b border-gray-200 flex items-center gap-2">
                <Table size={16} className="text-amber-500" />
                <h3 className="text-sm font-bold text-gray-900">Métricas Operativas de Cajeros</h3>
              </div>
              <div className="overflow-x-auto bg-white">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="p-3">Empleado</th>
                      <th className="p-3 text-center">Tickets</th>
                      <th className="p-3 text-right">Total ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-mono text-gray-600">
                    {data.ventas_empleados?.map((emp, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-3 font-sans text-gray-900 font-semibold">{emp.empleado}</td>
                        <td className="p-3 text-center text-gray-900">{emp.operaciones} u.</td>
                        <td className="p-3 text-right text-green-600 font-bold">${emp.total_facturado.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABLA DE GRANDES TRANSACCIONES */}
            <div className="xl:col-span-2 rounded-xl border border-gray-200 overflow-hidden" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-4 bg-white/50 border-b border-gray-200 flex items-center gap-2">
                <DollarSign size={16} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-gray-900">Registro de Transacciones de Mayor Volumen (Top 10)</h3>
              </div>
              <div className="overflow-x-auto bg-white">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="p-3">ID Venta</th>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Cajero Atendió</th>
                      <th className="p-3 text-right">Monto Facturado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-mono text-gray-600">
                    {data.top_transacciones?.map((trans, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-indigo-600">#00{trans.Id_venta}</td>
                        <td className="p-3 font-sans text-gray-500">{trans.Fecha_venta}</td>
                        <td className="p-3 font-sans text-gray-900 font-semibold">{trans.cliente}</td>
                        <td className="p-3 font-sans text-gray-600">{trans.empleado}</td>
                        <td className="p-3 text-right text-gray-900 font-bold">${trans.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ACCIÓN EXPORTACIÓN */}
          <div className="download-btn-container pt-4 flex justify-end border-t border-gray-200">
            <button onClick={generatePDF} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95">
              <Download size={14} /> Exportar Reporte de Ventas a PDF (Formato A4)
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default ReporteVentas;