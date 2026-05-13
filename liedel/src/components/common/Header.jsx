import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";

const NAV_ITEMS = [
	{ name: "Overview",   href: "/"          },
	{ name: "Products",   href: "/products"  },
	{ name: "Employees",  href: "/users"     },
	{ name: "Sales",      href: "/sales"     },
	{ name: "Orders",     href: "/orders"    },
	{ name: "Clients",    href: "/clients"   },
	{ name: "Suppliers",  href: "/suppliers" },
	{ name: "Excel",      href: "/excel"     },
	{ name: "Reports",    href: "/reports"   },
	{ name: "Settings",   href: "/settings"  },
	{ name: "Predictions",   href: "/predictions"  },
];

const getTitle = (pathname) => {
	if (pathname === "/")                        return "Sales Dashboard";
	if (pathname === "/products")                return "Products";
	if (pathname === "/products/low-stock")      return "Low Stock Products";
	if (pathname.startsWith("/products/"))       return "Product Detail";
	if (pathname === "/users")                   return "Employees";
	if (pathname === "/sales")                   return "Sales";
	if (pathname === "/orders")                  return "Orders";
	if (pathname === "/reports")                 return "Reports";
	if (pathname === "/excel")                   return "Excel";
	if (pathname === "/clients")                 return "Clients";
	if (pathname === "/suppliers")               return "Suppliers";
	if (pathname === "/settings")                return "Settings";
	if (pathname === "/analytics")               return "Analytics";
	if (pathname === "/predictions")  			 return "Predictions"
		return "Sales Dashboard";
};

const Header = () => {
	const location = useLocation();
	const title = getTitle(location.pathname);

	return (
		<header
			className="sticky top-0 z-20 border-b border-gray-200 shadow-md"
			style={{ backgroundColor: "rgb(240, 243, 255)" }}
		>
			<div className="flex items-center justify-between px-6 py-6 gap-4">
				{/* Title left */}
				<motion.h1
					key={title}
					initial={{ opacity: 0, y: -4 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.2 }}
					className="ml-24 text-2xl font-bold font-tracking-tight text-gray-800 whitespace-nowrap"
				>
					{title}
				</motion.h1>

				{/* Pills right */}
				<nav className="mr-8 flex items-center gap-2 overflow-x-auto scrollbar-hide">
					{NAV_ITEMS.map((item) => {
						const isActive = location.pathname === item.href;
						return (
							<Link key={item.href} to={item.href}>
								<motion.div
									className="px-3 py-2 rounded-full text-xs font-medium font-semibold font-tracking-tight whitespace-nowrap cursor-pointer"
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
				</nav>
			</div>
		</header>
	);
};

export default Header;