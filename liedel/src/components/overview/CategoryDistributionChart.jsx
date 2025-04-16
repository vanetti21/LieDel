import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#F472B6", "#60A5FA"];

const CategoryDistributionChart = () => {
	const [categoryData, setCategoryData] = useState([]);

	useEffect(() => {
		axios.get("http://localhost:5000/obtener_categoria_distribucion").then((res) => {
			console.log("Datos de categorías recibidos:", res.data);
			setCategoryData(res.data);
		});
	}, []);

	return (
		<motion.div
			className='rounded-xl p-6 border border-gray-200'
			style={{ backgroundColor: 'rgb(240, 243, 249)' }}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
		>
			<h2 className='text-lg font-medium mb-4 text-black-100'>Distribución por Categoría</h2>

			<div className='h-80'>
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={categoryData}
							cx="50%"
							cy="50%"
							labelLine={false}
							label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
							outerRadius={123}
							fill="#8884d8"
							dataKey="value"
						>
							{categoryData.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Pie>
						<Tooltip
							contentStyle={{
								backgroundColor: "rgba(31, 41, 55, 0.8)",
								borderColor: "#4B5563",
							}}
							itemStyle={{ color: "#E5E7EB" }}
						/>
					</PieChart>
				</ResponsiveContainer>
			</div>

			{/* Leyenda personalizada abajo */}
			<div className="flex flex-wrap justify-center mt-6 gap-4">
				{categoryData.map((entry, index) => (
					<div key={index} className="flex items-center space-x-2">
						<div
							className="w-4 h-4 rounded"
							style={{ backgroundColor: COLORS[index % COLORS.length] }}
						></div>
						<span className="text-sm text-gray-500">{entry.name}</span>
					</div>
				))}
			</div>
		</motion.div>
	);
};

export default CategoryDistributionChart;
