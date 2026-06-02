import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const ClientsTable = () => {
	const [clients, setClients] = useState([]);
	const [filteredClients, setFilteredClients] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		fetch("http://localhost:5000/api/clients-table")
			.then(res => res.json())
			.then(data => {
				setClients(data);
				setFilteredClients(data);
			});

	}, []);

	const handleSearch = (e) => {
		const term = e.target.value.toLowerCase();
		setSearchTerm(term);
		const filtered = clients.filter((client) =>
			client.cliente.toLowerCase().includes(term) ||
			client.ubicacion.toLowerCase().includes(term)
		);
		setFilteredClients(filtered);
	};

	return (
		<motion.div
			className="rounded-xl p-6 border border-gray-200 mb-8"
			style={{ backgroundColor: "rgb(240, 243, 249)" }}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>

			<div className="flex justify-between items-center mb-5">
				<motion.h2
					className="text-xl p-1 font-semibold text-black-100"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					Clients Ranking
				</motion.h2>

				<div className="relative">
					<input
						type="text"
						placeholder="Search Client..."
						className="bg-gray-200 hover:bg-gray-300 text-black placeholder:text-gray-500 rounded-lg pl-10 pr-4 py-2 outline-none"
						value={searchTerm}
						onChange={handleSearch}
					/>
					<Search
						className="absolute left-3 top-2.5 text-gray-500"
						size={18}
					/>
				</div>
			</div>

			<div className="overflow-x-auto max-h-[400px] overflow-y-auto">
				<table className="min-w-full divide-y divide-gray-700">
					<thead>
						<tr>
							<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">
								Client
							</th>
							<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">
								Location
							</th>
							<th className="px-10 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">
								Purchases
							</th>
							<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">
								Total Spent
							</th>
							<th className="px-9 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">
								Last Purchase
							</th>
						</tr>
					</thead>

					<tbody className="divide-y divide-gray-400">
						{filteredClients.map((client, index) => (
							<motion.tr
								key={index}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.3 }}
							>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
									{client.cliente}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm">
									{client.ubicacion}
								</td>
								<td className="px-10 py-4 whitespace-nowrap text-sm">
									{client.total_compras}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
									${Number(client.total_gastado).toLocaleString()}
								</td>
								<td className="px-9 py-4 whitespace-nowrap text-xs text-gray-500">
									{client.ultima_compra}
								</td>
							</motion.tr>
						))}
					</tbody>
				</table>
			</div>
		</motion.div>
	);
};

export default ClientsTable;