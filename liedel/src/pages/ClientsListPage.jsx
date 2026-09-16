import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Users,
  MapPin,
  ShoppingCart,
  Calendar,
} from "lucide-react";

const ClientsListPage = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/clients-table")
      .then((res) => res.json())
      .then((data) => {
        setClients(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar lista de clientes:", err);
        setLoading(false);
      });
  }, []);

  const filteredClients = clients.filter(
    (c) =>
      c.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex-1 overflow-auto relative z-10 font-sans">
      <main className="max-w-7xl mx-auto py-8 px-4 lg:px-8">
        {/* BOTÓN REGRESAR */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-indigo-600 transition"
        >
          <ArrowLeft size={16} /> Volver a Clientes
        </button>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          {/* HEADER CON BUSCADOR */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users size={22} className="text-indigo-600" /> Lista General de
                Clientes
              </h2>
              <p className="text-xs text-gray-500">
                Visualización detallada de compras acumuladas, gastos y última
                interacción comercial.
              </p>
            </div>

            {/* BARRA DE BÚSQUEDA */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Buscar cliente o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-indigo-500 transition"
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={16}
              />
            </div>
          </div>

          {/* TABLA DE CLIENTES */}
          {loading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-indigo-600 text-sm font-medium animate-pulse">
                Cargando base de datos de clientes...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Ubicación</th>
                    <th className="p-3 text-center">Total Compras</th>
                    <th className="p-3 text-right">Total Gastado</th>
                    <th className="p-3 text-center">Última Compra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-gray-600">
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-6 text-center text-gray-400 font-sans"
                      >
                        No se encontraron clientes registrados.
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((c, idx) => (
                      <tr
                        key={idx}
                        onDoubleClick={() =>
                          navigate(`/clients/detail/${c.Id_cliente}`)
                        }
                        className="hover:bg-indigo-50/50 cursor-pointer transition-colors"
                        title="Haz doble clic para ver el detalle del cliente"
                      >
                        <td className="p-3 font-sans text-gray-900 font-bold">
                          {c.cliente}
                        </td>

                        {/* UBICACIÓN */}
                        <td className="p-3 font-sans text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} className="text-gray-400" />
                            {c.ubicacion || "No especificada"}
                          </span>
                        </td>

                        {/* TOTAL COMPRAS */}
                        <td className="p-3 text-center font-sans font-semibold text-gray-800">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px]">
                            <ShoppingCart size={12} /> {c.total_compras}
                          </span>
                        </td>

                        {/* TOTAL GASTADO */}
                        <td className="p-3 text-right text-emerald-600 font-bold font-mono text-sm">
                          $
                          {Number(c.total_gastado).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </td>

                        {/* ÚLTIMA COMPRA */}
                        <td className="p-3 text-center font-sans text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={12} className="text-gray-400" />
                            {c.ultima_compra
                              ? new Date(c.ultima_compra).toLocaleDateString()
                              : "Sin compras"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default ClientsListPage;