import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TopSuppliers = () => {
	const [suppliers, setSuppliers] = useState([]);

	useEffect(() => {
		fetch("http://localhost:5000/top_proveedores")
			.then((res) => res.json())
			.then((data) => setSuppliers(data));
	}, []);

	return (
		<motion.div
			className="rounded-xl p-6 border border-gray-200"
			style={{ backgroundColor: "rgb(240, 243, 249)" }}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<motion.h2
				className="text-xl font-semibold mb-4"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.2 }}
			>
				Suppliers List
			</motion.h2>

			<div className="space-y-2 max-h-[420px] overflow-y-auto">
				{suppliers.map((supplier, index) => (
					<motion.div
						key={index}
						className="bg-white px-4 py-4 rounded-lg border border-gray-100"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3 }}
					>
						<p className="font-semibold text-gray-800">
							{supplier.Nombre}
						</p>

						<p className="text-sm text-gray-500">
							{supplier.Pais}
						</p>

						<p className="text-sm text-gray-400">
							{supplier.Ubicacion}
						</p>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
};

export default TopSuppliers;