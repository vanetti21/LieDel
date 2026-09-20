import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCheck,
  UsersIcon,
  UserX,
  Calendar,
  RefreshCw,
  DollarSign,
  Briefcase,
  TrendingUp,
  FileText,
  Percent,
  Download,
  UserPlus,
  Award,
  Building2,
  PieChart as PieIcon,
  BarChart2,
} from "lucide-react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { pdf } from "@react-pdf/renderer";
import ReporteEmpleadosPDF from "../components/reports/ReporteEmpleados";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import StatCard from "../components/common/StatCard";

const UsersPage = () => {
  const navigate = useNavigate();

  // 1. STATCARDS
  const [data, setData] = useState({
    employees: 0,
    active: 0,
    churn_rate: 0,
  });

  useEffect(() => {
    fetch("http://localhost:5000/obtener_empleados")
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error("Error fetching empleados:", error));
  }, []);

  // 2. REPORTE, FILTROS Y SUCURSALES
  const hoy = new Date().toISOString().split("T")[0];
  const haceUnAno = new Date(
    new Date().setFullYear(new Date().getFullYear() - 1),
  )
    .toISOString()
    .split("T")[0];

  const [reporteData, setReporteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(haceUnAno);
  const [fechaFin, setFechaFin] = useState(hoy);

  const [exportando, setExportando] = useState(false);

  // Estados para sucursales
  const [sucursales, setSucursales] = useState([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState("todas");

  // Cargar lista de sucursales para el combo box
  useEffect(() => {
    fetch("http://localhost:5000/api/sucursales")
      .then((res) => res.json())
      .then((data) => setSucursales(data))
      .catch((err) => console.error("Error cargando sucursales:", err));
  }, []);

  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      const url = `http://localhost:5000/api/reporte-empleados?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}&id_sucursal=${sucursalSeleccionada}`;
      const res = await fetch(url);
      if (!res.ok)
        throw new Error("Error cargando analítica de rendimiento laboral");
      const result = await res.json();
      setReporteData(result);
    } catch (error) {
      console.error("Error cargando reporte de empleados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  // =========================================================
  // GENERACIÓN DE PDF (con @react-pdf/renderer)
  // Los tres gráficos de Recharts se capturan como imagen con
  // html2canvas a partir de sus contenedores (identificados por
  // id) y se le pasan a ReporteEmpleadosPDF. El resto del reporte
  // (KPIs, tabla) se dibuja nativamente en el PDF.
  // =========================================================
  const generatePDF = async () => {
    try {
      setExportando(true);

      // Identificadores de contenedor HTML donde renderizan los charts en el DOM
      const chartVentasEl = document.querySelector("#chart-evolucion-ventas");
      const chartContratacionesEl = document.querySelector(
        "#chart-contrataciones",
      );
      const chartCargosEl = document.querySelector(
        "#chart-distribucion-cargos",
      );

      let imgVentas = null;
      let imgContrataciones = null;
      let imgCargos = null;

      if (chartVentasEl) {
        const canvasVentas = await html2canvas(chartVentasEl, { scale: 2 });
        imgVentas = canvasVentas.toDataURL("image/png");
      }

      if (chartContratacionesEl) {
        const canvasContrataciones = await html2canvas(chartContratacionesEl, {
          scale: 2,
        });
        imgContrataciones = canvasContrataciones.toDataURL("image/png");
      }

      if (chartCargosEl) {
        const canvasCargos = await html2canvas(chartCargosEl, { scale: 2 });
        imgCargos = canvasCargos.toDataURL("image/png");
      }

      // Generar documento binario
      const blob = await pdf(
        <ReporteEmpleadosPDF
          reporteData={reporteData}
          startDate={fechaInicio}
          endDate={fechaFin}
          chartImages={{
            evolucionVentas: imgVentas,
            contrataciones: imgContrataciones,
            distribucionCargos: imgCargos,
          }}
        />,
      ).toBlob();

      // Disparar descarga automática
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Reporte_Empleados_${fechaInicio}_A_${fechaFin}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al generar el PDF de empleados:", error);
    } finally {
      setExportando(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const PALETA_CARGOS = [
    "#6366F1",
    "#10B981",
    "#dc9213",
    "#EC4899",
    "#8B5CF6",
    "#3B82F6",
  ];

  const getColorPuesto = (puesto) => {
    const lista = reporteData?.distribucion_cargos || [];
    const idx = lista.findIndex((c) => c.puesto === puesto);
    const color = PALETA_CARGOS[idx >= 0 ? idx % PALETA_CARGOS.length : 0];
    return { bg: `${color}1A`, text: color, border: `${color}4D` };
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <main className="max-w-7xl mx-auto py-8 px-4 lg:px-8">
        {/* STATS SUPERIORES (usando el componente StatCard compartido) */}
        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            name="Cantidad de Empleados registrados"
            icon={UsersIcon}
            value={data.employees}
            color="#6366F1"
            onClick={() => navigate("/Employees")}
          />

          <StatCard
            name="Cantidad de Empleados Activos"
            icon={UserCheck}
            value={data.active}
            color="#F59E0B"
          />

          <StatCard
            name="Tasa de despidos"
            icon={UserX}
            value={`${data.churn_rate}%`}
            color="#EF4444"
          />
        </motion.div>

        {/* SECCIÓN DE REPORTE Y ANALÍTICA */}
        <div className="p-6 bg-white rounded-2xl text-gray-800 font-sans shadow-sm border border-gray-200">
          {/* BARRA DE FILTRADO CON FECHAS Y SUCURSALES */}
          <div
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 border border-gray-200 p-5 rounded-xl"
            style={{ backgroundColor: "rgb(240, 243, 249)" }}
          >
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Auditoría de Rendimiento Laboral y Comisiones
              </h2>
              <p className="text-xs text-gray-500">
                Evaluación de metas comerciales y métricas operativas por rango
                de fecha y sucursal.
              </p>
            </div>

            <div className="flex flex-col gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200 w-full lg:w-auto">
              {/* FILA SUPERIOR: SUCURSAL + FECHAS */}
              <div className="flex flex-nowrap items-center gap-3">
                {/* FILTRO SUCURSAL CON TEXTO NEGRO */}
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 px-2 border-r border-gray-200">
                  <Building2 size={14} className="text-indigo-600" /> Sucursal:
                  <select
                    value={sucursalSeleccionada}
                    onChange={(e) => setSucursalSeleccionada(e.target.value)}
                    style={{ color: "#000000", backgroundColor: "#f1f5f9" }}
                    className="p-1.5 rounded-md text-xs font-bold border border-gray-300 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                  >
                    {/* Opción Todas */}
                    <option
                      value="todas"
                      style={{ color: "#000000", backgroundColor: "#ffffff" }}
                      className="font-bold py-1"
                    >
                      🏢 Todas las Sucursales
                    </option>

                    {/* Sucursales Dinámicas */}
                    {sucursales.map((suc, idx) => {
                      const fondos = ["#ffffff", "#f8fafc"];

                      return (
                        <option
                          key={suc.Id_sucursal}
                          value={suc.Id_sucursal}
                          style={{
                            color: "#000000",
                            backgroundColor: fondos[idx % fondos.length],
                          }}
                          className="font-semibold py-1"
                        >
                          📍 {suc.Nombre}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* FILTROS DE FECHAS */}
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

              {/* FILA INFERIOR: BOTÓN FILTRAR */}
              <button
                onClick={fetchEmpleados}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 w-full"
              >
                <RefreshCw
                  size={13}
                  className={loading ? "animate-spin" : ""}
                />{" "}
                Filtrar Nómina
              </button>
            </div>
          </div>

          {loading && (
            <div
              className="text-center py-20 rounded-xl border border-gray-200"
              style={{ backgroundColor: "rgb(240, 243, 249)" }}
            >
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-indigo-600 font-medium">
                Consolidando historiales de facturación y calculando comisiones
                de periodos...
              </p>
            </div>
          )}

          {reporteData && !loading && (
            <div
              id="reporteEmpleadosCanvas"
              className="space-y-8 bg-white p-6 rounded-2xl border border-gray-200"
            >
              {/* KPIS OPERATIVOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  className="p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm"
                  style={{ backgroundColor: "rgb(240, 243, 249)" }}
                >
                  <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                    <DollarSign size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                      Volumen Procesado
                    </span>
                    <span className="text-xl font-black text-green-600 font-mono">
                      $
                      {reporteData.total_recaudado.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <p className="text-[9px] text-gray-500 mt-0.5">
                      Dinero total facturado en caja.
                    </p>
                  </div>
                </div>

                <div
                  className="p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm"
                  style={{ backgroundColor: "rgb(240, 243, 249)" }}
                >
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Briefcase size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                      Tickets Despachados
                    </span>
                    <span className="text-xl font-black text-indigo-600 font-mono">
                      {reporteData.total_despachado.toLocaleString()} u.
                    </span>
                    <p className="text-[9px] text-gray-500 mt-0.5">
                      Operaciones ejecutadas con éxito.
                    </p>
                  </div>
                </div>

                <div
                  className="p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm"
                  style={{ backgroundColor: "rgb(240, 243, 249)" }}
                >
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
                    <UserCheck size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                      Personal Activo
                    </span>
                    <span className="text-xl font-black text-amber-600 font-mono">
                      {reporteData.empleados_activos} Colab.
                    </span>
                    <p className="text-[9px] text-gray-500 mt-0.5">
                      Cajeros/Asesores con transacciones.
                    </p>
                  </div>
                </div>

                <div
                  className="p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm"
                  style={{ backgroundColor: "rgb(240, 243, 249)" }}
                >
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                    <TrendingUp size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                      Media por Colaborador
                    </span>
                    <span className="text-xl font-black text-purple-600 font-mono">
                      $
                      {reporteData.rendimiento_medio_empleado.toLocaleString(
                        "en-US",
                        { minimumFractionDigits: 2 },
                      )}
                    </span>
                    <p className="text-[9px] text-gray-500 mt-0.5">
                      Cuota promedio de recaudación.
                    </p>
                  </div>
                </div>
              </div>

              {/* GRÁFICOS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. EVOLUCIÓN DE VENTAS */}
                <div
                  id="chart-evolucion-ventas"
                  className="p-5 rounded-xl border border-gray-200"
                  style={{ backgroundColor: "rgb(240, 243, 249)" }}
                >
                  <h3 className="text-sm font-bold mb-3 text-gray-900 flex items-center gap-2">                  
                    📈 Evolución Mensual de Carga Operativa en Ventas
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={reporteData.evolucion_laboral}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        formatter={(value) => [
                          `$${value.toLocaleString()}`,
                          "Monto Procesado",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="monto_procesado"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* 2. EVOLUCIÓN DE CONTRATACIONES CON PUNTOS */}
                <div
                  id="chart-contrataciones"
                  className="p-5 rounded-xl border border-gray-200"
                  style={{ backgroundColor: "rgb(240, 243, 249)" }}
                >
                  <h3 className="text-sm font-bold mb-3 text-gray-900 flex items-center gap-2">
                    🆕 Evolución de Nuevas Contrataciones
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart
                      data={reporteData.evolucion_contrataciones || []}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip
                        formatter={(value) => [
                          `${value} empleados`,
                          "Contratados",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="contrataciones"
                        stroke="#6366F1"
                        strokeWidth={3}
                        dot={{
                          r: 5,
                          fill: "#ffffff",
                          stroke: "#6366F1",
                          strokeWidth: 3,
                        }}
                        activeDot={{
                          r: 7,
                          fill: "#6366F1",
                          stroke: "#ffffff",
                          strokeWidth: 2,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* DISTRIBUCIÓN DE EMPLEADOS POR CARGO (FORMATO DONUT + TABLA) */}
                <div
                  className="rounded-xl border border-gray-200 p-5 overflow-hidden lg:col-span-2"
                  style={{ backgroundColor: "rgb(240, 243, 249)" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <PieIcon size={18} className="text-indigo-600" />{" "}
                      Distribución de Empleados por Cargo
                    </h3>
                    <span className="text-xs text-gray-500 font-medium">
                      Composición del Personal
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-white p-4 rounded-xl border border-gray-200">
                    {/* 1. Gráfico de Dona */}
                    <div
                      id="chart-distribucion-cargos"
                      className="h-[220px] w-full"
                    >
                      {reporteData.distribucion_cargos &&
                      reporteData.distribucion_cargos.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={reporteData.distribucion_cargos}
                              dataKey="cantidad"
                              nameKey="puesto"
                              cx="50%"
                              cy="43%"
                              innerRadius={52}
                              outerRadius={76}
                              paddingAngle={4}
                            >
                              {reporteData.distribucion_cargos.map(
                                (entry, index) => {
                                  const PALETA_CARGOS = [
                                    "#6366F1",
                                    "#10B981",
                                    "#F59E0B",
                                    "#EC4899",
                                    "#8B5CF6",
                                    "#3B82F6",
                                  ];
                                  return (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={
                                        PALETA_CARGOS[
                                          index % PALETA_CARGOS.length
                                        ]
                                      }
                                    />
                                  );
                                },
                              )}
                            </Pie>
                            <Tooltip
                              formatter={(value) => [
                                `${value} empleados`,
                                "Cantidad",
                              ]}
                            />
                            <Legend
                              content={({ payload }) => (
                                <div className="w-full flex flex-wrap justify-center gap-x-5 gap-y-2 pt-3">
                                  {payload?.map((entry, index) => (
                                    <span
                                      key={`legend-cargo-${index}`}
                                      className="whitespace-nowrap text-sm font-medium text-gray-700"
                                    >
                                      <span
                                        style={{
                                          color: entry.color,
                                          fontSize: 20,
                                        }}
                                      >
                                        ●
                                      </span>{" "}
                                      {entry.value}
                                    </span>
                                  ))}
                                </div>
                              )}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-gray-400">
                          Sin registros de distribución por cargo
                        </div>
                      )}
                    </div>

                    {/* 2. Tabla de Detalle */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-gray-700">
                        <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200">
                          <tr>
                            <th className="p-2">Puesto</th>
                            <th className="p-2 text-center">Cantidad</th>
                            <th className="p-2 text-right">% del Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-mono text-gray-600">
                          {(() => {
                            // Calculamos el total una sola vez, fuera del loop de iteración
                            const totalCargos =
                              reporteData.distribucion_cargos?.reduce(
                                (sum, curr) => sum + curr.cantidad,
                                0,
                              ) || 0;

                            return reporteData.distribucion_cargos?.map(
                              (c, idx) => {
                                const porcentaje =
                                  totalCargos > 0
                                    ? (
                                        (c.cantidad / totalCargos) *
                                        100
                                      ).toFixed(1)
                                    : "0.0";

                                return (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="p-2 font-sans font-semibold text-gray-900 flex items-center gap-2">
                                      <span
                                        className="w-2.5 h-2.5 rounded-full inline-block"
                                        style={{
                                          backgroundColor:
                                            PALETA_CARGOS[
                                              idx % PALETA_CARGOS.length
                                            ],
                                        }}
                                      />
                                      {c.puesto}
                                    </td>
                                    <td className="p-2 text-center font-sans text-gray-600">
                                      {c.cantidad}
                                    </td>
                                    <td className="p-2 text-right font-bold text-gray-900">
                                      {porcentaje}%
                                    </td>
                                  </tr>
                                );
                              },
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* TOP GENERADORES */}
              <div
                className="p-5 rounded-xl border border-gray-200"
                style={{ backgroundColor: "rgb(240, 243, 249)" }}
              >
                <h3 className="text-sm font-bold mb-4 text-gray-900 flex items-center gap-2">
                  <Award size={18} className="text-amber-500" /> Empleados con
                  Mayor Recaudación Generada
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {(reporteData.top_generadores || []).map((top, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          Top #{index + 1}
                        </span>
                        <h4 className="text-xs font-bold text-gray-900 mt-2 whitespace-normal leading-tight">
                          {top.empleado}
                        </h4>
                        <p className="text-[10px] text-gray-400 whitespace-normal">
                          {top.puesto || "Asesor"}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block">
                          Generado
                        </span>
                        <span className="text-sm font-black text-green-600 font-mono">
                          $
                          {top.total_generado.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TABLA DE RENDIMIENTO */}
              <div
                className="rounded-xl border border-gray-200 overflow-hidden"
                style={{ backgroundColor: "rgb(240, 243, 249)" }}
              >
                <div className="p-4 bg-white/50 border-b border-gray-200 flex items-center gap-2">
                  <FileText size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-bold text-gray-900">
                    Tabla de Rendimiento Individual y Liquidación Colectiva (
                    {formatDate(fechaInicio)} - {formatDate(fechaFin)})
                  </h3>
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
                      {reporteData.tabla_empleados.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="p-6 text-center text-gray-400 font-sans"
                          >
                            ❌ Ningún registro comercial vinculado a empleados
                            en este rango de fechas / sucursal.
                          </td>
                        </tr>
                      ) : (
                        reporteData.tabla_empleados.map((emp, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="p-3 pl-5 font-sans text-gray-900 font-bold">
                              {emp.empleado}
                              <span className="block text-[9px] text-gray-400 font-mono">
                                ID: #EMP-0{emp.Id_empleado}
                              </span>
                            </td>
                            <td className="p-3 text-center font-sans">
                              <span
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold border"
                                style={{
                                  backgroundColor: getColorPuesto(emp.puesto)
                                    .bg,
                                  color: getColorPuesto(emp.puesto).text,
                                  borderColor: getColorPuesto(emp.puesto)
                                    .border,
                                }}
                              >
                                {emp.puesto}
                              </span>
                            </td>
                            <td className="p-3 text-center font-sans font-medium text-gray-700">
                              {emp.operaciones_realizadas} ops.
                            </td>
                            <td className="p-3 text-right text-indigo-600 font-bold">
                              $
                              {emp.ticket_promedio.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="p-3 text-right text-amber-600 font-bold flex items-center justify-end gap-1">
                              <Percent size={11} />$
                              {emp.comision_estimada.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="p-3 text-right text-green-600 font-black pr-5">
                              $
                              {emp.total_vendido.toLocaleString("en-US", {
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

              {/* BOTÓN EXPORTAR */}
              <div
                className={`download-btn-container pt-4 flex justify-end border-t border-gray-200 ${exportando ? "invisible" : ""}`}
              >
                <button
                  onClick={generatePDF}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Download size={14} /> Exportar Reporte de Capital Humano
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UsersPage;
