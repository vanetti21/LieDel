import React from "react";
import ProductTable from "../components/products/ProductsTable";

const AllProductsPage = () => {
  return (
    <div className="flex-1 overflow-auto relative z-10 p-6">
      <main className="max-w-7xl mx-auto py-8 px-4 lg:px-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Listado General de Productos
        </h1>
        {/* Renderizamos únicamente la tabla de productos */}
        <ProductTable />
      </main>
    </div>
  );
};

export default AllProductsPage;