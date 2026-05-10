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
			className='rounded-xl p-6 border border-gray-200'
			style={{ backgroundColor: "rgb(240, 243, 249)" }}
		>
			<h2 className='text-xl font-semibold mb-4'>
				Suppliers List
			</h2>

			<div className='space-y-4'>
				{suppliers.map((supplier, index) => (
					<div
						key={index}
						className='bg-gray-100 p-4 rounded-lg'
					>
						<h3 className='font-semibold'>
							{supplier.Nombre}
						</h3>

						<p className='text-sm text-gray-500'>
							{supplier.Pais}
						</p>

						<p className='text-sm text-gray-400'>
							{supplier.Ubicacion}
						</p>
					</div>
				))}
			</div>
		</motion.div>
	);
};

export default TopSuppliers;