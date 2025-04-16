
import { motion } from "framer-motion";

const SettingSection = ({ icon: Icon, title, children }) => {
	return (
		<motion.div
			className='rounded-xl p-6 border border-gray-200 mb-8' style={{ backgroundColor: 'rgb(240, 243, 249)' }}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className='flex items-center mb-4'>
				<Icon className='text-black-400 mr-4' size='24' />
				<h2 className='text-xl font-semibold text-black-100'>{title}</h2>
			</div>
			{children}
		</motion.div>
	);
};
export default SettingSection;
