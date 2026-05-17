import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Legend
} from "recharts";

const COLORS = [
	"#6366F1",
	"#10B981",
	"#F59E0B",
	"#EF4444",
	"#8B5CF6"
];

const DefectAnalysis = () => {

	const [data, setData] = useState({
		shipping: [],
		warehouses: [],
		suppliers: [],
		transfers: []
	});

	const [searchTerm, setSearchTerm] = useState("");
	const [filteredSuppliers, setFilteredSuppliers] = useState([]);

	useEffect(() => {

		fetch("http://localhost:5000/defect-analysis")
			.then(res => res.json())
			.then(data => {

				console.log(data);

				setData(data);
				setFilteredSuppliers(data.suppliers);
			});

	}, []);

	const handleSearch = (e) => {

		const term = e.target.value.toLowerCase();

		setSearchTerm(term);

		const filtered = data.suppliers.filter((s) =>
			s.proveedor?.toLowerCase().includes(term)
		);

		setFilteredSuppliers(filtered);
	};

	return (

		<div className="space-y-8">

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

				{/* TIPO DE ENVÍO */}
				<div className="bg-white rounded-xl p-6 shadow-sm">

					<h2 className="text-lg font-semibold mb-4">
						Defectos por Tipo de Envío
					</h2>

					<div style={{ width: "100%", height: 300 }}>

						<ResponsiveContainer>

							<PieChart>

								<Pie
									data={data.shipping}
									dataKey="total"
									nameKey="tipo_envio"
									outerRadius={100}
									label
								>

									{data.shipping.map((entry, index) => (

										<Cell
											key={index}
											fill={COLORS[index % COLORS.length]}
										/>

									))}

								</Pie>

								<Tooltip />

								<Legend />

							</PieChart>

						</ResponsiveContainer>

					</div>

				</div>

				{/* ALMACENES */}
				<div className="bg-white rounded-xl p-6 shadow-sm">

					<h2 className="text-lg font-semibold mb-4">
						Almacenes con Más Defectos
					</h2>

					<div style={{ width: "100%", height: 300 }}>

						<ResponsiveContainer>

							<BarChart data={data.warehouses}>

								<XAxis dataKey="almacen" />

								<YAxis />

								<Tooltip />

								<Bar
									dataKey="total"
									fill="#EF4444"
								/>

							</BarChart>

						</ResponsiveContainer>

					</div>

				</div>

			</div>

			{/* TABLA */}
			<div className="bg-white rounded-xl p-6 shadow-sm">

				<div className="flex justify-between items-center mb-6">

					<h2 className="text-lg font-semibold">
						AI Defect Insights
					</h2>

					<div className="relative">

						<input
							type="text"
							placeholder="Buscar proveedor..."
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

					<table className="w-full text-sm">

						<thead>

							<tr className="border-b bg-gray-50 text-gray-500 uppercase text-xs">

								<th className="text-left py-3 px-4">
									Proveedor
								</th>

								<th className="text-left py-3 px-4">
									Productos Defectuosos
								</th>

								<th className="text-left py-3 px-4">
									Riesgo
								</th>

							</tr>

						</thead>

						<tbody className="divide-y divide-gray-100">

							{filteredSuppliers.map((s, index) => {

								const riesgo =
									s.total >= 5
										? "Alto"
										: s.total >= 3
										? "Medio"
										: "Bajo";

								return (

									<tr
										key={index}
										className="hover:bg-gray-50"
									>

										<td className="py-4 px-4 font-medium">
											{s.proveedor}
										</td>

										<td className="py-4 px-4">
											{s.total}
										</td>

										<td className="py-4 px-4">

											<span
												className={`px-2 py-1 rounded-full text-xs font-semibold ${
													riesgo === "Alto"
														? "bg-red-100 text-red-700"
														: riesgo === "Medio"
														? "bg-yellow-100 text-yellow-700"
														: "bg-green-100 text-green-700"
												}`}
											>

												{riesgo}

											</span>

										</td>

									</tr>
								);
							})}

						</tbody>

					</table>

				</div>

			</div>

		</div>
	);
};

export default DefectAnalysis;