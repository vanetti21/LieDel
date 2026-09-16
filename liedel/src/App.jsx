import { Route, Routes, Navigate } from "react-router-dom";

import Header from "./components/common/Header";
import { hasPermission } from "./components/common/hasPermission";
import OverviewPage from "./pages/OverviewPage";
import ProductsPage from "./pages/ProductsPage";
import UsersPage from "./pages/UsersPage";
import SalesPage from "./pages/SalesPage";
import OrdersPage from "./pages/OrdersPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import ClientsPage from "./pages/ClientsPage";
import SuppliersPage from "./pages/SuppliersPage";
import UserSave from "./components/settings/usersave";
import LowStockPage from "./pages/LowStockPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import PredictionsPage from "./pages/PredictionsPage";
import DefectiveProductsPage from "./pages/DefectiveProductsPage";
import DeadStockPage from "./pages/DeadStockPage";
import ClientsListPage from "./pages/ClientsListPage";

import Userpage from "./pages/Userpage";
import CreateUserpage from "./pages/CreateUserPage";
import UserDetailsPage from "./pages/UserDetailsPage";
import EmployeesList from "./pages/EmployeesListPage";
import SalesListPage from "./pages/SalesListPage";
import SalesDetailPage from "./pages/SalesDetailPage";

import PendingOrdersPage from "./pages/PendingOrdersPage";
import CompletedOrdersPage from "./pages/CompletedOrdersPage";
import CancelledOrdersPage from "./pages/CancelledOrdersPage";

import SuppliersListPage from "./pages/SuppliersListPage";

import ClientDetailPage from "./pages/ClientDetailPage";
import VipClientsPage from "./pages/VipClientsPage";

import SupplierDetailPage from "./pages/SupplierDetailPage";

import AllProductsPage from "./pages/AllProductsPage";

import { useEffect } from "react";

// 🛡️ Guardián de Rutas
const ProtectedRoute = ({ children, permission }) => {
  const isAuthenticated = localStorage.getItem("usuario");

  if (!isAuthenticated) {
    window.location.href = "http://127.0.0.1:5000/";
    return null;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  // 🌟 PASO 1: Capturar y guardar datos de la URL INMEDIATAMENTE (Síncrono)
  const params = new URLSearchParams(window.location.search);
  const usuarioUrl = params.get("usuario");

  if (usuarioUrl) {
    localStorage.setItem("usuario", usuarioUrl);
    localStorage.setItem("nombre", params.get("nombre"));
    localStorage.setItem("email", params.get("email"));
    localStorage.setItem("puesto", params.get("puesto"));

    const urlPermisos = params.get("permisos");
    if (urlPermisos) {
      localStorage.setItem("permisos", urlPermisos);
    }
  }

  // 🌟 PASO 2: El useEffect ahora SÓLO se encarga de limpiar la URL una vez cargado todo
  useEffect(() => {
    if (usuarioUrl) {
      console.log("=== DATOS DE URL PROCESADOS CON ÉXITO ===");
      // Limpia los parámetros de la barra de direcciones para estética y seguridad
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [usuarioUrl]);

  return (
    <div
      className="flex flex-col min-h-screen text-gray-800"
      style={{ backgroundColor: "rgb(197, 202, 233)" }}
    >
      {/* Ahora Header leerá el localStorage ya lleno desde el primer milisegundo */}
      <Header />

      {/* Page content */}
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <OverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id"
            element={
              <ProtectedRoute>
                <ProductDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Rutas protegidas */}
          <Route
            path="/products"
            element={
              <ProtectedRoute permission="Ver ProductsPage">
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute permission="Ver UsersPage">
                <UsersPage />
              </ProtectedRoute>
            }
          />

          {/* 🎯 Ruta que redirige a la lista exclusiva de empleados */}
          <Route
            path="/Employees"
            element={
              <ProtectedRoute permission="Ver UsersPage">
                <EmployeesList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales"
            element={
              <ProtectedRoute permission="Ver SalesPage">
                <SalesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute permission="Ver OrdersPage">
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute permission="Ver ClientsPage">
                <ClientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/list"
            element={
              <ProtectedRoute permission="Ver ClientsPage">
                <ClientsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/detail/:id"
            element={
              <ProtectedRoute permission="Ver ClientsPage">
                <ClientDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/vip"
            element={
              <ProtectedRoute permission="Ver ClientsPage">
                <VipClientsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/suppliers"
            element={
              <ProtectedRoute permission="Ver SuppliersPage">
                <SuppliersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers/list"
            element={
              <ProtectedRoute permission="Ver SuppliersPage">
                <SuppliersListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers/detail/:id"
            element={
              <ProtectedRoute permission="Ver SuppliersPage">
                <SupplierDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/predictions"
            element={
              <ProtectedRoute permission="Ver Predictions">
                <PredictionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute permission="Reporte General">
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          {/* Submódulos */}
          <Route
            path="/products/low-stock"
            element={
              <ProtectedRoute permission="Ver ProductsPage">
                <LowStockPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/defective-products"
            element={
              <ProtectedRoute permission="Ver ProductsPage">
                <DefectiveProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/dead-stock"
            element={
              <ProtectedRoute permission="Ver ProductsPage">
                <DeadStockPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/pending"
            element={
              <ProtectedRoute permission="Ver OrdersPage">
                <PendingOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/completed"
            element={
              <ProtectedRoute permission="Ver OrdersPage">
                <CompletedOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/cancelled"
            element={
              <ProtectedRoute permission="Ver OrdersPage">
                <CancelledOrdersPage />
              </ProtectedRoute>
            }
          />

          {/* Gestión de Usuarios del Sistema */}
          <Route
            path="/usersave"
            element={
              <ProtectedRoute permission="Crear Usuarios">
                <UserSave />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users-management"
            element={
              <ProtectedRoute permission="Crear Usuarios">
                <Userpage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/create"
            element={
              <ProtectedRoute permission="Crear Usuarios">
                <CreateUserpage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id"
            element={
              <ProtectedRoute permission="Editar Usuarios">
                <UserDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/products/all"
            element={
              <ProtectedRoute permission="Ver ProductsPage">
                <AllProductsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales/list"
            element={
              <ProtectedRoute permission="Ver SalesPage">
                <SalesListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/:id"
            element={
              <ProtectedRoute permission="Ver SalesPage">
                <SalesDetailPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
