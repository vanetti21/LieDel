import { useEffect, useState } from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	CartesianGrid
} from "recharts";

const SalesForecastChart = () => {

	const [data, setData] = useState([]);

	useEffect(() => {
		fetch("http://localhost:5000/predicciones_ventas")
			.then(res => res.json())
			.then(data => setData(data));
	}, []);

	return (
		<div className="rounded-xl p-6 border border-gray-200">
			<h2 className="text-xl font-semibold mb-4">
				Sales Forecast
			</h2>

			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<LineChart data={data}>
						<CartesianGrid strokeDasharray="3 3" />

						<XAxis dataKey="fecha" />

						<YAxis />

						<Tooltip />

						<Line
							type="monotone"
							dataKey="prediccion"
							stroke="#6366F1"
							strokeWidth={3}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};

export default SalesForecastChart;