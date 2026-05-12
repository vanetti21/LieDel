import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const StockPrediction = () => {

	const [searchTerm, setSearchTerm] = useState("");
	const [data, setData] = useState([]);
	const [filteredData, setFilteredData] = useState([]);

	useEffect(() => {
		fetch("http://localhost:5000/prediccion_stock")
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
				item.producto.toLowerCase().includes(term)
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
					Stock Prediction
				</h2>

				<div className='relative'>

					<input
						type='text'
						placeholder='Search product...'
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

					<thead className='sticky top-0 bg-gray-100 z-10'>
						<tr>

							<th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
								Product
							</th>

							<th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
								Stock
							</th>

							<th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
								Avg Sales
							</th>

							<th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
								Days Left
							</th>

							<th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
								Risk
							</th>

						</tr>
					</thead>

					<tbody className='divide-y divide-gray-300'>

						{filteredData.map((item, index) => {

							const risk =
								item.dias_restantes <= 7
									? "High"
									: item.dias_restantes <= 15
									? "Medium"
									: "Low";

							return (

								<motion.tr
									key={index}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
								>

									<td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
										{item.producto}
									</td>

									<td className='px-6 py-4 whitespace-nowrap text-sm'>
										{item.stock}
									</td>

									<td className='px-6 py-4 whitespace-nowrap text-sm'>
										{item.promedio_ventas}
									</td>

									<td className='px-6 py-4 whitespace-nowrap text-sm'>
										{item.dias_restantes}
									</td>

									<td className='px-6 py-4 whitespace-nowrap'>

										<span
											className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
											${
												risk === "High"
													? "bg-red-700 text-red-100"
													: risk === "Medium"
													? "bg-yellow-600 text-yellow-100"
													: "bg-green-700 text-green-100"
											}`}
										>
											{risk}
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

export default StockPrediction;