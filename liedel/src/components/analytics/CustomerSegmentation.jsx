import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const customerSegmentationData = [
	{ name: "Segment 1", sales: 200, revenue: 5000 },
	{ name: "Segment 2", sales: 150, revenue: 4000 },
	{ name: "Segment 3", sales: 180, revenue: 4500 },
	{ name: "Segment 4", sales: 130, revenue: 3500 },
	{ name: "Segment 5", sales: 110, revenue: 3000 },
];

const CustomerSegmentation = () => {
	return (
		<motion.div
			className='rounded-xl p-6 border border-gray-200' style={{ backgroundColor: 'rgb(240, 243, 249)' }}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.5 }}
		>
			<h2 className='text-xl font-semibold text-black-100 mb-4'>Customer Segmentation</h2>
			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<LineChart data={customerSegmentationData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#374151' />
						<XAxis dataKey='name' stroke='#9CA3AF' />
						<YAxis stroke='#9CA3AF' />
						<Tooltip
							contentStyle={{
								backgroundColor: "rgba(31, 41, 55, 0.8)",
								borderColor: "#4B5563",
							}}
							itemStyle={{ color: "#E5E7EB" }}
						/>
						<Legend />
						<Line type='monotone' dataKey='sales' stroke='#8B5CF6' strokeWidth={2} />
						<Line type='monotone' dataKey='revenue' stroke='#10B981' strokeWidth={2} />
					</LineChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};
export default CustomerSegmentation;
