import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Download, CheckCircle, Sheet, FileText } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,   // Asegúrate de importar PieChart
  Pie,
  Cell,       // Asegúrate de importar Cell
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

const ReportsPage = () => {
  const [formato, setFormato]       = useState(null); // 'excel' | 'pdf'
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [data, setData]             = useState(null);

  useEffect(() => {
    if (formato !== "pdf" || !startDate || !endDate) return;
    const fetchData = async () => {
      setLoadingReport(true);
      setSuccess(false);
      try {
        const response = await fetch(
          `http://localhost:5000/api/reporte-fechas?inicio=${startDate}&fin=${endDate}`
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error al obtener el reporte:", error);
      } finally {
        setLoadingReport(false);
      }
    };
    fetchData();
  }, [startDate, endDate, formato]);


  const handleFormato = (f) => {
    setFormato(f);
    setData(null);
    setStartDate("");
    setEndDate("");
    setSuccess(false);
  };


  const exportarExcel = async () => {
    setLoadingExcel(true);
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
      setLoadingExcel(false);
    }
  };
 
  // Generar PDF — lógica original intacta
  const generatePDF = () => {
    setLoadingPDF(true);
    setSuccess(false);
    const input = document.getElementById("reportContent");
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData   = canvas.toDataURL("image/png");
      const pdf       = new jsPDF("p", "mm", "a4");
      const pdfWidth  = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth  = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft  = imgHeight;
      let position    = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      pdf.save("reporte_ventas.pdf");
      setLoadingPDF(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  };
  

  return (
    <div className="p-5 text-white">
      <div className="flex gap-4 mb-6">
        <motion.button
          onClick={() => handleFormato("excel")}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center gap-2 px-9 py-2.5 rounded-lg font-semibold ${
            formato === "excel"
              ? "bg-green-600 text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Sheet className="w-4 h-4" />
          Excel
        </motion.button>


        <motion.button
          onClick={() => handleFormato("pdf")}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center gap-2 px-10 py-2.5 rounded-lg font-semibold ${
            formato === "pdf"
              ? "bg-red-600 text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-gray-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          PDF
        </motion.button>

      </div>

       <AnimatePresence mode="wait">
 
        {/* Sin selección */}
        {!formato && (
          <motion.p
            key="empty"
            className="text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            Selecciona un formato para continuar.
          </motion.p>
        )}
 
        {/* ── EXCEL ── */}
        {formato === "excel" && (
          <motion.div
            key="excel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            {/* Fechas */}
            <div className="flex gap-4 mb-6">
              <motion.input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white hover:bg-gray-200 text-black font-semibold p-2 rounded outline-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              />
              <motion.input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white hover:bg-gray-200 text-black font-semibold p-2 rounded outline-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              />
            </div>
 
            {/* Card Excel */}
            <motion.div
              className="p-5 rounded-xl shadow space-y-6"
              style={{ backgroundColor: "rgb(240, 243, 249)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-medium text-black text-center">
                Exportar datos a Excel
                {startDate && endDate && (
                  <> desde <span className="text-black">{startDate}</span> hasta{" "}
                  <span className="text-black">{endDate}</span></>
                )}
              </h2>
 
              <div className="bg-green-500 bg-opacity-40 border-gray-200 p-4 rounded-xl flex items-center gap-4">
                <Sheet className="text-green-500 w-8 h-8 shrink-0" />
                <div>
                  <p className="text-base text-black font-medium">
                    El archivo Excel incluye 3 hojas:
                  </p>
                  <ul className="text-base text-black mt-1 space-y-0.5">
                    <li>• <span className="font-mono font-medium">Ventas</span> — detalle completo de ventas</li>
                    <li>• <span className="font-mono font-medium">Por Categoría</span> — resumen por categoría</li>
                    <li>• <span className="font-mono font-medium">Por Empleado</span> — total vendido por empleado</li>
                  </ul>
                </div>
              </div>
 
              {(!startDate || !endDate) && (
                <p className="text-gray-500 text-sm text-center">
                  Selecciona un rango de fechas para filtrar, o exporta todos los datos sin filtro.
                </p>
              )}
 
              <button
                onClick={exportarExcel}
                disabled={loadingExcel}
                className="mt-4 bg-green-700 hover:bg-green-600 disabled:bg-gray-500 text-white py-2 px-6 rounded-lg flex items-center gap-2 transition-colors"
              >
                {loadingExcel ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Exportando...</>
                ) : success ? (
                  <><CheckCircle className="w-4 h-4" />¡Descargado!</>
                ) : (
                  <><Download className="w-4 h-4" />Descargar Excel</>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
 
        {/* ── PDF ── */}
        {formato === "pdf" && (
          <motion.div
            key="pdf"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            {/* Fechas */}
            <div className="flex gap-4 mb-6">
              <motion.input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white hover:bg-gray-200 text-black font-semibold p-2 rounded outline-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              />
              <motion.input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white hover:bg-gray-200 text-black font-semibold p-2 rounded outline-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              />
            </div>
 
            {/* Reporte PDF */}
            {data ? (
              <div
                className="p-6 rounded-xl shadow space-y-8"
                id="reportContent"
                style={{ backgroundColor: "rgb(240, 243, 249)" }}
              >
                <h2 className="text-3xl font-medium mb-3 text-black text-center">
                  Reporte General desde{" "}
                  <span className="text-black">{startDate}</span> hasta{" "}
                  <span className="text-black">{endDate}</span>
                </h2>
 
                {/* Total vendido destacado */}
                <div className="bg-green-500 bg-opacity-40 border-gray-200 p-4 rounded-xl flex items-center gap-4">
                  <DollarSign className="text-green-600 w-8 h-8" />
                  <div>
                    <p className="text-sm text-black">Total vendido</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${parseFloat(data.total || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
 
                {/* Categorías más vendidas */}
                <div>
                  <h3 className="py-3 text-xl font-semibold mb-2 text-black">Categorías más vendidas</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.categorias}>
                      <XAxis dataKey="nombre" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
 
                {/* Tabla de productos más vendidos */}
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-black">Productos más vendidos</h3>
                  <div className="overflow-x-auto border-gray-200 rounded-xl p-4">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-black">Producto</th>
                          <th className="px-4 py-2 text-left text-black">Cantidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.productos.map((producto, index) => (
                          <tr key={index} className="border-t border-gray-600">
                            <td className="px-4 py-2 text-black">{producto.nombre}</td>
                            <td className="px-4 py-2 text-black">{producto.cant}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
 
                {/* Empleados con más ventas */}
                <div>
                  <h3 className="py-2 text-xl font-semibold mb-2 text-black">Empleados con más ventas</h3>
                  {data.empleados.length > 0 ? (
                    <ResponsiveContainer width="100%" height={550}>
                      <PieChart>
                        <Pie
                          data={data.empleados.map((emp) => ({
                            ...emp,
                            total: parseFloat(emp.total),
                          }))}
                          dataKey="total"
                          nameKey="nombre"
                          cx="50%"
                          cy="45%"
                          outerRadius={180}
                          label={({ name, total }) => `${name} - $${total.toFixed(2)}`}
                        >
                          {data.empleados.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-black">No hay ventas de empleados en este rango.</p>
                  )}
                </div>
 
                {/* Botón PDF */}
                <button
                  onClick={generatePDF}
                  disabled={loadingPDF}
                  className="mt-4 bg-green-700 hover:bg-green-600 disabled:bg-gray-500 text-white py-2 px-6 rounded-lg flex items-center gap-2 transition-colors"
                >
                  {loadingPDF ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Exportando...</>
                  ) : success ? (
                    <><CheckCircle className="w-4 h-4" />¡Descargado!</>
                  ) : (
                    <><Download className="w-4 h-4" />Descargar PDF</>
                  )}
                </button>
              </div>
            ) : (
              <p className="text-gray-900">Selecciona un rango de fechas para ver el reporte.</p>
            )}
          </motion.div>
        )}
 
      </AnimatePresence>
    </div>
  );
};
 
export default ReportsPage;