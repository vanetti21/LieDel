import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Plus } from "lucide-react";
import axios from "axios";

const DangerZone = () => {
	const [showForm, setShowForm] = useState(false);
	const [formData, setFormData] = useState({
		idemp: "",
		usuario: "",
		clave: "",
		estado: 1,
	});

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await axios.post("http://localhost:5000/guardar_usuario", formData);
			alert("Usuario guardado exitosamente");
			setFormData({ idemp: "", usuario: "", clave: "", estado: 1 });
			setShowForm(false);
		} catch (error) {
			console.error("Error al guardar usuario", error);
			alert("Hubo un error al guardar");
		}
	};

	return (
		<motion.div
			className='bg-red-300 bg-opacity-60 rounded-xl p-6 border border-gray-200 mb-8'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.2 }}
		>
			<div className='flex items-center mb-4'>
				<Trash2 className='text-red-400 mr-3' size={24} />
				<h2 className='text-xl font-semibold text-black-100'>Account</h2>
			</div>
			<p className='text-black-100 mb-4'>Add a new account or log out.</p>

			<button
				className='bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200'
			>
				Log Out
			</button>


			{showForm && (
				<form onSubmit={handleSubmit} className='mt-6 space-y-4 bg-white p-4 rounded-xl shadow'>
					<input
						type='number'
						name='idemp'
						value={formData.idemp}
						onChange={handleChange}
						placeholder='ID Empleado'
						className='w-full border px-4 py-2 rounded'
						required
					/>
					<input
						type='text'
						name='usuario'
						value={formData.usuario}
						onChange={handleChange}
						placeholder='Nombre de usuario'
						className='w-full border px-4 py-2 rounded'
						required
					/>
					<input
						type='password'
						name='clave'
						value={formData.clave}
						onChange={handleChange}
						placeholder='Contraseña'
						className='w-full border px-4 py-2 rounded'
						required
					/>
					<button
						type='submit'
						className='w-full bg-green-600 text-white py-2 rounded hover:bg-green-700'
					>
						Guardar Usuario
					</button>
				</form>
			)}
		</motion.div>
	);
};

export default DangerZone;
