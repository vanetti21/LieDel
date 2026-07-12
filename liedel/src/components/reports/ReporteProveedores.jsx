import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Download, Truck, Calendar, AlertTriangle, DollarSign, Phone, Award } from "lucide-react";
import { motion } from "framer-motion";

const ReporteProveedores = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Inicializar fechas (Hace un año hacia atrás hasta hoy)
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split("T")[0];
  });
  const [fechaFin, setFechaFin] = useState(() => new Date().toISOString().split("T")[0]);

  // 2. Modificación del Fetch pasándole las queries dinámicas
  const fetchProveedores = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/reporte-proveedores?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
      if (!res.ok) throw new Error("Error obteniendo datos de proveedores");
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Error cargando el reporte:", error);
    } finally {
      setLoading(false);
    }
  };

  // Escuchar cuando cambie cualquier control de fecha para recargar los KPI
  useEffect(() => {
    fetchProveedores();
  }, [fechaInicio, fechaFin]);

  const generatePDF = () => {
    const input = document.getElementById("reporteProveedores");
    const downloadBtn = document.querySelector(".download-btn-container");
    if (downloadBtn) downloadBtn.style.display = "none";

    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Reporte_Desempeno_Proveedores_${fechaInicio}_a_${fechaFin}.pdf`);
      if (downloadBtn) downloadBtn.style.display = "flex";
    });
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xs font-mono text-gray-500">
        ⌛ Cargando métricas analíticas de proveedores...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" id="reporteProveedores" style={{ backgroundColor: "rgb(247, 249, 253)" }}>
      
      {/* ENCABEZADO CON SELECTORES DE FECHA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-5 gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Truck className="text-indigo-600" size={22} /> Dashboard de Analítica de Proveedores
          </h1>
          <p className="text-xs text-gray-500 mt-1">Evaluación de tiempos de entrega, confiabilidad y volúmenes de inversión.</p>
        </div>

        {/* SELECTORES DE FECHA INTEGRADOS */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm text-xs">
          <Calendar size={14} className="text-gray-400 ml-1" />
          <input 
            type="date" 
            value={fechaInicio} 
            onChange={(e) => setFechaInicio(e.target.value)}
            className="border-none bg-transparent font-mono focus:ring-0 p-1 text-gray-700"
          />
          <span className="text-gray-300 font-bold">al</span>
          <input 
            type="date" 
            value={fechaFin} 
            onChange={(e) => setFechaFin(e.target.value)}
            className="border-none bg-transparent font-mono focus:ring-0 p-1 text-gray-700"
          />
        </div>
      </div>

      {data && (
        <>
          {/* CARDS DE METRICAS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
              <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600"><Truck size={20} /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Proveedores Activos</p>
                <h3 className="text-lg font-black text-gray-900">{data.total_proveedores}</h3>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600"><Calendar size={20} /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Órdenes Emitidas</p>
                <h3 className="text-lg font-black text-gray-900">{data.total_ordenes}</h3>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
              <div className="p-3 rounded-lg bg-amber-50 text-amber-600"><DollarSign size={20} /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Inversión en Abastecimiento</p>
                <h3 className="text-lg font-black text-gray-900">${data.inversion_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
              </div>
            </div>
          </div>

          {/* TABLA DE PROVEEDORES */}
          <div className="rounded-xl border border-gray-200 overflow-hidden flex flex-col" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
            <div className="p-3.5 bg-white/50 border-b border-gray-200 flex items-center gap-2">
              <Award size={16} className="text-indigo-600" />
              <h3 className="text-xs font-bold text-gray-900">Análisis Comparativo y Desempeño de Proveedores</h3>
            </div>
            <div className="overflow-x-auto bg-white flex-grow">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 uppercase text-gray-400 border-b border-gray-200 text-[10px]">
                  <tr>
                    <th className="p-2 pl-4">Proveedor</th>
                    <th className="p-2 text-center">Órdenes</th>
                    <th className="p-2 text-right">Total Invertido</th>
                    <th className="p-2 text-center">Demora Promedio</th>
                    <th className="p-2 text-center">Confiabilidad</th>
                    <th className="p-2 pr-4">Contacto </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans text-gray-600 text-[11px]">
                  {data.lista_proveedores.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-gray-400">No se encontraron datos en este rango.</td>
                    </tr>
                  ) : (
                    data.lista_proveedores.map((prov) => (
                      <tr key={prov.Id_proveedor} className="hover:bg-gray-50">
                        <td className="p-2 pl-4 font-bold text-gray-900">{prov.proveedor}</td>
                        <td className="p-2 text-center font-mono">{prov.total_compras}</td>
                        <td className="p-2 text-right font-mono font-medium text-gray-900">${prov.total_invertido.toFixed(2)}</td>
                        <td className="p-2 text-center font-mono text-gray-500">{prov.tiempo_entrega_promedio} días</td>
                        <td className="p-2 text-center font-mono">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${prov.confiabilidad >= 85 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {prov.confiabilidad}%
                          </span>
                        </td>
                        <td className="p-2 pr-4 text-gray-400 flex items-center gap-1 font-mono"><Phone size={10}/> {prov.Contacto_telefono}</td>
                        
                        <td className="p-2 pr-4 text-gray-400 flex items-center gap-1 font-mono"><letter size={10}/> {prov.Contacto_email}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECCIÓN GRÁFICA Y RETRASOS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* GRÁFICO */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col shadow-sm">
              <h4 className="text-xs font-bold text-gray-900 mb-4 uppercase text-gray-400 tracking-wider">Volumen de Compras por Proveedor ($)</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.lista_proveedores}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="proveedor" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => [`$${value}`, 'Inversión']} />
                    <Bar dataKey="total_invertido" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RETRASOS CRÍTICOS */}
            <div className="rounded-xl border border-gray-200 overflow-hidden flex flex-col" style={{ backgroundColor: "rgb(254, 242, 242)" }}>
              <div className="p-3.5 bg-red-50/50 border-b border-red-100 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-600" />
                <h3 className="text-xs font-bold text-red-900">Órdenes Críticas Retrasadas en el Periodo</h3>
              </div>
              <div className="overflow-x-auto bg-white flex-grow">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50 uppercase text-gray-400 border-b border-gray-200 text-[10px]">
                    <tr>
                      <th className="p-2 pl-4">ID Orden</th>
                      <th className="p-2">Proveedor</th>
                      <th className="p-2 text-center">Retraso</th>
                      <th className="p-2 pr-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono text-gray-600 text-[11px]">
                    {data.ordenes_retrasadas.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-4 text-center text-gray-400 font-sans">
                          🎉 No se registran órdenes críticas retrasadas asociadas a este periodo.
                        </td>
                      </tr>
                    ) : (
                      data.ordenes_retrasadas.map((oc) => (
                        <tr key={oc.Id_orden_compra} className="hover:bg-red-50/30">
                          <td className="p-2 pl-4 text-gray-400">#{oc.Id_orden_compra}</td>
                          <td className="p-2 font-sans font-medium text-gray-900">{oc.proveedor}</td>
                          <td className="p-2 text-center text-red-600 font-bold">{oc.dias_retraso} días</td>
                          <td className="p-2 pr-4 text-center">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                              {oc.Estado}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* BOTÓN EXPORTAR */}
          <div className="download-btn-container pt-4 flex justify-end">
            <button onClick={generatePDF} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95">
              <Download size={14} /> Exportar Reporte de Proveedores (PDF)
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ReporteProveedores;