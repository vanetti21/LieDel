import { BarChart2, DollarSign, Menu, Settings, ShoppingBag, FileSpreadsheet, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

const SIDEBAR_ITEMS = [
	{
		name: "Overview",
		icon: BarChart2,
		color: "#5a5cf9",
		href: "/",
	},
	{ name: "Products", icon: ShoppingBag, color: "#8654fb", href: "/products" },
	{ name: "Employees", icon: Users, color: "#ec3f95", href: "/users" },
	{ name: "Sales", icon: DollarSign, color: "#10ac78", href: "/sales" },
	{ name: "Reports", icon: TrendingUp, color: "#337ef8", href: "/reports" },
	{ name: "Excel", icon: FileSpreadsheet, color: "#cd8b30", href: "/excel" },
	{ name: "Settings", icon: Settings, color: "#6d9f8b", href: "/settings" },
];

const Sidebar = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	return (
		<motion.div
			className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${
				isSidebarOpen ? "w-64" : "w-20"
			}`}
			animate={{ width: isSidebarOpen ? 256 : 86 }}
		>
			<div className='h-full backdrop-blur-md p-4 flex flex-col border-r border-gray-400' style={{ backgroundColor: 'rgb(240, 243, 246)'}}>
				<motion.button
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					className='p-3 rounded-full hover:bg-[#A9C1FF] transition-colors max-w-fit' 
				>
					<Menu size={24} />
				</motion.button>

				<nav className='mt-7 flex-grow'>
					{SIDEBAR_ITEMS.map((item) => (
						<Link key={item.href} to={item.href}>
							<motion.div className='flex items-center p-3 text-m hover:bg-[#A9C1FF] font-medium rounded-lg transition-colors mb-2' >
								<item.icon size={27} style={{ color: item.color, minWidth: "27px" }} />
								<AnimatePresence>
									{isSidebarOpen && (
										<motion.span
											className='ml-4 whitespace-nowrap'
											initial={{ opacity: 0, width: 0 }}
											animate={{ opacity: 1, width: "auto" }}
											exit={{ opacity: 0, width: 0 }}
											transition={{ duration: 0.2, delay: 0.3 }}
										>
											{item.name}
										</motion.span>
									)}
								</AnimatePresence>
							</motion.div>
						</Link>
					))}
				</nav>
			</div>
		</motion.div>
	);
};
export default Sidebar;
