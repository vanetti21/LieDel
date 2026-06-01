import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

import DefectAnalysis from "../components/products/DefectAnalysis";

const DefectiveProductsPage = () => {

	const [data, setData] = useState([]);
	const [filteredData, setFilteredData] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			const res = await fetch("http://localhost:5000/products/defective");
			const result = await res.json();
			setData(result);
			setFilteredData(result);
			setLoading(false);
		};
		fetchData();
	}, []);

	const handleSearch = (e) => {
		const term = e.target.value.toLowerCase();
		setSearchTerm(term);
		const filtered = data.filter((p) =>
			p.Nombre?.toLowerCase().includes(term) ||
			p.proveedor?.toLowerCase().includes(term) ||
			p.almacen?.toLowerCase().includes(term) ||
			p.sucursal?.toLowerCase().includes(term) ||
			p.Tipo_envio?.toLowerCase().includes(term) ||
			p.Tipo_resolucion?.toLowerCase().includes(term)
		);
		setFilteredData(filtered);
	};

	const formatDate = (dateStr) => {
		if (!dateStr) return "N/A";
		const d = new Date(dateStr);
		return d.toLocaleDateString("es-DO", {
			day: "2-digit",
			month: "short",
			year: "numeric"
		});
	};

	const resolucionColor = {
		Baja:        "bg-red-100 text-red-700",
		Liquidacion: "bg-yellow-100 text-yellow-700",
		Devolucion:  "bg-green-100 text-green-700",
	};

	const resolucionLabel = {
		Baja:        "Baja",
		Liquidacion: "Liquidación",
		Devolucion:  "Devolución",
	};

	const estadoColor = {
		Defectuoso: "bg-red-100 text-red-700",
		Activo:     "bg-green-100 text-green-700",
	};

	return (
		<div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
			<div className="flex items-center gap-3">
				<span className="bg-red-100 text-red-700 text-sm font-semibold px-4 py-2 rounded-full">
					🚨 {filteredData.length} unidades defectuosas
				</span>
			</div>

			<motion.div
				className="rounded-xl p-6 border border-gray-200 mb-8"
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
						Productos Defectuosos
					</motion.h2>

					<div className="relative">
						<input
							type="text"
							placeholder="Search product..."
							className="bg-gray-200 hover:bg-gray-300 text-black placeholder:text-gray-500 rounded-lg pl-10 pr-4 py-2 outline-none"
							value={searchTerm}
							onChange={handleSearch}
						/>
						<Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
					</div>
				</div>

				<div className="overflow-x-auto max-h-[400px] overflow-y-auto">
					<table className="min-w-full divide-y divide-gray-700">
						<thead>
							<tr>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Producto</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Estado</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Proveedor</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Almacén</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Sucursal</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Envío</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Cantidad</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Resolución</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Motivo</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Pérdida estimada</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Actualizado</th>
							</tr>
						</thead>

						<tbody className="divide-y divide-gray-400">
							{loading ? (
								<tr>
									<td colSpan="11" className="px-6 py-10 text-center text-gray-400">
										Cargando...
									</td>
								</tr>
							) : filteredData.length > 0 ? (
								filteredData.map((p, index) => (
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
											<span className={`px-2 py-1 rounded-full text-xs font-semibold ${estadoColor[p.estado_producto] || "bg-gray-100 text-gray-700"}`}>
												{p.estado_producto || "N/A"}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											{p.proveedor || "N/A"}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											{p.almacen || "N/A"}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											{p.sucursal || "N/A"}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											<span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
												{p.Tipo_envio || "N/A"}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
											{p.Cantidad_actual}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											{p.Tipo_resolucion ? (
												<span className={`px-2 py-1 rounded-full text-xs font-semibold ${resolucionColor[p.Tipo_resolucion] || "bg-gray-100 text-gray-700"}`}>
													{resolucionLabel[p.Tipo_resolucion] || p.Tipo_resolucion}
												</span>
											) : (
												<span className="text-gray-400 text-xs">Sin resolución</span>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{p.motivo_defecto || "N/A"}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
											${Number(p.perdida_estimada).toLocaleString()}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{formatDate(p.Ultima_actualizacion)}
										</td>
									</motion.tr>
								))
							) : (
								<tr>
									<td colSpan="11" className="px-6 py-10 text-center text-gray-400">
										No hay productos defectuosos
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</motion.div>

			<DefectAnalysis />
		</div>
	);
};

export default DefectiveProductsPage;