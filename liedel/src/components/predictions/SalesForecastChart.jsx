import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	CartesianGrid
} from "recharts";

const SalesForecastChart = () => {
	const [data, setData] = useState([]);
	useEffect(() => {
		fetch("http://localhost:5000/predicciones_ventas")
			.then(res => res.json())
			.then(data => setData(data));
	}, []);

	return (
		<motion.div 
			className="rounded-xl p-6 border border-gray-200"
			style={{ backgroundColor: 'rgb(240, 243, 249)' }}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<h2 className="text-xl font-semibold text-black mb-6">
				Sales Forecast
			</h2>
			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<LineChart 
						data={data}
						margin={{ 
							top: 8, 
							right: 23, 
							left: 3, 
							bottom: 3, }}
						>
						<CartesianGrid strokeDasharray="3 3" stroke="#505a69"  />
						<XAxis dataKey="fecha" stroke="#60676f"/>
						<YAxis stroke="#60676f"/>
						<Tooltip 
							contentStyle={{
								backgroundColor: "rgba(31, 41, 55, 0.8)",
								borderColor: "#4B5563",
						}}
							itemStyle={{ color: "#E5E7EB" }}
						/>
						<Line
							type="monotone"
							dataKey="prediccion"
							stroke="#6366F1"
							strokeWidth={3}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default SalesForecastChart;