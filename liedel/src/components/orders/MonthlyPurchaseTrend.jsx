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
		>
			<h2 className='text-xl font-semibold mb-4'>
				Monthly Purchase Trend
			</h2>

			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<LineChart data={data}>
						<CartesianGrid strokeDasharray='3 3' />

						<XAxis dataKey='mes' />

						<YAxis />

						<Tooltip />

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