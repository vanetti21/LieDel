import { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { motion } from "framer-motion";

const Ventas = () => {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [ventasData, setVentasData] = useState([]);
	const [totalSales, setTotalSales] = useState(0);

	const fetchVentas = async () => {
		if (!startDate || !endDate) return;
		try {
			const res = await axios.get(`http://localhost:5000/api/ventas?inicio=${startDate}&fin=${endDate}`);
			setVentasData(res.data);
			const total = res.data.reduce((acc, venta) => acc + parseFloat(venta.total || 0), 0);
			setTotalSales(total);
		} catch (err) {
			console.error("Error al obtener ventas:", err);
		}
	};

	useEffect(() => {
		if (startDate && endDate) fetchVentas();
	}, [startDate, endDate]);

	const chartWidth = Math.max(ventasData.length * 30, 600);

	return (
		<motion.div
			className='rounded-xl p-6 border border-gray-200'
			style={{ backgroundColor: 'rgb(240, 243, 249)' }}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<h2 className='text-xl font-semibold mb-4 text-black'>Sales Report</h2>

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

			<div className='mb-4 text-green-600'>
				Total vendido: ${parseFloat(totalSales || 0).toFixed(2)}
			</div>

			<div className='w-full overflow-x-auto'>
				<div style={{ width: `${chartWidth}px`, height: "400px" }}>
					<LineChart
						width={chartWidth}
						height={400}
						data={ventasData}
						margin={{ top: 7, right: 20, left: 3, bottom: 0 }}
					>
						<CartesianGrid strokeDasharray='3 3' stroke='#505a69' />
						<XAxis dataKey='fecha' stroke='#60676f' />
						<YAxis
							stroke='#60676f'
							domain={[0, (dataMax) => dataMax * 6.50]}
						/>
						<Tooltip
							contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.8)", borderColor: "#4B5563" }}
							itemStyle={{ color: "#E5E7EB" }}
						/>
						<Line
							type='monotone'
							dataKey='total'
							stroke='#3B82F6'
							strokeWidth={3}
							dot={{ fill: "#3B82F6", r: 3 }}
							activeDot={{ r: 8 }}
						/>
					</LineChart>
				</div>
			</div>
		</motion.div>
	);
};

export default Ventas;