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
			transition={{ delay: 0.3 }}
		>
			<h2 className='text-xl font-semibold text-black mb-4'>
				Top Employees by Sales
			</h2>

			<div style={{ width: "100%", height: 350 }}>
				<ResponsiveContainer>
					<BarChart data={data}>
						<CartesianGrid strokeDasharray='3 3' />

						<XAxis dataKey='empleado' />

						<YAxis />

						<Tooltip />

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