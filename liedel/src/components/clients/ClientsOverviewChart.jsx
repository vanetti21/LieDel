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
        .then((result) => {
            // Agrupar por ciudad extraída de la dirección
            const agrupado = {};
            result.forEach((item) => {
                const partes = item.ubicacion.split(",");
                const ciudad = partes[partes.length - 1].trim();
                agrupado[ciudad] = (agrupado[ciudad] || 0) + item.total;
            });
            const procesado = Object.entries(agrupado)
                .map(([ubicacion, total]) => ({ ubicacion, total }))
                .sort((a, b) => b.total - a.total);
            setData(procesado);
        });
}, []);

	return (
		<motion.div
			className='rounded-xl p-6 border border-gray-200'
			style={{ backgroundColor: "rgb(240, 243, 249)" }}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<h2 className='text-xl font-semibold mb-6 text-black-100'>Clients by Location</h2>

				<ResponsiveContainer width="100%" height={350}>
					<BarChart 
						data={data}
						margin={{ 
							top: 10, 
							right: 20, 
							left: 10, 
							bottom: 0, }}
						>
						<CartesianGrid strokeDasharray='3 3' stroke="#505a69" />
						<XAxis 
							dataKey='ubicacion' 
							stroke="#60676f"
							 />
						<YAxis
							stroke="#60676f"
						/>
						<Tooltip 
							contentStyle={{
								borderColor: "#4B5563",
							}}
							itemStyle={{ color: "rgba(41, 31, 55, 0.8)" }}
						/>
						<Bar dataKey='total' fill='#6366F1' />
					</BarChart>
				</ResponsiveContainer>
		</motion.div>
	);
};

export default ClientsOverviewChart;