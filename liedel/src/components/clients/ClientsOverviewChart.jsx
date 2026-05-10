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

const ClientsOverviewChart = () => {
	const [data, setData] = useState([]);

	useEffect(() => {
		fetch("http://localhost:5000/clientes_por_ubicacion")
			.then((res) => res.json())
			.then((result) => setData(result));
	}, []);

	return (
		<motion.div
			className='rounded-xl p-6 border border-gray-200 mb-8'
			style={{ backgroundColor: "rgb(240, 243, 249)" }}
		>
			<h2 className='text-xl font-semibold mb-4'>
				Clients by Location
			</h2>

			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<BarChart data={data}>
						<CartesianGrid strokeDasharray='3 3' />
						<XAxis dataKey='ubicacion' />
						<YAxis />
						<Tooltip />
						<Bar dataKey='total' fill='#6366F1' />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default ClientsOverviewChart;