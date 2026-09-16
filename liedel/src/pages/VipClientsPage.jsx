import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/common/Header";
import {
  Crown,
  ArrowLeft,
  Phone,
  Mail,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Calendar,
  Star,
  RefreshCw,
} from "lucide-react";

const VipClientsPage = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    ticket_promedio_general: 0,
    total_vip: 0,
    clientes: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchVipClients = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/clientes-vip");
      if (!res.ok) throw new Error("Error obteniendo clientes VIP");
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Error al cargar lista VIP:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVipClients();
  }, []);

  // Filtro de búsqueda por nombre, email o teléfono
  const filteredClients = data.clientes.filter(
    (c) =>
      c.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.Contacto_email &&
        c.Contacto_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.Contacto_telefono && c.Contacto_telefono.includes(searchTerm)),
  );

  return (
    <div className="flex-1 overflow-auto relative z-10 font-sans">
      <main className="max-w-7xl mx-auto py-8 px-4 lg:px-8 space-y-6">
        {/* 2. TARJETAS INFORMATIVAS (DISEÑO LIMPIO Y UNIFORME) */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* TOTAL CLIENTES VIP */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl flex-shrink-0">
              <Crown size={26} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-extrabold block">
                Total Clientes VIP
              </span>
              <span className="text-2xl font-black text-gray-900 font-mono tracking-tight">
                {data.total_vip}{" "}
                <span className="text-sm font-sans font-bold text-gray-500">
                  Compradores
                </span>
              </span>
              <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                Cartera de alto valor comercial
              </p>
            </div>
          </div>

          {/* TICKET PROMEDIO GENERAL */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className="p-3.5 bg-indigo-500/10 text-indigo-600 rounded-2xl flex-shrink-0">
              <TrendingUp size={26} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-extrabold block">
                Ticket Promedio General
              </span>
              <span className="text-2xl font-black text-indigo-600 font-mono tracking-tight">
                $
                {data.ticket_promedio_general.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                Umbral mínimo para calificar VIP
              </p>
            </div>
          </div>

          {/* CRITERIO DINÁMICO */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className="p-3.5 bg-slate-100 text-slate-700 rounded-2xl flex-shrink-0">
              <Star size={26} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-extrabold block">
                Criterio Dinámico
              </span>
              <span className="text-sm font-bold text-gray-800 block leading-snug mt-0.5">
                Calculado en tiempo real
              </span>
              <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                Basado en transacciones efectivas
              </p>
            </div>
          </div>
        </motion.div>

        {/* 3. BUSCADOR Y TABLA VIP */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {/* BARRA DE BÚSQUEDA */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <input
              type="text"
              placeholder="Buscar por cliente, correo o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-500 transition-all shadow-sm"
            />
            <span className="text-xs text-gray-400 font-mono">
              Mostrando {filteredClients.length} de {data.total_vip} VIPs
            </span>
          </div>

          {/* ESTADO CARGANDO */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-9 h-9 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-gray-500">
                Evaluando historial de compras...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-100 uppercase text-gray-500 font-bold text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="p-3.5 pl-6">Cliente VIP</th>
                    <th className="p-3.5 text-center">Compras</th>
                    <th className="p-3.5 text-right">Ticket Prom. Cliente</th>
                    <th className="p-3.5 text-right">Total Inyectado</th>
                    <th className="p-3.5">Producto Preferido</th>
                    <th className="p-3.5 text-center pr-6">Última Compra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-10 text-center text-gray-400 font-sans"
                      >
                        👑 No se encontraron clientes VIP que coincidan con la
                        búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((cl) => (
                      <tr
                        key={cl.Id_cliente}
                        onClick={() =>
                          navigate(`/clients/detail/${cl.Id_cliente}`)
                        }
                        className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                      >
                        {/* DATOS CLIENTE */}
                        <td className="p-3.5 pl-6 font-sans">
                          <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                            {cl.cliente}
                            <Crown
                              size={12}
                              className="text-amber-500 inline-block"
                            />
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Phone size={10} />{" "}
                              {cl.Contacto_telefono || "S/N"}
                            </span>
                            {cl.Contacto_email && (
                              <span className="flex items-center gap-1">
                                <Mail size={10} /> {cl.Contacto_email}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* COMPRAS */}
                        <td className="p-3.5 text-center font-sans">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 font-semibold rounded-md text-[11px]">
                            {cl.total_compras} trans.
                          </span>
                        </td>

                        {/* TICKET PROMEDIO INDIVIDUAL */}
                        <td className="p-3.5 text-right font-bold text-indigo-600">
                          $
                          {cl.ticket_promedio_cliente.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </td>

                        {/* TOTAL GASTADO */}
                        <td className="p-3.5 text-right font-black text-emerald-600">
                          $
                          {cl.total_gastado.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </td>

                        {/* PRODUCTO FAVORITO */}
                        <td className="p-3.5 font-sans">
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold inline-block truncate max-w-[160px]">
                            {cl.producto_favorito}
                          </span>
                        </td>

                        {/* ÚLTIMA FECHA */}
                        <td className="p-3.5 text-center text-gray-500 pr-6 text-[11px]">
                          {cl.ultima_compra || "N/A"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VipClientsPage;
