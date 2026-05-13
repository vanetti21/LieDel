import { useEffect, useState } from "react";

const LowStockPage = () => {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			const res = await fetch("http://localhost:5000/products/low-stock");
			const result = await res.json();
			setData(result);
			setLoading(false);
		};
		fetchData();
	}, []);

	const formatDate = (dateStr) => {
		if (!dateStr || dateStr === "N/A") return "N/A";
		const d = new Date(dateStr);
		if (isNaN(d)) return dateStr;
		return d.toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" });
	};

	return (
		<div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">

			{/* KPI badge */}
			<div className="flex items-center gap-3">
				<span className="bg-red-100 text-red-600 text-sm font-semibold px-3 py-1 rounded-full">
					🔴 {data.length} producto{data.length !== 1 ? "s" : ""} bajo mínimo
				</span>
			</div>

			{/* Tabla */}
			<div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
				<div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
					<h3 className="font-semibold text-gray-800 text-base">Productos con stock crítico</h3>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
								<th className="px-6 py-3 text-left font-semibold">Producto</th>
								<th className="px-6 py-3 text-left font-semibold">Stock</th>
								<th className="px-6 py-3 text-left font-semibold">Mínimo</th>
								<th className="px-6 py-3 text-left font-semibold">Última Venta</th>
								<th className="px-6 py-3 text-left font-semibold">Última Compra</th>
								<th className="px-6 py-3 text-left font-semibold">Última Actualización</th>
							</tr>
						</thead>

						<tbody className="divide-y divide-gray-100">
							{loading ? (
								<tr>
									<td colSpan="6" className="px-6 py-10 text-center text-gray-400">
										Cargando...
									</td>
								</tr>
							) : Array.isArray(data) && data.length > 0 ? (
								data.map((p, index) => {
									const isCritical = p.Cantidad_actual < p.Cantidad_minima;
									return (
										<tr key={index} className="hover:bg-gray-50 transition-colors">
											<td className="px-6 py-4 font-medium text-gray-800">
												{p.Nombre}
											</td>
											<td className="px-6 py-4">
												<span className={`inline-flex items-center gap-1 font-semibold ${isCritical ? "text-red-600" : "text-gray-700"}`}>
													{isCritical && <span className="text-xs">⚠️</span>}
													{p.Cantidad_actual}
												</span>
											</td>
											<td className="px-6 py-4 text-gray-600">{p.Cantidad_minima}</td>
											<td className="px-6 py-4 text-gray-500">{formatDate(p.Ultima_venta)}</td>
											<td className="px-6 py-4 text-gray-500">{formatDate(p.Ultima_compra)}</td>
											<td className="px-6 py-4 text-gray-400 text-xs">{formatDate(p.Ultima_actualizacion)}</td>
										</tr>
									);
								})
							) : (
								<tr>
									<td colSpan="6" className="px-6 py-10 text-center text-gray-400">
										Sin productos bajo el mínimo 🎉
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default LowStockPage;