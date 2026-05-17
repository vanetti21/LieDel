import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const CompletedOrdersPage = () => {

	const [orders, setOrders] = useState([]);
	const [filteredOrders, setFilteredOrders] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {

		fetch("http://localhost:5000/orders/completed")
			.then(res => res.json())
			.then(data => {
				setOrders(data);
				setFilteredOrders(data);
			});

	}, []);

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

	return (

		<div className="p-6 md:p-10 max-w-7xl mx-auto">

			<div className="mb-6">

				<span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold text-sm">

					🟢 {filteredOrders.length} órdenes completadas

				</span>

			</div>

			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

				<div className="px-6 py-4 border-b flex justify-between items-center">

					<h2 className="font-semibold text-lg">

						Completed Orders

					</h2>

					<div className="relative">

						<input
							type="text"
							placeholder="Search Orders..."
							className="bg-gray-100 border border-gray-300 rounded-lg pl-10 pr-4 py-2 outline-none"
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

					<table className="min-w-full divide-y divide-gray-300">

						<thead>

							<tr className="bg-gray-50 text-gray-500 uppercase text-xs">

								<th className="px-6 py-3 text-left">
									Order ID
								</th>

								<th className="px-6 py-3 text-left">
									Supplier
								</th>

								<th className="px-6 py-3 text-left">
									Branch
								</th>

								<th className="px-6 py-3 text-left">
									Shipping
								</th>

								<th className="px-6 py-3 text-left">
									Delivered
								</th>

								<th className="px-6 py-3 text-left">
									Total Cost
								</th>

							</tr>

						</thead>

						<tbody className="divide-y divide-gray-100">

							{filteredOrders.map((o, index) => (

								<tr
									key={index}
									className="hover:bg-gray-50"
								>

									<td className="px-6 py-4 font-semibold">
										#{o.Id_orden_compra}
									</td>

									<td className="px-6 py-4">
										{o.proveedor}
									</td>

									<td className="px-6 py-4">
										{o.sucursal}
									</td>

									<td className="px-6 py-4">
										{o.Tipo_envio}
									</td>

									<td className="px-6 py-4 text-green-600 font-semibold">
										{o.Fecha_entrega_real}
									</td>

									<td className="px-6 py-4 text-green-600 font-semibold">
										${Number(o.Costo_total).toLocaleString()}
									</td>

								</tr>

							))}

						</tbody>

					</table>

				</div>

			</div>

		</div>
	);
};

export default CompletedOrdersPage;