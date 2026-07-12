import { Route, Routes, Navigate } from "react-router-dom"; // Añadido: Navigate para la redirección

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

import Userpage from "./pages/Userpage";
import CreateUserpage from "./pages/CreateUserpage";
import UserDetailsPage from "./pages/UserDetailsPage";

import PendingOrdersPage from "./pages/PendingOrdersPage";
import CompletedOrdersPage from "./pages/CompletedOrdersPage";
import CancelledOrdersPage from "./pages/CancelledOrdersPage";

import { useEffect } from "react";

// 🛡️ Componente Guardián de Rutas con Doble Validación (Sesión + Permisos)
const ProtectedRoute = ({ children, permission }) => {
	const params = new URLSearchParams(window.location.search);
	
	// Verificamos si hay sesión en localStorage O si justo está llegando en la URL
	const isAuthenticated = localStorage.getItem("usuario") || params.get("usuario");  

	// 1. Si NO ha iniciado sesión de ninguna forma, directo al login de Flask
	if (!isAuthenticated) {
		window.location.href = "http://127.0.0.1:5000/";
		return null; 
	}

	// 2. Si SÍ está autenticado, pero la ruta pide un permiso que no tiene
	if (permission && !hasPermission(permission)) {
		// Si está en la URL apenas llegando, dejamos que pase el render inicial para que el useEffect procese los permisos
		if (params.get("usuario")) return children;
		
		return <Navigate to="/" replace />;
	}

	return children;
};

function App() {
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const usuario = params.get("usuario");

		console.log("=== REVISANDO PARÁMETROS DE LA URL ===");
		console.log("Usuario detectado en URL:", usuario);
		console.log("Nombre detectado en URL:", params.get("nombre"));
		console.log("Puesto detectado en URL:", params.get("puesto"));
		console.log("Permisos detectados en URL:", params.get("permisos"));

		if (usuario) {
			localStorage.setItem("usuario", usuario);
			localStorage.setItem("nombre", params.get("nombre"));
			localStorage.setItem("email", params.get("email"));
			localStorage.setItem("puesto", params.get("puesto"));

			const urlPermisos = params.get("permisos");
			if (urlPermisos) { 
				localStorage.setItem("permisos", urlPermisos);
			}

			window.history.replaceState({}, "", window.location.pathname);  
		}
	}, []);

	return (
		<div
			className="flex flex-col min-h-screen text-gray-800"
			style={{ backgroundColor: "rgb(197, 202, 233)" }}
		>
			<Header />

			{/* Page content */}
			<main className="flex-1 overflow-y-auto">
				<Routes>
					{/* 🌟 Ahora también protegemos las rutas base contra usuarios no logueados */}
					<Route path="/"                   element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
					<Route path="/settings"           element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
					<Route path="/products/:id"       element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />

					{/* Protegidas por sus respectivos permisos de BD */}
					<Route path="/products"           element={<ProtectedRoute permission="Ver ProductsPage"><ProductsPage /></ProtectedRoute>} />
					<Route path="/users"              element={<ProtectedRoute permission="Ver UsersPage"><UsersPage /></ProtectedRoute>} />
					<Route path="/sales"              element={<ProtectedRoute permission="Ver SalesPage"><SalesPage /></ProtectedRoute>} />
					<Route path="/orders"             element={<ProtectedRoute permission="Ver OrdersPage"><OrdersPage /></ProtectedRoute>} />
					<Route path="/clients"            element={<ProtectedRoute permission="Ver ClientsPage"><ClientsPage /></ProtectedRoute>} />
					<Route path="/suppliers"          element={<ProtectedRoute permission="Ver SuppliersPage"><SuppliersPage /></ProtectedRoute>} />
					<Route path="/predictions" 		  element={<ProtectedRoute permission="Ver Predictions"><PredictionsPage /></ProtectedRoute>} />
					
					{/* Reportes */}
					<Route path="/reports"            element={<ProtectedRoute permission="Reporte General"><ReportsPage /></ProtectedRoute>} />
					
					{/* Rutas Secundarias/Módulos de Productos */}
					<Route path="/products/low-stock" element={<ProtectedRoute permission="Ver ProductsPage"><LowStockPage /></ProtectedRoute>} />
					<Route path="/defective-products" element={<ProtectedRoute permission="Ver ProductsPage"><DefectiveProductsPage /></ProtectedRoute>}/>
					<Route path="/products/dead-stock" element={<ProtectedRoute permission="Ver ProductsPage"><DeadStockPage /></ProtectedRoute>}/>
					
					{/* Rutas Secundarias de Órdenes */}
					<Route path="/orders/pending"     element={<ProtectedRoute permission="Ver OrdersPage"><PendingOrdersPage /></ProtectedRoute>} />
					<Route path="/orders/completed"   element={<ProtectedRoute permission="Ver OrdersPage"><CompletedOrdersPage /></ProtectedRoute>} />
					<Route path="/orders/cancelled"   element={<ProtectedRoute permission="Ver OrdersPage"><CancelledOrdersPage /></ProtectedRoute>} />
					
					{/* Administración Avanzada de Usuarios */}
					<Route path="/usersave"           element={<ProtectedRoute permission="Crear Usuarios"><UserSave /></ProtectedRoute>} />
					<Route path="/users-management"   element={<ProtectedRoute permission="Crear Usuarios"><Userpage /></ProtectedRoute>} />	
					<Route path="/users/create"       element={<ProtectedRoute permission="Crear Usuarios"><CreateUserpage /></ProtectedRoute>} />
					<Route path="/users/:id"          element={<ProtectedRoute permission="Editar Usuarios"><UserDetailsPage /></ProtectedRoute>} />

					{/* Fallback global por si escriben cualquier cosa en la URL */}
					<Route path="*"                   element={<Navigate to="/" replace />} />
				</Routes>
			</main>
		</div>
	);
}

export default App;