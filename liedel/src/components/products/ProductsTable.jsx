import { useEffect, useState } from "react";

const ProductTable = () => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/productos-reporte")
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((error) => console.error("Error al cargar productos:", error));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Productos</h2>
      <div className="overflow-x-auto bg-gray-800 p-4 rounded-xl shadow">
        <table className="min-w-full text-white">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Producto</th>
              <th className="px-4 py-2 text-left">Categoría</th>
              <th className="px-4 py-2 text-left">Precio</th>
              <th className="px-4 py-2 text-left">Stock</th>
              <th className="px-4 py-2 text-left">Total Ganado</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((prod) => (
              <tr key={prod.idprod} className="border-t border-gray-700">
                <td className="px-4 py-2">{prod.producto}</td>
                <td className="px-4 py-2">{prod.categoria}</td>
                <td className="px-4 py-2">${parseFloat(prod.precio).toFixed(2)}</td>
                <td className="px-4 py-2">{prod.stock}</td>
                <td className="px-4 py-2 text-green-400 font-bold">
                  ${parseFloat(prod.total_ganado).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
