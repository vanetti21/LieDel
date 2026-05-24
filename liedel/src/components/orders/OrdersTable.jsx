import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const OrdersTable = () => {
	const [orders, setOrders] = useState([]);
	const [filteredOrders, setFilteredOrders] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		fetch("http://localhost:5000/orders_table")
			.then((res) => res.json())
			.then((data) => {
				setOrders(data);
				setFilteredOrders(data);
			})
			.catch((err) => console.error(err));
	}, []);

	const handleSearch = (e) => {
		const term = e.target.value.toLowerCase();
		setSearchTerm(term);

		const filtered = orders.filter(
			(order) =>
				order.proveedor.toLowerCase().includes(term) ||
				order.Estado.toLowerCase().includes(term)
		);

		setFilteredOrders(filtered);
	};

	return (
		<motion.div
			className='rounded-xl p-6 border border-gray-200 m-7'
			style={{ backgroundColor: "rgb(240,243,249)" }}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<div className='flex justify-between items-center mb-5'>
				{/* Título dentro de un formulario */}
				<motion.h2
				className="text-xl p-1 font-semibold text-black-100"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.2 }}
				>
				Orders List
				</motion.h2>

				<div className='relative'>
					<input
						type='text'
						placeholder='Search orders...'
						className='bg-gray-200 hover:bg-gray-300 text-black placeholder:text-gray-500 rounded-lg pl-10 pr-4 py-2 outline-none'
						value={searchTerm}
						onChange={handleSearch}
					/>

					<Search
						className='absolute left-3 top-2.5 text-gray-500'
						size={18}
					/>
				</div>
			</div>

			<div className='overflow-x-auto max-h-[350px] overflow-y-auto'>
				<table className='min-w-full divide-y divide-gray-700'>
					<thead>
						<tr>
							<th className='px-6 py-3 text-left text-xs font-semibold text-black-500 uppercase tracking-wider'>
								Supplier
							</th>

							<th className='px-6 py-3 text-left text-xs font-semibold text-black-500 uppercase tracking-wider'>
								Order Date
							</th>

							<th className='px-6 py-3 text-left text-xs font-semibold text-black-500 uppercase tracking-wider'>
								Delivery Date
							</th>

							<th className='px-6 py-3 text-left text-xs font-semibold text-black-500 uppercase tracking-wider'>
								Status
							</th>

							<th className='px-6 py-3 text-left text-xs font-semibold text-black-500 uppercase tracking-wider'>
								Shipping
							</th>

							<th className='px-6 py-3 text-left text-xs font-semibold text-black-500 uppercase tracking-wider'>
								Cost
							</th>
						</tr>
					</thead>

					<tbody className='divide-y divide-gray-400'>
						{filteredOrders.map((order) => (
							<tr key={order.Id_orden_compra}>
								<td className='px-6 py-4'>
									{order.proveedor}
								</td>

								<td className='px-6 py-4'>
									{order.Fecha_orden}
								</td>

								<td className='px-6 py-4'>
									{order.Fecha_entrega_real || "Pending"}
								</td>

								<td className='px-6 py-4'>
									<span
										className={`px-3 py-1 rounded-full text-xs font-semibold
										${
											order.Estado.toLowerCase() === "entregada"
												? "bg-green-100 text-green-700"
												: order.Estado.toLowerCase() === "pendiente"
												? "bg-yellow-100 text-yellow-700"
												: "bg-blue-100 text-blue-700"
										}`}
									>
										{order.Estado}
									</span>
								</td>

								<td className='px-6 py-4'>
									{order.Tipo_envio}
								</td>

								<td className='px-6 py-4 font-semibold text-green-600'>
									${Number(order.Costo_total).toLocaleString()}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</motion.div>
	);
};

export default OrdersTable;