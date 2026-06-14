import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
	PieChart,
	Pie,
	Cell,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"];

const SuppliersOverviewChart = () => {
	const [data, setData] = useState([]);

	useEffect(() => {
		fetch("http://localhost:5000/proveedores_por_pais")
			.then((res) => res.json())
			.then((result) => setData(result));
	}, []);

	return (
		<motion.div
			className='rounded-xl p-6 border border-gray-200 mb-8'
			style={{ backgroundColor: "rgb(240, 243, 249)" }}
		>
			<h2 className='text-xl font-semibold mb-4'>
				Suppliers by Country
			</h2>

			<div style={{ width: "100%", height: 350 }}>
				<ResponsiveContainer>
					<PieChart>
						<Pie
							data={data}
							dataKey='total'
							nameKey='pais'
							cx='50%'
							cy='50%'
							outerRadius={120}
							label
						>
							{data.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={COLORS[index % COLORS.length]}
								/>
							))}
						</Pie>

						<Tooltip 
							contentStyle={{
								backgroundColor: "rgba(31, 41, 55, 0.8)",
								borderColor: "#4B5563",
							}}
							itemStyle={{ color: "#E5E7EB" }} 
						/>
						<Legend 
							iconType="circle"
							iconSize={12}
							formatter={(value) => ( <span style={{ marginRight: "12px" }}> {value} </span> )}
							wrapperStyle={{
								marginLeft: "12px",
								paddingTop: "20px",
								display: "flex",
								flexWrap: "wrap",
								justifyContent: "center",
								gap: "6px",
								fontSize: "15px",
								color: "#4B5563"
							}}
						/>
					</PieChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default SuppliersOverviewChart;