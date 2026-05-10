import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
	ComposableMap,
	Geographies,
	Geography,
} from "react-simple-maps";

const geoUrl =
	"https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";   

const SuppliersWorldMap = () => {
	const [data, setData] = useState([]);

	useEffect(() => {
		fetch("http://localhost:5000/proveedores_mapa")
			.then((res) => res.json())
			.then((result) => {
				console.log("DATOS BACKEND:", result);
				setData(result);
			});
	}, []);

	return (
		<motion.div
			className='rounded-xl p-6 border border-gray-200 mb-8'
			style={{ backgroundColor: "rgb(240, 243, 249)" }}
		>
			<h2 className='text-xl font-semibold mb-4'>
				Global Suppliers Map
			</h2>

			<div className='w-full h-[500px]'>
				<ComposableMap projectionConfig={{ scale: 140 }}>
					<Geographies geography={geoUrl}>
						{({ geographies }) =>
							geographies.map((geo) => {
								const geoName =
									geo.properties.NAME ||
									geo.properties.name;

								const country = data.find(
									(item) =>
										item.Pais.toLowerCase().trim() ===
										geoName?.toLowerCase().trim()
								);

								return (
									<Geography
										key={geo.rsmKey}
										geography={geo}
										fill={
											country
												? "#6366F1"
												: "#D1D5DB"
										}
										stroke='#FFFFFF'
										style={{
											default: {
												outline: "none",
											},
											hover: {
												fill: "#4338CA",
												outline: "none",
											},
											pressed: {
												outline: "none",
											},
										}}
									/>
								);
							})
						}
					</Geographies>
				</ComposableMap>
			</div>
		</motion.div>
	);
};

export default SuppliersWorldMap;