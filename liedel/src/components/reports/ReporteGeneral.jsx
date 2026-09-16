import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

import { DollarSign, Download, CheckCircle } from "lucide-react";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

const ReporteGeneral = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!startDate || !endDate) return;

    const cargarReporte = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `http://localhost:5000/api/reportes/general?inicio=${startDate}&fin=${endDate}`,
        );

        const result = await response.json();

        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    cargarReporte();
  }, [startDate, endDate]);

  const generatePDF = () => {
    setLoadingPDF(true);

    const input = document.getElementById("reporte-general");

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
        position -= pdfHeight;

        pdf.addPage();

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

        heightLeft -= pdfHeight;
      }

      pdf.save("reporte_general.pdf");

      setLoadingPDF(false);

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    });
  };

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-white text-black p-2 rounded"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-white text-black p-2 rounded"
        />
      </div>

      {!startDate || !endDate ? (
        <p className="text-black">Selecciona un rango de fechas.</p>
      ) : loading ? (
        <p className="text-black">Cargando reporte...</p>
      ) : data ? (
        <div id="reporte-general" className="bg-gray-100 p-6 rounded-xl">
          <h2 className="text-3xl font-bold text-black text-center mb-6">
            Reporte General
          </h2>

          <div className="bg-green-100 p-4 rounded-xl flex items-center gap-4 mb-8">
            <DollarSign className="text-green-600" size={40} />

            <div>
              <p className="text-black">Total vendido</p>

              <p className="text-2xl font-bold text-green-700">
                ${parseFloat(data.total || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-black text-xl font-semibold mb-3">
              Categorías más vendidas
            </h3>

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

          <div className="mb-8">
            <h3 className="text-black text-xl font-semibold mb-3">
              Productos más vendidos
            </h3>

            <table className="w-full text-black">
              <thead>
                <tr>
                  <th className="text-left">Producto</th>

                  <th className="text-left">Cantidad</th>
                </tr>
              </thead>

              <tbody>
                {data.productos.map((producto, index) => (
                  <tr key={index}>
                    <td>{producto.nombre}</td>
                    <td>{producto.cant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-black text-xl font-semibold mb-3">
              Empleados con más ventas
            </h3>

            <ResponsiveContainer width="100%" height={500}>
              <PieChart>
                <Pie
                  data={data.empleados.map((e) => ({
                    ...e,
                    total: parseFloat(e.total),
                  }))}
                  dataKey="total"
                  nameKey="nombre"
                  outerRadius={150}
                >
                  {data.empleados.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {data && (
        <button
          onClick={generatePDF}
          disabled={loadingPDF}
          className="mt-4 bg-green-700 hover:bg-green-600 text-white py-2 px-6 rounded-lg flex items-center gap-2"
        >
          {loadingPDF ? (
            <>Generando...</>
          ) : success ? (
            <>
              <CheckCircle size={18} />
              Descargado
            </>
          ) : (
            <>
              <Download size={18} />
              Descargar PDF
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ReporteGeneral;
