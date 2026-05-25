import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";

import { CreditCard, DollarSign, TrendingUp } from "lucide-react";

import SalesOverviewChart from "../components/sales/SalesOverviewChart";
import Ventas from "../components/sales/Ventas";
import Categorias from "../components/sales/Categorias";
import TopEmployeesSales from "../components/sales/TopEmployeesSales";


const SalesPage = () => {

	const [salesStats, setSalesStats] = useState({
		totalRevenue: 0,
		averageOrderValue: 0,
		salesGrowth: 0,
	});

	useEffect(() => {
		fetch("http://localhost:5000/sales_stats")
			.then((res) => res.json())
			.then((data) => setSalesStats(data))
			.catch((err) => console.error(err));
	}, []);

	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<main className='max-w-7xl mx-auto py-8 px-4 lg:px-8'>

				{/* SALES STATS */}
				<motion.div
					className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>

					<StatCard
						name='Total Revenue'
						icon={DollarSign}
						value={`$${salesStats.totalRevenue.toLocaleString("es-DO")}`}
						color='#6366F1'
					/>

					<StatCard
						name='Average Order'
						icon={TrendingUp}
						value={`$${salesStats.averageOrderValue.toLocaleString("es-DO")}`}
						color='#F59E0B'
					/>

					<StatCard
						name='Sales Growth'
						icon={CreditCard}
						value={`${salesStats.salesGrowth}%`}
						color='#EF4444'
					/>

				</motion.div>

				<SalesOverviewChart />

				<TopEmployeesSales />

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-9'>
					<Ventas />
					<Categorias />
				</div>

			</main>
		</div>
	);
};

export default SalesPage;