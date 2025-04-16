import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const EmployeesTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // Función para formatear la fecha (solo mostrar la fecha sin la hora)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Esto devuelve solo la fecha en formato "MM/DD/YYYY"
  };

  // 🔁 Fetch de los empleados desde Flask cuando carga el componente
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/listar_empleados");
        const data = await response.json();
        setEmployees(data);
        setFilteredEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(term) ||
        employee.email.toLowerCase().includes(term)
    );
    setFilteredEmployees(filtered);
  };

  return (
    <motion.div
      className="rounded-xl p-6 border border-gray-200"
      style={{ backgroundColor: "rgb(240, 243, 249)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black-100">Employees</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search employees..."
            className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-400 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-400 uppercase tracking-wider">
                Hire Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-400">
            {filteredEmployees.map((employee) => (
              <motion.tr
                key={employee.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                      {employee.name.charAt(0)}
                    </div>
                    <div className="ml-4 text-sm font-medium text-black-100">
                      {employee.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black-100">
                  {employee.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black-100">
                  {employee.phone || "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employee.status === "Active"
                        ? "bg-green-700 text-green-100"
                        : "bg-red-700 text-red-100"
                    }`}
                  >
                    {employee.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black-100">
                  {formatDate(employee.hireDate)} {/* Formatear la fecha aquí */}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default EmployeesTable;
