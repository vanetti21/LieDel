import { useEffect, useState } from "react";
import { Search, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const LowStockPage = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("http://localhost:5000/products/low-stock");
      const result = await res.json();
      setData(result);
      setFilteredData(result);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = data.filter((p) => p.Nombre?.toLowerCase().includes(term));
    setFilteredData(filtered);
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "N/A") return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <span className="bg-red-100 text-red-600 text-sm font-semibold px-4 py-2 rounded-full">
          🔴 {filteredData.length} producto
          {filteredData.length !== 1 ? "s" : ""} bajo mínimo
        </span>
      </div>

      <motion.div
        className="rounded-xl p-6 border border-gray-200"
        style={{ backgroundColor: "rgb(240, 243, 249)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-5">
          <motion.h2
            className="text-xl p-1 font-semibold text-black-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Productos con stock crítico
          </motion.h2>

          <div className="relative">
            <input
              type="text"
              placeholder="Search product..."
              className="bg-gray-200 hover:bg-gray-300 text-black placeholder:text-gray-500 rounded-lg pl-10 pr-4 py-2 outline-none"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-500"
              size={18}
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">
                  Mínimo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider text-red-600">
                  Pérdida por Quiebre
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">
                  Última Venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">
                  Última Compra
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">
                  Última Actualización
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-400">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    Cargando...
                  </td>
                </tr>
              ) : Array.isArray(filteredData) && filteredData.length > 0 ? (
                filteredData.map((p, index) => {
                  const isCritical = p.Cantidad_actual <= p.StockMinimo;
                  return (
                    <motion.tr
                      key={index}
                      className="hover:bg-gray-100 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {p.Nombre}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${isCritical ? "text-red-600" : "text-gray-700"}`}
                        >
                          {isCritical && <span className="text-xs">⚠️</span>}
                          {p.Cantidad_actual} u.
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                        {p.StockMinimo} u.
                      </td>

                      {/* NUEVO CAMPO: COSTO DE OPORTUNIDAD POR QUIEBRE */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-red-600">
                        $
                        {p.costo_opportunity?.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        }) ||
                          p.costo_oportunidad?.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(p.ultima_venta)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(p.ultima_compra)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                        {formatDate(p.Ultima_actualizacion)}
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    Sin productos bajo el mínimo 🎉
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default LowStockPage;
