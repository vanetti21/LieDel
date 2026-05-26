import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

const PendingOrdersPage = () => {
	const [orders, setOrders] = useState([]);
	const [filteredOrders, setFilteredOrders] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");

	const formatDate = (dateStr) => {
		if (!dateStr) return "N/A";

		const d = new Date(dateStr);

		return d.toLocaleDateString("en-DO", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	};

	const handleSearch = (e) => {
		const term = e.target.value.toLowerCase();

		setSearchTerm(term);

		const filtered = orders.filter((o) =>
				o.proveedor?.toLowerCase().includes(term) ||
				o.sucursal?.toLowerCase().includes(term) ||
				o.Tipo_envio?.toLowerCase().includes(term) ||
				o.Estado?.toLowerCase().includes(term)
		);
		setFilteredOrders(filtered);
	};

	useEffect(() => {
		fetch("http://localhost:5000/orders/pending")
			.then((res) => res.json())
			.then((data) => {
				setOrders(data);
				setFilteredOrders(data);
			});
	}, []);

	return (
		<div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
			<div className="flex items-center gap-3">
				<span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-semibold text-sm">
					🟡 {orders.length} órdenes pendientes
				</span>
			</div>

			<motion.div 
				className="rounded-xl p-6 border border-gray-200 mb-8"
				style={{ backgroundColor: "rgb(240, 243, 249)" }}
				initial={{ opacity: 0, y: 20 }} 
				animate={{ opacity: 1, y: 0 }} 
				transition={{ duration: 0.3 }}
			
			>
				<div className="flex justify-between items-center mb-5">

					<motion.h2
						className="text-xl p-1 font-semibold text-black-100"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						Pending Orders
					</motion.h2>

				<div className="relative">

					<input
						type="text"
						placeholder="Search Order..."
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
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Order ID</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Supplier</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Branch</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Shipping</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Order Date</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Estimated Delivery</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Total Cost</th>
							</tr>
						</thead>

						<tbody className="divide-y divide-gray-400">
							{filteredOrders.map((o, index) => (
								<motion.tr
									key={index}
									className="hover:bg-gray-100 transition-colors"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.3 }}
								>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
										#{o.Id_orden_compra}
									</td>

									<td className="px-6 py-4 whitespace-nowrap text-sm">
										{o.proveedor}
									</td>

									<td className="px-6 py-4 whitespace-nowrap text-sm">
										{o.sucursal}
									</td>

									<td className="px-6 py-4 whitespace-nowrap text-sm">
										{o.Tipo_envio}
									</td>

									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{formatDate(o.Fecha_orden)}
									</td>

									<td className="px-6 py-4 text-yellow-500 whitespace-nowrap text-sm">
										{formatDate(o.Fecha_entrega_estimada)}
									</td>

									<td className="px-6 py-4 text-green-600 whitespace-nowrap text-sm font-semibold">
										${Number(o.Costo_total).toLocaleString()}
									</td>
								</motion.tr>
							))}
						</tbody>
					</table>
				</div>
			</motion.div>
		</div>
	);
};

export default PendingOrdersPage;

