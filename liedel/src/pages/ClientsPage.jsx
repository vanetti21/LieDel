import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import { pdf } from "@react-pdf/renderer";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Users,
  Crown,
  HeartHandshake,
  UserX,
  Download,
  Calendar,
  DollarSign,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Award,
  Phone,
  Repeat,
} from "lucide-react";

import StatCard from "../components/common/StatCard";
import ReporteClientesPDF from "../components/reports/ReporteClientes";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ec4899"];

const ClientsPage = () => {
  const navigate = useNavigate();

  // --- ESTADOS DE STATCARDS ---
  const [stats, setStats] = useState({
    total_clients: 0,
    vip_clients: 0,
    loyal_clients: 0,
    inactive_clients: 0,
  });

  // --- ESTADOS DE REPORTE Y AUDITORÍA ---
  const hoy = new Date().toISOString().split("T")[0];
  const haceUnAno = new Date(
    new Date().setFullYear(new Date().getFullYear() - 1),
  )
    .toISOString()
    .split("T")[0];

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(haceUnAno);
  const [fechaFin, setFechaFin] = useState(hoy);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  // Helper de formato compacto, agrégalo arriba del componente o en un archivo de utils
  const formatCompact = (num) => {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(num);
  };

  const formatFull = (num) => {
    return num.toLocaleString("en-US", { minimumFractionDigits: 2 });
  };

  // --- FETCH DE STATCARDS ---
  useEffect(() => {
    fetch("http://localhost:5000/api/client-stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Error cargando stats de clientes:", err));
  }, []);

  // --- FETCH DE REPORTE ---
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

  // --- GENERACIÓN DE PDF NATIVO CON @REACT-PDF/RENDERER Y CAPTURA DE GRÁFICOS ---
  const generatePDF = async () => {
    try {
      setGenerandoPDF(true);

      const chartEvolucionEl = document.querySelector(
        "#chart-evolucion-clientes",
      );
      const chartSegmentacionEl = document.querySelector("#chart-segmentacion");

      let imgEvolucion = null;
      let imgSegmentacion = null;

      if (chartEvolucionEl) {
        const canvas = await html2canvas(chartEvolucionEl, { scale: 2 });
        imgEvolucion = canvas.toDataURL("image/png");
      }

      if (chartSegmentacionEl) {
        const canvas = await html2canvas(chartSegmentacionEl, { scale: 2 });
        imgSegmentacion = canvas.toDataURL("image/png");
      }

      const blob = await pdf(
        <ReporteClientesPDF
          data={data}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          chartImages={{
            evolucionClientes: imgEvolucion,
            segmentacion: imgSegmentacion,
          }}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Auditoria_Clientes_${fechaInicio}_a_${fechaFin}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al generar el PDF de clientes:", error);
    } finally {
      setGenerandoPDF(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto relative z-10 font-sans">
      <main className="max-w-7xl mx-auto py-8 px-4 lg:px-8">
        {/* 1. TARJETAS DE ESTADÍSTICAS GENERALES (STATCARDS) */}
        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <StatCard
            name="Cantidad de Clientes"
            icon={Users}
            value={stats.total_clients}
            color="#6366F1"
            onClick={() => navigate("/clients/list")}
          />

          <StatCard
            name="Clientes VIP"
            icon={Crown}
            value={stats.vip_clients}
            color="#F59E0B"
            onClick={() => navigate("/clients/vip")}
          />
        </motion.div>

        {/* ================= TARJETA BLANCA EXTERIOR (envuelve filtro + reporte) ================= */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-gray-800 font-sans mb-8">
          {/* 2. PANEL SUPERIOR DE FILTRADO POR FECHAS */}
          <div
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 border border-gray-200 p-5 rounded-xl"
            style={{ backgroundColor: "rgb(240, 243, 249)" }}
          >
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Auditoría Comercial y Retención de Clientes
              </h2>
              <p className="text-xs text-gray-500">
                Análisis del valor financiero aportado por rango de fechas y
                segmentación de cartera.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200 w-full lg:w-auto">
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
              <button
                onClick={fetchClientes}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95 ml-auto lg:ml-0"
              >
                <RefreshCw
                  size={13}
                  className={loading ? "animate-spin" : ""}
                />{" "}
                Analizar Periodo
              </button>
            </div>
          </div>

          {/* INDICADOR DE CARGA */}
          {loading && (
            <div
              className="text-center py-20 rounded-xl border border-gray-200"
              style={{ backgroundColor: "rgb(240, 243, 249)" }}
            >
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-indigo-600 font-medium text-sm">
                Extrayendo transacciones y calculando flujos de consumo
                comercial...
              </p>
            </div>
          )}

          {/* 3. VISTA DE REPORTES Y AUDITORÍA */}
          {data && !loading && (
            <div id="reporteClientesCanvas" className="space-y-8">
              {/* TARJETAS DE KPIS COMERCIALES */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div
                  className="p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm"
                  style={{ backgroundColor: "rgb(240, 243, 249)" }}
                >
                  <div className="p-3 bg-green-100 text-green-600 rounded-lg shrink-0">
                    <DollarSign size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                      Recaudación Total
                    </span>
                    <span
                      className="text-xl font-black text-green-600 font-mono cursor-help"
                      title={`$${formatFull(data.facturacion_total)}`}
                    >
                      ${formatCompact(data.facturacion_total)}
                    </span>
                    <p className="text-[9px] text-gray-500 mt-0.5">
                      Ingreso bruto neto facturado.
                    </p>
                  </div>
                </div>

                <div
                  className="p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm"
                  style={{ backgroundColor: "rgb(240, 243, 249)" }}
                >
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
                    <Users size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                      Clientes Compradores
                    </span>
                    <span className="text-xl font-black text-indigo-600 font-mono">
                      {data.clientes_activos.toLocaleString()} Únicos
                    </span>
                    <p className="text-[9px] text-gray-500 mt-0.5">
                      Clientes que generaron ingresos.
                    </p>
                  </div>
                </div>

                <div
                  className="p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm"
                  style={{ backgroundColor: "rgb(240, 243, 249)" }}
                >
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-lg shrink-0">
                    <ShoppingBag size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                      Transacciones Totales
                    </span>
                    <span className="text-xl font-black text-amber-600 font-mono">
                      {data.total_transacciones} Ventas
                    </span>
                    <p className="text-[9px] text-gray-500 mt-0.5">
                      Volumen de tickets emitidos.
                    </p>
                  </div>
                </div>

                <div
                  className="p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm"
                  style={{ backgroundColor: "rgb(240, 243, 249)" }}
                >
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-lg shrink-0">
                    <TrendingUp size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                      Consumo Promedio
                    </span>
                    <span
                      className="text-xl font-black text-purple-600 font-mono cursor-help"
                      title={`$${formatFull(data.ticket_promedio_general)}`}
                    >
                      ${formatCompact(data.ticket_promedio_general)}
                    </span>
                    <p className="text-[9px] text-gray-500 mt-0.5">
                      Valor medio del ticket emitido.
                    </p>
                  </div>
                </div>

                {/* NUEVO: CICLO PROMEDIO ENTRE COMPRAS */}
                <div className="p-4 rounded-xl border border-gray-200 flex items-center gap-3 shadow-sm bg-[rgb(240,243,249)]">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                    <Repeat size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                      Ciclo Recompra
                    </span>
                    <span className="text-lg font-black text-blue-600 font-mono">
                      {data.ciclo_dias_promedio || 0} Días
                    </span>
                    <p className="text-[9px] text-gray-500 mt-0.5">
                      Frecuencia entre compras.
                    </p>
                  </div>
                </div>
              </div>

              {/* EVOLUCIÓN HISTÓRICA DEL MES */}
              <div
                id="chart-evolucion-clientes"
                className="p-5 rounded-xl border border-gray-200"
                style={{ backgroundColor: "rgb(240, 243, 249)" }}
              >
                <h3 className="text-sm font-bold mb-1 text-gray-900 flex items-center gap-2">
                  📈 Tendencia de Ingresos y Tráfico de Compradores
                </h3>
                <p className="text-[12px] text-gray-500 mb-4">
                  Comportamiento financiero temporal según el ciclo de ventas.
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart
                    data={data.evolucion_clientes}
                    margin={{ top: 5, right: 19, left: -1, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value) => [
                        `$${value.toLocaleString()}`,
                        "Ingreso Neto Realizado",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="ingresos"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* SEGMENTACIÓN Y TOP CLIENTES */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CARTERA POR SEGMENTO (CON TABLA DESGLOSADA) */}
                <div className="lg:col-span-1 p-5 rounded-xl border border-gray-200 flex flex-col justify-between bg-[rgb(240,243,249)]">
                  <div>
                    <h3 className="text-sm font-bold mb-1 text-gray-900 flex items-center gap-2">
                      <Award size={16} className="text-indigo-600" /> Cartera
                      por Segmento
                    </h3>
                    <p className="text-[12px] text-gray-500 mb-3">
                      División por volumen de capital inyectado.
                    </p>
                  </div>

                  {/* GRÁFICO REDUCIDO / CENTRADO */}
                  <div id="chart-segmentacion" className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.segmentacion}
                          dataKey="aporte_financiero"
                          nameKey="segmento"
                          cx="50%"
                          cy="50%"
                          innerRadius={68}
                          outerRadius={100}
                          paddingAngle={3}
                        >
                          {data.segmentacion.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [
                            `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                            "Total Aportado",
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* TABLA TABULAR DE SEGMENTOS */}
                  <div className="mt-3 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-gray-100 text-gray-500 uppercase font-bold border-b border-gray-200">
                        <tr>
                          <th className="p-2">Segmento</th>
                          <th className="p-2 text-center">Clientes</th>
                          <th className="p-2 text-right">Total Aportado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono">
                        {data.segmentacion.map((seg, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="p-2 font-sans font-semibold flex items-center gap-1.5 text-gray-800">
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                                style={{
                                  backgroundColor: COLORS[idx % COLORS.length],
                                }}
                              />
                              <span
                                className="truncate max-w-[90px]"
                                title={seg.segmento}
                              >
                                {seg.segmento.split(" ")[0]}
                              </span>
                            </td>
                            <td className="p-2 text-center text-gray-600 font-sans">
                              {seg.cantidad_clientes}
                            </td>
                            <td className="p-2 text-right font-bold text-emerald-600">
                              $
                              {Number(
                                seg.aporte_financiero || 0,
                              ).toLocaleString("en-US", {
                                minimumFractionDigits: 0,
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* TOP 10 CLIENTES */}
                <div
                  className="lg:col-span-2 rounded-xl border border-gray-200 overflow-hidden flex flex-col"
                  style={{ backgroundColor: "rgb(240, 243, 249)" }}
                >
                  <div className="p-4 bg-white/50 border-b border-gray-200 flex items-center gap-2">
                    <Award size={16} className="text-amber-500" />
                    <h3 className="text-sm font-bold text-gray-900">
                      Ranking Top Clientes de Mayor Valor (CLV)
                    </h3>
                  </div>
                  <div className="overflow-x-auto bg-white flex-grow">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200">
                        <tr>
                          <th className="p-2.5 pl-4">Cliente</th>
                          <th className="p-2.5 text-center">Frecuencia</th>
                          <th className="p-2.5 text-right">Ticket Promedio</th>
                          <th className="p-2.5 text-right pr-4">
                            Total Aportado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 font-mono text-gray-600">
                        {data.top_clientes.length === 0 ? (
                          <tr>
                            <td
                              colSpan="4"
                              className="p-6 text-center text-gray-400 font-sans"
                            >
                              ❌ Ninguna transacción registrada en este rango
                              temporal.
                            </td>
                          </tr>
                        ) : (
                          data.top_clientes.map((cl, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="p-2.5 pl-4 font-sans text-gray-900 font-semibold flex flex-col">
                                <span>{cl.cliente}</span>
                                <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                                  <Phone size={10} />{" "}
                                  {cl.Contacto_telefono || cl.Telefono || "S/N"}
                                </span>
                              </td>
                              <td className="p-2.5 text-center font-sans text-gray-600 font-medium">
                                {cl.compras_realizadas} trans.
                              </td>
                              <td className="p-2.5 text-right text-indigo-600 font-bold">
                                $
                                {cl.ticket_promedio.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td className="p-2.5 text-right text-green-600 font-black pr-4">
                                $
                                {cl.total_gastado.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                })}
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
              <div className="download-btn-container pt-4 flex justify-end border-t border-gray-200">
                <button
                  onClick={generatePDF}
                  disabled={generandoPDF}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  <Download size={14} />{" "}
                  {generandoPDF
                    ? "Generando PDF de Clientes..."
                    : `Exportar Auditoría de Clientes (${fechaInicio} a ${fechaFin})`}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientsPage;