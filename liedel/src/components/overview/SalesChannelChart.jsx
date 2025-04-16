import { useState, useEffect } from "react";
import axios from "axios"; // Necesitas instalar axios
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#F472B6", "#60A5FA", "#3B82F6", "#9333EA", "#10B981"];

const SalesChannelChart = () => {
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    // Obtener los productos más vendidos
    axios.get("http://localhost:5000/obtener_productos_mas_vendidos")
      .then((response) => {
        setSalesData(response.data);  // Guardamos los datos en el estado
      })
      .catch((error) => {
        console.error("Error al obtener los productos más vendidos:", error);
      });
  }, []);

  return (
    <motion.div
      className="rounded-xl p-6 lg:col-span-2 border border-gray-200" style={{ backgroundColor: 'rgb(240, 243, 249)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h2 className="text-lg font-medium mb-4 text-black-100">Productos más vendidos</h2>

      <div className="h-80">
        <ResponsiveContainer>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF" 
              angle={-45} 
              textAnchor="end" 
              interval={0} 
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "#4B5563",
              }}
              itemStyle={{ color: "#E5E7EB" }}
            />
            <Legend verticalAlign="bottom" height={36} />
            <Bar dataKey="value" fill="#8884d8">
              {salesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default SalesChannelChart;
