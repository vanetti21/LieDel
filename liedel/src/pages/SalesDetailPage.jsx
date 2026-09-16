import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBag,
  User,
  Calendar,
  Store,
  DollarSign,
  Package,
} from "lucide-react";

const SalesDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/ventas/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setDetalle(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-20 font-bold text-gray-700">
        Cargando detalles de la venta...
      </div>
    );
  }

  if (!detalle) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-bold mb-4">
          No se encontró la venta solicitada.
        </p>
        <button
          onClick={() => navigate("/sales/list")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold"
        >
          Volver a la Lista
        </button>
      </div>
    );
  }

  const { venta, items } = detalle;

  return (
    <div className="flex-1 overflow-auto relative z-10 py-8 px-4 lg:px-8 max-w-7xl mx-auto">
      {/* Botón para regresar */}

      {/* Encabezado Principal */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              <ShoppingBag className="text-indigo-600" /> Detalle de Venta
            </h1>
            <p className="text-xs text-gray-500 font-semibold mt-1">
              Registro del sistema para la transacción asignada
            </p>
          </div>
          <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl font-extrabold text-lg">
            Total: $
            {venta.Total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Tarjetas de Información General */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs mb-1">
              <User size={16} /> Cliente
            </div>
            <p className="text-sm font-bold text-gray-800">{venta.cliente}</p>
            <p className="text-xs text-gray-500">{venta.cliente_email}</p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs mb-1">
              <User size={16} /> Atendido Por
            </div>
            <p className="text-sm font-bold text-gray-800">{venta.empleado}</p>
            <p className="text-xs text-gray-500">Vendedor Asignado</p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs mb-1">
              <Calendar size={16} /> Fecha & Hora
            </div>
            <p className="text-sm font-bold text-gray-800">
              {venta.Fecha_venta}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs mb-1">
              <Store size={16} /> Sucursal
            </div>
            <p className="text-sm font-bold text-gray-800">{venta.sucursal}</p>
          </div>
        </div>
      </div>

      {/* Tabla de Artículos Comprados */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="text-indigo-600" /> Artículos Facturados (
          {items.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="text-xs uppercase bg-indigo-50 text-indigo-900 border-b border-indigo-100">
              <tr>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 text-center">Cantidad</th>
                <th className="py-3 px-4 text-right">Precio Unitario</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-indigo-50/30 transition-colors"
                >
                  <td className="py-3 px-4 font-bold text-gray-800">
                    {item.producto}
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-gray-500">
                    {item.categoria || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-center font-extrabold text-indigo-600">
                    {item.Cantidad}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    $
                    {item.Precio_unitario.toLocaleString("es-DO", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600">
                    $
                    {item.subtotal.toLocaleString("es-DO", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesDetailPage;
