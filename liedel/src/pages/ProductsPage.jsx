import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import html2canvas from "html2canvas";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

import StatCard from "../components/common/StatCard";
import ReportePDF from "../components/reports/ReporteProductos";

import {
  AlertTriangle,
  DollarSign,
  Package,
  TrendingUp,
  XCircle,
  ArchiveX,
  Download,
  Calendar,
  Search,
} from "lucide-react";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#8dd1e1",
  "#a4de6c",
  "#d0ed57",
  "#5798ed",
  "#ed57e3",
  "#ed5757",
];

// Función auxiliar para formatear fechas
const formatDate = (date) => date.toISOString().split("T")[0];

const ProductPage = () => {
  const navigate = useNavigate();

  // 1. ESTADO DE LAS STATCARDS[cite: 1]
  const [stats, setStats] = useState({
    total_productos: 0,
    top_selling: 0,
    low_stock: 0,
    total_revenue: 0,
    defective_products: 0,
    dead_stock: 0,
  });

  // 2. ESTADOS PARA REPORTE DINÁMICO[cite: 1]
  const [startDate, setStartDate] = useState(() => {
    const haceDosAnios = new Date();
    haceDosAnios.setFullYear(haceDosAnios.getFullYear() - 2);
    return formatDate(haceDosAnios);
  });

  const [endDate, setEndDate] = useState(() => formatDate(new Date()));
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  // 3. ESTADOS PARA FILTROS Y DATOS DE ALMACÉN[cite: 1]
  const [almacenesData, setAlmacenesData] = useState([]);
  const [selectedAlmacen, setSelectedAlmacen] = useState("Todos");
  const [searchProducto, setSearchProducto] = useState("");

  // Fetch de StatCards al cargar el componente[cite: 1]
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/productos-stats");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Error al cargar estadísticas fijas:", error);
      }
    };

    fetchStats();
  }, []);

  // Fetch del ENDPOINT de almacenes[cite: 1]
  useEffect(() => {
    const fetchAlmacenes = async () => {
      try {
        let url = "http://localhost:5000/api/productos-almacenes";
        if (startDate && endDate) {
          url += `?inicio=${startDate}&fin=${endDate}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Error en la respuesta del servidor");

        const data = await res.json();
        setAlmacenesData(data.productos_por_almacen || []);
      } catch (error) {
        console.error("Error al obtener productos por almacén:", error);
        setAlmacenesData([]);
      }
    };

    fetchAlmacenes();
  }, [startDate, endDate]);

  // Fetch de datos analíticos dependiente del rango de fechas[cite: 1]
  useEffect(() => {
    if (!startDate || !endDate) return;

    const fetchReporteData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:5000/api/reporte-productos?inicio=${startDate}&fin=${endDate}`,
        );
        if (!res.ok) throw new Error("Error en el servidor al obtener reporte");
        const result = await res.json();
        setReportData(result);
      } catch (error) {
        console.error("Error cargando el reporte por fechas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReporteData();
  }, [startDate, endDate]);

  // Función para exportar el reporte a PDF usando @react-pdf/renderer
  const generatePDF = async () => {
    try {
      setGenerandoPDF(true);

      // Captura de los gráficos si están renderizados en el DOM
      const chartVentasEl = document.querySelector("#chart-ventas");
      const chartTopEl = document.querySelector("#chart-top-ingresos");
      const chartCategoriasEl = document.querySelector("#chart-categorias");
      const chartVariedadEl = document.querySelector("#chart-variedad-almacen");
      const chartDistribucionEl = document.querySelector(
        "#chart-distribucion-almacen",
      );

      let imgVentas = null;
      let imgTop = null;
      let imgCategorias = null;
      let imgVariedad = null;
      let imgDistribucion = null;

      if (chartVentasEl) {
        const canvasVentas = await html2canvas(chartVentasEl, { scale: 2 });
        imgVentas = canvasVentas.toDataURL("image/png");
      }

      if (chartTopEl) {
        const canvasTop = await html2canvas(chartTopEl, { scale: 2 });
        imgTop = canvasTop.toDataURL("image/png");
      }

      if (chartCategoriasEl) {
        const canvasCategorias = await html2canvas(chartCategoriasEl, {
          scale: 2,
        });
        imgCategorias = canvasCategorias.toDataURL("image/png");
      }

      if (chartVariedadEl) {
        const canvasVariedad = await html2canvas(chartVariedadEl, { scale: 2 });
        imgVariedad = canvasVariedad.toDataURL("image/png");
      }

      if (chartDistribucionEl) {
        const canvasDistribucion = await html2canvas(chartDistribucionEl, {
          scale: 2,
        });
        imgDistribucion = canvasDistribucion.toDataURL("image/png");
      }

      // Generar el documento PDF vectorial
      // OJO: las llaves de este objeto deben coincidir EXACTAMENTE con las que
      // lee ReportePDF.jsx (chartImages?.variedadAlmacen / distribucionAlmacen),
      // si no, esas dos secciones nunca se muestran aunque la imagen sí exista.
      const blob = await pdf(
        <ReportePDF
          reportData={reportData}
          almacenesData={almacenesData}
          startDate={startDate}
          endDate={endDate}
          chartImages={{
            ventas: imgVentas,
            topIngresos: imgTop,
            categorias: imgCategorias,
            variedadAlmacen: imgVariedad,
            distribucionAlmacen: imgDistribucion,
          }}
        />,
      ).toBlob();

      // Descargar el archivo
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Reporte_Productos_${startDate}_A_${endDate}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    } finally {
      setGenerandoPDF(false);
    }
  };

  // Obtener lista única de almacenes disponibles para el select desde almacenesData[cite: 1]
  const listaAlmacenes = [
    "Todos",
    ...new Set(almacenesData.map((i) => i.almacen)),
  ];
  // Filtro dinámico para la tabla de almacenes[cite: 1]
  const productosFiltradosAlmacen = almacenesData.filter((item) => {
    const coincideAlmacen =
      selectedAlmacen === "Todos" || item.almacen === selectedAlmacen;
    const coincideNombre = item.Nombre?.toLowerCase().includes(
      searchProducto.toLowerCase(),
    );
    return coincideAlmacen && coincideNombre;
  });

  const maxIngreso = Math.max(
    ...(reportData?.top_ingresos?.map((p) => p.ingresos) || [0]),
  );
  const yDomainMaxIngresos = Math.ceil((maxIngreso * 1.05) / 100000) * 100000;

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <main className="max-w-7xl mx-auto py-8 px-4 lg:px-8">
        {/* ================= SECCIÓN DE STATCARDS ================= */}
        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <StatCard
            name="Cantidad de Productos"
            icon={Package}
            value={stats.total_productos}
            color="#6366F1"
            onClick={() => navigate("/products/all")}
          />
          <StatCard
            name="Cantidad de Unidades vendidas"
            icon={TrendingUp}
            value={stats.top_selling}
            color="#10B981"
          />
          <StatCard
            name="Cantidad de productos en Stock Bajo"
            icon={AlertTriangle}
            value={stats.low_stock}
            color="#F59E0B"
            onClick={() => navigate("/products/low-stock")}
          />
          <StatCard
            name="Cantidad de productos Defectuosos"
            icon={XCircle}
            value={stats.defective_products}
            color="#DC2626"
            onClick={() => navigate("/defective-products")}
          />
          <StatCard
            name="Total de dinero recolectado"
            icon={DollarSign}
            value={`$${stats.total_revenue.toLocaleString("es-DO")}`}
            color="#EF4444"
          />
          <StatCard
            name="Cantidad de productos en Stock muerto"
            icon={ArchiveX}
            value={stats.dead_stock}
            color="#7C3AED"
            onClick={() => navigate("/products/dead-stock")}
          />
        </motion.div>

        {/* ================= TARJETA BLANCA EXTERIOR (envuelve filtro + reporte) ================= */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-gray-800 font-sans mb-8">
          {/* ================= CONTROLLER DE FECHAS ================= */}
          <div
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border border-gray-200 p-5 rounded-xl shadow-sm"
            style={{ backgroundColor: "rgb(240, 243, 249)" }}
          >
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Filtro Analítico de Productos
              </h2>
              <p className="text-xs text-gray-500">
                Seleccione un rango para filtrar los gráficos y reportes
                detallados inferiores.
              </p>
            </div>
            <div className="flex flex-nowrap items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 px-2 border-r border-gray-200">
                <Calendar size={14} className="text-indigo-600" /> Desde:
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-gray-100 p-1.5 rounded-md text-gray-800 font-mono border border-gray-200 outline-none"
                />
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 px-2">
                Hasta:
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-gray-100 p-1.5 rounded-md text-gray-800 font-mono border border-gray-200 outline-none"
                />
              </div>
            </div>
          </div>

          {/* ================= ESTADOS DE CARGA / INICIAL ================= */}
          {!reportData && !loading && (
            <div className="text-center py-16 rounded-xl border border-dashed border-gray-300 bg-gray-50">
              <Calendar className="mx-auto text-gray-400 mb-3" size={40} />
              <p className="text-gray-600 font-medium">
                Establezca un rango de fechas en el panel superior para cargar
                los datos del reporte.
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-16 rounded-xl border border-gray-200 bg-gray-50">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-indigo-600 font-medium animate-pulse">
                Procesando registros de inventario y ventas...
              </p>
            </div>
          )}

          {/* ================= CUERPO DEL REPORTE BASADO EN FECHAS ================= */}
          {reportData && (
            <div className="space-y-8">
              {/* RESUMEN DE METADATOS */}
              <div
                className="p-3 rounded-xl border border-gray-200 text-xs text-gray-600 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 bg-gray-50 text-center"
                style={{ lineHeight: "1.2", verticalAlign: "middle" }}
              >
                <div className="px-2 py-1 flex items-center justify-center gap-1">
                  <span className="uppercase text-[11px]">PRODUCTO LÍDER:</span>
                  <strong className="text-gray-900 font-bold">
                    {reportData.producto_top}
                  </strong>
                </div>
                <div className="px-2 py-1 border-t sm:border-t-0 sm:border-l border-gray-200 flex items-center justify-center gap-1">
                  <span className="uppercase text-[11px]">
                    CATEGORÍA LÍDER:
                  </span>
                  <strong className="text-gray-900 font-bold">
                    {reportData.categoria_top}
                  </strong>
                </div>
                <div className="px-2 py-1 border-t lg:border-t-0 lg:border-l border-gray-200 flex items-center justify-center gap-1">
                  <span className="uppercase text-[11px]">
                    CAPITAL EN INVENTARIO:
                  </span>
                  <strong className="text-green-600 font-bold">
                    $
                    {reportData.capital_inmovilizado?.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </strong>
                </div>
                <div className="px-2 py-1 border-t lg:border-t-0 lg:border-l border-gray-200 flex items-center justify-center gap-1">
                  <span className="uppercase text-[11px]">
                    INGRESOS TOTALES:
                  </span>
                  <strong className="text-indigo-600 font-bold">
                    $
                    {reportData.ingresos?.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </strong>
                </div>
              </div>

              {/* LineChart Ventas */}
              <div
                id="chart-ventas"
                className="p-5 rounded-xl border border-gray-200 bg-gray-50"
              >
                <h3 className="text-base font-bold mb-4 text-gray-900 flex items-center gap-2">
                  📊 Evolución Temporal de Unidades Vendidas
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart
                    data={reportData.tendencia_ventas || []}
                    margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="fecha"
                      stroke="#718096"
                      tick={{ fontSize: 11 }}
                      minTickGap={20}
                      tickFormatter={(value) => {
                        const d = new Date(value);
                        return d.toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                        });
                      }}
                      padding={{ left: 20, right: 20 }}
                    />
                    <YAxis
                      stroke="#718096"
                      allowDecimals={false}
                      domain={[0, 22]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderColor: "#cbd5e1",
                        color: "#000",
                      }}
                      labelFormatter={(value) => {
                        const d = new Date(value);
                        return d.toLocaleDateString("es-ES", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        });
                      }}
                      formatter={(value) => [`${value} unidades`, "Vendidas"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="unidades_vendidas"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* BarChart Top 10 */}
              <div
                id="chart-top-ingresos"
                className="p-5 rounded-xl border border-gray-200 bg-gray-50"
              >
                <h3 className="text-base font-bold mb-4 text-gray-900">
                  🏆 Top 10 Productos con Mayor Aporte de Ingresos
                </h3>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart
                    data={reportData.top_ingresos}
                    margin={{ top: 20, right: 30, left: 15, bottom: 55 }}
                  >
                    <XAxis
                      dataKey="Nombre"
                      stroke="#718096"
                      tick={{ fontSize: 10, fill: "#4a5568" }}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      tickFormatter={(value) =>
                        value.length > 12 ? `${value.slice(0, 14)}…` : value
                      }
                    />
                    <YAxis
                      stroke="#718096"
                      tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                      domain={[0, yDomainMaxIngresos]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderColor: "#cbd5e1",
                      }}
                      formatter={(value) => [
                        `$${value.toLocaleString()}`,
                        "Ingresos",
                      ]}
                    />
                    <Bar
                      dataKey="ingresos"
                      name="Ingresos Generados ($)"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* SECCIÓN UNIFICADA POR CATEGORÍAS */}
              <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
                <h3 className="text-base font-bold mb-4 text-gray-900">
                  📈 Rendimiento y Participación Financiera por Categorías
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                  {/* Gráfico de Pastel */}
                  <div id="chart-categorias" className="w-full h-[320px] pb-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportData?.categorias || []}
                          dataKey="total"
                          nameKey="nombre"
                          cx="50%"
                          cy="40%"
                          outerRadius={85}
                          labelLine={({ percent, points }) => {
                            if (percent < 0.02 || !points) return null;
                            return (
                              <path
                                d={`M${points[0].x},${points[0].y}L${points[1].x},${points[1].y}`}
                                stroke="#9ca3af"
                                strokeWidth={1}
                                fill="none"
                              />
                            );
                          }}
                          label={({ x, y, textAnchor, nombre, percent }) => {
                            if (percent < 0.02) return null;
                            return (
                              <text
                                x={x}
                                y={y}
                                textAnchor={textAnchor}
                                fill="#4b5563"
                                fontSize={10}
                              >
                                {`${nombre} (${(percent * 100).toFixed(1)}%)`}
                              </text>
                            );
                          }}
                        >
                          {(reportData?.categorias || []).map((_, i) => (
                            <Cell
                              key={`cell-${i}`}
                              fill={COLORS[i % COLORS.length]}
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          formatter={(value) => [
                            `$${Number(value).toLocaleString()}`,
                            "Ingresos",
                          ]}
                        />

                        <Legend
                          verticalAlign="bottom"
                          align="center"
                          content={({ payload }) => (
                            <div className="w-full flex flex-wrap justify-center gap-x-4 gap-y-2 mt-0 pt-2 pb-2 px-2">
                              {payload?.map((entry, index) => (
                                <span
                                  key={`legend-item-${index}`}
                                  className="whitespace-nowrap text-[11px] font-medium text-gray-700"
                                >
                                  <span
                                    style={{ color: entry.color, fontSize: 20 }}
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
                  </div>

                  {/* Tabla Detallada por Categorías */}
                  <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200">
                        <tr>
                          <th className="p-3">Categoría</th>
                          <th className="p-3 text-center">U. Vendidas</th>
                          <th className="p-3 text-right">Volumen Total ($)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-gray-600">
                        {reportData.categorias?.map((cat, index) => {
                          const unidadCat =
                            reportData.categorias_unidades?.find(
                              (u) => u.categoria === cat.nombre,
                            );
                          return (
                            <tr
                              key={index}
                              className="hover:bg-gray-50 font-mono"
                            >
                              <td className="p-3 font-sans text-gray-900 font-semibold">
                                {cat.nombre}
                              </td>
                              <td className="p-3 text-center text-amber-600 font-bold">
                                {unidadCat ? unidadCat.total : 0} u.
                              </td>
                              <td className="p-3 text-right text-indigo-600 font-bold">
                                $
                                {Number(cat.total).toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* SECCIÓN CAPITAL INMOVILIZADO */}
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                <div className="p-4 bg-white/50 border-b border-gray-200 flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900">
                    🔒 Capital Inmovilizado Activo (Top 15)
                  </h3>
                </div>
                <div className="overflow-x-auto bg-white">
                  <table className="w-full text-left text-xs text-gray-700">
                    <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="p-3">Producto</th>
                        <th className="p-3 text-center">Stock</th>
                        <th className="p-3 text-right">Precio Venta</th>
                        <th className="p-3 text-right">Valor Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-mono text-gray-600">
                      {reportData.capital_por_producto?.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="p-3 font-sans text-gray-900 font-semibold">
                            {item.Nombre}
                          </td>
                          <td className="p-3 text-center text-gray-900 font-semibold">
                            {item.stock}
                          </td>
                          <td className="p-3 text-right">
                            ${Number(item.Precio_venta).toFixed(2)}
                          </td>
                          <td className="p-3 text-right text-green-600 font-bold">
                            $
                            {Number(item.valor).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ================= SECCIÓN PRODUCTOS Y GRÁFICOS POR ALMACÉN (SUCURSAL) ================= */}
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 p-5 space-y-6">
                {/* ENCABEZADO Y FILTROS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    🗂️ Análisis e Inventario por Almacén / Sucursal
                  </h3>

                  {/* Buscador y Selector de Almacén */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-300">
                      <Search size={14} className="text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar producto..."
                        value={searchProducto}
                        onChange={(e) => setSearchProducto(e.target.value)}
                        className="outline-none bg-transparent text-gray-800 w-32 sm:w-40"
                      />
                    </div>

                    <select
                      value={selectedAlmacen}
                      onChange={(e) => setSelectedAlmacen(e.target.value)}
                      className="bg-white px-3 py-1.5 rounded-lg border border-gray-300 text-gray-800 font-semibold outline-none cursor-pointer"
                    >
                      {listaAlmacenes.map((almacen, idx) => (
                        <option key={idx} value={almacen}>
                          {almacen === "Todos"
                            ? "Todos los Almacenes"
                            : almacen}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* GRÁFICOS DINÁMICOS DE ALMACÉN MEJORADOS */}
                {almacenesData.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Helper inline para formatear nombres y agrupar */}
                    {(() => {
                      const formatNombre = (nombre) =>
                        nombre
                          ? nombre.replace(/almacén|almacen/gi, "").trim()
                          : "";

                      const datosAgrupados = Object.values(
                        almacenesData.reduce((acc, item) => {
                          const nombreLimpio = formatNombre(item.almacen);
                          if (!acc[nombreLimpio]) {
                            acc[nombreLimpio] = {
                              almacen: nombreLimpio,
                              productos: 0,
                              valor: 0,
                            };
                          }
                          acc[nombreLimpio].productos += 1;
                          acc[nombreLimpio].valor +=
                            Number(item.stock || 0) *
                            Number(item.Precio_venta || 0);
                          return acc;
                        }, {}),
                      );

                      return (
                        <>
                          {/* Gráfico 1: Unidades/Productos por Almacén */}
                          <div
                            id="chart-variedad-almacen"
                            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
                          >
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">
                              📦 Variedad de Productos por Sucursal
                            </h4>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart
                                data={datosAgrupados}
                                margin={{
                                  top: 20,
                                  right: 10,
                                  left: -20,
                                  bottom: 55,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#f1f5f9"
                                />
                                <XAxis
                                  dataKey="almacen"
                                  stroke="#64748b"
                                  tick={{ fontSize: 10, fill: "#475569" }}
                                  angle={-35}
                                  textAnchor="end"
                                  interval={0}
                                  tickFormatter={(value) =>
                                    value.length > 12
                                      ? `${value.slice(0, 12)}…`
                                      : value
                                  }
                                />
                                <YAxis
                                  stroke="#64748b"
                                  allowDecimals={false}
                                  tick={{ fontSize: 11 }}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#fff",
                                    borderRadius: "8px",
                                    borderColor: "#cbd5e1",
                                  }}
                                  formatter={(value) => [
                                    `${value} productos`,
                                    "Variedad",
                                  ]}
                                />
                                <Bar
                                  dataKey="productos"
                                  name="Productos"
                                  fill="#6366f1"
                                  radius={[4, 4, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Gráfico 2: Valor Monetario por Almacén */}
                          <div
                            id="chart-distribucion-almacen"
                            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
                          >
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">
                              💰 Distribución de Valor Monetario ($)
                            </h4>
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie
                                  data={datosAgrupados}
                                  dataKey="valor"
                                  nameKey="almacen"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={75}
                                  labelLine={({ percent, points }) => {
                                    if (percent < 0.03 || !points) return null;
                                    return (
                                      <path
                                        d={`M${points[0].x},${points[0].y}L${points[1].x},${points[1].y}`}
                                        stroke="#9ca3af"
                                        strokeWidth={1}
                                        fill="none"
                                      />
                                    );
                                  }}
                                  label={({ x, y, textAnchor, percent }) => {
                                    if (percent < 0.03) return null;
                                    return (
                                      <text
                                        x={x}
                                        y={y}
                                        textAnchor={textAnchor}
                                        fill="#4b5563"
                                        fontSize={11}
                                      >
                                        {`${(percent * 100).toFixed(1)}%`}
                                      </text>
                                    );
                                  }}
                                >
                                  {datosAgrupados.map((_, i) => (
                                    <Cell
                                      key={i}
                                      fill={COLORS[i % COLORS.length]}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(val) => [
                                    `$${Number(val).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                                    "Valor Estimado",
                                  ]}
                                />
                                <Legend
                                  verticalAlign="bottom"
                                  align="center"
                                  content={({ payload }) => (
                                    <div className="w-full flex flex-wrap justify-center gap-x-3 gap-y-1 pt-3 px-2">
                                      {payload?.map((entry, index) => (
                                        <span
                                          key={`legend-item-${index}`}
                                          className="whitespace-nowrap"
                                          style={{
                                            color: "#374151",
                                            fontSize: 11,
                                          }}
                                        >
                                          <span
                                            style={{
                                              color: entry.color,
                                              fontSize: 18,
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
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* TABLA DE PRODUCTOS FILTRADOS */}
                <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
                  <table className="w-full text-left text-xs text-gray-700">
                    <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="p-3">Almacén</th>
                        <th className="p-3">Producto</th>
                        <th className="p-3 text-center">Stock Disponible</th>
                        <th className="p-3 text-right">Precio Venta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-600">
                      {productosFiltradosAlmacen.length > 0 ? (
                        productosFiltradosAlmacen.map((item, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 font-mono"
                          >
                            <td className="p-3 font-sans text-indigo-600 font-bold">
                              {item.almacen}
                            </td>
                            <td className="p-3 font-sans text-gray-900 font-semibold">
                              {item.Nombre}
                            </td>
                            <td className="p-3 text-center text-gray-900 font-semibold">
                              {item.stock} u.
                            </td>
                            <td className="p-3 text-right font-bold text-gray-900">
                              ${Number(item.Precio_venta || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-6 text-center text-gray-400 font-sans"
                          >
                            No se encontraron productos para los filtros
                            seleccionados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BOTÓN EXPORTAR */}
              <div className="pt-4 flex justify-end border-t border-gray-200">
                <button
                  onClick={generatePDF}
                  disabled={generandoPDF}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Download size={14} />
                  {generandoPDF
                    ? "Procesando páginas y gráficos..."
                    : "Exportar Reporte Analítico a PDF"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductPage;
