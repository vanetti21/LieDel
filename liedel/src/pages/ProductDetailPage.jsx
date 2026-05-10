import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/common/Header";

import {
	BarChart,
	Bar,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

const ProductDetailPage = () => {
	const { id } = useParams();

	const [product, setProduct] = useState(null);
	const [sales, setSales] = useState([]);
	const [purchases, setPurchases] = useState([]);
	const [prices, setPrices] = useState([]);
	const [insights, setInsights] = useState(null);

	useEffect(() => {
		fetch(`http://localhost:5000/product/${id}`)
			.then(res => res.json())
			.then(setProduct);

		fetch(`http://localhost:5000/product/${id}/sales`)
			.then(res => res.json())
			.then(setSales);

		fetch(`http://localhost:5000/product/${id}/purchases`)
			.then(res => res.json())
			.then(setPurchases);

		fetch(`http://localhost:5000/product/${id}/price-history`)
			.then(res => res.json())
			.then(setPrices);

		fetch(`http://localhost:5000/product/${id}/insights`)
			.then(res => res.json())
			.then(setInsights);

	}, [id]);

	if (!product) return <div className="p-6">Cargando...</div>;

	// 🧠 reglas
	const isDeadProduct = () => {
		if (!insights?.last_sale) return false;

		const last = new Date(insights.last_sale);
		const now = new Date();

		const months =
			(now.getFullYear() - last.getFullYear()) * 12 +
			(now.getMonth() - last.getMonth());

		return months >= 6;
	};

	const isHighDemand = () => {
		const total =
			insights?.months?.slice(0, 3)
				.reduce((acc, m) => acc + (m.total_vendido || 0), 0);

		return total > 50;
	};

	return (
	<div className="bg-[rgb(240,243,249)] flex justify-center">
		
		<div className="w-full max-w-7xl p-6 md:p-10 space-y-8">

			{/* HEADER */}
			<Header title={product.Nombre} />

			{/* KPI */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">

				<div className="p-6 bg-white border rounded-xl">
					<p>Precio</p>
					<h2 className="text-2xl font-bold">${product.Precio_venta}</h2>
				</div>

				<div className="p-6 bg-white border rounded-xl">
					<p>Stock</p>
					<h2 className="text-2xl font-bold">{product.Cantidad_actual}</h2>
				</div>

				<div className="p-6 bg-white border rounded-xl">
					<p>Mínimo</p>
					<h2 className="text-2xl font-bold">{product.Cantidad_minima}</h2>
				</div>

				<div className="p-6 bg-white border rounded-xl">
					<p>Estado</p>
					<h2 className="text-2xl font-bold">
						{product.Cantidad_actual <= product.Cantidad_minima
							? "🔴 Crítico"
							: "🟢 OK"}
					</h2>
				</div>

			</div>

			{/* GRID GRÁFICOS */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">

				{/* PRECIOS */}
				<div className="p-6 bg-white border rounded-xl">
					<h3 className="font-semibold mb-4 text-lg">Historial de precios</h3>

					<ResponsiveContainer width="100%" height={320}>
						<LineChart data={prices}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="Fecha_cambio" />
							<YAxis />
							<Tooltip />
							<Line dataKey="Precio" stroke="#6366F1" />
						</LineChart>
					</ResponsiveContainer>
				</div>

				{/* SUCURSALES */}
				<div className="p-6 bg-white border rounded-xl">
					<h3 className="font-semibold mb-4 text-lg">Ventas por sucursal</h3>

					<ResponsiveContainer width="100%" height={320}>
						<BarChart data={sales}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="sucursal" />
							<YAxis />
							<Tooltip />
							<Bar dataKey="total_vendido" fill="#10B981" />
						</BarChart>
					</ResponsiveContainer>
				</div>

				{/* MESES */}
				<div className="p-6 bg-white border rounded-xl">
					<h3 className="font-semibold mb-4 text-lg">Ventas por mes</h3>

					<ResponsiveContainer width="100%" height={320}>
						<BarChart data={insights?.months || []}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="mes" />
							<YAxis />
							<Tooltip />
							<Bar dataKey="total_vendido" fill="#F59E0B" />
						</BarChart>
					</ResponsiveContainer>
				</div>

				{/* INSIGHTS */}
				<div className="p-6 bg-white border rounded-xl space-y-3">
					<h3 className="font-semibold text-lg">Insights</h3>

					<div>🏢 {insights?.stores?.[0]?.sucursal || "N/A"}</div>
					<div>📅 {insights?.months?.[0]?.mes || "N/A"}</div>

					{isDeadProduct() && (
						<div className="text-red-600 font-bold text-lg">
							⚠️ Producto muerto
						</div>
					)}

					{isHighDemand() && (
						<div className="text-green-600 font-bold text-lg">
							🔥 Alta demanda
						</div>
					)}
				</div>

			</div>

			{/* COMPRAS */}
			<div className="p-6 bg-white border rounded-xl">
				<h3 className="font-semibold mb-4 text-lg">Compras / Proveedores</h3>

				<div className="space-y-2">
					{purchases.map((p, i) => (
						<div key={i} className="text-base">
							{p.proveedor} - <b>{p.total_comprado}</b>
						</div>
					))}
				</div>
			</div>

		</div>
	</div>
);
};

export default ProductDetailPage;