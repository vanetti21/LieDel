import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Download, Calendar, DollarSign, RefreshCw, FileText, Package, TrendingUp, ArrowUpRight, ArrowDownLeft, Percent } from "lucide-react";

const ReporteProductoEspecifico = () => {
  const hoy = new Date().toISOString().split("T")[0];
  const haceUnAno = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split("T")[0];

  const [idProducto, setIdProducto] = useState("1"); // Cambiar por el ID que desees auditar
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(haceUnAno);
  const [fechaFin, setFechaFin] = useState(hoy);

  const fetchProductoEspecifico = async () => {
    if (!idProducto) return;
    try {
      setLoading(true);
      const url = `http://localhost:5000/api/reporte-producto-especifico?id_producto=${idProducto}&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error cargando analítica de producto");
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Error cargando reporte de producto:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductoEspecifico();
  }, []);

  const generatePDF = () => {
    const input = document.getElementById("reporteProductoCanvas");
    const downloadBtn = document.querySelector(".download-btn-container");
    if (downloadBtn) downloadBtn.style.display = "none";

    html2canvas(input, { scale: 1.5, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Auditoria_Producto_${data?.codigo || idProducto}.pdf`);
      if (downloadBtn) downloadBtn.style.display = "block";
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="p-6 bg-white min-h-screen text-gray-800 font-sans">
      
      {/* SECTOR DE BUSQUEDA Y FILTRADO */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 border border-gray-200 p-5 rounded-xl" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">📦 Trazabilidad y Auditoría de Producto Único</h2>
          <p className="text-xs text-gray-500">Historial profundo de rotación, rentabilidad y reabastecimiento indexado por rango de fecha.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200 w-full lg:w-auto">
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-600 px-2 border-r border-gray-200">
            ID Producto:
            <input type="number" value={idProducto} onChange={(e) => setIdProducto(e.target.value)} className="w-14 bg-gray-100 p-1 rounded font-mono text-center outline-none border border-gray-200" />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 px-2">
            <Calendar size={14} /> Desde:
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="bg-gray-100 p-1.5 rounded-md text-gray-800 font-mono border border-gray-200 outline-none" />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 px-2">
            Hasta:
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="bg-gray-100 p-1.5 rounded-md text-gray-800 font-mono border border-gray-200 outline-none" />
          </div>
          <button onClick={fetchProductoEspecifico} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95 ml-auto lg:ml-0">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Auditar SKU
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-20 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-indigo-600 font-medium">Cruzando flujos de inventario, compras logísticas y facturas de venta...</p>
        </div>
      )}

      {data && !loading && (
        <div id="reporteProductoCanvas" className="space-y-8 bg-white p-6 rounded-2xl border border-gray-200">
          
          {/* ENCABEZADO DEL PRODUCTO AUDITADO */}
          <div className="border border-gray-200 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">{data.categoria}</span>
              <h3 className="text-lg font-black text-gray-900 mt-1">📊 {data.producto}</h3>
              <p className="text-xs text-gray-500 font-mono">Código Único SKU: {data.codigo}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-center min-w-[120px]">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Stock en Almacén</span>
              <span className="text-xl font-black text-gray-800 font-mono">{data.stock_actual} unidades</span>
            </div>
          </div>

          {/* TARJETAS DE KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-gray-200 flex items-center gap-3.5 shadow-sm" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-lg"><Package size={20} /></div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Despachado (Ventas)</span>
                <span className="text-lg font-black text-indigo-600 font-mono">{data.unidades_vendidas} u.</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 flex items-center gap-3.5 shadow-sm" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-2.5 bg-green-100 text-green-600 rounded-lg"><DollarSign size={20} /></div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Ingreso Bruto</span>
                <span className="text-lg font-black text-green-600 font-mono">${data.ingresos_totales.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 flex items-center gap-3.5 shadow-sm" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-2.5 bg-amber-100 text-amber-600 rounded-lg"><ArrowUpRight size={20} /></div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Ganancia Real</span>
                <span className="text-lg font-black text-amber-600 font-mono">${data.ganancia_neta.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 flex items-center gap-3.5 shadow-sm" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-2.5 bg-purple-100 text-purple-600 rounded-lg"><Percent size={20} /></div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Margen Comercial</span>
                <span className="text-lg font-black text-purple-600 font-mono">{data.margen_porcentaje}%</span>
              </div>
            </div>
          </div>

          {/* GRÁFICO DE TENDENCIA DE VENTAS */}
          <div className="p-5 rounded-xl border border-gray-200" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
            <h3 className="text-sm font-bold mb-3 text-gray-900 flex items-center gap-2"><TrendingUp size={16} className="text-indigo-600"/> Curva de Demanda Temporal del Artículo</h3>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={data.tendencia_ventas}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => [`${value} unidades`, 'Rotación Real']} />
                <Line type="monotone" dataKey="unidades_vendidas" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* TABLAS COMPARATIVAS DE FLUJO (COMPRAS VS VENTAS) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SALIDAS: HISTORIAL DE VENTAS */}
            <div className="rounded-xl border border-gray-200 overflow-hidden flex flex-col" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-3.5 bg-white/50 border-b border-gray-200 flex items-center gap-2">
                <ArrowDownLeft size={16} className="text-red-500" />
                <h3 className="text-xs font-bold text-gray-900">Historial de Salidas / Facturación a Clientes</h3>
              </div>
              <div className="overflow-x-auto bg-white flex-grow">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50 uppercase text-gray-400 border-b border-gray-200 text-[10px]">
                    <tr>
                      <th className="p-2 pl-4">Fecha</th>
                      <th className="p-2">Comprador</th>
                      <th className="p-2 text-center">Cant.</th>
                      <th className="p-2 text-right pr-4">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono text-gray-600 text-[11px]">
                    {data.historial_ventas.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-4 text-center text-gray-400 font-sans">❌ Sin salidas comerciales registradas.</td>
                      </tr>
                    ) : (
                      data.historial_ventas.map((vnt, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-2 pl-4 text-gray-400">{formatDate(vnt.fecha)}</td>
                          <td className="p-2 font-sans text-gray-900 font-medium">{vnt.cliente || "Consumidor Final"}</td>
                          <td className="p-2 text-center font-bold">{vnt.unidades} u.</td>
                          <td className="p-2 text-right font-black text-gray-900 pr-4">${vnt.total.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ENTRADAS: HISTORIAL DE COMPRAS */}
            <div className="rounded-xl border border-gray-200 overflow-hidden flex flex-col" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
              <div className="p-3.5 bg-white/50 border-b border-gray-200 flex items-center gap-2">
                <ArrowUpRight size={16} className="text-green-500" />
                <h3 className="text-xs font-bold text-gray-900">Historial de Entradas / Reabastecimiento Logístico</h3>
              </div>
              <div className="overflow-x-auto bg-white flex-grow">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50 uppercase text-gray-400 border-b border-gray-200 text-[10px]">
                    <tr>
                      <th className="p-2 pl-4">Fecha</th>
                      <th className="p-2">Proveedor</th>
                      <th className="p-2 text-center">Cant.</th>
                      <th className="p-2 text-center pr-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono text-gray-600 text-[11px]">
                    {data.historial_compras.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-4 text-center text-gray-400 font-sans">❌ Sin órdenes de reabastecimiento en este rango.</td>
                      </tr>
                    ) : (
                      data.historial_compras.map((cmp, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-2 pl-4 text-gray-400">{formatDate(cmp.fecha)}</td>
                          <td className="p-2 font-sans text-gray-900 font-medium">{cmp.proveedor}</td>
                          <td className="p-2 text-center font-bold text-indigo-600">{cmp.unidades} u.</td>
                          <td className="p-2 text-center pr-4 font-sans">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${cmp.Estado?.toLowerCase() === 'completada' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                              {cmp.Estado}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* NUEVO APARTADO: MOVIMIENTOS Y TRANSFERENCIAS INTERNAS */}
            <div className="rounded-xl border border-gray-200 overflow-hidden flex flex-col mt-6" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
            <div className="p-3.5 bg-white/50 border-b border-gray-200 flex items-center gap-2">
                <RefreshCw size={16} className="text-purple-600" />
                <h3 className="text-xs font-bold text-gray-900">Historial de Transferencias Internas entre Almacenes</h3>
            </div>
            <div className="overflow-x-auto bg-white flex-grow">
                <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 uppercase text-gray-400 border-b border-gray-200 text-[10px]">
                    <tr>
                    <th className="p-2 pl-4">ID Transf.</th>
                    <th className="p-2">Fecha</th>
                    <th className="p-2">Origen</th>
                    <th className="p-2">Destino</th>
                    <th className="p-2 text-center pr-4">Cantidad</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-gray-600 text-[11px]">
                    {data.historial_transferencias.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="p-4 text-center text-gray-400 font-sans">
                        ℹ️ No se registraron traslados internos para este producto en el periodo seleccionado.
                        </td>
                    </tr>
                    ) : (
                    data.historial_transferencias.map((tf) => (
                        <tr key={tf.Id_transferencia} className="hover:bg-gray-50">
                        <td className="p-2 pl-4 text-gray-400">#{tf.Id_transferencia}</td>
                        <td className="p-2 text-gray-500">{formatDate(tf.fecha)}</td>
                        <td className="p-2 font-sans text-red-600 font-medium">⬇️ {tf.almacen_origen}</td>
                        <td className="p-2 font-sans text-green-600 font-medium">⬆️ {tf.almacen_destino}</td>
                        <td className="p-2 text-center font-black text-gray-900 pr-4">{tf.unidades} u.</td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
            </div>
            {/* APARTADO: AUDITORÍA DE PRECIOS HISTÓRICOS */}
            <div className="rounded-xl border border-gray-200 overflow-hidden flex flex-col mt-6" style={{ backgroundColor: "rgb(240, 243, 249)" }}>
            <div className="p-3.5 bg-white/50 border-b border-gray-200 flex items-center gap-2">
                <DollarSign size={16} className="text-amber-600" />
                <h3 className="text-xs font-bold text-gray-900">Historial de Ajustes de Precios y Variación Cronológica</h3>
            </div>
            <div className="overflow-x-auto bg-white flex-grow">
                <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 uppercase text-gray-400 border-b border-gray-200 text-[10px]">
                    <tr>
                    <th className="p-2 pl-4">Fecha Ajuste</th>
                    <th className="p-2 text-center">Precio Anterior</th>
                    <th className="p-2 text-center">Precio Nuevo</th>
                    <th className="p-2 text-center">Variación</th>
                    <th className="p-2 pl-4 pr-4">Motivo del Cambio</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-gray-600 text-[11px]">
                    {!data?.historial_precios || data.historial_precios.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="p-4 text-center text-gray-400 font-sans">
                        ℹ️ No hay variaciones de precio registradas en este periodo para este producto.
                        </td>
                        
                    </tr>
                    ) : (
                    data.historial_precios.map((hp) => {
                        const diferencia = hp.precio_nuevo - hp.precio_anterior;
                        console.log("SI imprime consola");
                        console.log(data);
                        console.log(data?.historial_precios);    
                        return (
                        <tr key={hp.Id_precio} className="hover:bg-gray-50">
                            <td className="p-2 pl-4 text-gray-400 font-sans">{formatDate(hp.fecha)}</td>
                            <td className="p-2 text-center text-gray-500">${hp.precio_anterior.toFixed(2)}</td>
                            <td className="p-2 text-center font-bold text-gray-900">${hp.precio_nuevo.toFixed(2)}</td>
                            <td className={`p-2 text-center font-bold ${diferencia > 0 ? 'text-green-600' : diferencia < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                            {diferencia > 0 ? `+$${diferencia.toFixed(2)}` : diferencia < 0 ? `-$${Math.abs(diferencia).toFixed(2)}` : 'Sin cambio'}
                            </td>
                            <td className="p-2 pl-4 pr-4 font-sans text-gray-500 text-left truncate max-w-xs" title={hp.motivo}>
                            {hp.motivo || "No especificado"}
                            </td>
                        </tr>
                        );
                    })
                    )}
                </tbody>
                </table>
            </div>
            </div>

          </div>

          {/* ACCION DE EXPORTACION */}
          <div className="download-btn-container pt-4 flex justify-end border-t border-gray-200">
            <button onClick={generatePDF} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95">
              <Download size={14} /> Exportar Ficha de Auditoría de Producto
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default ReporteProductoEspecifico;