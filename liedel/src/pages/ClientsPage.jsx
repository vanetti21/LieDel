import { motion } from "framer-motion";
import { Users, Crown, HeartHandshake, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import StatCard from "../components/common/StatCard";

import ClientsTable from "../components/clients/ClientsTable";
import ClientsOverviewChart from "../components/clients/ClientsOverviewChart";
import TopClients from "../components/clients/TopClients";

const ClientsPage = () => {

	const navigate = useNavigate();

	const [stats, setStats] = useState({
		total_clients: 0,
		vip_clients: 0,
		loyal_clients: 0,
		inactive_clients: 0
	});

	useEffect(() => {

		fetch("http://localhost:5000/api/client-stats")
			.then(res => res.json())
			.then(data => setStats(data));

	}, []);

	return (

		<div className='flex-1 overflow-auto relative z-10'>

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>

				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>

					<StatCard
						name='Total Clients'
						icon={Users}
						value={stats.total_clients}
						color='#6366F1'
					/>

					<StatCard
						name='VIP Clients'
						icon={Crown}
						value={stats.vip_clients}
						color='#F59E0B'
						onClick={() =>
							navigate("/clients/vip")
						}
					/>

					<StatCard
						name='Loyal Clients'
						icon={HeartHandshake}
						value={stats.loyal_clients}
						color='#10B981'
						onClick={() =>
							navigate("/clients/loyal")
						}
					/>

					<StatCard
						name='Inactive Clients'
						icon={UserX}
						value={stats.inactive_clients}
						color='#EF4444'
						onClick={() =>
							navigate("/clients/inactive")
						}
					/>

				</motion.div>
				<ClientsTable />

				<ClientsOverviewChart />

				<div className='mt-8'>
					<TopClients />
				</div>

			</main>

		</div>
	);
};

export default ClientsPage;