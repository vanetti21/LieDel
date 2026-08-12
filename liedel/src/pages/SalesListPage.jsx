import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowLeft, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SalesListPage = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/ventas/lista")
      .then((res) => res.json())
      .then((data) => {
        setVentas(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar la lista de ventas:", err);
        setLoading(false);
      });
  }, []);

  // Buscador por Cliente o Empleado
  const ventasFiltradas = ventas.filter((v) =>
    (v.cliente && v.cliente.toLowerCase().includes(busqueda.toLowerCase())) ||
    (v.empleado && v.empleado.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-auto relative z-10 py-8 px-4 lg:px-8 max-w-7xl mx-auto">
      
      

      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 p-6">
        
        {/* Encabezado y Buscador */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <ShoppingBag className="text-indigo-600" /> Registro General de Ventas Realizadas
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Haz doble clic en cualquier fila para ver el detalle completo de la venta
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por Cliente o Empleado..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
        </div>

        {/* Tabla de Ventas */}
        {loading ? (
          <div className="text-center py-10 font-semibold text-gray-600">
            Cargando registro de ventas...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="text-xs uppercase bg-indigo-50 text-indigo-900 border-b border-indigo-100">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Atendido Por</th>
                  <th className="py-3 px-4 text-right">Monto Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ventasFiltradas.length > 0 ? (
                  ventasFiltradas.map((v) => (
                    <tr
                      key={v.Id_venta}
                      onDoubleClick={() => navigate(`/sales/${v.Id_venta}`)}
                      title="Haz doble clic para abrir el detalle completo"
                      className="hover:bg-indigo-100/60 transition-colors cursor-pointer select-none"
                    >
                      <td className="py-3 px-4 text-gray-600 font-medium">
                        {v.Fecha_venta}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900 flex items-center gap-2">
                        <User size={14} className="text-indigo-500" /> {v.cliente}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {v.empleado}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">
                        ${v.Total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-gray-500 font-medium">
                      No se encontraron resultados para la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default SalesListPage;