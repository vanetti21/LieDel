
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";

const SalesOverviewChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState("This Month");

  useEffect(() => {
    // Función para obtener datos de ventas desde el backend
    const fetchSalesData = async () => {
      try {
        const response = await fetch('http://localhost:5000/obtener_ventas');
        const data = await response.json();
        
        // Formateamos los datos de la respuesta para que se ajusten al formato necesario
        const formattedData = data.map((item) => ({
          month: item.name,
          sales: item.sales,
        }));
        
        setSalesData(formattedData);
      } catch (error) {
        console.error('Error al obtener los datos de ventas:', error);
      }
    };

    fetchSalesData();
  }, []); // Esto solo se ejecuta cuando el componente se monta.


  // Encuentra el valor máximo y mínimo de las ventas
  const maxSales = Math.max(...salesData.map((item) => item.sales), 0);
  const minSales = Math.min(...salesData.map((item) => item.sales), 0);

  return (
    <motion.div
      className='rounded-xl p-6 border border-gray-200 mb-8' style={{ backgroundColor: 'rgb(240, 243, 249)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-xl font-semibold text-black-100'>Sales Overview</h2>

        <select
          className='bg-gray-700 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2'
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
        >
          <option>This Week</option>
          <option>This Month</option>
          <option>This Quarter</option>
          <option>This Year</option>
        </select>
      </div>

      <div className='w-full h-80'>
        <ResponsiveContainer>
          <AreaChart data={salesData}>
            <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
            <XAxis dataKey='month' stroke='#9CA3AF' />
            <YAxis 
              stroke='#9CA3AF'
              domain={[minSales, maxSales]}
              />
            <Tooltip
              contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.8)", borderColor: "#4B5563" }}
              itemStyle={{ color: "#E5E7EB" }}
            />
            <Area type='monotone' dataKey='sales' stroke='#8B5CF6' fill='#8B5CF6' fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default SalesOverviewChart;
