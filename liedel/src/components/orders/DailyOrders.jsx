import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer
} from "recharts";

const DailyOrders = () => {
	const [data, setData] = useState([]);

	useEffect(() => {
		fetch("http://localhost:5000/daily_orders")
			.then((res) => res.json())
			.then((result) => setData(result));
	}, []);

	return (
		<motion.div
			className='rounded-xl p-6 border border-gray-200'
			style={{ backgroundColor: "rgb(240,243,249)" }}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<h2 className='text-xl font-semibold mb-6'>
				Daily Orders
			</h2>

			<div style={{ width: "100%", height: 320 }}>
				<ResponsiveContainer>
					<LineChart 
						data={data}
						margin={{ 
							top: 5, 
							right: 20, 
							left: 0, 
							bottom: 5, }}
						>
						<CartesianGrid strokeDasharray='3 3' stroke="#505a69" />
						<XAxis 
							dataKey='fecha' 
							stroke="#60676f"
							tickFormatter={(value) => {
								if (!value) return "";
								return new Date(value).toLocaleDateString("es-DO", {
									day: "2-digit",
									month: "short"
								});
							}}
							interval={Math.floor(data.length / 6)}
							/>
						<YAxis 
							stroke="#60676f"
							allowDecimals={false}
    						domain={[0, (dataMax) => dataMax + 1]}
							/>
						<Tooltip 
							contentStyle={{
								backgroundColor: "rgba(31, 41, 55, 0.8)",
								borderColor: "#4B5563",
							}}
							itemStyle={{ color: "#E5E7EB" }}
							 labelFormatter={(value) => {
							if (!value) return "";
							return new Date(value).toLocaleDateString("es-DO", {
								day: "2-digit",
								month: "short",
								year: "numeric"
							});
						}}
						/>

						<Line
							type='monotone'
							dataKey='total'
							stroke='#6366F1'
							strokeWidth={3}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default DailyOrders;