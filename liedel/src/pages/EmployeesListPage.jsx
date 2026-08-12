import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export default function EmployeesListPage() {
  const [empleados, setEmpleados] = useState([]);
  const [filteredEmpleados, setFilteredEmpleados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cargando, setCargando] = useState(true);

  // Formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
  };

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/empleados/lista')
      .then((res) => res.json())
      .then((data) => {
        setEmpleados(data);
        setFilteredEmpleados(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error('Error al cargar la lista de empleados:', err);
        setCargando(false);
      });
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = empleados.filter(
      (emp) =>
        emp.Nombre?.toLowerCase().includes(term) ||
        emp.Cargo?.toLowerCase().includes(term) ||
        emp.Contacto_email?.toLowerCase().includes(term)
    );
    setFilteredEmpleados(filtered);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Título Principal fuera de la tarjeta */}
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
        Listado General de Empleados
      </h1>

      {/* Contenedor tipo Tarjeta Blanca */}
      <motion.div
        className="bg-[#f2f4f8] rounded-2xl p-6 shadow-sm border border-gray-100/50"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Encabezado interno con Título secundario e Input de Búsqueda */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Employees</h2>

          <div className="relative">
            <input
              type="text"
              placeholder="Search Employee..."
              className="bg-[#e4e7ed] hover:bg-[#dcdee4] focus:bg-white text-gray-800 placeholder:text-gray-500 rounded-xl pl-10 pr-4 py-2 text-sm outline-none transition-all duration-200 border border-transparent focus:border-gray-300 w-64"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search className="absolute left-3.5 top-2.5 text-gray-500" size={16} />
          </div>
        </div>

        {/* Tabla Estilizada como en Productos */}
        {cargando ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            Cargando empleados...
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#f2f4f8] z-10 border-b border-gray-400/30">
                <tr className="text-gray-700 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">EMPLEADO</th>
                  <th className="py-3 px-4">CARGO</th>
                  <th className="py-3 px-4">EMAIL</th>
                  <th className="py-3 px-4">TELÉFONO</th>
                  <th className="py-3 px-4">ESTADO</th>
                  <th className="py-3 px-4">FECHA INGRESO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300/40 text-sm">
                {filteredEmpleados.length > 0 ? (
                  filteredEmpleados.map((emp) => (
                    <tr
                      key={emp.Id_empleado}
                      className="hover:bg-gray-200/40 transition-colors"
                    >
                      <td className="py-4 px-4 font-semibold text-gray-900">
                        #{emp.Id_empleado}
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-900">
                        {emp.Nombre}
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {emp.Cargo || 'Sin cargo'}
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {emp.Contacto_email || '—'}
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {emp.Contacto_telefono || '—'}
                      </td>
                      <td className="py-4 px-4 font-bold">
                        <span
                          className={
                            emp.Estado?.toLowerCase() === 'activo'
                              ? 'text-emerald-600'
                              : 'text-red-500'
                          }
                        >
                          {emp.Estado}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {formatDate(emp.Fecha_ingreso)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-8 text-center text-sm text-gray-500"
                    >
                      No se encontraron empleados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}