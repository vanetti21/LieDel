import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header";

const CreateUserPage = () => {
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState([]);
  const [formData, setFormData] = useState({
    id_empleado: "",
    usuario: "",
    password: "",
    role: "cajero", // Rol por defecto
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 1. Cargar los empleados al entrar para el Select
  useEffect(() => {
    fetch("http://localhost:5000/api/empleados-disponibles")
      .then((res) => res.json())
      .then((data) => setEmpleados(data))
      .catch((err) => console.error("Error cargando empleados:", err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.id_empleado || !formData.usuario || !formData.password) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create user.");
      }

      setSuccess("User created successfully!");
      setTimeout(() => navigate("/users-management"), 1500); // Redirige tras el éxito
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <main className="max-w-xl mx-auto py-10 px-4">
        {/* Botón Volver */}
        <button
          onClick={() => navigate("/users-management")}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 text-sm font-semibold transition"
        >
          <ArrowLeft size={16} /> Back to Users
        </button>

        <motion.div
          className="rounded-xl p-8 border border-gray-200 shadow-lg"
          style={{ backgroundColor: "rgb(240, 243, 249)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">
              User Credentials
            </h2>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4 font-semibold">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm mb-4 font-semibold">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* SELECT DE EMPLEADOS */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Employee
              </label>
              <select
                name="id_empleado"
                value={formData.id_empleado}
                onChange={handleChange}
                className="w-full bg-white text-black rounded-lg p-2.5 border border-gray-300 outline-none text-sm"
              >
                <option value="">-- Choose an Employee --</option>
                {empleados.map((emp) => (
                  <option key={emp.id_empleado} value={emp.id_empleado}>
                    {emp.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* USERNAME */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                name="usuario"
                placeholder="e.g. jsmith"
                value={formData.usuario}
                onChange={handleChange}
                className="w-full bg-white text-black rounded-lg p-2.5 border border-gray-300 outline-none text-sm"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-white text-black rounded-lg p-2.5 border border-gray-300 outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-sm transition shadow-md mt-4"
            >
              Save User
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default CreateUserPage;