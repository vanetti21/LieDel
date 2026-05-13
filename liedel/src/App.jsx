import { Route, Routes } from "react-router-dom";

import Header from "./components/common/Header";

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
import DefectiveProductsPage from "./pages/DefectiveProductsPage";	
import DeadStockPage from "./pages/DeadStockPage";
import { useEffect } from "react";

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
		<div
			className="flex flex-col min-h-screen text-gray-800"
			style={{ backgroundColor: "rgb(197, 202, 233)" }}
		>
			<Header />

			{/* Page content */}
			<main className="flex-1 overflow-y-auto">
				<Routes>
					<Route path="/"                   element={<OverviewPage />}      />
					<Route path="/products"           element={<ProductsPage />}      />
					<Route path="/users"              element={<UsersPage />}         />
					<Route path="/sales"              element={<SalesPage />}         />
					<Route path="/orders"             element={<OrdersPage />}        />
					<Route path="/reports"            element={<ReportsPage />}       />
					<Route path="/excel"              element={<ExcelPage />}         />
					<Route path="/analytics"          element={<AnalyticsPage />}     />
					<Route path="/usersave"           element={<UserSave />}          />
					<Route path="/settings"           element={<SettingsPage />}      />
					<Route path="/clients"            element={<ClientsPage />}       />
					<Route path="/suppliers"          element={<SuppliersPage />}     />
					<Route path="/products/low-stock" element={<LowStockPage />}      />
					<Route path="/products/:id"       element={<ProductDetailPage />} />
					<Route path='/predictions' 		  element={<PredictionsPage />} />
					<Route path="/defective-products" element={<DefectiveProductsPage />}/>
					<Route path="/products/dead-stock" element={<DeadStockPage />}/>
				</Routes>
			</main>
		</div>
	);
}

export default App;