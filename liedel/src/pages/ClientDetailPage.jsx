import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Mail, Phone, MapPin, ShoppingBag, 
  HeartHandshake, XCircle, TrendingUp, Radio, User,
  Building2, Package
} from "lucide-react";

import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip 
} from "recharts";

const ClientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/client-detail/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setDetail(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar detalle del cliente:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-indigo-600 font-medium text-sm animate-pulse">Cargando perfil del cliente...</p>
        </div>
      </div>
    );
  }

  if (!detail || detail.error) {
    return (
      <div className="flex-1 p-8 text-center text-gray-500">
        <p>No se encontró la información de este cliente.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 underline">Volver atrás</button>
      </div>
    );
  }

  // Desestructuración segura con valores por defecto
  const { 
    cliente = {}, 
    resumen = {}, 
    sucursales = [], 
    productos_comprados = [], 
    historial_compras = [], 
    comparativa_canales = [], 
    tendencia_compras = [] 
  } = detail;

  return (
    <div className="flex-1 overflow-auto relative z-10 font-sans">
      <main className="max-w-7xl mx-auto py-8 px-4 lg:px-8 space-y-6">
        
        {/* ENCABEZADO */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-indigo-600 transition"
        >
          <ArrowLeft size={16} /> Volver a Lista de Clientes
        </button>

        {/* FICHA TÉCNICA DEL CLIENTE */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-2xl border border-indigo-100">
              <User size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-gray-900">{cliente.Nombre || "Cliente sin nombre"}</h1>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-mono">
                  ID: #{cliente.Id_cliente}
                </span>
                {resumen.es_leal && (
                  <span className="flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    <HeartHandshake size={12} /> Cliente Leal
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2">
                <span className="flex items-center gap-1"><Mail size={13} className="text-indigo-500" /> {cliente.Contacto_email || "N/A"}</span>
                <span className="flex items-center gap-1"><Phone size={13} className="text-indigo-500" /> {cliente.Contacto_telefono || "N/A"}</span>
                <span className="flex items-center gap-1"><MapPin size={13} className="text-indigo-500" /> {cliente.Ubicacion || "No especificada"}</span>
              </div>
            </div>
          </div>

          {/* TARJETAS RÁPIDAS */}
          <div className="flex gap-4 w-full md:w-auto overflow-x-auto">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-gray-400">Compras</span>
              <p className="text-base font-bold text-gray-900 font-mono">{resumen.total_compras || 0}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 min-w-[130px]">
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Gastado</span>
              <p className="text-base font-bold text-emerald-600 font-mono">
                ${Number(resumen.monto_total_gastado || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-gray-400">Canceladas</span>
              <p className={`text-base font-bold font-mono ${resumen.canceladas_cant > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {resumen.canceladas_cant || 0}
              </p>
            </div>
          </div>
        </motion.div>

        {/* SECCIÓN GRÁFICOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-indigo-600" /> Histórico de Consumo por Mes
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tendencia_compras}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(val) => [`$${Number(val).toLocaleString()}`, "Monto Gastado"]} />
                  <Area type="monotone" dataKey="total_mes" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Radio size={18} className="text-emerald-600" /> Gastos por Canal de Compra
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparativa_canales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="canal" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(val) => [`$${Number(val).toLocaleString()}`, "Monto"]} />
                  <Bar dataKey="monto" fill="#10B981" radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SUCURSALES Y PRODUCTOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* SUCURSALES */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Building2 size={16} className="text-indigo-600" /> Sucursales Frecuentadas
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="p-3">Sucursal</th>
                    <th className="p-3 text-center">Compras</th>
                    <th className="p-3 text-right">Total Gastado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-gray-600">
                  {sucursales.length === 0 ? (
                    <tr><td colSpan="3" className="p-4 text-center font-sans text-gray-400">Sin datos de sucursal</td></tr>
                  ) : (
                    sucursales.map((s, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-3 font-sans font-bold text-gray-800">{s.sucursal}</td>
                        <td className="p-3 text-center font-sans">{s.compras}</td>
                        <td className="p-3 text-right font-bold text-emerald-600">
                          ${Number(s.total_gastado).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PRODUCTOS */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Package size={16} className="text-indigo-600" /> Productos más Comprados
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="p-3">Producto</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3 text-center">Cant.</th>
                    <th className="p-3 text-right">Invertido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-gray-600">
                  {productos_comprados.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-4 text-center font-sans text-gray-400">
                        Sin productos registrados
                      </td>
                    </tr>
                  ) : (
                    productos_comprados.map((p, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-3 font-sans font-bold text-gray-900">{p.producto}</td>
                        <td className="p-3 font-sans text-gray-500">
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-[11px] font-medium">
                            {p.categoria || "Sin categoría"}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-indigo-600">{p.cantidad_comprada}</td>
                        <td className="p-3 text-right font-bold text-emerald-600">
                          ${Number(p.total_invertido).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* HISTORIAL GENERAL DE VENTAS */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag size={16} className="text-indigo-600" /> Historial Detallado de Ventas
            </h3>
            <span className="text-xs text-gray-500 font-mono">{historial_compras.length} Registros</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-100 uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="p-3"># Venta</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Canal</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Monto Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-gray-600">
                {historial_compras.length === 0 ? (
                  <tr><td colSpan="5" className="p-4 text-center font-sans text-gray-400">Sin historial de ventas</td></tr>
                ) : (
                  historial_compras.map((venta) => {
                    const isCancelada = ['cancelada', 'anulada'].includes((venta.estado || '').toLowerCase());
                    return (
                      <tr key={venta.Id_venta} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-indigo-600">#{venta.Id_venta}</td>
                        <td className="p-3 font-sans text-gray-600">{venta.fecha}</td>
                        <td className="p-3 font-sans font-semibold text-gray-800">{venta.canal}</td>
                        <td className="p-3 font-sans">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCancelada ? 'bg-red-100 text-red-800 flex items-center gap-1 w-max' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isCancelada && <XCircle size={10} />}
                            {venta.estado || 'Completada'}
                          </span>
                        </td>
                        <td className={`p-3 text-right font-bold ${isCancelada ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          ${Number(venta.monto || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

export default ClientDetailPage;