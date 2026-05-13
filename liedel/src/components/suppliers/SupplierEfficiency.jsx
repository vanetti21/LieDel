import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TopSuppliers = () => {
	const [suppliers, setSuppliers] = useState([]);

	useEffect(() => {
		fetch("http://localhost:5000/top_proveedores_rendimiento")
			.then((res) => res.json())
			.then((data) => setSuppliers(data));
	}, []);

	return (
		<motion.div
			className='rounded-xl p-6 border border-gray-200'
			style={{ backgroundColor: "rgb(240, 243, 249)" }}
		>
			<h2 className='text-xl font-semibold mb-6'>
				Top Suppliers
			</h2>

			<div className='overflow-y-auto max-h-[521px] pr-2 flex flex-col gap-4'>
				{suppliers.map((supplier, index) => (
					<div
						key={index}
						className='bg-white rounded-xl p-4 shadow-sm'
					>
						<div className='flex justify-between items-center'>
							<div>
								<h3 className='font-semibold text-lg'>
									{supplier.proveedor}
								</h3>

								<p className='text-sm text-gray-500'>
									{supplier.Pais}
								</p>
							</div>

							<div className='text-right'>
								<p className='text-green-600 font-bold'>
									${parseFloat(
										supplier.total_compras
									).toLocaleString()}
								</p>

								<p className='text-sm text-gray-500'>
									{supplier.promedio_entrega} days
								</p>
							</div>
						</div>

						<div className='mt-3 text-sm text-gray-600'>
							Orders: {supplier.total_ordenes}
						</div>
					</div>
				))}
			</div>
		</motion.div>
	);
};

export default TopSuppliers;