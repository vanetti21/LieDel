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
      className="rounded-xl p-6 border border-gray-200 m-7"
      style={{ backgroundColor: "rgb(240, 243, 249)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-5">
        {/* Título dentro de un formulario */}
        <motion.h2
          className="text-xl p-1 font-semibold text-black-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Products
        </motion.h2>

        <div className="relative">
          {/* Campo de búsqueda */}
          <input
            type="text"
            placeholder="Search Products..."
            className="bg-gray-200 border border-gray-900 hover:bg-gray-300 text-black placeholder:text-gray-400 rounded-lg pl-10 pr-4 py-2 outline-none"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-2.5 text-gray-600" size={18} />
        </div>
      </div>

      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black-500 uppercase tracking-wider">
                Total Earned
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
                <td className="px-6 py-4 whitespace-nowrap text-green-600 font-bold">
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
