import { useState } from "react";
import { FileSpreadsheet, Download, CheckCircle } from "lucide-react";

const Excel = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  const exportarExcel = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      let url = "http://localhost:5000/api/exportar-excel";
      if (startDate && endDate) url += `?inicio=${startDate}&fin=${endDate}`;

      const res  = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href     = URL.createObjectURL(blob);
      link.download = "ventas.xlsx";
      link.click();
      URL.revokeObjectURL(link.href);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error al exportar:", err);
      alert("No se pudo exportar. Verifica que el servidor esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 text-white">

      {/* Filtro de fechas — igual que ReportsPage */}
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-gray-700 p-2 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-gray-700 p-2 rounded"
        />
      </div>

      {/* Contenido principal */}
      <div
        className="p-5 rounded-xl shadow space-y-8"
        style={{ backgroundColor: "rgb(240, 243, 249)" }}
      >
        {/* Título */}
        <h2 className="text-4xl font-medium mb-3 text-black text-center">
          Exportar datos a Excel
          {startDate && endDate && (
            <>
              {" "}desde <span className="text-black">{startDate}</span> hasta{" "}
              <span className="text-black">{endDate}</span>
            </>
          )}
        </h2>

        {/* Info del archivo */}
        <div className="bg-green-500 bg-opacity-40 border-gray-200 p-4 rounded-xl flex items-center gap-4">
          <FileSpreadsheet className="text-green-600 w-8 h-8" />
          <div>
            <p className="text-sm text-black font-medium">El archivo Excel incluye 3 hojas:</p>
            <ul className="text-sm text-black mt-1 space-y-0.5">
              <li>• <span className="font-mono font-medium">Ventas</span> — detalle completo de ventas</li>
              <li>• <span className="font-mono font-medium">Por_Categoria</span> — resumen por categoría</li>
              <li>• <span className="font-mono font-medium">Por_Empleado</span> — total vendido por empleado</li>
            </ul>
          </div>
        </div>

        {/* Nota de fechas */}
        {(!startDate || !endDate) && (
          <p className="text-gray-500 text-sm text-center">
            Selecciona un rango de fechas para filtrar, o exporta todos los datos sin filtro.
          </p>
        )}

        {/* Botón exportar */}
        <button
          onClick={exportarExcel}
          disabled={loading}
          className="mt-4 bg-green-700 hover:bg-green-600 disabled:bg-gray-500 text-white py-2 px-6 rounded-lg flex items-center gap-2 transition-colors"
        >
          {loading ? (
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
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Excel;