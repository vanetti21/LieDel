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
		>

			<div className="flex justify-between items-center mb-5">

				<h2 className="text-xl font-semibold">
					Clients Ranking
				</h2>

				<div className="relative">

					<input
						type="text"
						placeholder="Search Client..."
						className="bg-gray-200 border border-gray-500 hover:bg-gray-300 text-black placeholder:text-gray-400 rounded-lg pl-10 pr-4 py-2 outline-none"
						value={searchTerm}
						onChange={handleSearch}
					/>

					<Search
						className="absolute left-3 top-2.5 text-gray-600"
						size={18}
					/>

				</div>

			</div>

			<div className="overflow-x-auto max-h-[400px] overflow-y-auto">

				<table className="min-w-full divide-y divide-gray-300">

					<thead>

						<tr>

							<th className="px-6 py-3 text-left text-xs font-semibold uppercase">
								Client
							</th>

							<th className="px-6 py-3 text-left text-xs font-semibold uppercase">
								Location
							</th>

							<th className="px-6 py-3 text-left text-xs font-semibold uppercase">
								Purchases
							</th>

							<th className="px-6 py-3 text-left text-xs font-semibold uppercase">
								Total Spent
							</th>

							<th className="px-6 py-3 text-left text-xs font-semibold uppercase">
								Last Purchase
							</th>

						</tr>

					</thead>

					<tbody className="divide-y divide-gray-200">

						{filteredClients.map((client, index) => (

							<tr
								key={index}
								className="hover:bg-gray-50"
							>

								<td className="px-6 py-4 font-medium">
									{client.cliente}
								</td>

								<td className="px-6 py-4">
									{client.ubicacion}
								</td>

								<td className="px-6 py-4">
									{client.total_compras}
								</td>

								<td className="px-6 py-4 text-green-600 font-semibold">
									${Number(client.total_gastado).toLocaleString()}
								</td>

								<td className="px-6 py-4 text-gray-500">
									{client.ultima_compra}
								</td>

							</tr>

						))}

					</tbody>

				</table>

			</div>

		</motion.div>
	);
};

export default ClientsTable;