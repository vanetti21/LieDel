import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, ShieldAlert } from 'lucide-react';

import Header from '../components/common/Header'; // Siguiendo el estilo de OrdersPage
import StatCard from '../components/common/StatCard'; 
import UsuariosTabla from '../components/users/UsuariosTabla'; // <--- Importamos el nuevo componente

// Nota: Luego podrás importar tus componentes modulares aquí abajo, por ejemplo:
// import UsersTable from "../components/users/UsersTable";

const Userpage = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        adminUsers: 0
    });

    useEffect(() => {
        // Petición directa e independiente para los stats
        fetch("http://localhost:5000/api/users/stats")
            .then((res) => {
                if (!res.ok) throw new Error("Error obteniendo estadísticas");
                return res.json();
            })
            .then((data) => setStats(data))
            .catch((err) => console.error("Error en frontend:", err));
    }, []);

    return (
        <div className="flex-1 overflow-auto relative z-10">
            {/* Si usas el componente Header global como en OrdersPage */}
            

            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                
                {/* SECCIÓN DE STATCARDS */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <StatCard
                        name="Total Users"
                        icon={Users}
                        value={stats.totalUsers}
                        color="#3B82F6"
                    />

                    <StatCard
                        name="Active Users"
                        icon={UserCheck}
                        value={stats.activeUsers}
                        color="#10B981"
                    />

                    <StatCard
                        name="Inactive Users"
                        icon={UserX}
                        value={stats.inactiveUsers}
                        color="#EF4444"
                    />

                    <StatCard
                        name="Admin Users"
                        icon={ShieldAlert}
                        value={stats.adminUsers}
                        color="#F59E0B"
                    />
                </motion.div>

                {/* El marcador para cuando decidas meter el componente modular de la tabla */}
                 <UsuariosTabla /> 

            </main>
        </div>
    );
};

export default Userpage;