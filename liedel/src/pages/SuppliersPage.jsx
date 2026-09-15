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
      <main className='max-w-7xl mx-auto py-8 px-4 lg:px-8 space-y-8'>

        {/* --- 1. TARJETAS DE ESTADÍSTICAS GENERALES --- */}
        <motion.div
          className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
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

        {/* --- 2. SECCIÓN REPORTE DE PROVEEDORES (DEBAJO DE LAS STAT CARDS) --- */}
        <motion.div 
          className="p-6 rounded-2xl space-y-6"
          id="seccionReporteProveedores" 
          style={{ backgroundColor: "rgb(247, 249, 253)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          
          {/* ENCABEZADO Y FILTROS DE FECHA */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-5 gap-4">
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Truck className="text-indigo-600" size={22} /> Dashboard de Analítica de Proveedores
              </h1>
              <p className="text-xs text-gray-500 mt-1">Evaluación de tiempos de entrega, confiabilidad y volúmenes de inversión.</p>
            </div>

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

          {reportLoading && !reportData ? (
            <div className="flex items-center justify-center py-12 text-xs font-mono text-gray-500">
              ⌛ Cargando métricas analíticas...
            </div>
          ) : reportData && (
            <>
              {/* METRICAS DEL PERIODO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
                  <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600"><Truck size={20} /></div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Proveedores Activos</p>
                    <h3 className="text-lg font-black text-gray-900">{reportData.total_proveedores}</h3>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
                  <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600"><Calendar size={20} /></div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Órdenes Emitidas</p>
                    <h3 className="text-lg font-black text-gray-900">{reportData.total_ordenes}</h3>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
                  <div className="p-3 rounded-lg bg-amber-50 text-amber-600"><DollarSign size={20} /></div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Inversión en Abastecimiento</p>
                    <h3 className="text-lg font-black text-gray-900">${(reportData.inversion_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
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
                        <th className="p-2 pr-4">Contacto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-sans text-gray-600 text-[11px]">
                      {reportData.lista_proveedores.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-4 text-center text-gray-400">No se encontraron datos en este rango.</td>
                        </tr>
                      ) : (
                        reportData.lista_proveedores.map((prov) => (
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
                            <td className="p-2 pr-4 text-gray-400 font-mono">
                              <div className="flex items-center gap-1"><Phone size={10}/> {prov.Contacto_telefono || "S/N"}</div>
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
                <div id="chart-volumen-compras" className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col shadow-sm">
                  <h4 className="text-xs font-bold text-gray-900 mb-4 uppercase text-gray-400 tracking-wider">Volumen de Compras por Proveedor ($)</h4>
                  <div className="h-64">
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
                        {reportData.ordenes_retrasadas.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="p-4 text-center text-gray-400 font-sans">
                              🎉 No se registran órdenes críticas retrasadas asociadas a este periodo.
                            </td>
                          </tr>
                        ) : (
                          reportData.ordenes_retrasadas.map((oc) => (
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
			
			  <div id="suppliers-world-map">
			    <SuppliersWorldMap fechaInicio={fechaInicio} fechaFin={fechaFin} />
			  </div>
			
			   
              {/* BOTÓN EXPORTAR PDF */}
              <div className="download-btn-container pt-4 flex justify-end">
                <button 
                  onClick={generatePDF} 
                  disabled={generandoPDF}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  <Download size={14} /> {generandoPDF ? "Generando PDF de Proveedores..." : "Exportar Reporte de Proveedores (PDF)"}
                </button>
              </div>
            </>
          )}

        </motion.div>

      </main>
    </div>
  );
};

export default SuppliersPage;