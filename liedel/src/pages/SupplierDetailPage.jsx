import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Truck, ArrowLeft, Phone, Mail, MapPin, 
  Package, DollarSign, Calendar, RefreshCw 
} from "lucide-react";

const SupplierDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSupplierDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/suppliers/${id}`);
      if (!res.ok) throw new Error("Error obteniendo detalles del proveedor");
      const data = await res.json();
      setSupplier(data);
    } catch (error) {
      console.error("Error al cargar proveedor:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplierDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-gray-500">Cargando expediente del proveedor...</p>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex-1 text-center py-20">
        <p className="text-gray-500">No se encontró la información del proveedor.</p>
        <button 
          onClick={() => navigate("/suppliers/list")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto relative z-10 font-sans">
      <main className="max-w-7xl mx-auto py-8 px-4 lg:px-8 space-y-6">

        {/* 1. REGRESO Y CABECERA */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/suppliers/list")}
            className="p-2.5 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 transition-all text-gray-700 font-medium flex items-center gap-2 text-xs shadow-sm"
          >
            <ArrowLeft size={16} /> Volver a Lista de Proveedores
          </button>

          <button
            onClick={fetchSupplierDetail}
            className="p-2.5 bg-white hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200 flex items-center gap-2 text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>

        {/* 2. PERFIL PRINCIPAL */}
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <Truck size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">{supplier.nombre}</h1>
              <p className="text-xs text-gray-500 font-medium">Contacto directo: <span className="text-gray-800 font-bold">{supplier.contacto || "No especificado"}</span></p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-600 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-indigo-600" /> {supplier.telefono || "S/N"}
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-indigo-600" /> {supplier.email || "S/N"}
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-indigo-600" /> {supplier.direccion || "Sin dirección"}
            </div>
          </div>
        </div>

        {/* 3. RESUMEN FINANCIERO / OPERATIVO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <DollarSign size={24} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-gray-400">Total Invertido</span>
              <p className="text-2xl font-black text-emerald-600 font-mono">
                ${(supplier.total_invertido || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
              <Package size={24} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-gray-400">Productos Suministrados</span>
              <p className="text-2xl font-black text-gray-900 font-mono">
                {supplier.total_productos || 0} <span className="text-xs text-gray-400 font-sans font-normal">variedades</span>
              </p>
            </div>
          </div>
        </div>

        {/* 4. TABLA DE HISTORIAL DE PRODUCTOS / PEDIDOS */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-800">Catálogo de Productos Provistos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-100 uppercase text-gray-500 font-bold text-[10px] border-b border-gray-200">
                <tr>
                  <th className="p-3.5 pl-6">Producto</th>
                  <th className="p-3.5 text-center">Stock Actual</th>
                  <th className="p-3.5 text-right">Precio de Compra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {(!supplier.productos || supplier.productos.length === 0) ? (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-gray-400 font-sans">
                      No hay productos asociados a este proveedor.
                    </td>
                  </tr>
                ) : (
                  supplier.productos.map((prod, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-3.5 pl-6 font-sans font-bold text-gray-800">{prod.nombre}</td>
                      <td className="p-3.5 text-center font-bold text-indigo-600">{prod.stock} unids.</td>
                      <td className="p-3.5 text-right font-bold text-gray-900">${(prod.precio_compra || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

export default SupplierDetailPage;