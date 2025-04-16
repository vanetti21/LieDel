import { motion } from "framer-motion";
import { Trash2, Plus } from "lucide-react";

const DangerZone = () => {
	return (
		<motion.div
			className='bg-red-300 bg-opacity-60 rounded-xl p-6 border border-gray-200 mb-8'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.2 }}
		>
			<div className='flex items-center mb-4'>
				<Trash2 className='text-red-400 mr-3' size={24} />
				<h2 className='text-xl font-semibold text-black-100'>Account</h2>
			</div>
			<p className='text-black-100 mb-4'>Add a new account account or log out.</p>
			<button
				className='bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded 
      			transition duration-200'
			>
				Log Out
			</button>
			<button className='mt-4 flex items-center text-indigo-900 hover:text-indigo-400 transition duration-200'>
				<Plus size={18} className='mr-2' /> 
				Add Account
			</button>
		</motion.div>
	);
};
export default DangerZone;
