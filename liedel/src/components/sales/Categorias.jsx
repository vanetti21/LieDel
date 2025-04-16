import { useEffect, useState } from "react";
import axios from "axios";
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
		<div className='p-5 rounded-xl shadow-lg text-white' style={{ backgroundColor: 'rgb(240, 243, 249)' }}>
			<h2 className='text-xl font-semibold mb-4 text-black'>Categorías más vendidas</h2>

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

			<div className='w-full' style={{ height: "450px" }}>
				<ResponsiveContainer >
					<BarChart data={data}>
						<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
						<XAxis dataKey="categoria" stroke="#9CA3AF" />
						<YAxis stroke="#9CA3AF" domain={[0, 'dataMax + 3500']}/>
						<Tooltip
							contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.8)", borderColor: "#4B5563" }}
							itemStyle={{ color: "#E5E7EB" }}
						/>
						<Bar dataKey="total" fill="#10B981" barSize={40} />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};

export default Categorias;
