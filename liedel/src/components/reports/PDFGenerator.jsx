import { useState } from "react";

import ReportSelector from "./ReportSelector";

import ReporteGeneral from "./ReporteGeneral";
import ReporteProductos from "./ReporteProductos";
import ReporteVentas from "./ReporteVentas";
import ReporteClientes from "./ReporteClientes";
import ReporteEmpleados from "./ReporteEmpleados";
import ReporteProveedores from "./ReporteProveedores";
import ReporteCompras from "./ReporteCompras";
import ReporteInventario from "./ReporteInventario";
import ReporteProductoEspecifico from "./ReporteProductoEspecifico";

const PDFGenerator = () => {

    const [tipoReporte, setTipoReporte] = useState("general");

    return (
        <div className="bg-gray-100 rounded-xl p-5">

            <h2 className="text-2xl font-bold text-black mb-4">
                Reportes PDF
            </h2>

            <ReportSelector
                tipoReporte={tipoReporte}
                setTipoReporte={setTipoReporte}
            />

            {tipoReporte === "general" && <ReporteGeneral />}
            {tipoReporte === "productos" && <ReporteProductos />}
            {tipoReporte === "ventas" && <ReporteVentas />}
            {tipoReporte === "inventario" && <ReporteInventario />}
            {tipoReporte === "proveedores" && <ReporteProveedores />}
            {tipoReporte === "compras" && <ReporteCompras />}
            {tipoReporte === "clientes" && <ReporteClientes />}
            {tipoReporte === "empleados" && <ReporteEmpleados />}
            {tipoReporte === "productoespecifico" && <ReporteProductoEspecifico />}
            

        </div>
    );
};

export default PDFGenerator;