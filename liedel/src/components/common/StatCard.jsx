import { motion } from "framer-motion";

const StatCard = ({name, icon:Icon, value, color}) => {
  return (
    <motion.div
        className="overflow-hidden rounded-lx border border-gray-200" style={{ backgroundColor: 'rgb(240, 243, 249)' }}
        whileHover={{ y: -5, boxShadow: "0px 25px 50px -12px rgba(172, 168, 168, 0.5)" }}
    >
        <div className="px-4 py-5 sm:p-6">
            <span className="flex items-center text-sm font-medium text-black-100">
                <Icon 
                    size={20}   
                    className="mr-2"
                    style={{color}}
                />
                {name}
            </span>
            <p className="mt-1 text-3xl font-semibold text-black-100">{value}</p>
        </div>
        
    </motion.div>
  )
}

export default StatCard;
