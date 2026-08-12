import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Truck, ArrowLeft, Phone, Mail, MapPin, RefreshCw, Search } from "lucide-react";

const SuppliersListPage = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/suppliers/list");
      if (!res.ok) throw new Error("Error obteniendo lista de proveedores");
      const data = await res.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter((s) =>
    (s.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.contacto || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.telefono || "").includes(searchTerm)
  );

  return (
    <div className="flex-1 overflow-auto relative z-10 font-sans">
      <main className="max-w-7xl mx-auto py-8 px-4 lg:px-8 space-y-6">

        {/* CABECERA Y BOTONES */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/suppliers")}
              className="p-2.5 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 transition-all text-gray-700 shadow-sm"
              title="Volver"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Truck className="text-indigo-600" size={26} /> Directorio de Proveedores
              </h1>
              <p className="text-xs text-gray-500">
                Lista completa de proveedores y datos de contacto comercial.
              </p>
            </div>
          </div>

          <button
            onClick={fetchSuppliers}
            className="p-2.5 bg-white hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200 flex items-center gap-2 text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualizar
          </button>
        </div>

        {/* TABLA DE PROVEEDORES */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          
          {/* BARRA BÚSQUEDA */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar proveedor, contacto, correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>
            <span className="text-xs text-gray-400 font-mono">
              Total: {filteredSuppliers.length} proveedores
            </span>
          </div>

          {/* ESTADO CARGANDO O TABLA */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-9 h-9 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-gray-500">Cargando directorio...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-100 uppercase text-gray-500 font-bold text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="p-3.5 pl-6">Proveedor</th>
                    <th className="p-3.5">Contacto</th>
                    <th className="p-3.5">Teléfono</th>
                    
                    <th className="p-3.5 pr-6">Dirección</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-10 text-center text-gray-400 font-sans">
                        🚚 No se encontraron proveedores que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    // En tu mapeo dentro de SuppliersListPage.jsx:
                    filteredSuppliers.map((s, idx) => (
                      <tr 
                        key={s.id || idx} 
                        onDoubleClick={() => navigate(`/suppliers/detail/${s.id}`)}
                        className="hover:bg-indigo-50/50 transition-colors cursor-pointer select-none group"
                        title="Haz doble clic para ver el detalle completo"
                      >
                        <td className="p-3.5 pl-6 font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {s.nombre || "Sin Nombre"}
                        </td>
                        <td className="p-3.5 text-gray-600 font-medium">
                          {s.contacto || "N/A"}
                        </td>
                        <td className="p-3.5 font-mono text-gray-600">
                          <span className="flex items-center gap-1.5">
                            <Phone size={12} className="text-gray-400" /> {s.telefono || "S/N"}
                          </span>
                        </td>
                        
                        <td className="p-3.5 pr-6 text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-gray-400 flex-shrink-0" /> {s.direccion || "No especificada"}
                          </span>
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

export default SuppliersListPage;