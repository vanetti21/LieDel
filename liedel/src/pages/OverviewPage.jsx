import { useEffect, useState } from "react";
import { BarChart2, ShoppingBag, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import SalesOverviewChart from "../components/overview/SalesOverviewChart";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import SalesChannelChart from "../components/overview/SalesChannelChart";

const OverviewPage = () => {
	const [data, setData] = useState({
		total_sales: 0,
		employees: 0,
		total_products: 0,
	});

	useEffect(() => {
		fetch('http://localhost:5000/obtener_resumen')
			.then(response => response.json())
			.then(data => {
				console.log('Resumen:', data);
				setData(data); // ← Actualiza el estado con los datos recibidos
			})
			.catch(error => {
				console.error('Error fetching resumen:', error);
			});
	}, []);

	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Overview' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				{/* STATS */}
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard
						name='Total Sales'
						icon={Zap}
						value={`$${parseFloat(data.total_sales).toFixed(2)}`}
						color='#6366F1'
					/>
					<StatCard
						name='Total Employees'
						icon={Users}
						value={data.employees}
						color='#8B5CF6'
					/>
					<StatCard
						name='Total Products'
						icon={ShoppingBag}
						value={data.total_products}
						color='#EC4899'
					/>
				</motion.div>

				{/* CHARTS */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
					<SalesOverviewChart />
					<CategoryDistributionChart />
					<SalesChannelChart />
				</div>
			</main>
		</div>
	);
};

export default OverviewPage;
