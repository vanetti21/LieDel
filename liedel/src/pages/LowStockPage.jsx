import { useEffect, useState } from "react";
import Header from "../components/common/Header";

const LowStockPage = () => {
	const [data, setData] = useState([]);

			useEffect(() => {
				const fetchData = async () => {
					const res = await fetch("http://localhost:5000/products/low-stock");
					const result = await res.json();

					console.log("RESULTADO API:", result);
					console.log("ES ARRAY?", Array.isArray(result));

					setData(result);
				};

				fetchData();
			}, []);

	return (
		<div className="flex-1">
			<Header title="Low Stock Products" />

			<div className="p-6">
				<table className="w-full border">
					<thead>
						<tr>
							<th>Producto</th>
							<th>Stock</th>
							<th>Mínimo</th>
							<th>Última Venta</th>
							<th>Última Compra</th>
							<th>Última Actualización</th>
						</tr>
					</thead>

					<tbody>
						{Array.isArray(data) && data.length > 0 ? (
							data.map((p, index) => (
								<tr key={index}>
									<td>{p.Nombre}</td>
									<td>{p.Cantidad_actual}</td>
									<td>{p.Cantidad_minima}</td>
									<td>{p.Ultima_venta || "N/A"}</td>
									<td>{p.Ultima_compra || "N/A"}</td>
									<td>{p.Ultima_actualizacion}</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan="6" className="text-center">
									Cargando o sin datos...
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default LowStockPage;