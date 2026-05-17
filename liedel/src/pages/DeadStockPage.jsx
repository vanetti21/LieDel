import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const DeadStockPage = () => {

	const [data, setData] = useState([]);
	const [filteredData, setFilteredData] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");

	const [insights, setInsights] = useState({
		categories: [],
		never_sold: [],
		warehouses: []
	});

	useEffect(() => {

		fetch("http://localhost:5000/products/dead-stock")
			.then(res => res.json())
			.then(data => {
				setData(data);
				setFilteredData(data);
			});

		fetch("http://localhost:5000/dead-stock-insights")
			.then(res => res.json())
			.then(data => setInsights(data));

	}, []);

	const handleSearch = (e) => {

		const term = e.target.value.toLowerCase();

		setSearchTerm(term);

		const filtered = data.filter((p) =>

			p.Nombre?.toLowerCase().includes(term) ||
			p.categoria?.toLowerCase().includes(term)
		);

		setFilteredData(filtered);
	};

	const formatDate = (date) => {

		if (!date) return "Never";

		return new Date(date).toLocaleDateString();
	};

	return (

		<div className="p-6 md:p-10 max-w-7xl mx-auto">

			<div className="mb-6">

				<span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold text-sm">

					📦 {filteredData.length} productos con stock muerto

				</span>

			</div>

			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

				<div className="px-6 py-4 border-b flex justify-between items-center">

					<h2 className="font-semibold text-lg">

						Dead Stock Analysis

					</h2>

					<div className="relative">

						<input
							type="text"
							placeholder="Buscar producto..."
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

					<table className="min-w-full divide-y divide-gray-700">

						<thead>

							<tr className="bg-gray-50 text-gray-500 uppercase text-xs">

								<th className="px-6 py-3 text-left">
									Producto
								</th>

								<th className="px-6 py-3 text-left">
									Categoría
								</th>

								<th className="px-6 py-3 text-left">
									Stock
								</th>

								<th className="px-6 py-3 text-left">
									Días sin venta
								</th>

								<th className="px-6 py-3 text-left">
									Última venta
								</th>

								<th className="px-6 py-3 text-left">
									Dinero estancado
								</th>

							</tr>

						</thead>

						<tbody className="divide-y divide-gray-100">

							{filteredData.map((p, index) => (

								<tr
									key={index}
									className="hover:bg-gray-50"
								>

									<td className="px-6 py-4 font-medium">
										{p.Nombre}
									</td>

									<td className="px-6 py-4">
										{p.categoria}
									</td>

									<td className="px-6 py-4">
										{p.Cantidad_actual}
									</td>

									<td className="px-6 py-4 text-red-600 font-semibold">
										{p.dias_sin_venta || "Nunca vendido"}
									</td>

									<td className="px-6 py-4">
										{formatDate(p.ultima_venta)}
									</td>

									<td className="px-6 py-4 text-purple-700 font-semibold">
										${Number(p.dinero_estancado).toLocaleString()}
									</td>

								</tr>

							))}

						</tbody>

					</table>

				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 p-6">

					{/* Categorías */}
					<div className="bg-white rounded-xl p-6 shadow-sm border">

						<h3 className="font-semibold mb-4">
							Categorías con más stock muerto
						</h3>

						<div className="space-y-3">

							{insights.categories.map((c, index) => (

								<div
									key={index}
									className="border rounded-lg p-3"
								>

									<div className="font-medium">
										{c.categoria}
									</div>

									<div className="text-sm text-gray-500">
										{c.productos} productos
									</div>

									<div className="text-red-600 font-semibold">
										${Number(c.dinero_estancado).toLocaleString()}
									</div>

								</div>

							))}

						</div>

					</div>

					{/* Nunca vendidos */}
					<div className="bg-white rounded-xl p-6 shadow-sm border">

						<h3 className="font-semibold mb-4">
							Productos nunca vendidos
						</h3>

						<div className="space-y-3">

							{insights.never_sold.map((p, index) => (

								<div
									key={index}
									className="border rounded-lg p-3"
								>

									<div className="font-medium">
										{p.Nombre}
									</div>

									<div className="text-sm text-gray-500">
										Stock: {p.Cantidad_actual}
									</div>

									<div className="text-purple-700 font-semibold">
										${Number(p.perdida).toLocaleString()}
									</div>

								</div>

							))}

						</div>

					</div>

					{/* Recomendaciones */}
					<div className="bg-white rounded-xl p-6 shadow-sm border">

						<h3 className="font-semibold mb-4">
							Recomendaciones IA
						</h3>

						<div className="space-y-4 text-sm text-gray-700">

							<div className="border rounded-lg p-3">
								📉 Aplicar descuentos a productos sin ventas mayores a 90 días.
							</div>

							<div className="border rounded-lg p-3">
								🚚 Revisar proveedores con mayor acumulación de stock muerto.
							</div>

							<div className="border rounded-lg p-3">
								🏬 Redistribuir productos entre almacenes con más movimiento.
							</div>

							<div className="border rounded-lg p-3">
								📦 Reducir futuras órdenes de compra en categorías saturadas.
							</div>

						</div>

					</div>

				</div>

			</div>

		</div>
	);
};

export default DeadStockPage;