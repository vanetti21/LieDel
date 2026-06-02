import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

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
			{/* Fila de gráficas */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

				{/* TIPO DE ENVÍO */}
				<motion.div
					className="rounded-xl p-6 border border-gray-200"
					style={{ backgroundColor: "rgb(240, 243, 249)" }}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<motion.h2
						className="text-xl font-semibold text-black-100 mb-6"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						Defectos por Tipo de Envío
					</motion.h2>

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
								</Pie >
								<Tooltip />
								<Legend 
									iconType="circle"
									iconSize={12}
									formatter={(value) => ( <span style={{ marginRight: "15px" }}> {value} </span> )}
									wrapperStyle={{
										marginLeft: "15px",
										paddingTop: "20px",
										display: "flex",
										flexWrap: "wrap",
										justifyContent: "center",
										gap: "6px",
										fontSize: "15px",
										color: "#4B5563"
									}}
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>
				</motion.div>

				{/* ALMACENES */}
				<motion.div
					className="rounded-xl p-6 border border-gray-200"
					style={{ backgroundColor: "rgb(240, 243, 249)" }}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<motion.h2
						className="text-xl font-semibold text-black-100 mb-6"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						Almacenes con Más Defectos
					</motion.h2>

					<div style={{ width: "100%", height: 300 }}>
						<ResponsiveContainer>
							<BarChart 
								data={data.warehouses}
								margin={{ 
								top: 8, 
								right: 25, 
								left: 5, 
								bottom: 3, }}
								>
								<XAxis dataKey="almacen" />
								<YAxis />
								<Tooltip />
								<Bar dataKey="total" fill="#EF4444" />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</motion.div>
			</div>

			{/* TABLA DE PROVEEDORES */}
			<motion.div
				className="rounded-xl p-6 border border-gray-200"
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
						AI Defect Insights
					</motion.h2>

					<div className="relative">
						<input
							type="text"
							placeholder="Buscar proveedor..."
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
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-500 uppercase tracking-wider">
									Proveedor
								</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-500 uppercase tracking-wider">
									Productos Defectuosos
								</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-500 uppercase tracking-wider">
									Riesgo
								</th>
							</tr>
						</thead>

						<tbody className="divide-y divide-gray-400">
							{filteredSuppliers.map((s, index) => {
								const riesgo =
									s.total >= 5
										? "Alto"
										: s.total >= 3
										? "Medio"
										: "Bajo";

								return (
									<motion.tr
										key={index}
										className="hover:bg-gray-100"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ duration: 0.3 }}
									>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											{s.proveedor}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											{s.total}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
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
									</motion.tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</motion.div>
		</div>
	);
};

export default DefectAnalysis;