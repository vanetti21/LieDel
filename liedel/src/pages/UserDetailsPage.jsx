import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Key, ShieldCheck, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/common/Header";

const UserDetailsPage = () => {
  const { id } = useParams(); // Captura el Id_Empleado desde la URL
  const navigate = useNavigate();

  // Estado para los datos del usuario
  const [userData, setUserData] = useState({
    Nombre: "",
    Cargo: "",
    usuario: "",
    password: "",
    estado: 1,
  });

  // Estado para la lista maestra de permisos
  const [permisos, setPermisos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 1. Cargar simultáneamente los datos del usuario y sus permisos actuales
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userRes, permRes] = await Promise.all([
          fetch(`http://localhost:5000/api/users/${id}`),
          fetch(`http://localhost:5000/api/users/${id}/permisos`),
        ]);

        if (!userRes.ok || !permRes.ok) {
          throw new Error("Could not fetch user details or permissions.");
        }

        const userDataJson = await userRes.json();
        const permDataJson = await permRes.json();

        setUserData({
          Nombre: userDataJson.Nombre,
          Cargo: userDataJson.Cargo,
          usuario: userDataJson.usuario,
          password: "",
          estado: userDataJson.estado,
        });

        setPermisos(permDataJson);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: name === "estado" ? parseInt(value) : value,
    });
  };

  // 2. Controlar el encendido/apagado de los checkboxes en el estado
  const handlePermissionChange = (idPermiso) => {
    setPermisos(
      permisos.map((perm) =>
        perm.id_permiso === idPermiso
          ? { ...perm, asignado: perm.asignado === 1 ? 0 : 1 }
          : perm,
      ),
    );
  };

  // 3. Enviar todo sincronizado al backend al enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Filtramos solo los IDs de los permisos que quedaron con el gancho puesto (asignado === 1)
    const permisosSeleccionados = permisos
      .filter((p) => p.asignado === 1)
      .map((p) => p.id_permiso);

    try {
      // Petición A: Actualizar datos de usuario (nombre de usuario, clave, estado)
      const userResponse = await fetch(
        `http://localhost:5000/api/users/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        },
      );
      const userDataRes = await userResponse.json();
      if (!userResponse.ok)
        throw new Error(userDataRes.error || "Error updating user data.");

      // Petición B: Actualizar los permisos independientes de este usuario
      const permResponse = await fetch(
        `http://localhost:5000/api/users/${id}/permisos`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permisos: permisosSeleccionados }),
        },
      );
      const permDataRes = await permResponse.json();
      if (!permResponse.ok)
        throw new Error(permDataRes.error || "Error updating permissions.");

      setSuccess("User and permissions updated successfully!");
      setTimeout(() => navigate("/users-management"), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  // Agrupar dinámicamente los permisos por su categoría para renderizarlos por bloques
  const permisosAgrupados = permisos.reduce((acc, perm) => {
    if (!acc[perm.categoria]) acc[perm.categoria] = [];
    acc[perm.categoria].push(perm);
    return acc;
  }, {});

  if (loading)
    return (
      <div className="text-center text-gray-500 py-10">
        Loading user configuration...
      </div>
    );

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <main className="max-w-6xl mx-auto py-8 px-4">
        {/* Botón Volver */}
        <button
          onClick={() => navigate("/users-management")}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 text-sm font-semibold transition"
        >
          <ArrowLeft size={16} /> Back to Users
        </button>

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

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* COLUMNA IZQUIERDA: DATOS DE ACCESO */}
          <motion.div
            className="lg:col-span-1 rounded-xl p-6 border border-gray-200 shadow-lg h-fit space-y-5"
            style={{ backgroundColor: "rgb(240, 243, 249)" }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-2 border-b border-gray-300 pb-3">
              <User className="text-blue-600" size={24} />
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {userData.Nombre}
                </h2>
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  {userData.Cargo}
                </p>
              </div>
            </div>

            {/* CAMBIAR USUARIO */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Username
              </label>
              <input
                type="text"
                name="usuario"
                value={userData.usuario}
                onChange={handleUserChange}
                className="w-full bg-white text-black rounded-lg p-2.5 border border-gray-300 outline-none text-sm font-medium"
                required
              />
            </div>

            {/* CAMBIAR CONTRASEÑA */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                New Password{" "}
                <span className="text-[10px] text-gray-400 font-normal lowercase">
                  (Optional)
                </span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={userData.password}
                  onChange={handleUserChange}
                  className="w-full bg-white text-black rounded-lg p-2.5 pl-10 border border-gray-300 outline-none text-sm"
                />
                <Key
                  className="absolute left-3 top-3 text-gray-400"
                  size={16}
                />
              </div>
            </div>

            {/* CAMBIAR ESTADO */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Account Status
              </label>
              <select
                name="estado"
                value={userData.estado}
                onChange={handleUserChange}
                className="w-full bg-white text-black rounded-lg p-2.5 border border-gray-300 outline-none text-sm font-medium"
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-sm transition shadow-md mt-4"
            >
              <Save size={16} /> Save Changes
            </button>
          </motion.div>

          {/* COLUMNA DERECHA: INTERFAZ DE PERMISOS DETALLADOS POR BLOQUES */}
          <motion.div
            className="lg:col-span-2 rounded-xl p-6 border border-gray-200 shadow-lg"
            style={{ backgroundColor: "rgb(240, 243, 249)" }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-6 border-b border-gray-300 pb-3">
              <ShieldCheck className="text-amber-500" size={24} />
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  User Access Permissions
                </h2>
                <p className="text-xs text-gray-500">
                  Enable or disable features independently for this account.
                </p>
              </div>
            </div>

            {/* Grid de Bloques/Categorías de Permisos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(permisosAgrupados).map((categoria) => (
                <div
                  key={categoria}
                  className="bg-white bg-opacity-60 rounded-xl p-4 border border-gray-200 shadow-sm"
                >
                  <h3 className="text-sm font-bold text-blue-900 border-b border-gray-200 pb-1.5 mb-3 uppercase tracking-wider">
                    {categoria}
                  </h3>

                  <div className="space-y-2.5">
                    {permisosAgrupados[categoria].map((perm) => (
                      <label
                        key={perm.id_permiso}
                        className="flex items-center gap-3 text-sm text-gray-800 font-medium cursor-pointer hover:text-black transition select-none"
                      >
                        <input
                          type="checkbox"
                          checked={perm.asignado === 1}
                          onChange={() =>
                            handlePermissionChange(perm.id_permiso)
                          }
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        />
                        <span>{perm.nombre_permiso}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </form>
      </main>
    </div>
  );
};

export default UserDetailsPage;
