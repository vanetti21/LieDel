import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const ProductTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [productos, setProductos] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // 🔁 Fetch de los productos desde Flask cuando carga el componente
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/productos-reporte");
        const data = await response.json();
        setProductos(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = productos.filter(
      (product) =>
        product.producto.toLowerCase().includes(term) ||
        product.categoria.toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
  };

  return (
    <motion.div
      className="rounded-xl p-5 border border-gray-200 m-7"
      style={{ backgroundColor: "rgb(240, 243, 249)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-6">
        {/* Título dentro de un formulario */}
        <motion.h2
          className="text-xl font-semibold text-black-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Productos
        </motion.h2>

        <div className="relative">
          {/* Campo de búsqueda */}
          <input
            type="text"
            placeholder="Buscar productos..."
            className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-400 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-400 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-400 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-400 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-400 uppercase tracking-wider">
                Total Ganado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-400">
            {filteredProducts.map((product) => (
              <motion.tr
                key={product.idprod}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap">{product.producto}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.categoria}</td>
                <td className="px-6 py-4 whitespace-nowrap">${parseFloat(product.precio).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-green-400 font-bold">
                  ${parseFloat(product.total_ganado).toFixed(2)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default ProductTable;
