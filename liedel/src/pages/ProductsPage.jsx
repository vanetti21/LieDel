import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid 
} from "recharts";

import StatCard from "../components/common/StatCard";

import {
    AlertTriangle,
    DollarSign,
    Package,
    TrendingUp,
    XCircle,
    ArchiveX,
    Download,
    Calendar,
    Table,
    PieChart as PieIcon,
    Search,
    Building2
} from "lucide-react";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c", "#d0ed57", "#5798ed", "#ed57e3", "#ed5757"];

// Función auxiliar para formatear fechas
const formatDate = (date) => date.toISOString().split("T")[0];

const ProductPage = () => {
    const navigate = useNavigate();

    // 1. ESTADO DE LAS STATCARDS
    const [stats, setStats] = useState({
        total_productos: 0,
        top_selling: 0,
        low_stock: 0,
        total_revenue: 0,
        defective_products: 0,
        dead_stock: 0,
    });

    // 2. ESTADOS PARA REPORTE DINÁMICO (Inicializados directo con el rango de 2 años)
    const [startDate, setStartDate] = useState(() => {
        const haceDosAnios = new Date();
        haceDosAnios.setFullYear(haceDosAnios.getFullYear() - 2);
        return formatDate(haceDosAnios);
    });
    
    const [endDate, setEndDate] = useState(() => formatDate(new Date()));
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exportando, setExportando] = useState(false);

    // 3. ESTADOS PARA FILTROS Y DATOS DE ALMACÉN
    const [almacenesData, setAlmacenesData] = useState([]);
    const [selectedAlmacen, setSelectedAlmacen] = useState("Todos");
    const [searchProducto, setSearchProducto] = useState("");

    // Fetch de StatCards al cargar el componente
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

    // Fetch del ENDPOINT de almacenes
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

    // Fetch de datos analíticos dependiente del rango de fechas
    useEffect(() => {
        if (!startDate || !endDate) return;

        const fetchReporteData = async () => {
            try {
                setLoading(true);
                const res = await fetch(
                    `http://localhost:5000/api/reporte-productos?inicio=${startDate}&fin=${endDate}`
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

    // Función para exportar el reporte dinámico
    const generatePDF = () => {
    setExportando(true);

    // Pequeña espera para que React re-renderice ocultando el botón antes de capturar
    setTimeout(() => {
        const input = document.getElementById("reporteProductosSeccion");

        html2canvas(input, { scale: 1.5, useCORS: true }).then((canvas) => {
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const pageHeightInCanvasPx = (pdfHeight * canvas.width) / pdfWidth;

            let renderedHeight = 0;
            let pageIndex = 0;

            while (renderedHeight < canvas.height) {
                const sliceHeight = Math.min(pageHeightInCanvasPx, canvas.height - renderedHeight);

                const pageCanvas = document.createElement("canvas");
                pageCanvas.width = canvas.width;
                pageCanvas.height = sliceHeight;

                const ctx = pageCanvas.getContext("2d");
                ctx.drawImage(
                    canvas,
                    0, renderedHeight, canvas.width, sliceHeight,
                    0, 0, canvas.width, sliceHeight
                );

                const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.85);
                const sliceHeightMm = (sliceHeight * imgWidth) / canvas.width;

                if (pageIndex > 0) pdf.addPage();
                pdf.addImage(pageImgData, "JPEG", 0, 0, imgWidth, sliceHeightMm);

                renderedHeight += sliceHeight;
                pageIndex++;
            }

            pdf.save(`Reporte_Productos_${startDate}_A_${endDate}.pdf`);
            setExportando(false);
        });
    }, 50);
};

    // Obtener lista única de almacenes disponibles para el select desde almacenesData
    const listaAlmacenes = ["Todos", ...new Set(almacenesData.map((i) => i.almacen))];

    // Filtro dinámico para la tabla de almacenes
    const productosFiltradosAlmacen = almacenesData.filter((item) => {
        const coincideAlmacen = selectedAlmacen === "Todos" || item.almacen === selectedAlmacen;
        const coincideNombre = item.Nombre?.toLowerCase().includes(searchProducto.toLowerCase());
        return coincideAlmacen && coincideNombre;
    });

    const maxIngreso = Math.max(
        ...(reportData?.top_ingresos?.map((p) => p.ingresos) || [0])
    );
    const yDomainMaxIngresos = Math.ceil((maxIngreso * 1.05) / 100000) * 100000;
    
    
    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <main className='max-w-7xl mx-auto py-8 px-4 lg:px-8'>
                
                {/* ================= SECCIÓN DE STATCARDS ================= */}
                <motion.div
                    className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <StatCard
                        name='Cantidad de Productos'
                        icon={Package}
                        value={stats.total_productos}
                        color='#6366F1'
                        onClick={() => navigate("/products/all")}   
                    />
                    <StatCard
                        name='Cantidad de Unidades vendidas'
                        icon={TrendingUp}
                        value={stats.top_selling}
                        color='#10B981'
                    />
                    <StatCard
                        name='Cantidad de productos en Stock Bajo'
                        icon={AlertTriangle}
                        value={stats.low_stock}
                        color='#F59E0B'
                        onClick={() => navigate("/products/low-stock")}
                    />
                    <StatCard
                        name='Cantidad de productos Defectuosos'
                        icon={XCircle}
                        value={stats.defective_products}
                        color='#DC2626'
                        onClick={() => navigate("/defective-products")}
                    />
                    <StatCard
                        name='Total de dinero recolectado'
                        icon={DollarSign}
                        value={`$${stats.total_revenue.toLocaleString("es-DO")}`}
                        color='#EF4444'
                    />
                    <StatCard
                        name='Cantidad de productos en Stock muerto'
                        icon={ArchiveX}
                        value={stats.dead_stock}
                        color='#7C3AED'
                        onClick={() => navigate("/products/dead-stock")} 
                    />
                </motion.div>

                {/* ================= CONTROLLER DE FECHAS ================= */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border border-gray-200 p-5 rounded-xl bg-white shadow-sm">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Filtro Analítico de Productos</h2>
                        <p className="text-xs text-gray-500">Seleccione un rango para filtrar los gráficos y reportes detallados inferiores.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-300">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-gray-400 px-1">Desde</span>
                            <input 
                                type="date" 
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)} 
                                className="bg-transparent text-gray-800 text-sm p-1 outline-none cursor-pointer" 
                            />
                        </div>
                        <div className="w-[1px] h-8 bg-gray-300" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-gray-400 px-1">Hasta</span>
                            <input 
                                type="date" 
                                value={endDate} 
                                onChange={(e) => setEndDate(e.target.value)} 
                                className="bg-transparent text-gray-800 text-sm p-1 outline-none cursor-pointer" 
                            />
                        </div>
                    </div>
                </div>

                {/* ================= ESTADOS DE CARGA / INICIAL ================= */}
                {!reportData && !loading && (
                    <div className="text-center py-16 rounded-xl border border-dashed border-gray-300 bg-gray-50">
                        <Calendar className="mx-auto text-gray-400 mb-3" size={40} />
                        <p className="text-gray-600 font-medium">Establezca un rango de fechas en el panel superior para cargar los datos del reporte.</p>
                    </div>
                )}

                {loading && (
                    <div className="text-center py-16 rounded-xl border border-gray-200 bg-gray-50">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-indigo-600 font-medium animate-pulse">Procesando registros de inventario y ventas...</p>
                    </div>
                )}

                {/* ================= CUERPO DEL REPORTE BASADO EN FECHAS ================= */}
                {reportData && (
                    <div id="reporteProductosSeccion" className="space-y-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-gray-800">
                        
                        {/* RESUMEN DE METADATOS */}
                        <div className="p-4 rounded-xl border border-gray-200 text-xs text-gray-600 flex flex-wrap gap-y-2 justify-between items-center divide-x divide-gray-200 bg-gray-50">
                            <div className="px-4">PRODUCTO LÍDER: <span className="text-gray-900 font-bold">{reportData.producto_top}</span></div>
                            <div className="px-4">CATEGORÍA LÍDER: <span className="text-gray-900 font-bold">{reportData.categoria_top}</span></div>
                            <div className="px-4">CAPITAL EN INVENTARIO: <span className="text-green-600 font-bold">${reportData.capital_inmovilizado?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                            <div className="px-4">INGRESOS TOTALES: <span className="text-indigo-600 font-bold">${reportData.ingresos?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                        </div>

                        {/* LineChart Ventas */}
                        <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
                            <h3 className="text-base font-bold mb-4 text-gray-900 flex items-center gap-2   ">
                                📊 Evolución Temporal de Unidades Vendidas
                            </h3>
                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart 
                                    data={reportData.tendencia_ventas || []}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="fecha" stroke="#718096" tick={{ fontSize: 11 }}
                                    minTickGap={20}
                                    tickFormatter={(value) => {
                                        const d = new Date(value);
                                        return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
                                    }}
                                    padding={{ left: 20, right: 20 }}
                                    />
                                    <YAxis 
                                        stroke="#718096" 
                                        allowDecimals={false} 
                                        domain={[0, 22]} 
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#fff", borderColor: "#cbd5e1", color: "#000" }}
                                        labelFormatter={(value) => {
                                        const d = new Date(value);
                                        return d.toLocaleDateString("es-ES", { 
                                            weekday: "short", 
                                            day: "2-digit", 
                                            month: "short", 
                                            year: "numeric" 
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
                        <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
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
                                        contentStyle={{ backgroundColor: '#fff', borderColor: '#cbd5e1' }} 
                                        formatter={(value) => [`$${value.toLocaleString()}`, 'Ingresos']} 
                                    />
                                    <Bar dataKey="ingresos" name="Ingresos Generados ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* SECCIÓN UNIFICADA POR CATEGORÍAS */}
                        <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
                            <h3 className="text-base font-bold mb-4 text-gray-900 flex items-center gap-2">
                                <PieIcon size={18} className="text-indigo-600" />
                                Rendimiento y Participación Financiera por Categorías
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                                {/* Gráfico de Pastel */}
                                <div className="h-[335px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={reportData.categorias || []}
                                                dataKey="total"
                                                nameKey="nombre"
                                                cx="50%"
                                                cy="49%"
                                                outerRadius={90}
                                                labelLine={({ percent, ...rest }) => {
                                                    if (percent < 0.02) return null;
                                                    return <path {...rest} stroke="#9ca3af" strokeWidth={1} fill="none" />;
                                                }}
                                                label={({ x, y, textAnchor, nombre, percent }) => {
                                                    if (percent < 0.02) return null;
                                                    return (
                                                        <text x={x} y={y} textAnchor={textAnchor} fill="#4b5563" fontSize={10}>
                                                            {`${nombre} (${(percent * 100).toFixed(1)}%)`}
                                                        </text>
                                                    );
                                                }}
                                            >
                                                {(reportData.categorias || []).map((_, i) => (
                                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Ingresos"]} />
                                            <Legend
                                                iconSize={14}
                                                wrapperStyle={{ fontSize: "14px", paddingTop: "15px" }}
                                                formatter={(value) => (
                                                    <span style={{ color: "#374151", marginRight: "10px" }}>{value}</span>
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
                                                const unidadCat = reportData.categorias_unidades?.find(u => u.categoria === cat.nombre);
                                                return (
                                                    <tr key={index} className="hover:bg-gray-50 font-mono">
                                                        <td className="p-3 font-sans text-gray-900 font-semibold">{cat.nombre}</td>
                                                        <td className="p-3 text-center text-amber-600 font-bold">{unidadCat ? unidadCat.total : 0} u.</td>
                                                        <td className="p-3 text-right text-indigo-600 font-bold">${Number(cat.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
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
                                <Table size={16} className="text-green-600" />
                                <h3 className="text-sm font-bold text-gray-900">Capital Inmovilizado Activo (Top 15)</h3>
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
                                                <td className="p-3 font-sans text-gray-900 font-semibold">{item.Nombre}</td>
                                                <td className="p-3 text-center text-gray-900 font-semibold">{item.stock}</td>
                                                <td className="p-3 text-right">${Number(item.Precio_venta).toFixed(2)}</td>
                                                <td className="p-3 text-right text-green-600 font-bold">${Number(item.valor).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
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
                                    <Building2 size={18} className="text-indigo-600" />
                                    Análisis e Inventario por Almacén / Sucursal
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
                                                {almacen === "Todos" ? "Todos los Almacenes" : almacen}
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
                                            nombre ? nombre.replace(/almacén|almacen/gi, "").trim() : "";

                                        const datosAgrupados = Object.values(
                                            almacenesData.reduce((acc, item) => {
                                                const nombreLimpio = formatNombre(item.almacen);
                                                if (!acc[nombreLimpio]) {
                                                    acc[nombreLimpio] = { 
                                                        almacen: nombreLimpio, 
                                                        productos: 0, 
                                                        valor: 0 
                                                    };
                                                }
                                                acc[nombreLimpio].productos += 1;
                                                acc[nombreLimpio].valor += Number(item.stock || 0) * Number(item.Precio_venta || 0);
                                                return acc;
                                            }, {})
                                        );

                                        return (
                                            <>
                                                {/* Gráfico 1: Unidades/Productos por Almacén */}
                                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">
                                                    📦 Variedad de Productos por Sucursal
                                                </h4>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <BarChart 
                                                        data={datosAgrupados} 
                                                        margin={{ top: 20, right: 10, left: -20, bottom: 55 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                        <XAxis 
                                                            dataKey="almacen" 
                                                            stroke="#64748b" 
                                                            tick={{ fontSize: 10, fill: "#475569" }}
                                                            angle={-35} 
                                                            textAnchor="end" 
                                                            interval={0}
                                                            tickFormatter={(value) => 
                                                                value.length > 12 ? `${value.slice(0, 12)}…` : value
                                                            }
                                                        />
                                                        <YAxis stroke="#64748b" allowDecimals={false} tick={{ fontSize: 11 }} />
                                                        <Tooltip 
                                                            contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", borderColor: "#cbd5e1" }}
                                                            formatter={(value) => [`${value} productos`, "Variedad"]}
                                                        />
                                                        <Bar dataKey="productos" name="Productos" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                                {/* Gráfico 2: Valor Monetario por Almacén */}
                                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
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
                                                            labelLine={({ percent, ...rest }) => {
                                                                if (percent < 0.03) return null;
                                                                return <path {...rest} stroke="#9ca3af" strokeWidth={1} fill="none" />;
                                                            }}
                                                            label={({ x, y, textAnchor, percent }) => {
                                                                if (percent < 0.03) return null;
                                                                return (
                                                                    <text x={x} y={y} textAnchor={textAnchor} fill="#4b5563" fontSize={11}>
                                                                        {`${(percent * 100).toFixed(1)}%`}
                                                                    </text>
                                                                );
                                                            }}
                                                        >
                                                            {datosAgrupados.map((_, i) => (
                                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip 
                                                            formatter={(val) => [
                                                                `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 
                                                                'Valor Estimado'
                                                            ]} 
                                                        />
                                                        <Legend 
                                                            layout="horizontal" 
                                                            verticalAlign="bottom" 
                                                            align="center"
                                                            iconSize={9}
                                                            wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                                                            formatter={(value) => (
                                                                <span style={{ color: "#374151", marginRight: "5px" }}>{value}</span>
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
                                                <tr key={index} className="hover:bg-gray-50 font-mono">
                                                    <td className="p-3 font-sans text-indigo-600 font-bold">{item.almacen}</td>
                                                    <td className="p-3 font-sans text-gray-900 font-semibold">{item.Nombre}</td>
                                                    <td className="p-3 text-center text-gray-900 font-semibold">{item.stock} u.</td>
                                                    <td className="p-3 text-right font-bold text-gray-900">
                                                        ${Number(item.Precio_venta || 0).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="p-6 text-center text-gray-400 font-sans">
                                                    No se encontraron productos para los filtros seleccionados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* BOTÓN EXPORTAR */}
                        <div className={`download-btn-container pt-4 flex justify-end border-t border-gray-200 ${exportando ? "invisible" : ""}`}>
                            <button onClick={generatePDF} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95">
                                <Download size={14} /> Exportar Reporte Analítico a PDF
                            </button>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
};

export default ProductPage;