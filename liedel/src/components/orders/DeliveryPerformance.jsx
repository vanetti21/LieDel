import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
	PieChart,
	Pie,
	Cell,
	Tooltip,
	ResponsiveContainer,
	Legend
} from "recharts";

const COLORS = ["#10B981", "#EF4444"];

const DeliveryPerformance = () => {
	const [data, setData] = useState([]);

	useEffect(() => {
		fetch("http://localhost:5000/delivery_performance")
			.then((res) => res.json())
			.then((result) => {
				setData([
					{
						name: "On Time",
						value: Number(result.on_time) || 0

					},
					{
						name: "Delayed",
						value: Number(result.delayed) || 0
					}
				]);
			});
	}, []);

	return (
		<motion.div
			className='rounded-xl p-6 border border-gray-200'
			style={{ backgroundColor: "rgb(240,243,249)" }}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<h2 className='text-xl font-semibold mb-6 text-black-100'>
				Delivery Performance
			</h2>

			<div style={{ width: "100%", height: 330 }}>
				<ResponsiveContainer>
					<PieChart>
						<Pie
							data={data}
							dataKey='value'
							nameKey='name'
							outerRadius={100}
							label
						>
							{data.map((entry, index) => (
								<Cell
									key={index}
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
							formatter={(value) => ( <span style={{ marginRight: "15px" }}> {value} </span> )}
							wrapperStyle={{
								marginLeft: "14px",
								paddingTop: "20px",
								display: "flex",
								flexWrap: "wrap",
								justifyContent: "center",
								gap: "6px",
								fontSize: "14px",
								color: "#4B5563"
							}}
						/>
					</PieChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default DeliveryPerformance;