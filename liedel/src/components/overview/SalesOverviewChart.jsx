import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const SalesOverviewChart = () => {
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    const fetchSalesData = async () => {
      const response = await fetch('http://127.0.0.1:5000/obtener_ventas');
      const data = await response.json();
      console.log("Datos recibidos:", data); // Verifica los datos recibidos
      setSalesData(data);
    };

    fetchSalesData();
  }, []);

  // Encuentra el valor máximo y mínimo de las ventas
  const maxSales = Math.max(...salesData.map((item) => item.sales), 0);
  const minSales = Math.min(...salesData.map((item) => item.sales), 0);

  return (
    <motion.div
      className='rounded-xl p-6 border border-gray-200'
      style={{ backgroundColor: 'rgb(240, 243, 249)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className='text-lg font-medium mb-4 text-black-100'>Ventas mensuales</h2>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={salesData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
          <XAxis dataKey="name" stroke="#9ca3af" />
          <YAxis
            stroke="#9ca3af"
            domain={[minSales, maxSales]} // Ajuste dinámico del dominio
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(31, 41, 55, 0.8)",
              borderColor: "#4B5563",
            }}
            itemStyle={{ color: "#E5E7EB" }}
          />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#6366F1"
            strokeWidth={3}
            dot={{ fill: "#6366F1", strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default SalesOverviewChart;
