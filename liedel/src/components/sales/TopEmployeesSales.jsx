import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

const TopEmployeesSales = () => {
	const [data, setData] = useState([]);

	useEffect(() => {
		fetch("http://localhost:5000/top_empleados_ventas")
			.then((res) => res.json())
			.then((result) => setData(result))
			.catch((err) => console.error(err));
	}, []);

	return (
		<motion.div
			className='rounded-xl p-6 border border-gray-200 mb-8'
			style={{ backgroundColor: "rgb(240, 243, 249)" }}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<h2 className='text-xl font-medium text-black-100 mb-6'>
				Top Employees by Sales
			</h2>

			<div style={{ width: "100%", height: 335 }}>
				<ResponsiveContainer>
					<BarChart 
						data={data}
						margin={{ top: 0, right: 23, left: 8, bottom: 4 }}
					>
						<CartesianGrid strokeDasharray='3 3' stroke="#505a69"  />

						<XAxis dataKey='empleado' stroke="#60676f" />

						<YAxis stroke="#60676f" />

						<Tooltip 
							contentStyle={{
							backgroundColor: "rgba(31, 41, 55, 0.8)",
							borderColor: "#4B5563",
						}}
						itemStyle={{ color: "#E5E7EB" }}
						/>
						<Bar
							dataKey='total_vendido'
							fill='#6366F1'
							radius={[5, 5, 0, 0]}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default TopEmployeesSales;