import { useEffect, useState } from "react";
import { UserCheck, UsersIcon, UserX } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import UsersTable from "../components/users/UsersTable";
import UserGrowthChart from "../components/users/UserGrowthChart";
import UserActivityHeatmap from "../components/users/UserActivityHeatmap";

const UsersPage = () => {
const [data, setData] = useState({
employees: 0,
active: 0,
churn_rate: 0,
});

useEffect(() => {
fetch("http://localhost:5000/obtener_empleados")
.then((response) => response.json())
.then((data) => {
console.log("Empleados:", data);
setData(data);
})
.catch((error) => {
console.error("Error fetching empleados:", error);
});
}, []);

return (
<div className="flex-1 overflow-auto relative z-10">
<Header title="Employees" />

<main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
{/* STATS */}
<motion.div
className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8"
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 1 }}
>
<StatCard
name="Total Employees"
icon={UsersIcon}
value={data.employees}
color="#6366F1"
/>
<StatCard
name="Active Employees"
icon={UserCheck}
value={data.active}
color="#F59E0B"
/>
<StatCard
name="Churn Rate"
icon={UserX}
value={`${data.churn_rate}%`}
color="#EF4444"
/>
</motion.div>

<UsersTable />

{/* USER CHARTS */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
<UserGrowthChart />
<UserActivityHeatmap />
</div>
</main>
</div>
);
};

export default UsersPage;