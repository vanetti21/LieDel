import { useEffect, useState } from "react";
import { User } from "lucide-react";
import SettingSection from "./SettingSection";

const Profile = () => {
    const [perfil, setPerfil] = useState(null);

   useEffect(() => {
    const nombre = localStorage.getItem("nombre");
    const Contacto_email = localStorage.getItem("Contacto_email");
	const Cargo = localStorage.getItem("Cargo");

    console.log("Datos del perfil:", { nombre, Contacto_email, Cargo });

    if (nombre) {
        setPerfil({ nombre, Contacto_email, Cargo });
    }
}, []);

    return (
        <SettingSection icon={User} title={"Profile"}>
            <div className='flex flex-col sm:flex-row items-center mb-6'>
                <div className='w-20 h-20 rounded-full bg-indigo-200 flex items-center justify-center mr-4 text-indigo-700 text-3xl font-bold'>
                    {perfil ? perfil.nombre.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  {perfil && !perfil.error ? (
					<>
						<h3 className='text-lg font-semibold text-black-100'>
							{perfil.nombre}
						</h3>
						<p className='text-black-100'>{perfil.Contacto_email}</p>
						<p className='text-gray-500 text-sm'>{perfil.Cargo}</p>
					</>
				) : (
					<p className='text-gray-400'>Cargando perfil...</p>
				)}
                </div>
            </div>
        </SettingSection>
    );
};
export default Profile;