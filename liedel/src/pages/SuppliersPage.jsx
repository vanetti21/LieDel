import { motion } from "framer-motion";
import { Truck, DollarSign, Package } from "lucide-react";
import { useEffect, useState } from "react";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";

import SuppliersOverviewChart from "../components/suppliers/SuppliersOverviewChart";
import TopSuppliers from "../components/suppliers/TopSuppliers";
import SuppliersWorldMap from "../components/suppliers/SuppliersWorldMap";
import SupplierEfficiency from "../components/suppliers/SupplierEfficiency";


const SuppliersPage = () => {
    const [stats, setStats] = useState({
	totalSuppliers: 0,
	productsSupplied: 0,
	supplierRevenue: 0,
});

useEffect(() => {
	fetch("http://localhost:5000/suppliers_stats")
		.then((res) => res.json())
		.then((data) => setStats(data))
		.catch((err) => console.error(err));
}, []);
	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<main className='max-w-7xl mx-auto py-8 px-4 lg:px-8'>

				<motion.div
					className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.2 }}
				>
					<StatCard
                        name='Total Suppliers'
                        icon={Truck}
                        value={stats.totalSuppliers}
                        color='#6366F1'
                    />
                    <StatCard
                        name='Products Supplied'
                        icon={Package}
                        value={stats.productsSupplied}
                        color='#10B981'
                    />
                    <StatCard
                        name='Supplier Revenue'
                        icon={DollarSign}
                        value={`$${stats.supplierRevenue.toLocaleString()}`}
                        color='#F59E0B'
                    />
				</motion.div>
                
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-2'>
                    <div className='lg:col-span-2'>
                        <SuppliersWorldMap/>
                    </div>
                    <div className='lg:col-span-1'>
                        <SupplierEfficiency/>
                    </div>    
                </div>

                <SuppliersOverviewChart />

				<div className='mt-8'>
					<TopSuppliers />
				</div>

			</main>
		</div>
	);
};

export default SuppliersPage;