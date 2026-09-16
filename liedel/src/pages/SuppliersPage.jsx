import { motion } from "framer-motion";
import { 
  Truck, DollarSign, Package, Calendar, AlertTriangle, 
  Phone, Award, Download 
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import html2canvas from "html2canvas";
import { pdf } from "@react-pdf/renderer";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

import StatCard from "../components/common/StatCard";
import SuppliersWorldMap from "../components/suppliers/SuppliersWorldMap";
import ReporteProveedoresPDF from "../components/reports/ReporteProveedores";

const SuppliersPage = () => {
  const navigate = useNavigate();

  // 1. Estados para StatCards generales
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    productsSupplied: 0,
    supplierRevenue: 0,
  });

  // 2. Estados para el Reporte de Analítica
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  // Inicializar rango de fechas (1 año atrás hasta hoy)
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split("T")[0];
  });
  const [fechaFin, setFechaFin] = useState(() => new Date().toISOString().split("T")[0]);

  // Cargar estadísticas superiores
  useEffect(() => {
    fetch("http://localhost:5000/suppliers_stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  }, []);

  // Cargar datos del reporte analítico según el rango de fechas
  const fetchReporte = async () => {
    try {
      setReportLoading(true);
      const res = await fetch(`http://localhost:5000/api/reporte-proveedores?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
      if (!res.ok) throw new Error("Error obteniendo datos del reporte");
      const result = await res.json();
      setReportData(result);
    } catch (error) {
      console.error("Error cargando el reporte:", error);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    fetchReporte();
  }, [fechaInicio, fechaFin]);

  // GENERACIÓN DE PDF NATIVO CON @REACT-PDF/RENDERER Y CAPTURA DE GRÁFICOS
  const generatePDF = async () => {
    try {
      setGenerandoPDF(true);

      const chartVolumenEl = document.querySelector("#chart-volumen-compras");
      const mapaEl = document.querySelector("#suppliers-world-map");

      let imgVolumen = null;
      let imgMapa = null;

      if (chartVolumenEl) {
        const canvas = await html2canvas(chartVolumenEl, { scale: 2 });
        imgVolumen = canvas.toDataURL("image/png");
      }

      if (mapaEl) {
        const canvas = await html2canvas(mapaEl, { scale: 2, useCORS: true });
        imgMapa = canvas.toDataURL("image/png");
      }

      const blob = await pdf(
        <ReporteProveedoresPDF
          data={reportData}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          chartImages={{
            volumenCompras: imgVolumen,
            mapaProveedores: imgMapa,
          }}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Reporte_Desempeno_Proveedores_${fechaInicio}_a_${fechaFin}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al generar el PDF de proveedores:", error);
    } finally {
      setGenerandoPDF(false);
    }
  };

  return (
    <div className='flex-1 overflow-auto relative z-10 font-sans'>
      <main className='max-w-7xl mx-auto py-8 px-4 lg:px-8'>

        {/* --- 1. TARJETAS DE ESTADÍSTICAS GENERALES --- */}
        <motion.div
          className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <StatCard
            name='Cantidad de Proveedores'
            icon={Truck}
            value={stats.totalSuppliers}
            color='#6366F1'
            onClick={() => navigate("/suppliers/list")} 
          />
          <StatCard
            name='Productos Provistos'
            icon={Package}
            value={stats.productsSupplied}
            color='#10B981'
          />
          <StatCard
            name='Cantidad invertida'
            icon={DollarSign}
            value={`$${(stats.supplierRevenue || 0).toLocaleString()}`}
            color='#F59E0B'
          />
        </motion.div>

        {/* ================= TARJETA BLANCA EXTERIOR (envuelve filtro + reporte) ================= */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-gray-800 font-sans mb-8">

          {/* ENCABEZADO Y FILTROS DE FECHA */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 border border-gray-200 p-5 rounded-xl" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Truck className="text-indigo-600" size={22} /> Dashboard de Analítica de Proveedores
              </h2>
              <p className="text-xs text-gray-500">Evaluación de tiempos de entrega, confiabilidad y volúmenes de inversión.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 px-2">
                <Calendar size={14} /> Desde:
                <input 
                  type="date" 
                  value={fechaInicio} 
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="bg-gray-100 p-1.5 rounded-md text-gray-800 font-mono border border-gray-200 outline-none"
                />
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 px-2">
                Hasta:
                <input 
                  type="date" 
                  value={fechaFin} 
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="bg-gray-100 p-1.5 rounded-md text-gray-800 font-mono border border-gray-200 outline-none"
                />
              </div>
            </div>
          </div>

          {reportLoading && !reportData ? (
            <div className="text-center py-20 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-indigo-600 font-medium text-sm">Cargando métricas analíticas...</p>
            </div>
          ) : reportData && (
            <div className="space-y-8">

              {/* METRICAS DEL PERIODO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg shrink-0"><Truck size={22} /></div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Proveedores Activos</span>
                    <span className="text-xl font-black text-indigo-600 font-mono">{reportData.total_proveedores}</span>
                    <p className="text-[9px] text-gray-500 mt-0.5">Proveedores con órdenes en el periodo.</p>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg shrink-0"><Calendar size={22} /></div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Órdenes Emitidas</span>
                    <span className="text-xl font-black text-emerald-600 font-mono">{reportData.total_ordenes}</span>
                    <p className="text-[9px] text-gray-500 mt-0.5">Órdenes de compra registradas.</p>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-lg shrink-0"><DollarSign size={22} /></div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Inversión en Abastecimiento</span>
                    <span className="text-xl font-black text-amber-600 font-mono">
                      ${(reportData.inversion_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <p className="text-[9px] text-gray-500 mt-0.5">Capital total invertido en compras.</p>
                  </div>
                </div>
              </div>

              {/* TABLA DE PROVEEDORES */}
              <div className="rounded-xl border border-gray-200 overflow-hidden flex flex-col" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                <div className="p-4 bg-white/50 border-b border-gray-200 flex items-center gap-2">
                  <Award size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-bold text-gray-900">Análisis Comparativo y Desempeño de Proveedores</h3>
                </div>
                <div className="overflow-x-auto bg-white flex-grow">
                  <table className="w-full text-left text-xs text-gray-700">
                    <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="p-3 pl-4">Proveedor</th>
                        <th className="p-3 text-center">Órdenes</th>
                        <th className="p-3 text-right">Total Invertido</th>
                        <th className="p-3 text-center">Demora Promedio</th>
                        <th className="p-3 text-center">Confiabilidad</th>
                        <th className="p-3 pr-4">Contacto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-mono text-gray-600">
                      {reportData.lista_proveedores.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-6 text-center text-gray-400 font-sans">No se encontraron datos en este rango.</td>
                        </tr>
                      ) : (
                        reportData.lista_proveedores.map((prov) => (
                          <tr key={prov.Id_proveedor} className="hover:bg-gray-50">
                            <td className="p-3 pl-4 font-sans text-gray-900 font-semibold">{prov.proveedor}</td>
                            <td className="p-3 text-center">{prov.total_compras}</td>
                            <td className="p-3 text-right font-bold text-gray-900">${prov.total_invertido.toFixed(2)}</td>
                            <td className="p-3 text-center text-gray-500">{prov.tiempo_entrega_promedio} días</td>
                            <td className="p-3 text-center font-sans">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${prov.confiabilidad >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                {prov.confiabilidad}%
                              </span>
                            </td>
                            <td className="p-3 pr-4 text-gray-400 font-sans">
                              <div className="flex items-center gap-1"><Phone size={11}/> {prov.Contacto_telefono || "S/N"}</div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* GRÁFICA Y RETRASOS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* GRÁFICO BARRA */}
                <div id="chart-volumen-compras" className="rounded-xl border border-gray-200 p-5" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                  <h3 className="text-sm font-bold mb-4 text-gray-900">Volumen de Compras por Proveedor ($)</h3>
                  <div className="h-64 bg-white rounded-xl border border-gray-200 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.lista_proveedores}>
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
                  <div className="p-4 bg-white/50 border-b border-red-100 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-600" />
                    <h3 className="text-sm font-bold text-red-900">Órdenes Críticas Retrasadas en el Periodo</h3>
                  </div>
                  <div className="overflow-x-auto bg-white flex-grow">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200">
                        <tr>
                          <th className="p-3 pl-4">ID Orden</th>
                          <th className="p-3">Proveedor</th>
                          <th className="p-3 text-center">Retraso</th>
                          <th className="p-3 pr-4 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 font-mono text-gray-600">
                        {reportData.ordenes_retrasadas.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="p-6 text-center text-gray-400 font-sans">
                              🎉 No se registran órdenes críticas retrasadas asociadas a este periodo.
                            </td>
                          </tr>
                        ) : (
                          reportData.ordenes_retrasadas.map((oc) => (
                            <tr key={oc.Id_orden_compra} className="hover:bg-red-50/30">
                              <td className="p-3 pl-4 text-gray-400">#{oc.Id_orden_compra}</td>
                              <td className="p-3 font-sans font-semibold text-gray-900">{oc.proveedor}</td>
                              <td className="p-3 text-center text-red-600 font-bold">{oc.dias_retraso} días</td>
                              <td className="p-3 pr-4 text-center">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
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

              <div id="suppliers-world-map">
                <SuppliersWorldMap fechaInicio={fechaInicio} fechaFin={fechaFin} />
              </div>

              {/* BOTÓN EXPORTAR PDF */}
              <div className="download-btn-container pt-4 flex justify-end border-t border-gray-200">
                <button 
                  onClick={generatePDF} 
                  disabled={generandoPDF}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  <Download size={14} /> {generandoPDF ? "Generando PDF de Proveedores..." : "Exportar Reporte de Proveedores (PDF)"}
                </button>
              </div>

            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default SuppliersPage;