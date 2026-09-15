import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { pdf } from "@react-pdf/renderer";

import StatCard from "../components/common/StatCard";
import ReporteOrdenesPDF from "../components/reports/ReporteCompras";

import { 
  CheckCircle, Clock, DollarSign, ShoppingBag, XCircle,
  Download, Calendar, Building2, Truck, TrendingUp,
  PieChart as PieIcon, FileText, Package, Navigation, Award
} from "lucide-react";

import { 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, 
  Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar 
} from "recharts";

const OrdersPage = () => {
  const navigate = useNavigate();

  // Estados de StatCards superiores
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
  });

  // Fechas por defecto: Hoy y Hace 2 años
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 2);
    return today.toISOString().split("T")[0];
  });

  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const COLORS_ESTADOS = ["#F59E0B", "#10B981", "#EF4444", "#6366F1", "#8B5CF6", "#f15cf6"];
  const COLORS_ENVIOS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899"];

  // Filtro de Sucursales
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("todas");

  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [exportando, setExportando] = useState(false);

  // 1. Cargar tarjetas estadísticas superiores
  useEffect(() => {
    fetch("http://localhost:5000/orders_stats")
      .then((res) => res.json())
      .then((data) => setOrderStats(data))
      .catch((err) => console.error("Error al cargar stats:", err));
  }, []);

  // 2. Cargar lista de sucursales desde /api/sucursales
  useEffect(() => {
    fetch("http://localhost:5000/api/sucursales")
      .then((res) => res.json())
      .then((data) => setBranches(data))
      .catch((err) => console.error("Error al cargar sucursales:", err));
  }, []);

  // 3. Cargar reporte general de órdenes
  useEffect(() => {
    if (!startDate || !endDate) return;

    const fetchReport = async () => {
      try {
        setLoadingReport(true);
        const res = await fetch(
          `http://localhost:5000/api/reporte-ordenes?inicio=${startDate}&fin=${endDate}&sucursal=${selectedBranch}`
        );
        if (!res.ok) throw new Error("Error en el servidor");
        const result = await res.json();
        setReportData(result);
      } catch (error) {
        console.error("Error cargando el reporte de órdenes: ", error);
      } finally {
        setLoadingReport(false);
      }
    };
    fetchReport();
  }, [startDate, endDate, selectedBranch]);

  // GENERACIÓN DE PDF NATIVO CON @REACT-PDF/RENDERER Y CAPTURA DE GRÁFICOS
  const generatePDF = async () => {
    try {
      setExportando(true);

      const chartTendenciaEl = document.querySelector("#chart-tendencia-compras");
      const chartTiposEnvioEl = document.querySelector("#chart-tipos-envio");
      const chartDistribucionEl = document.querySelector("#chart-distribucion-estados");

      let imgTendencia = null;
      let imgTiposEnvio = null;
      let imgDistribucion = null;

      if (chartTendenciaEl) {
        const canvas = await html2canvas(chartTendenciaEl, { scale: 2 });
        imgTendencia = canvas.toDataURL("image/png");
      }

      if (chartTiposEnvioEl) {
        const canvas = await html2canvas(chartTiposEnvioEl, { scale: 2 });
        imgTiposEnvio = canvas.toDataURL("image/png");
      }

      if (chartDistribucionEl) {
        const canvas = await html2canvas(chartDistribucionEl, { scale: 2 });
        imgDistribucion = canvas.toDataURL("image/png");
      }

      const blob = await pdf(
        <ReporteOrdenesPDF
          reportData={reportData}
          startDate={startDate}
          endDate={endDate}
          chartImages={{
            tendenciaCompras: imgTendencia,
            tiposEnvio: imgTiposEnvio,
            distribucionEstados: imgDistribucion,
          }}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Reporte_Ordenes_${startDate}_A_${endDate}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al generar el PDF de órdenes:", error);
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <main className='max-w-7xl mx-auto py-8 px-4 lg:px-8'>

        {/* 1. STAT CARDS SUPERIORES */}
        <motion.div
          className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            name='Cantidad de Ordenes'
            icon={ShoppingBag}
            value={orderStats.totalOrders}
            color='#6366F1'
          />

          <StatCard
            name='Cantidad Pendientes'
            icon={Clock}
            value={orderStats.pendingOrders}
            color='#F59E0B'
            onClick={() => navigate("/orders/pending")}
          />

          <StatCard
            name='Cantidad Completas'
            icon={CheckCircle}
            value={orderStats.completedOrders}
            color='#10B981'
            onClick={() => navigate("/orders/completed")}
          />

          <StatCard
            name='Cantidad Canceladas'
            icon={XCircle}
            value={orderStats.cancelledOrders}
            color='#EF4444'
            onClick={() => navigate("/orders/cancelled")}
          />

          <StatCard
            name='Total Invertido'
            icon={DollarSign}
            value={`$${orderStats.totalRevenue.toLocaleString("en-DO")}`}
            color='#EF4444'
          />
        </motion.div>

        {/* 2. REPORTE DE ÓRDENES DE COMPRA */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-gray-800 font-sans mb-8">
          
          {/* HEADER DE CONTROL: SUCURSAL Y FECHAS */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 border border-gray-200 p-6 rounded-xl" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">Auditoría de Órdenes y Logística</h2>
              <p className="text-xs text-gray-500">Monitoreo de inversión en compras, métodos de envío y productos más demandados.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-200">

              {/* SELECTOR SUCURSAL */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 px-1.5 border-r border-gray-200 shrink-0">
                <Building2 size={14} className="text-indigo-600 shrink-0" /> Sucursal:
                <select 
                  value={selectedBranch} 
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="bg-gray-100 p-1.5 rounded-md text-gray-800 font-bold border border-gray-200 outline-none cursor-pointer max-w-[130px] truncate text-[12px]"
                >
                  <option value="todas">Todas las Sucursales</option>
                  {branches.map((suc) => (
                    <option key={suc.Id_sucursal} value={suc.Id_sucursal}>
                      {suc.Nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* FECHA DESDE */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 px-1.5 shrink-0">
                <Calendar size={14} className="shrink-0" /> Desde:
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="bg-gray-100 p-1.5 rounded-md text-gray-800 font-mono border border-gray-200 outline-none text-[12px]" 
                />
              </div>

              {/* FECHA HASTA */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 px-1.5 shrink-0">
                Hasta:
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="bg-gray-100 p-1.5 rounded-md text-gray-800 font-mono border border-gray-200 outline-none text-[12px]" 
                />
              </div>

            </div>
          </div>

          {!reportData && !loadingReport && (
            <div className="text-center py-16 rounded-xl border border-dashed border-gray-300" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <Calendar className="mx-auto text-gray-400 mb-3" size={40} />
              <p className="text-gray-600 font-medium">Establezca un rango de fechas para procesar las métricas de compras.</p>
            </div>
          )}

          {loadingReport && (
            <div className="text-center py-16 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-indigo-600 font-medium animate-pulse">Procesando registros de logística, proveedores y productos...</p>
            </div>
          )}

          {reportData && (
            <div id="reporteOrdenes" className="space-y-8 bg-white p-6 rounded-2xl border border-gray-200">
              
              {/* METADATOS / METRICAS CLAVE */}
              <div className="p-4 rounded-xl border border-gray-200 text-xs text-gray-600 flex flex-wrap gap-y-2 justify-between items-center divide-x divide-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                <div className="px-4">INVERSIÓN TOTAL: <span className="text-indigo-600 font-bold">${reportData.inversion_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                <div className="px-4">ÓRDENES REGISTRADAS: <span className="text-gray-900 font-bold">{reportData.total_ordenes} ops</span></div>
                <div className="px-4">COSTO PROMEDIO: <span className="text-emerald-600 font-bold">${reportData.orden_promedio.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                <div className="px-4">PENDIENTES: <span className="text-amber-600 font-bold">{reportData.pendientes}</span></div>
                <div className="px-4">COMPLETADAS: <span className="text-emerald-600 font-bold">{reportData.completadas}</span></div>
              </div>

              {/* CURVA TEMPORAL DE COMPRAS */}
              <div id="chart-tendencia-compras" className="p-5 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                <h3 className="text-base font-bold mb-4  text-gray-900 flex items-center gap-2">
                  <h3 size={18} className="text-indigo-600"/>📈 Curva Temporal de Inversión en Compras
                </h3>
                <ResponsiveContainer width="100%" height={230}>
                  <AreaChart data={reportData.tendencia_compras}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="fecha" stroke="#718096" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#718096" tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Inversión Base']} />
                    <Area type="monotone" dataKey="inversion" name="Inversión ($)" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.1} strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* SECCIÓN 1: LOGÍSTICA DE ENVÍO Y PRODUCTOS MÁS PEDIDOS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* A. LOGÍSTICA Y TIPOS DE ENVÍO */}
                <div className="rounded-xl border border-gray-200 p-5 overflow-hidden" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <Navigation size={18} className="text-blue-600" /> Logística y Tipos de Envío
                  </h3>

                  <div id="chart-tipos-envio" className="bg-white p-4 rounded-xl border border-gray-200 mb-4">
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={reportData.tipos_envio} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="tipo_envio" type="category" stroke="#475569" tick={{ fontSize: 11 }} width={100} />
                        <Tooltip formatter={(val, name) => [name === "cantidad" ? `${val} envíos` : `$${val.toLocaleString()}`, name === "cantidad" ? "Total Envíos" : "Costo Total"]} />
                        <Bar dataKey="cantidad" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Resumen en tarjetas */}
                  <div className="grid grid-cols-2 gap-2">
                    {reportData.tipos_envio?.map((env, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-bold text-gray-800">{env.tipo_envio}</p>
                          <p className="text-[10px] text-gray-500">{env.cantidad} órdenes</p>
                        </div>
                        <span className="text-xs font-bold text-indigo-600 font-mono">
                          ${env.total_invertido.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* B. PRODUCTOS MÁS ORDENADOS (TOP 10) */}
                <div className="rounded-xl border border-gray-200 overflow-hidden flex flex-col" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                  <div className="p-4 bg-white/50 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Package size={18} className="text-emerald-600" /> Productos / Insumos Más Ordenados
                    </h3>
                    <Award size={16} className="text-amber-500" />
                  </div>
                  <div className="overflow-y-auto max-h-[355px] bg-white flex-1">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200 sticky top-0">
                        <tr>
                          <th className="p-3">Producto</th>
                          <th className="p-3 text-center">Unidades</th>
                          <th className="p-3 text-right">Monto Gastado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono text-gray-600">
                        {reportData.productos_mas_ordenados?.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="p-4 text-center text-gray-400 font-sans">
                              Sin registro de ítems en el periodo seleccionado.
                            </td>
                          </tr>
                        ) : (
                          reportData.productos_mas_ordenados?.map((prod, idx) => (
                            <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                              <td className="p-3 font-sans text-gray-900 font-semibold flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-bold">
                                  {idx + 1}
                                </span>
                                {prod.producto || "Producto sin nombre"}
                              </td>
                              <td className="p-3 text-center text-gray-800 font-bold font-sans">
                                {prod.cantidad_total.toLocaleString()} u.
                              </td>
                              <td className="p-3 text-right text-emerald-600 font-bold font-mono">
                                ${prod.total_gastado.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* SECCIÓN 2: GRID DE PROVEEDORES Y ESTADOS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* TOP PROVEEDORES */}
                <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                  <div className="p-4 bg-white/50 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Truck size={18} className="text-indigo-600" /> Inversión por Proveedor (Top 10)
                    </h3>
                    <span className="text-xs text-gray-500 font-medium">{reportData.ventas_proveedores?.length || 0} Proveedores</span>
                  </div>
                  <div className="overflow-y-auto max-h-[310px] bg-white">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200 sticky top-0">
                        <tr>
                          <th className="p-3">Proveedor</th>
                          <th className="p-3 text-center">Órdenes</th>
                          <th className="p-3 text-right">Total Invertido</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono text-gray-600">
                        {reportData.ventas_proveedores?.map((p, idx) => (
                          <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                            <td className="p-3 font-sans text-gray-900 font-semibold">{p.proveedor}</td>
                            <td className="p-3 text-center text-gray-700 font-bold">{p.total_ordenes} ops.</td>
                            <td className="p-3 text-right text-indigo-600 font-bold font-mono">
                              ${p.total_invertido.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* DISTRIBUCIÓN POR ESTADO DE ÓRDENES */}
                <div className="rounded-xl border border-gray-200 overflow-hidden p-4" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                    <PieIcon size={18} className="text-amber-500" /> Distribución por Estado
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-white p-3 rounded-xl border border-gray-200">
                    <div id="chart-distribucion-estados" className="h-[180px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={reportData.distribucion_estados}
                            dataKey="total_monto"
                            nameKey="estado"
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={65}
                            paddingAngle={4}
                          >
                            {reportData.distribucion_estados?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS_ESTADOS[index % COLORS_ESTADOS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Monto']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-gray-700">
                        <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200">
                          <tr>
                            <th className="p-2">Estado</th>
                            <th className="p-2 text-center">Cant.</th>
                            <th className="p-2 text-right">Monto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-mono text-gray-600">
                          {reportData.distribucion_estados?.map((est, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="p-2 font-sans font-semibold text-gray-900 flex items-center gap-1.5">
                                <span 
                                  className="w-2.5 h-2.5 rounded-full inline-block" 
                                  style={{ backgroundColor: COLORS_ESTADOS[idx % COLORS_ESTADOS.length] }} 
                                />
                                {est.estado}
                              </td>
                              <td className="p-2 text-center font-sans">{est.cantidad}</td>
                              <td className="p-2 text-right font-bold text-gray-900">
                                ${est.total_monto.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>

              {/* TABLA DE AUDITORÍA: REGISTRO DE ÓRDENES RELEVANTES */}
              <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                <div className="p-4 bg-white/50 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <FileText size={16} className="text-indigo-600" /> Registro de Órdenes Relevantes
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">Últimas 15 operaciones</span>
                </div>
                <div className="overflow-x-auto bg-white">
                  <table className="w-full text-left text-xs text-gray-700">
                    <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="p-3"># Orden</th>
                        <th className="p-3">Proveedor</th>
                        <th className="p-3">Sucursal</th>
                        <th className="p-3">Fecha Orden</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3">Tipo Envío</th>
                        <th className="p-3 text-right">Costo Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-mono text-gray-600">
                      {reportData.detalle_ordenes?.map((ord) => (
                        <tr key={ord.Id_orden_compra} className="hover:bg-gray-50">
                          <td className="p-3 font-bold text-indigo-600">#{ord.Id_orden_compra}</td>
                          <td className="p-3 font-sans text-gray-900 font-semibold">{ord.proveedor || "N/A"}</td>
                          <td className="p-3 font-sans text-gray-600">{ord.sucursal || "N/A"}</td>
                          <td className="p-3 font-sans text-gray-500">{ord.fecha_orden}</td>
                          <td className="p-3 font-sans">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ord.Estado?.toLowerCase() === 'pendiente'
                                  ? 'bg-amber-100 text-amber-800'
                                  : ['completada', 'entregada'].includes(ord.Estado?.toLowerCase())
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {ord.Estado}
                            </span>
                          </td>
                          <td className="p-3 font-sans text-gray-500">{ord.Tipo_envio || "Estándar"}</td>
                          <td className="p-3 text-right text-gray-900 font-bold">
                            ${ord.Costo_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BOTÓN EXPORTAR A PDF */}
              <div className="download-btn-container pt-4 flex justify-end border-t border-gray-200">
                <button 
                  onClick={generatePDF} 
                  disabled={exportando}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Download size={14} /> {exportando ? "Generando PDF de Órdenes..." : "Exportar Reporte de Órdenes a PDF (Formato A4)"}
                </button>
              </div>

            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default OrdersPage;