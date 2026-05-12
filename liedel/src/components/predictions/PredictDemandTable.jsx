import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const PredictDemandTable = () => {

	const [data, setData] = useState([]);
	const [filteredData, setFilteredData] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {

		fetch("http://localhost:5000/api/predict-demand")
			.then((res) => res.json())
			.then((result) => {
				setData(result);
				setFilteredData(result);
			});

	}, []);

	const handleSearch = (e) => {

		const term = e.target.value.toLowerCase();

		setSearchTerm(term);

		const filtered = data.filter((item) =>
			item.producto.toLowerCase().includes(term)
		);

		setFilteredData(filtered);
	};

	return (

		<motion.div
			className='rounded-xl p-6 border border-gray-200 mb-10'
			style={{ backgroundColor: "rgb(240,243,249)" }}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
		>

			<div className='flex justify-between items-center mb-6'>

				<h2 className='text-xl font-semibold'>
					AI Demand Forecast
				</h2>

				<div className='relative'>

					<input
						type='text'
						placeholder='Search product...'
						value={searchTerm}
						onChange={handleSearch}
						className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none'
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

							<th className='px-6 py-3 text-left text-xs uppercase'>
								Product
							</th>

							<th className='px-6 py-3 text-left text-xs uppercase'>
								Current Avg
							</th>

							<th className='px-6 py-3 text-left text-xs uppercase'>
								Predicted Demand
							</th>

							<th className='px-6 py-3 text-left text-xs uppercase'>
								AI Trend
							</th>

						</tr>

					</thead>

					<tbody className='divide-y divide-gray-300'>

						{filteredData.map((item, index) => (

							<motion.tr
								key={index}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className='hover:bg-gray-100 transition'
							>

								<td className='px-6 py-4 whitespace-nowrap font-medium'>
									{item.producto}
								</td>

								<td className='px-6 py-4 whitespace-nowrap'>
									{item.promedio_actual}
								</td>

								<td className='px-6 py-4 whitespace-nowrap font-bold text-blue-700'>
									{item.prediccion}
								</td>

								<td className='px-6 py-4 whitespace-nowrap'>

									<span
										className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
										${
											item.tendencia === "High Demand"
												? "bg-green-700 text-green-100"
												: "bg-red-700 text-red-100"
										}`}
									>
										{item.tendencia}
									</span>

								</td>

							</motion.tr>

						))}

					</tbody>

				</table>

			</div>

		</motion.div>
	);
};

export default PredictDemandTable;