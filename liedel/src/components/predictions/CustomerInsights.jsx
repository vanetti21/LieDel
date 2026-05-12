import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const CustomerInsights = () => {

	const [searchTerm, setSearchTerm] = useState("");
	const [data, setData] = useState([]);
	const [filteredData, setFilteredData] = useState([]);

	useEffect(() => {
		fetch("http://localhost:5000/customer_insights")
			.then((res) => res.json())
			.then((result) => {
				setData(result);
				setFilteredData(result);
			});
	}, []);

	const handleSearch = (e) => {

		const term = e.target.value.toLowerCase();

		setSearchTerm(term);

		const filtered = data.filter(
			(item) =>
				item.Nombre.toLowerCase().includes(term)
		);

		setFilteredData(filtered);
	};

	return (

		<motion.div
			className='rounded-xl p-6 border border-gray-200'
			style={{ backgroundColor: "rgb(240,243,249)" }}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>

			<div className='flex justify-between items-center mb-6'>

				<h2 className='text-xl font-semibold text-black-100'>
					Top Customers
				</h2>

				<div className='relative'>

					<input
						type='text'
						placeholder='Search customer...'
						className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none'
						value={searchTerm}
						onChange={handleSearch}
					/>

					<Search
						className='absolute left-3 top-2.5 text-gray-400'
						size={18}
					/>

				</div>

			</div>

			<div className='overflow-x-auto max-h-[450px] overflow-y-auto'>

				<table className='min-w-full divide-y divide-gray-400'>

					<thead>

						<tr>

							<th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
								Customer
							</th>

							<th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
								Orders
							</th>

							<th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
								Total Spent
							</th>

							<th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
								Status
							</th>

						</tr>

					</thead>

					<tbody className='divide-y divide-gray-300'>

						{filteredData.map((item, index) => {

							const vip =
								item.total_gastado >= 50000;

							return (

								<motion.tr
									key={index}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className='hover:bg-gray-100 transition'
								>

									<td className='px-6 py-4 whitespace-nowrap'>

										<div className='flex items-center'>

											<div className='h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold'>
												{item.Nombre.charAt(0)}
											</div>

											<div className='ml-4 text-sm font-medium'>
												{item.Nombre}
											</div>

										</div>

									</td>

									<td className='px-6 py-4 whitespace-nowrap text-sm'>
										{item.compras}
									</td>

									<td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-700'>
										${parseFloat(item.total_gastado).toLocaleString()}
									</td>

									<td className='px-6 py-4 whitespace-nowrap'>

										<span
											className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
											${
												vip
													? "bg-yellow-500 text-white"
													: "bg-blue-600 text-white"
											}`}
										>
											{vip ? "VIP" : "Regular"}
										</span>

									</td>

								</motion.tr>
							);
						})}

					</tbody>

				</table>

			</div>

		</motion.div>
	);
};

export default CustomerInsights;