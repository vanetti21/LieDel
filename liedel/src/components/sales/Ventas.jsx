import { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Ventas = () => {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [ventasData, setVentasData] = useState([]);
	const [totalSales, setTotalSales] = useState(0);

	const fetchVentas = async () => {
		if (!startDate || !endDate) return;

		try {
			const res = await axios.get(`http://localhost:5000/api/ventas?inicio=${startDate}&fin=${endDate}`);
			setVentasData(res.data); // [{ fecha: "2025-04-10", total: 1450 }, ...]
			const total = res.data.reduce((acc, venta) => acc + parseFloat(venta.total || 0), 0);
			setTotalSales(total);
		} catch (err) {
			console.error("Error al obtener ventas:", err);
		}
	};

	useEffect(() => {
		if (startDate && endDate) {
			fetchVentas();
		}
	}, [startDate, endDate]);
    
	return (
		<div className='p-5 rounded-xl shadow-lg text-white' style={{ backgroundColor: 'rgb(240, 243, 249)' }}>
			<h2 className='text-xl font-semibold mb-4 text-black'>Reporte de Ventas</h2>

			<div className='flex gap-4 mb-4'>
				<input
					type='date'
					value={startDate}
					onChange={(e) => setStartDate(e.target.value)}
					className='bg-gray-700 p-2 rounded'
				/>
				<input
					type='date'
					value={endDate}
					onChange={(e) => setEndDate(e.target.value)}
					className='bg-gray-700 p-2 rounded'
				/>
			</div>

			<div className='mb-4 text-green-600'>
				Total vendido: ${parseFloat(totalSales || 0).toFixed(2)}
			</div>

			<div className='w-full' style={{ height: "450px" }}>
				<ResponsiveContainer width="100%" height={400}>
					<LineChart data={ventasData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#374151' />
						<XAxis dataKey='fecha' stroke='#9CA3AF' />
						<YAxis stroke='#9CA3AF' domain={[0, 'dataMax + 1000']} />
						<Tooltip
							contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.8)", borderColor: "#4B5563" }}
							itemStyle={{ color: "#E5E7EB" }}
						/>
						<Line
							type='monotone'
							dataKey='total'
							stroke='#3B82F6'
							strokeWidth={3}
							dot={{ fill: "#3B82F6", r: 4 }}
							activeDot={{ r: 6 }}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};

export default Ventas;
