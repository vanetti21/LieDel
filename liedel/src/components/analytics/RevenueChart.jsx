import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";

const RevenueChart = () => {
	const [selectedTimeRange, setSelectedTimeRange] = useState("This Month");
	const [revenueData, setRevenueData] = useState([]);

	useEffect(() => {
		const monthNames = {
			1: "Ene",
			2: "Feb",
			3: "Mar",
			4: "Abr",
			5: "May",
			6: "Jun",
			7: "Jul",
			8: "Ago",
			9: "Sep",
			10: "Oct",
			11: "Nov",
			12: "Dic",
		};

		fetch("http://localhost:5000/revenue_data")
			.then((response) => response.json())
			.then((data) => {
				const formatted = data.map((item) => ({
					...item,
					month: monthNames[item.mes],
				}));
				setRevenueData(formatted);
			})
			.catch((error) => {
				console.error("Error fetching revenue data:", error);
			});
	}, []);


	return (
		<motion.div
			className='rounded-xl p-6 border border-gray-200 mb-8' style={{ backgroundColor: 'rgb(240, 243, 249)' }}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<div className='flex justify-between items-center mb-6'>
				<h2 className='text-xl font-semibold text-gray-100'>Revenue vs Target</h2>

			</div>

			<div className='w-full' style={{ height: "450px" }}>
				<ResponsiveContainer>
					<AreaChart data={revenueData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#374151' />
						<XAxis dataKey='month' stroke='#9CA3AF' />
						<YAxis 
							stroke='#9CA3AF'
							domain={[0, 'dataMax + 10700']}
							/>
						<Tooltip
							contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.8)", borderColor: "#4B5563" }}
							itemStyle={{ color: "#E5E7EB" }}
						/>
						<Legend />
						<Area type='monotone' dataKey='revenue' stroke='#8B5CF6' fill='#8B5CF6' fillOpacity={0.3} />
						<Area type='monotone' dataKey='target' stroke='#10B981' fill='#10B981' fillOpacity={0.3} />
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default RevenueChart;