import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { pdf } from "@react-pdf/renderer";

import StatCard from "../components/common/StatCard";
import ReporteVentasPDF from "../components/reports/ReporteVentas";

import { 
  CreditCard, DollarSign, TrendingUp, ShoppingBag, 
  Download, Calendar, Table, Users, BarChart2, Tag, Building2, UserCheck, Package, Globe, Store
} from "lucide-react";

import { 
  ResponsiveContainer, AreaChart, Area, ComposedChart, Bar, Line,
  PieChart, Pie, Cell, Tooltip, Legend, XAxis, YAxis, CartesianGrid
} from "recharts";

const SalesPage = () => {
  const navigate = useNavigate();

  // Estados de StatCards superiores
  const [salesStats, setSalesStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    salesGrowth: 0,
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
  
  const COLORS_PAGO = ["#10B981", "#6366F1", "#8B5CF6", "#F59E0B", "#EC4899"];

  // Filtro de Sucursales
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("todas");

  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [exportando, setExportando] = useState(false);

  // 1. Cargar tarjetas estadísticas superiores
  useEffect(() => {
    fetch("http://localhost:5000/sales_stats")
      .then((res) => res.json())
      .then((data) => setSalesStats(data))
      .catch((err) => console.error("Error al cargar stats:", err));
  }, []);

  // 2. Cargar lista de sucursales para el select
  useEffect(() => {
    fetch("http://localhost:5000/api/sucursales")
      .then((res) => res.json())
      .then((data) => setBranches(data))
      .catch((err) => console.error("Error al cargar sucursales:", err));
  }, []);

  // 3. Cargar reporte general (Reacciona a fecha inicio, fecha fin y sucursal)
  useEffect(() => {
    if (!startDate || !endDate) return;

    const fetchReport = async () => {
      try {
        setLoadingReport(true);
        const res = await fetch(
          `http://localhost:5000/api/reporte-ventas?inicio=${startDate}&fin=${endDate}&sucursal=${selectedBranch}`
        );
        if (!res.ok) throw new Error("Error en el servidor");
        const result = await res.json();
        setReportData(result);
      } catch (error) {
        console.error("Error cargando el reporte de ventas: ", error);
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

      const chartTendenciaEl = document.querySelector("#chart-tendencia-ventas");
      const chartCanalesEl = document.querySelector("#chart-canales-venta");
      const chartVolumenEl = document.querySelector("#chart-volumen-recaudacion");

      let imgTendencia = null;
      let imgCanales = null;
      let imgVolumen = null;

      if (chartTendenciaEl) {
        const canvas = await html2canvas(chartTendenciaEl, { scale: 2 });
        imgTendencia = canvas.toDataURL("image/png");
      }

      if (chartCanalesEl) {
        const canvas = await html2canvas(chartCanalesEl, { scale: 2 });
        imgCanales = canvas.toDataURL("image/png");
      }

      if (chartVolumenEl) {
        const canvas = await html2canvas(chartVolumenEl, { scale: 2 });
        imgVolumen = canvas.toDataURL("image/png");
      }

      const blob = await pdf(
        <ReporteVentasPDF
          reportData={reportData}
          startDate={startDate}
          endDate={endDate}
          chartImages={{
            tendenciaVentas: imgTendencia,
            canalesVenta: imgCanales,
            volumenVsRecaudacion: imgVolumen,
          }}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Reporte_Ventas_${startDate}_A_${endDate}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al generar el PDF de ventas:", error);
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <main className='max-w-7xl mx-auto py-8 px-4 lg:px-8'>

        {/* 1. STAT CARDS */}
        <motion.div
          className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            name='Total Recaudado'
            icon={DollarSign}
            value={`$${(salesStats?.totalRevenue || salesStats?.totalSales || 0).toLocaleString("es-DO", { minimumFractionDigits: 2 })}`}
            color='#6366F1'
          />

          <div 
            onClick={() => navigate("/sales/list")} 
            className="cursor-pointer transition-transform hover:scale-[1.02]"
            title="Haz clic para ver el detalle de todas las ventas"
          >
            <StatCard
              name='Ventas Realizadas'
              icon={ShoppingBag}
              value={(salesStats?.totalOrders || 0).toLocaleString("es-DO")}  
              color='#10B981'
            />
          </div>

          <StatCard
            name='Promedio de Orden'
            icon={TrendingUp}
            value={`$${(salesStats?.averageOrderValue || 0).toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            color='#F59E0B'
          />

          <StatCard
            name='Aumento de ventas'
            icon={CreditCard}
            value={`${salesStats?.salesGrowth || 0}%`}
            color='#EF4444'
          />
        </motion.div>

        {/* 2. REPORTE DE VENTAS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-gray-800 font-sans mb-8">
          
         {/* HEADER DE CONTROL: SUCURSAL Y FECHAS (DISEÑO TIPO PASTILLA) */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 border border-gray-200 p-5 rounded-xl bg-[#f0f3f9]">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Auditoría Comercial y de Ventas
              </h2>
              <p className="text-xs text-gray-500">
                Monitoreo de ingresos corrientes, volumen transaccional y rentabilidad por sucursal.
              </p>
            </div>

            {/* CONTENEDOR TIPO PASTILLA (EN UNA SOLA LÍNEA) */}
            <div className="flex items-center gap-2 bg-white p-4 px-3 rounded-2xl shadow-sm border border-gray-200 shrink-0 whitespace-nowrap">
              
              {/* FILTRO SUCURSAL */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <Building2 size={15} className="text-indigo-600 shrink-0" /> 
                <span>Sucursal:</span>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="bg-slate-100 hover:bg-slate-200 text-gray-900 px-2 py-1 rounded-lg text-xs font-bold border border-gray-200 outline-none cursor-pointer transition-colors max-w-[160px] truncate"
                >
                  <option value="todas">🏢 Todas las Sucursales</option>
                  {branches.map((suc) => (
                    <option key={suc.Id_sucursal} value={suc.Id_sucursal}>
                      📍 {suc.Nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* SEPARADOR VERTICAL */}
              <div className="w-[1px] h-5 bg-gray-200 mx-1" />

              {/* FILTRO DESDE */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <Calendar size={14} className="text-gray-500 shrink-0" /> 
                <span>Desde:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-100 hover:bg-slate-200 text-gray-900 px-2 py-1 rounded-lg text-xs font-bold border border-gray-200 outline-none cursor-pointer transition-colors"
                />
              </div>

              {/* SEPARADOR VERTICAL */}
              <div className="w-[1px] h-5 bg-gray-200 mx-1" />

              {/* FILTRO HASTA */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <span>Hasta:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-100 hover:bg-slate-200 text-gray-900 px-2 py-1 rounded-lg text-xs font-bold border border-gray-200 outline-none cursor-pointer transition-colors"
                />
              </div>

            </div>
          </div>

          {!reportData && !loadingReport && (
            <div className="text-center py-16 rounded-xl border border-dashed border-gray-300" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <Calendar className="mx-auto text-gray-400 mb-3" size={40} />
              <p className="text-gray-600 font-medium">Establezca un rango de fechas en el panel superior para procesar las métricas de ingresos.</p>
            </div>
          )}

          {loadingReport && (
            <div className="text-center py-16 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-indigo-600 font-medium animate-pulse">Cruzando registros de facturación, clientes y sucursales...</p>
            </div>
          )}

          {reportData && (
            <div id="reporteVentas" className="space-y-8 bg-white p-6 rounded-2xl border border-gray-200">
              
              {/* METADATOS / METRICAS CLAVE EN UNA SOLA LÍNEA */}
              <div className="p-4 rounded-xl border border-gray-200 text-xs text-gray-600 flex flex-nowrap items-center justify-between overflow-x-auto whitespace-nowrap" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                <div className="px-3">INGRESOS NETOS: <span className="text-green-600 font-bold">${reportData.ingresos_totales?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                <div className="w-[1px] h-4 bg-gray-300" />
                <div className="px-3">TRANSACCIONES: <span className="text-gray-900 font-bold">{reportData.transacciones_totales} ops</span></div>
                <div className="w-[1px] h-4 bg-gray-300" />
                <div className="px-3">TICKET PROMEDIO: <span className="text-indigo-600 font-bold">${reportData.ticket_promedio?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                <div className="w-[1px] h-4 bg-gray-300" />
                <div className="px-3">CAJERO TOP: <span className="text-amber-600 font-bold">{reportData.empleado_top}</span></div>
                <div className="w-[1px] h-4 bg-gray-300" />
                <div className="px-3">CLIENTE VIP: <span className="text-gray-900 font-bold">{reportData.cliente_top}</span></div>
              </div>

              {/* CURVA TEMPORAL */}
              <div id="chart-tendencia-ventas" className="p-5 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                <h3 className="text-base font-bold mb-4 text-gray-900 flex items-center gap-2">📈 Curva Temporal de Recaudación Diaria</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={reportData.tendencia_ventas}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="fecha" stroke="#718096" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#718096" tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Ingresos Base']} />
                    <Area type="monotone" dataKey="ingresos" name="Ingresos ($)" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.1} strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* TABLA DE EMPLEADOS + TABLA DE CATEGORÍAS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. TABLA CUOTA DE FACTURACIÓN POR EMPLEADO */}
                <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                  <div className="p-4 bg-white/50 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Users size={18} className="text-indigo-600" /> Cuota de Facturación por Empleado
                    </h3>
                    <span className="text-xs text-gray-500 font-medium">{reportData.ventas_empleados?.length || 0} Empleados</span>
                  </div>
                  <div className="overflow-y-auto max-h-[300px] bg-white">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200 sticky top-0">
                        <tr>
                          <th className="p-3">Empleado</th>
                          <th className="p-3 text-right">% Cuota</th>
                          <th className="p-3 text-right">Total Facturado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono text-gray-600">
                        {reportData.ventas_empleados?.map((emp, idx) => {
                          const porcentaje = reportData.ingresos_totales > 0 
                            ? ((emp.total_facturado / reportData.ingresos_totales) * 100).toFixed(1) 
                            : 0;

                          return (
                            <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                              <td className="p-3 font-sans text-gray-900 font-semibold">{emp.empleado}</td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="font-bold text-indigo-600">{porcentaje}%</span>
                                  <div className="w-12 bg-gray-200 rounded-full h-1.5 hidden sm:block">
                                    <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${Math.min(porcentaje, 100)}%` }} />
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-right text-emerald-600 font-bold font-mono">
                                ${emp.total_facturado?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* 2. TABLA VENTAS POR CATEGORÍA */}
                <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                  <div className="p-4 bg-white/50 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Tag size={18} className="text-amber-500" /> Rendimiento por Categoría
                    </h3>
                    <span className="text-xs text-gray-500 font-medium">{reportData.ventas_categorias?.length || 0} Categorías</span>
                  </div>
                  <div className="overflow-y-auto max-h-[300px] bg-white">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200 sticky top-0">
                        <tr>
                          <th className="p-3">Categoría</th>
                          <th className="p-3 text-center">Unidades</th>
                          <th className="p-3 text-right">Total Facturado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono text-gray-600">
                        {reportData.ventas_categorias && reportData.ventas_categorias.length > 0 ? (
                          reportData.ventas_categorias.map((cat, idx) => {
                            const total = Number(cat?.total_facturado || 0);
                            const unidades = Number(cat?.unidades_vendidas || 0);

                            return (
                              <tr key={idx} className="hover:bg-amber-50/40 transition-colors">
                                <td className="p-3 font-sans text-gray-900 font-semibold">{cat?.categoria || "Sin Categoría"}</td>
                                <td className="p-3 text-center text-gray-700 font-bold">{unidades} u.</td>
                                <td className="p-3 text-right text-emerald-600 font-bold font-mono">
                                  ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="3" className="p-4 text-center text-gray-400 font-sans">
                              Sin datos de categorías en este rango
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* CONTENEDOR GRID DE 2 COLUMNAS: CLIENTES Y PRODUCTOS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. TABLA TOP 10 CLIENTES VIP */}
                <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                  <div className="p-4 bg-white/50 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <UserCheck size={18} className="text-emerald-600" /> Top 10 Clientes con Mayor Facturación
                    </h3>
                    <span className="text-xs text-gray-500 font-medium">{reportData.top_clientes?.length || 0} Clientes</span>
                  </div>
                  <div className="overflow-x-auto bg-white">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200">
                        <tr>
                          <th className="p-3 text-center">#</th>
                          <th className="p-3">Cliente</th>
                          <th className="p-3 text-center">Compras</th>
                          <th className="p-3 text-right">Total Acumulado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono text-gray-600">
                        {reportData.top_clientes && reportData.top_clientes.length > 0 ? (
                          reportData.top_clientes.map((cli, idx) => (
                            <tr key={cli.Id_cliente || idx} className="hover:bg-emerald-50/40 transition-colors">
                              <td className="p-3 text-center font-bold text-gray-400 font-sans">
                                {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                              </td>
                              <td className="p-3 font-sans text-gray-900 font-semibold">{cli.cliente}</td>
                              <td className="p-3 text-center text-gray-700 font-semibold">{cli.total_compras} ops.</td>
                              <td className="p-3 text-right text-emerald-600 font-bold font-mono">
                                ${cli.total_gastado?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="p-4 text-center text-gray-400 font-sans">
                              Sin datos de clientes en este rango
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. TABLA TOP 10 PRODUCTOS MÁS VENDIDOS */}
                <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                  <div className="p-4 bg-white/50 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Package size={18} className="text-indigo-600" /> Top 10 Productos Más Vendidos
                    </h3>
                    <span className="text-xs text-gray-500 font-medium">{reportData.top_productos?.length || 0} Productos</span>
                  </div>
                  <div className="overflow-x-auto bg-white">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200">
                        <tr>
                          <th className="p-3 text-center">#</th>
                          <th className="p-3">Producto</th>
                          <th className="p-3 text-center">Unidades</th>
                          <th className="p-3 text-right">Total Generado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono text-gray-600">
                        {reportData.top_productos && reportData.top_productos.length > 0 ? (
                          reportData.top_productos.map((prod, idx) => (
                            <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                              <td className="p-3 text-center font-bold text-gray-400 font-sans">
                                {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                              </td>
                              <td className="p-3 font-sans text-gray-900 font-semibold">{prod.producto}</td>
                              <td className="p-3 text-center text-indigo-600 font-bold">{prod.unidades_vendidas} u.</td>
                              <td className="p-3 text-right text-emerald-600 font-bold font-mono">
                                ${prod.total_generado?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="p-4 text-center text-gray-400 font-sans">
                              Sin datos de productos en este rango
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* DESGLOSE POR CANAL DE VENTA */}
              <div className="rounded-xl border border-gray-200 p-5 overflow-hidden" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Globe size={18} className="text-indigo-600" /> Distribución por Canal de Venta
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">Origen de las Ventas</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-white p-4 rounded-xl border border-gray-200">
                  
                  {/* 1. Gráfico de Dona */}
                  <div id="chart-canales-venta" className="h-[200px] w-full">
                    {reportData.canales_venta && reportData.canales_venta.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={reportData.canales_venta}
                            dataKey="total_monto"
                            nameKey="canal"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={4}
                          >
                            {reportData.canales_venta.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS_PAGO[index % COLORS_PAGO.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Monto Total']} 
                          />
                          <Legend
                            verticalAlign="bottom"
                            align="center"
                            content={({ payload }) => (
                              <div className="w-full flex flex-wrap justify-center gap-x-4 gap-y-2 mt-1 pt-1 pb-1 px-2">
                                {payload?.map((entry, index) => (
                                  <span
                                    key={`legend-item-${index}`}
                                    className="whitespace-nowrap text-sm font-medium text-gray-700"
                                  >
                                    <span style={{ color: entry.color, fontSize: 18 }}>●</span> {entry.value}
                                  </span>
                                ))}
                              </div>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">
                        Sin registros de canales de venta
                      </div>
                    )}
                  </div>

                  {/* 2. Tabla de Detalle */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200">
                        <tr>
                          <th className="p-2">Canal</th>
                          <th className="p-2 text-center">Ops.</th>
                          <th className="p-2 text-right">Monto Generado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono text-gray-600">
                        {reportData.canales_venta?.map((c, idx) => {
                          const porcentaje = reportData.ingresos_totales > 0 
                            ? ((c.total_monto / reportData.ingresos_totales) * 100).toFixed(1) 
                            : 0;

                          return (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="p-2 font-sans font-semibold text-gray-900 flex items-center gap-2">
                                <span 
                                  className="w-2.5 h-2.5 rounded-full inline-block" 
                                  style={{ backgroundColor: COLORS_PAGO[idx % COLORS_PAGO.length] }} 
                                />
                                {c.canal}
                              </td>
                              <td className="p-2 text-center font-sans text-gray-600">{c.operaciones}</td>
                              <td className="p-2 text-right font-bold text-gray-900">
                                ${c.total_monto?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                <span className="block text-[10px] text-gray-400 font-normal">{porcentaje}% del total</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>

              {/* MÉTRICAS ADICIONALES */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* GRÁFICA COMBINADA */}
                <div id="chart-volumen-recaudacion" className="lg:col-span-3 p-5 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                  <h3 className="text-sm font-bold mb-1 text-gray-900 flex items-center gap-2">
                    <h3 size={18} className="text-indigo-600" />📊 Rendimiento Diario: Volumen de Ventas vs Dinero Recaudado
                  </h3>
                  <p className="text-[11px] text-gray-500 mb-4">Comparativa directa entre transacciones cobradas (barras) y capital bruto ingresado (línea).</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart data={reportData.volumen_vs_recaudacion}>
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

              {/* TABLAS DE AUDITORÍA OPERATIVA */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* GRANDES TRANSACCIONES */}
                <div className="xl:col-span-3 rounded-xl border border-gray-200 overflow-hidden" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
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
                        {reportData.top_transacciones?.map((trans, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="p-3 font-bold text-indigo-600">#00{trans.Id_venta}</td>
                            <td className="p-3 font-sans text-gray-500">{trans.Fecha_venta}</td>
                            <td className="p-3 font-sans text-gray-900 font-semibold">{trans.cliente}</td>
                            <td className="p-3 font-sans text-gray-600">{trans.empleado}</td>
                            <td className="p-3 text-right text-gray-900 font-bold">${trans.total?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* BOTÓN EXPORTAR A PDF */}
              <div className="download-btn-container pt-4 flex justify-end border-t border-gray-200">
                <button 
                  onClick={generatePDF} 
                  disabled={exportando}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Download size={14} /> {exportando ? "Generando PDF de Ventas..." : "Exportar Reporte de Ventas a PDF (Formato A4)"}
                </button>
              </div>

            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default SalesPage;