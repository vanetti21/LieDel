import { motion } from "framer-motion";

const StatCard = ({ name, icon: Icon, value, color, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      className={`p-5 rounded-xl border border-gray-200 shadow-sm bg-white flex items-center gap-4 ${
        onClick ? "cursor-pointer transition-transform hover:scale-[1.02]" : ""
      }`}
      whileHover={onClick ? { y: -2 } : {}}
    >
      <div
        className="p-3 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}1A`, color: color }}
      >
        <Icon size={22} />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{name}</p>
        <p className="text-xl font-black font-mono mt-0.5" style={{ color: color }}>
          {value}
        </p>
      </div>
    </motion.div>
  );
};

export default StatCard;