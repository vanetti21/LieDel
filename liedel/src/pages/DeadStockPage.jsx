import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

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
		return new Date(date).toLocaleDateString("es-DO", {
			day: "2-digit",
			month: "short",
			year: "numeric"
		});
	};

	return (
		<div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
			<div className="flex items-center gap-3">
				<span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold text-sm">
					📦 {filteredData.length} productos con stock muerto
				</span>
			</div>

			{/* Tabla principal */}
			<motion.div
				className="rounded-xl p-6 border border-gray-200"
				style={{ backgroundColor: "rgb(240, 243, 249)" }}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<div className="flex justify-between items-center mb-5">
					<motion.h2
						className="text-xl p-1 font-semibold text-black-100"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						Dead Stock Analysis
					</motion.h2>

					<div className="relative">
						<input
							type="text"
							placeholder="Search product..."
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
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Producto</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Categoría</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Stock</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Días sin venta</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Última venta</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Dinero estancado</th>
							</tr>
						</thead>

						<tbody className="divide-y divide-gray-400">
							{filteredData.map((p, index) => (
								<motion.tr
									key={index}
									className="hover:bg-gray-100 transition-colors"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.3 }}
								>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
										{p.Nombre}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm">
										{p.categoria}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm">
										{p.Cantidad_actual}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-red-600 text-sm font-semibold">
										{p.dias_sin_venta || "Nunca vendido"}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
										{formatDate(p.ultima_venta)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-purple-700 text-sm font-semibold">
										${Number(p.dinero_estancado).toLocaleString()}
									</td>
								</motion.tr>
							))}
						</tbody>
					</table>
				</div>
			</motion.div>

			{/* Cards de insights */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

				{/* Categorías */}
				<motion.div
					className="rounded-xl p-6 border border-gray-200"
					style={{ backgroundColor: "rgb(240, 243, 249)" }}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<motion.h3
						className="text-xl p-1 font-semibold text-black-100 mb-4"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						Categorías con más stock muerto
					</motion.h3>

					<div className="space-y-3">
						{insights.categories.map((c, index) => (
							<div key={index} className="bg-white rounded-lg p-3">
								<div className="font-medium">{c.categoria}</div>
								<div className="text-sm text-gray-500">{c.productos} productos</div>
								<div className="text-red-600 font-semibold">
									${Number(c.dinero_estancado).toLocaleString()}
								</div>
							</div>
						))}
					</div>
				</motion.div>

				{/* Nunca vendidos */}
				<motion.div
					className="rounded-xl p-6 border border-gray-200"
					style={{ backgroundColor: "rgb(240, 243, 249)" }}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<motion.h3
						className="text-xl p-1 font-semibold text-black-100 mb-4"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						Productos nunca vendidos
					</motion.h3>

					<div className="space-y-3">
						{insights.never_sold.map((p, index) => (
							<div key={index} className="bg-white rounded-lg p-3">
								<div className="font-medium">{p.Nombre}</div>
								<div className="text-sm text-gray-500">Stock: {p.Cantidad_actual}</div>
								<div className="text-purple-700 font-semibold">
									${Number(p.perdida).toLocaleString()}
								</div>
							</div>
						))}
					</div>
				</motion.div>

				{/* Recomendaciones */}
				<motion.div
					className="rounded-xl p-6 border border-gray-200"
					style={{ backgroundColor: "rgb(240, 243, 249)" }}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<motion.h3
						className="text-xl p-1 font-semibold text-black-100 mb-4"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						Recomendaciones IA
					</motion.h3>

					<div className="space-y-4 text-sm text-gray-700">
						<div className="bg-white rounded-lg p-3">
							📉 Aplicar descuentos a productos sin ventas mayores a 90 días.
						</div>
						<div className="bg-white rounded-lg p-3">
							🚚 Revisar proveedores con mayor acumulación de stock muerto.
						</div>
						<div className="bg-white rounded-lg p-3">
							🏬 Redistribuir productos entre almacenes con más movimiento.
						</div>
						<div className="bg-white rounded-lg p-3">
							📦 Reducir futuras órdenes de compra en categorías saturadas.
						</div>
					</div>
				</motion.div>

			</div>
		</div>
	);
};

export default DeadStockPage;