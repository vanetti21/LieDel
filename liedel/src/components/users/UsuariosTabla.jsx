import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UsuariosTabla = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // 🔁 Fetch de los usuarios desde Flask cuando carga el componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users/table");
        const data = await response.json();
        setUsuarios(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // 🔍 Lógica del buscador en tiempo real
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = usuarios.filter(
      (user) =>
        user.Nombre.toLowerCase().includes(term) ||
        user.usuario.toLowerCase().includes(term) ||
        user.Cargo.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  return (
    <motion.div
      className="rounded-xl p-6 border border-gray-200 mb-8"
      style={{ backgroundColor: "rgb(240, 243, 249)" }} // El mismo color de fondo de tu tabla de productos
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-5">
        <motion.h2
          className="text-xl p-1 font-semibold text-black-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          System Users
        </motion.h2>
        {/* Contenedor del Buscador + Botón */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        

        {/* BOTÓN AGREGADO: Te redirige al formulario */}
        <button
          onClick={() => navigate("/users/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition shadow-md"
        >
          Create User
        </button>
      </div>
        <div className="relative">
          {/* Campo de búsqueda */}
          <input
            type="text"
            placeholder="Search User..."
            className="bg-gray-200 hover:bg-gray-300 text-black placeholder:text-gray-500 rounded-lg pl-10 pr-4 py-2 outline-none"
            value={searchTerm}
            onChange={handleSearch}
          />

          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
        </div>
      </div>

      {/* Contenedor con scroll vertical e histórico del sticky header */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className='sticky top-0 bg-gray-100 z-10'>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black-600 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-400">
            {filteredUsers.map((user) => (
              <motion.tr
                key={user.Id_Empleado}
                onDoubleClick={() => navigate(`/users/${user.Id_Empleado}`)} // Por si deseas agregar vista detalle después
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-gray-800"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{user.Nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.usuario}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.Cargo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.Contacto_email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.estado === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.estado}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default UsuariosTabla;