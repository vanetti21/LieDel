import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, Download, CheckCircle, ChevronDown, ChevronRight } from "lucide-react";

const CATEGORIAS = [
  {
    id: "ventas",
    label: "Ventas y Clientes",
    hojas: [
      { id: "detalle",  label: "Detalle completo de ventas" },
      { id: "canal",    label: "Por Canal (presencial vs online)" },
      { id: "clientes", label: "Top Clientes" },
      { id: "suc_mes",  label: "Ventas por Sucursal y Mes" },
    ],
  },
  {
    id: "inventario",
    label: "Inventario",
    hojas: [
      { id: "stock",      label: "Stock Actual por Sucursal" },
      { id: "defectuoso", label: "Productos Defectuosos" },
      { id: "dead_stock", label: "Dead Stock (sin movimiento)" },
    ],
  },
  {
    id: "compras",
    label: "Compras y Proveedores",
    hojas: [
      { id: "compras_detalle", label: "Detalle de Compras" },
      { id: "proveedores",     label: "Resumen por Proveedor" },
    ],
  },
  {
    id: "rrhh",
    label: "Recursos Humanos",
    hojas: [
      { id: "empleados", label: "Ranking de Empleados" },
    ],
  },
];

// startDate y endDate vienen de ReportsPage (los captura Ventas_Fecha)
const ExcelExporter = ({ startDate, endDate }) => {
  const [abiertos,      setAbiertos]      = useState({});
  const [seleccionadas, setSeleccionadas] = useState({});
  const [loadingExcel,  setLoadingExcel]  = useState(false);
  const [success,       setSuccess]       = useState(false);

  const toggleCategoria = (id) =>
    setAbiertos((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleHoja = (id) =>
    setSeleccionadas((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleTodaCategoria = (categoria) => {
    const todasMarcadas = categoria.hojas.every((h) => seleccionadas[h.id]);
    const update = {};
    categoria.hojas.forEach((h) => { update[h.id] = !todasMarcadas; });
    setSeleccionadas((prev) => ({ ...prev, ...update }));
  };

  const totalSeleccionadas = Object.values(seleccionadas).filter(Boolean).length;

  const exportarExcel = async () => {
    if (totalSeleccionadas === 0) {
      alert("Selecciona al menos una hoja antes de exportar.");
      return;
    }
    const hojasParam = Object.entries(seleccionadas)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(",");

    setLoadingExcel(true);
    setSuccess(false);
    try {
      let url = `http://localhost:5000/api/exportar-excel?hojas=${hojasParam}`;
      if (startDate && endDate) url += `&inicio=${startDate}&fin=${endDate}`;
      const res  = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href     = URL.createObjectURL(blob);
      link.download = "reporte_muebleria.xlsx";
      link.click();
      URL.revokeObjectURL(link.href);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error al exportar:", err);
      alert("No se pudo exportar. Verifica que el servidor esté corriendo.");
    } finally {
      setLoadingExcel(false);
    }
  };

  return (
    <motion.div
      key="excel-exporter"
      className="rounded-xl p-5 -mt-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div
        className="p-6 rounded-xl shadow space-y-5"
        style={{ backgroundColor: "rgb(240, 243, 249)" }}
      >
        {/* Encabezado */}
        <div className="flex items-center gap-3">
          <Sheet className="text-green-600 shrink-0" />
          <h2 className="text-2xl font-medium text-black">
            Exportar a Excel
            {startDate && endDate && (
              <span className="text-lg font-normal text-gray-500 ml-2">
                desde {startDate} hasta {endDate}
              </span>
            )}
          </h2>
        </div>

        {/* Instrucción + contador */}
        <p className="text-sm text-gray-500">
          Selecciona las hojas que quieres incluir en el archivo.
          {totalSeleccionadas > 0 && (
            <span className="ml-2 font-semibold text-green-700">
              {totalSeleccionadas} hoja{totalSeleccionadas > 1 ? "s" : ""} seleccionada{totalSeleccionadas > 1 ? "s" : ""}
            </span>
          )}
        </p>

        {/* Acordeón */}
        <div className="space-y-2">
          {CATEGORIAS.map((categoria) => {
            const estaAbierta   = !!abiertos[categoria.id];
            const todasMarcadas = categoria.hojas.every((h) => seleccionadas[h.id]);
            const algunaMarcada = categoria.hojas.some((h) => seleccionadas[h.id]);

            return (
              <div key={categoria.id} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between bg-white px-4 py-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={todasMarcadas}
                      ref={(el) => { if (el) el.indeterminate = algunaMarcada && !todasMarcadas; }}
                      onChange={() => toggleTodaCategoria(categoria)}
                      className="w-4 h-4 accent-green-600 cursor-pointer"
                    />
                    <span className="font-semibold text-gray-800">{categoria.label}</span>
                  </div>
                  <button
                    onClick={() => toggleCategoria(categoria.id)}
                    className="text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    {estaAbierta
                      ? <ChevronDown className="w-5 h-5" />
                      : <ChevronRight className="w-5 h-5" />}
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {estaAbierta && (
                    <motion.div
                      key="hojas"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="divide-y divide-gray-100 bg-gray-50 px-4">
                        {categoria.hojas.map((hoja) => (
                          <label
                            key={hoja.id}
                            className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-gray-100 rounded px-2 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={!!seleccionadas[hoja.id]}
                              onChange={() => toggleHoja(hoja.id)}
                              className="w-4 h-4 accent-green-600"
                            />
                            <span className="text-sm text-gray-700">{hoja.label}</span>
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Botón centrado */}
        <div className="flex justify-center pt-2">
          <button
            onClick={exportarExcel}
            disabled={loadingExcel || totalSeleccionadas === 0}
            className="bg-green-700 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-8 rounded-lg flex items-center gap-2 transition-colors"
          >
            {loadingExcel ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exportando...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-4 h-4" />
                ¡Descargado!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Descargar Excel
                {totalSeleccionadas > 0 && (
                  <span className="ml-1 text-xs bg-white text-green-700 font-bold px-1.5 py-0.5 rounded-full">
                    {totalSeleccionadas}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ExcelExporter;