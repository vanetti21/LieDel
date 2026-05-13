import { useEffect, useState } from "react";
import DefectAnalysis from "../components/products/DefectAnalysis";
const DefectiveProductsPage = () => {

	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {

		const fetchData = async () => {

			const res = await fetch(
				"http://localhost:5000/products/defective"
			);

			const result = await res.json();

			setData(result);

			setLoading(false);
		};

		fetchData();

	}, []);

	const formatDate = (dateStr) => {

		if (!dateStr) return "N/A";

		const d = new Date(dateStr);

		return d.toLocaleDateString(
			"es-DO",
			{
				day: "2-digit",
				month: "short",
				year: "numeric"
			}
		);
	};

	return (

		<div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">

			<div className="flex items-center gap-3">

				<span className="bg-red-100 text-red-700 text-sm font-semibold px-3 py-1 rounded-full">
					🚨 {data.length} productos defectuosos
				</span>

			</div>

			<div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

				<div className="px-6 py-4 border-b border-gray-100">

					<h3 className="font-semibold text-gray-800 text-base">
						Productos Defectuosos
					</h3>

				</div>

				<div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-700">

						<thead>

							<tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">

								<th className="px-6 py-3 text-left">
									Producto
								</th>

								<th className="px-6 py-3 text-left">
									Proveedor
								</th>

								<th className="px-6 py-3 text-left">
									País
								</th>

								<th className="px-6 py-3 text-left">
									Almacén
								</th>

								<th className="px-6 py-3 text-left">
									Sucursal
								</th>

								<th className="px-6 py-3 text-left">
									Envío
								</th>

								<th className="px-6 py-3 text-left">
									Cantidad
								</th>

								<th className="px-6 py-3 text-left">
									Pérdida
								</th>

								<th className="px-6 py-3 text-left">
									Actualizado
								</th>

							</tr>

						</thead>

						<tbody className="divide-y divide-gray-100">

							{loading ? (

								<tr>
									<td
										colSpan="9"
										className="px-6 py-10 text-center text-gray-400"
									>
										Cargando...
									</td>
								</tr>

							) : data.length > 0 ? (

								data.map((p, index) => (

									<tr
										key={index}
										className="hover:bg-gray-50 transition-colors"
									>

										<td className="px-6 py-4 font-medium text-gray-800">
											{p.Nombre}
										</td>

										<td className="px-6 py-4 text-gray-700">
											{p.proveedor || "N/A"}
										</td>

										<td className="px-6 py-4 text-gray-600">
											{p.Pais || "N/A"}
										</td>

										<td className="px-6 py-4 text-gray-600">
											{p.almacen || "N/A"}
										</td>

										<td className="px-6 py-4 text-gray-600">
											{p.sucursal || "N/A"}
										</td>

										<td className="px-6 py-4">
											<span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
												{p.Tipo_envio || "N/A"}
											</span>
										</td>

										<td className="px-6 py-4 text-red-600 font-semibold">
											{p.Cantidad_actual}
										</td>

										<td className="px-6 py-4 font-semibold text-red-700">
											$
											{Number(
												p.perdida_estimada
											).toLocaleString()}
										</td>

										<td className="px-6 py-4 text-gray-500 text-xs">
											{formatDate(
												p.Ultima_actualizacion
											)}
										</td>

									</tr>

								))

							) : (

								<tr>

									<td
										colSpan="9"
										className="px-6 py-10 text-center text-gray-400"
									>
										No hay productos defectuosos
									</td>

								</tr>

							)}

						</tbody>

					</table>

				</div>

			</div>
<DefectAnalysis />
		</div>
	);
};

export default DefectiveProductsPage;