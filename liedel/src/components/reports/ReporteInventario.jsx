import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Download, Package, AlertTriangle, DollarSign, Layers, Calendar, MapPin, Store } from "lucide-react";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#3b82f6"];

const ReporteInventario = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Rangos de fecha iniciales (últimos 12 meses por defecto)
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split("T")[0];
  });
  const [fechaFin, setFechaFin] = useState(() => new Date().toISOString().split("T")[0]);

  const fetchInventario = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/reporte-inventario?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
      if (!res.ok) throw new Error("Error obteniendo datos de inventario");
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Error cargando reporte de inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventario();
  }, [fechaInicio, fechaFin]);

  const generatePDF = () => {
    const input = document.getElementById("reporteInventario");
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

      pdf.save(`Reporte_Auditoria_Inventario_${fechaInicio}_a_${fechaFin}.pdf`);
      if (downloadBtn) downloadBtn.style.display = "flex";
    });
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xs font-mono text-gray-500">
        ⌛ Sincronizando auditoría y evaluando variables predictivas del periodo...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" id="reporteInventario" style={{ backgroundColor: "rgb(247, 249, 253)" }}>
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-5 gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="text-indigo-600" size={22} /> Auditoría y Control de Inventarios
          </h1>
          <p className="text-xs text-gray-500 mt-1">Análisis predictivo de existencias, capital inmovilizado por almacén y alertas de reabastecimiento.</p>
        </div>

        {/* COMPONENTE TEMPORAL EN LINEA */}
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
          {/* BLOQUE DE INDICADORES CLAVE */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
              <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600"><Layers size={20} /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Mix Catálogo</p>
                <h3 className="text-lg font-black text-gray-900">{data.total_productos} ítems</h3>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600"><Package size={20} /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Stock Total</p>
                <h3 className="text-lg font-black text-gray-900">{data.unidades_totales.toLocaleString()} u.</h3>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
              <div className="p-3 rounded-lg bg-amber-50 text-amber-600"><DollarSign size={20} /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Capital Retenido</p>
                <h3 className="text-lg font-black text-gray-900">${data.capital_inmovilizado.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
              <div className="p-3 rounded-lg bg-red-50 text-red-600"><AlertTriangle size={20} /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Ítems Críticos</p>
                <h3 className="text-lg font-black text-gray-900">{data.productos_criticos} prod.</h3>
              </div>
            </div>
          </div>

          {/* TABLA 2: DISTRIBUCIÓN POR ALMACÉN */}
          <div className="rounded-xl border border-gray-200 overflow-hidden flex flex-col" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
            <div className="p-3.5 bg-white/50 border-b border-gray-200 flex items-center gap-2">
              <Store size={16} className="text-indigo-600" />
              <h3 className="text-xs font-bold text-gray-900">Distribución Física y Valorización por Almacén</h3>
            </div>
            <div className="overflow-x-auto bg-white flex-grow">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 uppercase text-gray-400 border-b border-gray-200 text-[10px]">
                  <tr>
                    <th className="p-2 pl-4">Almacén</th>
                    <th className="p-2">Ubicación Sucursal</th>
                    <th className="p-2 text-center">Variedades</th>
                    <th className="p-2 text-center">Unidades Totales</th>
                    <th className="p-2 text-right pr-4">Capital en Almacén</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans text-gray-600 text-[11px]">
                  {data.inventario_almacenes.map((alm, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-2 pl-4 font-bold text-gray-900 flex items-center gap-1.5"><Store size={12} className="text-gray-400"/> {alm.almacen}</td>
                      <td className="p-2 text-gray-500 flex items-center gap-0.5"><MapPin size={11} className="text-gray-300"/>{alm.ubicacion || "S/D"}</td>
                      <td className="p-2 text-center font-mono">{alm.variedades}</td>
                      <td className="p-2 text-center font-mono font-bold text-gray-800">{alm.unidades.toLocaleString()} u.</td>
                      <td className="p-2 text-right font-mono font-black text-gray-900 pr-4">${alm.capital_almacen.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECCIÓN INTERMEDIA: GRÁFICO CIRCULAR DE CATEGORÍAS (TABLA 3) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/3 h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.distribucion_categorias} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="stock_categoria">
                    {data.distribucion_categorias.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} unidades`, 'Stock']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* DESGLOSE EN TABLA COMPACTA DE LA OPCIÓN 3 */}
            <div className="w-full md:w-2/3 overflow-x-auto">
              <table className="w-full text-left text-[11px] text-gray-600">
                <thead className="bg-gray-50 uppercase text-gray-400 text-[9px] border-b border-gray-200">
                  <tr>
                    <th className="p-2">Categoría</th>
                    <th className="p-2 text-center">Stock Acumulado</th>
                    <th className="p-2 text-right">Inversión en Categoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {data.distribucion_categorias.map((cat, index) => (
                    <tr key={index} className="hover:bg-gray-50/50">
                      <td className="p-2 font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        {cat.categoria}
                      </td>
                      <td className="p-2 text-center font-mono">{cat.stock_categoria.toLocaleString()} u.</td>
                      <td className="p-2 text-right font-mono font-bold text-gray-900">${cat.inversion_categoria.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLA 4: TOP 10 DE CAPITAL INMOVILIZADO */}
          <div className="rounded-xl border border-gray-200 overflow-hidden flex flex-col" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
            <div className="p-3.5 bg-white/50 border-b border-gray-200 flex items-center gap-2">
              <Layers className="text-indigo-600" size={16} />
              <h3 className="text-xs font-bold text-gray-900">Top 10 Artículos con Mayor Capital Inmovilizado</h3>
            </div>
            <div className="overflow-x-auto bg-white flex-grow">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 uppercase text-gray-400 border-b border-gray-200 text-[10px]">
                  <tr>
                    <th className="p-2 pl-4">ID</th>
                    <th className="p-2">Producto</th>
                    <th className="p-2">Categoría</th>
                    <th className="p-2 text-center">Stock Actual</th>
                    <th className="p-2 text-right">Costo Unitario (Base)</th>
                    <th className="p-2 text-right pr-4">Valor Total Inmovilizado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans text-gray-600 text-[11px]">
                  {data.top_inversion.map((item) => (
                    <tr key={item.Id_producto} className="hover:bg-gray-50">
                      <td className="p-2 pl-4 font-mono text-gray-400">{item.Id_producto}</td>
                      <td className="p-2 font-bold text-gray-900">{item.producto}</td>
                      <td className="p-2 text-gray-500">{item.categoria}</td>
                      <td className="p-2 text-center font-mono font-bold">{item.stock} u.</td>
                      <td className="p-2 text-right font-mono">${item.costo_unitario.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono font-black text-indigo-950 pr-4">${item.valor_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLA 5: REABASTECIMIENTO Y AUDITORÍA PREDICTIVA */}
          <div className="rounded-xl border border-gray-200 overflow-hidden flex flex-col" style={{ backgroundColor: "rgb(254, 242, 242)" }}>
            <div className="p-3.5 bg-red-50/50 border-b border-red-100 flex items-center gap-2">
              <AlertTriangle className="text-red-600" size={16} />
              <h3 className="text-xs font-bold text-red-900">Auditoría Dinámica Predictiva (Stock ≤ Mínimo Dinámico en el Periodo)</h3>
            </div>
            <div className="overflow-x-auto bg-white flex-grow">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 uppercase text-gray-400 border-b border-gray-200 text-[10px]">
                  <tr>
                    <th className="p-2 pl-4">Producto</th>
                    <th className="p-2 text-center">Consumo Diario Promedio</th>
                    <th className="p-2 text-center">Tiempo Entrega (Lead Time)</th>
                    <th className="p-2 text-center">Stock Seguridad</th>
                    <th className="p-2 text-center">Punto de Pedido (Mínimo)</th>
                    <th className="p-2 text-center">Stock Actual</th>
                    <th className="p-2 pr-4 text-center">Garantía</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-gray-600 text-[11px]">
                  {data.lista_criticos.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-gray-400 font-sans">
                        🎉 Inventario balanceado. Ningún artículo requiere reabastecimiento crítico en este rango temporal.
                      </td>
                    </tr>
                  ) : (
                    data.lista_criticos.map((prod) => (
                      <tr key={prod.Id_producto} className="hover:bg-red-50/30">
                        <td className="p-2 pl-4 font-sans font-bold text-gray-900">{prod.producto}</td>
                        <td className="p-2 text-center text-gray-700">{prod.consumo_diario} u/día</td>
                        <td className="p-2 text-center text-gray-600">{prod.tiempo_entrega} días</td>
                        <td className="p-2 text-center text-gray-400">{prod.stock_seguridad} u.</td>
                        <td className="p-2 text-center font-bold text-gray-800">{prod.minimo} u.</td>
                        <td className="p-2 text-center text-red-600 font-black bg-red-50/50">{prod.stock} u.</td>
                        <td className="p-2 pr-4 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${prod.stock === 0 ? 'bg-black text-white' : 'bg-red-100 text-red-800'}`}>
                            {prod.stock === 0 ? "Ruptura" : "Crítico"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* BOTÓN DE DESCARGA PDF */}
          <div className="download-btn-container pt-4 flex justify-end">
            <button onClick={generatePDF} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95">
              <Download size={14} /> Exportar Reporte de Existencias (PDF)
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ReporteInventario;