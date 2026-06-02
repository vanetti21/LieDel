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
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<motion.h2
				className='text-xl font-semibold mb-4'
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.2 }}
			>
				Top Clients
			</motion.h2>

			<div className='space-y-2 max-h-[340px] overflow-y-auto'>
				{clients.map((client, index) => (
					<motion.div
						key={index}
						className='flex justify-between items-center bg-white px-4 py-4 rounded-lg'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3 }}
					>
						<div>
							<p className='text-md font-medium'>{client.cliente}</p>
							<p className='text-sm text-gray-500'>
								{client.compras} purchases
							</p>
						</div>

						<div className='text-sm font-bold text-green-600'>
							${Number(client.total_gastado).toLocaleString("es-DO", { minimumFractionDigits: 2 })}
						</div>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
};

export default TopClients;