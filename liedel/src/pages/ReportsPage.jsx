import { CheckCircle, Clock, DollarSign, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../components/common/Header";
import Ventas_Fecha from "../components/reports/Ventas_Fecha";


const OrdersPage = () => {
	return (
		<div className='flex-1 relative z-10 overflow-auto'>
			<Header title={"Reports"} />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
            <Ventas_Fecha />

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
				
				</div>

				
				
			</main>
		</div>
	);
};
export default OrdersPage;