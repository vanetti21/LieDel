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

const MonthlyPurchaseTrend = () => {
	const [data, setData] = useState([]);

	useEffect(() => {
		fetch("http://localhost:5000/monthly_purchase_trend")
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
				Monthly Purchase Trend
			</h2>

			<div style={{ width: "100%", height: 330 }}>
				<ResponsiveContainer>
					<LineChart 
						data={data}
						margin={{
							top: 7,
							right: 17,
							left: 10,
							bottom: 0 }}
						>
						<CartesianGrid strokeDasharray='3 3' stroke='#505a69' />
						<XAxis dataKey='mes' stroke='#60676f' />
						<YAxis 
							stroke='#60676f'
							domain={[0, (dataMax) => dataMax * 2.60]} />
						<Tooltip 
							contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.8)", borderColor: "#4B5563" }}
							itemStyle={{ color: "#E5E7EB" }} />
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

export default MonthlyPurchaseTrend;