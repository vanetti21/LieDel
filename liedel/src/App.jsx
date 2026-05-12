import { Route, Routes } from "react-router-dom";

import Sidebar from "./components/common/Sidebar";

import OverviewPage from "./pages/OverviewPage";
import ProductsPage from "./pages/ProductsPage";
import UsersPage from "./pages/UsersPage";
import SalesPage from "./pages/SalesPage";
import OrdersPage from "./pages/OrdersPage";
import ReportsPage from "./pages/ReportsPage";
import ExcelPage from "./pages/ExcelPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import ClientsPage from "./pages/ClientsPage";
import SuppliersPage from "./pages/SuppliersPage";
import UserSave from "./components/settings/usersave";
import LowStockPage from "./pages/LowStockPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import PredictionsPage from "./pages/PredictionsPage";

import { useEffect } from "react";

// ... resto de imports igual

function App() {
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const usuario = params.get("usuario");
		if (usuario) {
			localStorage.setItem("usuario", usuario);
			localStorage.setItem("nombre", params.get("nombre"));
			localStorage.setItem("email", params.get("email"));
			localStorage.setItem("puesto", params.get("puesto"));
			window.history.replaceState({}, "", window.location.pathname);
		}
	}, []);
	return (
		<div className='flex h-screen text-black-100  overflow-y-auto' style={{ backgroundColor: 'rgb(169, 193, 255)' }}>
			{/* BG */}
			<div className='fixed inset-0 z-0'>
				<div className='absolute inset-0' />
				<div className='absolute inset-0 ' />
			</div>

			<Sidebar />
			<main className="flex-1 flex justify-center overflow-y-auto">
			<div className="w-full max-w-7xl px-4 md:px-8">
			<Routes>
				<Route path='/' element={<OverviewPage />} />
				<Route path='/products' element={<ProductsPage />} />
				<Route path='/users' element={<UsersPage />} />
				<Route path='/sales' element={<SalesPage />} />
				<Route path='/orders' element={<OrdersPage />} />
				<Route path='/reports' element={<ReportsPage />} />
				<Route path='/excel' element={<ExcelPage />} />
				<Route path='/analytics' element={<AnalyticsPage />} />
				<Route path='/usersave' element={<UserSave />} />
				<Route path='/settings' element={<SettingsPage />} />
				<Route path='/clients' element={<ClientsPage />} />
				<Route path='/suppliers' element={<SuppliersPage />} />
				<Route path="/products/low-stock" element={<LowStockPage />} />
				<Route path="/products/:id" element={<ProductDetailPage />} />
				<Route path='/predictions' element={<PredictionsPage />} />
				
			</Routes>
				</div>
			</main>
		</div>
	);
}

export default App;
