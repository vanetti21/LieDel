import { motion } from "framer-motion";
import { Users, Truck } from "lucide-react";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";

import ClientsOverviewChart from "../components/clients/ClientsOverviewChart";
import TopClients from "../components/clients/TopClients";


const ClientsPage = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Clients Dashboard' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>

				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard
						name='Total Clients'
						icon={Users}
						value='0'
						color='#6366F1'
					/>

					<StatCard
						name='Active Clients'
						icon={Users}
						value='0'
						color='#10B981'
					/>

					<StatCard
						name='Top Client Purchases'
						icon={Truck}
						value='$0'
						color='#F59E0B'
					/>
				</motion.div>

				<ClientsOverviewChart />

				<div className='mt-8'>
					<TopClients />
				</div>

			</main>
		</div>
	);
};

export default ClientsPage;