import { useState } from "react";
import axios from "axios";

const UserSave = () => {
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
			alert("Usuario guardado");
		} catch (error) {
			console.error("Error al guardar usuario", error);
		}
	};

	return (
		<div className='max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10'>
			<h2 className='text-2xl font-bold mb-4'>Agregar Usuario</h2>
			<form onSubmit={handleSubmit} className='space-y-4'>
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
					placeholder='Usuario'
					className='w-full border px-4 py-2 rounded'
					required
				/>
				<input
					type='password'
					name='clave'
					value={formData.clave}
					onChange={handleChange}
					placeholder='Clave'
					className='w-full border px-4 py-2 rounded'
					required
				/>
				<button
					type='submit'
					className='w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700'
				>
					Guardar
				</button>
			</form>
		</div>
	);
};

export default UserSave;
