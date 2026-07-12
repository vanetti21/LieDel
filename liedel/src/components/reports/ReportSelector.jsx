import React from "react";
import { hasPermission } from "../../components/common/hasPermission";

// Definimos las opciones ligándolas con el nombre exacto de su permiso en la BD
const REPORT_OPTIONS = [
    { value: "general",            label: "Reporte General",       permission: "Reporte General" },
    { value: "productos",          label: "Productos",             permission: "Productos" },
    { value: "clientes",           label: "Clientes",              permission: "Clientes" },
    { value: "empleados",          label: "Empleados",             permission: "Empleados" },
    { value: "proveedores",        label: "Proveedores",           permission: "Proveedores" },
    { value: "compras",            label: "Compras",               permission: "Compras" },
    { value: "inventario",         label: "Inventario",            permission: "Inventario" },
    { value: "ventas",             label: "Ventas",                permission: "Ventas" },
    { value: "productoespecifico", label: "Producto en Especifico", permission: "Producto en Especifico" },
];

const ReportSelector = ({ tipoReporte, setTipoReporte }) => {
    // Filtramos el arreglo dejando pasar solo las opciones para las que el usuario tiene autorización
    const opcionesPermitidas = REPORT_OPTIONS.filter(option => hasPermission(option.permission));

    return (
        <select
            value={tipoReporte}
            onChange={(e) => setTipoReporte(e.target.value)}
            className="bg-white border p-2 rounded text-black mb-4 outline-none font-medium shadow-sm cursor-pointer"
        >
            {/* Si el usuario no tiene ningún permiso de reporte en absoluto */}
            {opcionesPermitidas.length === 0 ? (
                <option value="" disabled>No tienes reportes autorizados</option>
            ) : (
                opcionesPermitidas.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))
            )}
        </select>
    );
};

export default ReportSelector;