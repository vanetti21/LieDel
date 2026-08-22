import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid 
} from "recharts";
import { Download, Calendar, BarChart2, Table, AlertCircle } from "lucide-react";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c", "#d0ed57"];

const ReporteProductos = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    if (!startDate || !endDate) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/reporte-productos?inicio=${startDate}&fin=${endDate}`);
        if (!res.ok) throw new Error("Error en el servidor");
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Error cargando el reporte: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [startDate, endDate]);

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
  
  return (
    <div className="p-6 bg-white min-h-screen text-gray-800 font-sans">
      
      {/* HEADER DE CONTROL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border border-gray-200 p-5 rounded-xl" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                
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

      {/* ESTADOS DE CARGA / INICIAL */}
      {!data && !loading && (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-300" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
          <Calendar className="mx-auto text-gray-400 mb-3" size={40} />
          <p className="text-gray-600 font-medium">Establezca un rango de fechas en el panel superior para procesar las consultas SQL de auditoría.</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-16 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-indigo-600 font-medium animate-pulse">Escaneando tablas de ventas e inventario en tiempo real...</p>
        </div>
      )}

      {/* CUERPO DEL REPORTE */}
      {data && (
        <div id="reporteProductos" className="space-y-8 bg-white p-6 rounded-2xl border border-gray-200">
          
          {/* RESUMEN METADATOS (Sustituto analítico de Statcards) */}
          <div className="p-4 rounded-xl border border-gray-200 text-xs text-gray-600 flex flex-wrap gap-y-2 justify-between items-center divide-x divide-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
            <div className="px-4">PRODUCTO LÍDER: <span className="text-gray-900 font-bold">{data.producto_top}</span></div>
            <div className="px-4">CATEGORÍA LÍDER: <span className="text-gray-900 font-bold">{data.categoria_top}</span></div>
            <div className="px-4">ITEMS STOCK CRÍTICO: <span className="text-red-600 font-bold">{data.stock_critico} ({data.porcentaje_stock_critico}%)</span></div>
            <div className="px-4">CAPITAL EN INVENTARIO: <span className="text-green-600 font-bold">${data.capital_inmovilizado.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
            <div className="px-4">INGRESOS TOTALES: <span className="text-indigo-600 font-bold">${data.ingresos.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
          </div>

          {/* ================= SECCIÓN GRÁFICAS CLAVE ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* TENDENCIA DE VENTAS TEMPORAL */}
            <div
                className="p-5 rounded-xl border border-gray-200"
                style={{ backgroundColor: "rgb(240, 243, 249)" }}
              >
                <h3 className="text-base font-bold mb-4 text-gray-900 flex items-center gap-2">
                  📊 Evolución Temporal de Unidades Vendidas
                </h3>

                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={data.tendencia_ventas || []} margin={{ top: 20, right: 50, left: 30, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="fecha"
                      stroke="#718096"
                      tick={{ fontSize: 10 }}
                      minTickGap={45}
                      tickFormatter={(value) => {
                        const d = new Date(value);
                        return d.toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short"
                        });
                      }}
                      padding={{
                          left: 20,
                          right: 20
                        }}
                    />
                    <YAxis
                      stroke="#718096"
                      allowDecimals={false}
                      domain={[0, 'dataMax + 2']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderColor: "#cbd5e1",
                        color: "#000",
                      }}
                      formatter={(value) => [`${value} unidades`, "Vendidas"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="unidades_vendidas"
                      name="Unidades Vendidas"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

            {/* PARTICIPACIÓN POR CATEGORÍA */}
              <div
                className="p-5 rounded-xl border border-gray-200"
                style={{ backgroundColor: "rgb(240, 243, 249)" }}
              >

                <h3 className="text-base font-bold mb-4 text-gray-900">
                  💰 Participación Financiera por Categorías
                </h3>

                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.categorias || []}
                      dataKey="total"
                      nameKey="nombre"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      label={({ nombre, percent }) =>
                        `${nombre} (${(percent * 100).toFixed(1)}%)`
                      }
                    >

                      {(data.categorias || []).map((_, i) => (
                        <Cell
                          key={i}
                          fill={COLORS[i % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `$${Number(value).toLocaleString()}`,
                        "Ingresos"
                      ]}
                    />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

            {/* TOP 10 PRODUCTOS POR INGRESOS */}
            <div className="p-5 rounded-xl border border-gray-200 lg:col-span-2" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <h3 className="text-base font-bold mb-4 text-gray-900">🏆 Rendimiento Financiero: Top 10 Productos con Mayor Aporte de Ingresos</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.top_ingresos}>
                  <XAxis dataKey="Nombre" stroke="#718096" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#718096" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#cbd5e1' }} formatter={(value) => [`$${value.toLocaleString()}`, 'Ingresos']} />
                  <Bar dataKey="ingresos" name="Ingresos Generados ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ================= SECCIÓN DE DATOS TABULARES CRUCIALES ================= */}
          <div className="space-y-6">
            
            {/* TABLA 1: STOCK BAJO */}
            <div className="rounded-xl border border-gray-200 " style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-4 bg-white/50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-sm font-bold text-red-600 flex items-center gap-2">
                  <AlertCircle size={16} /> Alerta de Reposición: Productos con Stock Bajo o Crítico
                </h3>
                <span className="text-[11px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200 font-semibold">Acción Requerida</span>
              </div>
              <div className="overflow-x-auto   border border-gray-200 rounded-b-xl bg-white">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-100 uppercase text-gray-500 sticky top-0 border-b border-gray-200">
                    <tr>
                      <th className="p-3">Descripción Producto</th>
                      <th className="p-3">Categoría</th>
                      <th className="p-3 text-center">Stock Físico</th>
                      <th className="p-3 text-center">Stock Mín. Req</th>
                      <th className="p-3 text-center">Días sin Venta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.stock_bajo?.map((prod, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-semibold text-gray-900">{prod.Nombre}</td>
                        <td className="p-3 text-gray-500">{prod.categoria || "N/A"}</td>
                        <td className="p-3 text-center font-bold text-red-600 bg-red-50">{prod.stock}</td>
                        <td className="p-3 text-center text-gray-600">{prod.minimo}</td>
                        <td className="p-3 text-center font-mono text-amber-600 font-semibold">{prod.dias_sin_venta ?? "Sin registros"}</td>
                      </tr>
                    ))}
                    {(!data.stock_bajo || data.stock_bajo.length === 0) && (
                      <tr><td colSpan="5" className="p-6 text-center text-gray-400">No se detectaron quiebres de stock mínimo exigible.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABLAS EN PARALELO: CAPITAL INMOVILIZADO Y RENDIMIENTO CATEGORÍAS */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              {/* TABLA 2: CAPITAL INMOVILIZADO */}
              <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                <div className="p-4 bg-white/50 border-b border-gray-200 flex items-center gap-2">
                  <Table size={16} className="text-green-600" />
                  <h3 className="text-sm font-bold text-gray-900">Auditoría Financiera: Capital Inmovilizado Activo (Top 15)</h3>
                </div>
                <div className="overflow-x-auto overflow-y-auto border border-gray-200 rounded-b-xl bg-white">
                  <table className="w-full text-left text-xs text-gray-700">
                    <thead className="bg-gray-100 uppercase text-gray-500 sticky top-0 border-b border-gray-200">
                      <tr>
                        <th className="p-3">Producto</th>
                        <th className="p-3 text-center">Stock Actual</th>
                        <th className="p-3 text-right">Precio Venta</th>
                        <th className="p-3 text-right">Valor Total Disp.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-mono text-gray-600">
                      {data.capital_por_producto?.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="p-3 font-sans text-gray-900 text-left font-semibold">{item.Nombre}</td>
                          <td className="p-3 text-center text-gray-900 font-semibold">{item.stock}</td>
                          <td className="p-3 text-right">${Number(item.Precio_venta).toFixed(2)}</td>
                          <td className="p-3 text-right text-green-600 font-bold">${Number(item.valor).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABLA 3: CATEGORÍAS UNIDADES VS DINERO */}
              <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
                <div className="p-4 bg-white/50 border-b border-gray-200 flex items-center gap-2">
                  <Table size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-bold text-gray-900">Desglose Consolidado de Rendimiento por Categorías</h3>
                </div>
                <div className="overflow-x-auto  overflow-y-auto border border-gray-200 rounded-b-xl bg-white">
                  <table className="w-full text-left text-xs text-gray-700">
                    <thead className="bg-gray-100 uppercase text-gray-500 sticky top-0 border-b border-gray-200">
                      <tr>
                        <th className="p-3">Categoría</th>
                        <th className="p-3 text-center">U. Vendidas</th>
                        <th className="p-3 text-right">Volumen Total ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-600">
                      {data.categorias?.map((cat, index) => {
                        const unidadCat = data.categorias_unidades?.find(u => u.categoria === cat.nombre);
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
          </div>

          {/* ACCIÓN EXPORTACIÓN ACCESIBLE */}
          <div className={`download-btn-container pt-4 flex justify-end border-t border-gray-200 ${exportando ? "invisible" : ""}`}>
            <button onClick={generatePDF} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95">
                <Download size={14} /> Exportar Reporte Analítico a PDF
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default ReporteProductos;