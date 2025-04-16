import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { DollarSign } from "lucide-react";
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (startDate && endDate) {
        console.log(`Consultando reporte desde ${startDate} hasta ${endDate}`);
        try {
          const response = await fetch(
            `http://localhost:5000/api/reporte-fechas?inicio=${startDate}&fin=${endDate}`
          );
          const result = await response.json();
          setData(result);
        } catch (error) {
          console.error("Error al obtener el reporte:", error);
        }
      }
    };

    fetchData();
  }, [startDate, endDate]);

  // Función para generar el PDF
  const generatePDF = () => {
    const input = document.getElementById("reportContent");
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
  
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      let heightLeft = imgHeight;
      let position = 0;
  
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
  
      while (heightLeft > 0) {
        position = position - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
  
      pdf.save("reporte-ventas.pdf");
    });
  };
  

  return (
    <div className="p-6 text-white">
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

      {data ? (
        <div className="bg-gray-800 p-4 rounded-xl shadow space-y-8" id="reportContent">
          <h2 className="text-3xl font-bold mb-4 text-green-400">
            Reporte General desde{" "}
            <span className="underline underline-offset-4 text-white">{startDate}</span> hasta{" "}
            <span className="underline underline-offset-4 text-white">{endDate}</span>
          </h2>

          {/* Total vendido destacado */}
          <div className="bg-green-600 bg-opacity-20 border border-green-500 p-4 rounded-xl flex items-center gap-4">
            <DollarSign className="text-green-400 w-8 h-8" />
            <div>
              <p className="text-sm text-gray-300">Total vendido</p>
              <p className="text-2xl font-bold text-green-400">
                ${parseFloat(data.total || 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Categorías más vendidas */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Categorías más vendidas</h3>
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
            <h3 className="text-xl font-semibold mb-2">Productos más vendidos</h3>
            <div className="overflow-x-auto bg-gray-700 border border-gray-600 rounded-xl p-4">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-300">Producto</th>
                    <th className="px-4 py-2 text-left text-gray-300">Cantidad</th>
                    
                  </tr>
                </thead>
                <tbody>
                  {data.productos.map((producto, index) => (
                    <tr key={index} className="border-t border-gray-600">
                      <td className="px-4 py-2 text-gray-200">{producto.nombre}</td>
                      <td className="px-4 py-2 text-gray-200">{producto.cant}</td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empleados con más ventas */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Empleados con más ventas</h3>
            {data.empleados.length > 0 ? (
              <ResponsiveContainer width="100%" height={600}>
                <PieChart>
                  <Pie
                    data={data.empleados.map((emp) => ({
                      ...emp,
                      total: parseFloat(emp.total),
                    }))}
                    dataKey="total"
                    nameKey="nombre"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
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
              <p className="text-gray-400">No hay ventas de empleados en este rango.</p>
            )}
          </div>

          {/* Botón para descargar el PDF */}
          <button
            onClick={generatePDF}
            className="mt-4 bg-green-600 text-white py-2 px-4 rounded-lg"
          >
            Descargar Reporte en PDF
          </button>
        </div>
      ) : (
        <p className="text-gray-400">Selecciona un rango de fechas para ver el reporte.</p>
      )}
    </div>
  );
};

export default ReportsPage;