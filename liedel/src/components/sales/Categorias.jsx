import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	ResponsiveContainer,
} from "recharts";

const Categorias = () => {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [data, setData] = useState([]);

	const fetchCategorias = async () => {
		if (!startDate || !endDate) return;

		try {
			const res = await axios.get(`http://localhost:5000/api/categorias-mas-vendidas?inicio=${startDate}&fin=${endDate}`);
			setData(res.data); // [{ categoria: 'Electrónica', total: 3200 }, ...]
		} catch (err) {
			console.error("Error al obtener categorías:", err);
		}
	};

	useEffect(() => {
		if (startDate && endDate) {
			fetchCategorias();
		}
	}, [startDate, endDate]);

	return (
		<motion.div
			className='rounded-xl p-6 border border-gray-200'
			style={{ backgroundColor: 'rgb(240, 243, 249)' }}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<h2 className='text-xl font-semibold mb-4 text-black'>Best-Selling Categories</h2>

			<div className='flex gap-4 mb-4'>
				<input
					type='date'
					value={startDate}
					onChange={(e) => setStartDate(e.target.value)}
					className='bg-white hover:bg-gray-200 text-black font-semibold p-2 rounded outline-none'
				/>
				<input
					type='date'
					value={endDate}
					onChange={(e) => setEndDate(e.target.value)}
					className='bg-white hover:bg-gray-200 text-black font-semibold p-2 rounded outline-none'
				/>
			</div>

			<div className='w-full' style={{ height: "450px" }}>
				<ResponsiveContainer >
					<BarChart 
						data={data}
						margin={{ 
							top: 18, 
							right: 20, 
							left: 10, 
							bottom: 0 
						}}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#505a69" />
						<XAxis dataKey="categoria" stroke="#60676f" />
						<YAxis stroke="#60676f" domain={[0, (dataMax) => dataMax * 2.35]} />
						<Tooltip
							contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.8)", borderColor: "#4B5563" }}
							itemStyle={{ color: "#E5E7EB" }}
						/>
						<Bar dataKey="total" fill="#10B981" barSize={40} />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default Categorias;
