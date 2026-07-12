import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { hasPermission } from "./hasPermission"; // Importamos el utilitario

// 1. Agregamos la propiedad 'permission' vinculada a cada elemento de navegación
const NAV_ITEMS = [
	{ name: "Overview",    href: "/"                  , permission: null }, // Libre acceso al panel base
	{ name: "Products",    href: "/products"          , permission: "Ver ProductsPage" },
	{ name: "Employees",   href: "/users"             , permission: "Ver UsersPage" },
	{ name: "Sales",       href: "/sales"             , permission: "Ver SalesPage" },
	{ name: "Orders",      href: "/orders"            , permission: "Ver OrdersPage" },
	{ name: "Clients",     href: "/clients"           , permission: "Ver ClientsPage" },
	{ name: "Suppliers",   href: "/suppliers"         , permission: "Ver SuppliersPage" },
	{ name: "Reports",     href: "/reports"           , permission: "Reporte General" },
	{ name: "Predictions", href: "/predictions"       , permission: "Ver Predictions" },
	{ name: "Users",       href: "/users-management"  , permission: "Ver UserPage" }, 
];

const getTitle = (pathname) => {
	if (pathname === "/")                   return "Sales Dashboard";
	if (pathname === "/products")           return "Products";
	if (pathname === "/products/low-stock") return "Low Stock Products";
	if (pathname.startsWith("/products/"))  return "Product Detail";
	if (pathname === "/users")              return "Employees";
	if (pathname === "/sales")              return "Sales";
	if (pathname === "/orders")             return "Orders";
	if (pathname === "/reports")            return "Reports";
	if (pathname === "/clients")            return "Clients";
	if (pathname === "/suppliers")          return "Suppliers";
	if (pathname === "/settings")           return "Settings";
	if (pathname === "/predictions")        return "Predictions";
	if (pathname === "/users-management")   return "System Users Access"; 
	return "Sales Dashboard";
};

const Header = () => {
	const location  = useLocation();
	const title     = getTitle(location.pathname);

	const nombre  = localStorage.getItem("nombre");
	const inicial = nombre ? nombre.charAt(0).toUpperCase() : "?";

	const isSettings = location.pathname === "/settings";

	// Forzamos la lectura de los permisos actuales en cada renderizado de ruta
	const permisosActuales = localStorage.getItem("permisos") || "";

	return (
		<header
			className="sticky top-0 z-20 border-b border-gray-200 shadow-md"
			style={{ backgroundColor: "rgb(240, 243, 255)" }}
		>
			<div className="flex items-center justify-between px-6 py-6 gap-4">

				{/* Título izquierda */}
				<motion.h1
					key={title}
					initial={{ opacity: 0, y: -4 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.2 }}
					className="ml-24 text-2xl font-bold font-tracking-tight text-gray-800 whitespace-nowrap"
				>
					{title}
				</motion.h1>

				{/* Nav derecha */}
				<nav className="mr-8 flex items-center gap-3 overflow-x-auto scrollbar-hide">

					{NAV_ITEMS.map((item) => {
						// Si el ítem no requiere permisos (como Overview), pasa directo
						if (!item.permission) {
							const isActive = location.pathname === item.href;
							return (
								<Link key={item.href} to={item.href}>
									<motion.div
										className="px-3 py-2 rounded-full text-xs font-semibold font-tracking-tight whitespace-nowrap cursor-pointer"
										style={{
											backgroundColor: isActive ? "#fff" : "transparent",
											color: isActive ? "#5a5cf9" : "#6b7280",
											boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
											border: isActive ? "1px solid #e5e7eb" : "1px solid transparent",
										}}
										whileHover={{
											backgroundColor: isActive ? "#fff" : "rgba(255,255,255,0.55)",
										}}
										transition={{ duration: 0.12 }}
									>
										{item.name}
									</motion.div>
								</Link>
							);
						}

						// Si requiere permisos, evaluamos directamente usando la variable fresca de los permisos
						const listaFlujo = permisosActuales.split(",").map(p => p.trim());
						if (!listaFlujo.includes(item.permission.trim())) {
							return null;
						}

						const isActive = location.pathname === item.href;
						return (
							<Link key={item.href} to={item.href}>
								<motion.div
									className="px-3 py-2 rounded-full text-xs font-semibold font-tracking-tight whitespace-nowrap cursor-pointer"
									style={{
										backgroundColor: isActive ? "#fff" : "transparent",
										color: isActive ? "#5a5cf9" : "#6b7280",
										boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
										border: isActive ? "1px solid #e5e7eb" : "1px solid transparent",
									}}
									whileHover={{
										backgroundColor: isActive ? "#fff" : "rgba(255,255,255,0.55)",
									}}
									transition={{ duration: 0.12 }}
								>
									{item.name}
								</motion.div>
							</Link>
						);
					})}

					{/* Avatar */}
					<Link to="/settings" className="ml-1">
						<motion.div
							className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-600 text-xs font-bold cursor-pointer flex-shrink-0"
							style={{
								border: isSettings ? "2px solid #6f71f0" : "1px solid transparent",
								boxShadow: isSettings ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
							}}
							transition={{ duration: 0.12 }}
						>
							{inicial}
						</motion.div>
					</Link>

				</nav>
			</div>
		</header>
	);
};

export default Header;