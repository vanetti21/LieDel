import { useEffect, useState } from "react";

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

	useEffect(() => {

	fetch("http://localhost:5000/defect-analysis")
		.then(res => res.json())
		.then(data => {

			console.log(data);

			setData(data);
		});

}, []);

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

				<h2 className="text-lg font-semibold mb-6">
					AI Defect Insights
				</h2>

				<div className="overflow-x-auto">

					<table className="w-full text-sm">

						<thead>

							<tr className="border-b">

								<th className="text-left py-3">
									Proveedor
								</th>

								<th className="text-left py-3">
									Productos Defectuosos
								</th>

								<th className="text-left py-3">
									Riesgo
								</th>

							</tr>

						</thead>

						<tbody>

							{data.suppliers.map((s, index) => {

								const riesgo =
									s.total >= 5
										? "Alto"
										: s.total >= 3
										? "Medio"
										: "Bajo";

								return (

									<tr
										key={index}
										className="border-b"
									>

										<td className="py-4">
											{s.proveedor}
										</td>

										<td className="py-4">
											{s.total}
										</td>

										<td className="py-4">

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