import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TopClients = () => {
	const [clients, setClients] = useState([]);

	useEffect(() => {
		fetch("http://localhost:5000/top_clientes")
			.then((res) => res.json())
			.then((data) => setClients(data));
	}, []);

	return (
		<motion.div
			className='rounded-xl p-6 border border-gray-200'
			style={{ backgroundColor: "rgb(240, 243, 249)" }}
		>
			<h2 className='text-xl font-semibold mb-4'>
				Top Clients
			</h2>

			<div className='space-y-2'>
				{clients.map((client, index) => (
					<div
						key={index}
						className='flex justify-between items-center bg-gray-100 p-4 rounded-lg'
					>
						<div>
							<h3 className='font-semibold'>{client.cliente}</h3>
							<p className='text-sm text-gray-500'>
								{client.compras} purchases
							</p>
						</div>

						<div className='font-bold text-green-600'>
							${parseFloat(client.total_gastado).toFixed(2)}
						</div>
					</div>
				))}
			</div>
		</motion.div>
	);
};

export default TopClients;