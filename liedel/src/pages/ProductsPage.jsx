import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import ProductTable from "../components/products/ProductsTable";
import SalesTrendChart from "../components/products/SalesTrendChart";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";

import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react";

const ProductPage = () => {
	const [stats, setStats] = useState({
		total_productos: 0,
		top_selling: 0,
		low_stock: 0,
		total_revenue: 0,
	});

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const res = await fetch("http://localhost:5000/api/productos-stats");
				const data = await res.json();
				setStats(data);
			} catch (error) {
				console.error("Error al cargar estadísticas de productos:", error);
			}
		};

		fetchStats();
	}, []);

	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Products' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				{/* STATS */}
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard name='Total Products' icon={Package} value={stats.total_productos} color='#6366F1' />
					<StatCard name='Top Selling' icon={TrendingUp} value={stats.top_selling} color='#10B981' />
					<StatCard name='Low Stock' icon={AlertTriangle} value={stats.low_stock} color='#F59E0B' />
					<StatCard name='Total Revenue' icon={DollarSign} value={`$${stats.total_revenue.toFixed(2)}`} color='#EF4444' />
				</motion.div>

				<ProductTable />

				{/* CHARTS */}
				<div className="grid grid-col-1 lg:grid-cols-2 gap-8">
					<SalesTrendChart />
					<CategoryDistributionChart />
				</div>
			</main>
		</div>
	);
};

export default ProductPage;
