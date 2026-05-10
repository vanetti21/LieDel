import { useEffect, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { motion } from "framer-motion";

const UserActivityHeatmap = () => {
	const [userActivityData, setUserActivityData] = useState([]);

	useEffect(() => {
		fetch("http://localhost:5000/actividad_empleados")
			.then((res) => res.json())
			.then((data) => setUserActivityData(data))
			.catch((err) => console.error("Error fetching activity data:", err));
	}, []);

	return (
		<motion.div
			className='rounded-xl p-6 border border-gray-200'
			style={{ backgroundColor: "rgb(240, 243, 249)" }}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
		>
			<h2 className='text-xl font-semibold text-black-100 mb-4'>
				Employee Activity Heatmap
			</h2>

			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<BarChart data={userActivityData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#374151' />

						<XAxis dataKey='name' stroke='#9CA3AF' />

						<YAxis stroke='#9CA3AF' />

						<Tooltip
							contentStyle={{
								backgroundColor: "rgba(31, 41, 55, 0.8)",
								borderColor: "#4B5563",
							}}
							itemStyle={{ color: "#E5E7EB" }}
						/>

						<Legend />

						<Bar
							dataKey='ventas'
							fill='#6366F1'
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default UserActivityHeatmap;