import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
	PieChart,
	Pie,
	Cell,
	Tooltip,
	ResponsiveContainer,
	Legend
} from "recharts";

const COLORS = [
	"#6366F1",
	"#10B981",
	"#F59E0B",
	"#EF4444"
];

const OrderDistribution = () => {
	const [data, setData] = useState([]);

	useEffect(() => {
		fetch("http://localhost:5000/orders_distribution")
			.then((res) => res.json())
			.then((result) => setData(result));
	}, []);

	return (
		<motion.div
			className='rounded-xl p-6 border border-gray-200'
			style={{ backgroundColor: "rgb(240,243,249)" }}
		>
			<h2 className='text-xl font-semibold mb-4'>
				Order Distribution
			</h2>

			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<PieChart>
						<Pie
							data={data}
							dataKey='total'
							nameKey='Estado'
							outerRadius={100}
							label
						>
							{data.map((entry, index) => (
								<Cell
									key={index}
									fill={COLORS[index % COLORS.length]}
								/>
							))}
						</Pie>

						<Tooltip />
						<Legend />
					</PieChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default OrderDistribution;