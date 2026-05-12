import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
	AlertTriangle,
	TrendingUp,
	Truck,
	Star,
} from "lucide-react";

const AIBusinessInsights = () => {

	const [insights, setInsights] = useState([]);

	useEffect(() => {

		fetch("http://localhost:5000/api/ai-business-insights")
			.then((res) => res.json())
			.then((data) => setInsights(data))
			.catch((err) => console.error(err));

	}, []);

	const getIcon = (type) => {

		switch (type) {

			case "restock":
				return <TrendingUp className='text-blue-600' size={20} />;

			case "risk":
				return <AlertTriangle className='text-red-600' size={20} />;

			case "supplier":
				return <Truck className='text-yellow-600' size={20} />;

			case "vip":
				return <Star className='text-green-600' size={20} />;

			default:
				return <AlertTriangle size={20} />;
		}
	};

	const getBorder = (priority) => {

		switch (priority) {

			case "high":
				return "border-l-4 border-red-500";

			case "medium":
				return "border-l-4 border-yellow-500";

			default:
				return "border-l-4 border-green-500";
		}
	};

	return (

		<motion.div
			className='rounded-xl p-6 border border-gray-200'
			style={{ backgroundColor: "rgb(240,243,249)" }}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
		>

			<h2 className='text-xl font-semibold mb-6'>
				AI Business Insights
			</h2>

			<div className='space-y-4 max-h-[500px] overflow-y-auto'>

				{insights.map((item, index) => (

					<motion.div
						key={index}
						className={`bg-white rounded-xl p-4 shadow-sm ${getBorder(item.priority)}`}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
					>

						<div className='flex items-start gap-4'>

							<div className='mt-1'>
								{getIcon(item.type)}
							</div>

							<div>

								<h3 className='font-semibold text-gray-800'>
									{item.title}
								</h3>

								<p className='text-sm text-gray-600 mt-1'>
									{item.message}
								</p>

							</div>

						</div>

					</motion.div>

				))}

			</div>

		</motion.div>
	);
};

export default AIBusinessInsights;