import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SettingSection from "./SettingSection";

const Account = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:5000/api/logout", { method: "POST" });
        } catch (err) {
            console.error("Error en logout:", err);
        } finally {
            localStorage.removeItem("Usuario");
            localStorage.removeItem("Nombre");
            localStorage.removeItem("Contacto_email");
            localStorage.removeItem("Cargo");
            window.location.href = "http://127.0.0.1:5000/";
        }
    };

    return (
        <SettingSection icon={LogOut} title={"Account"}>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='text-lg font-semibold text-black-100'>Cerrar sesión</h3>
                    <p className='text-gray-500 text-sm'>Salir de tu cuenta actual</p>
                </div>
                <button
                    onClick={handleLogout}
                    className='bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded transition duration-200'
                >
                    Logout
                </button>
            </div>
        </SettingSection>
    );
};
export default Account;