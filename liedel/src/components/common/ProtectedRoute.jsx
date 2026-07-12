import React from "react";
import { Navigate } from "react-router-dom";
import { hasPermission } from "./hasPermission";

const ProtectedRoute = ({ children, permission }) => {
  // Si la ruta requiere un permiso específico y el usuario NO lo tiene
  if (permission && !hasPermission(permission)) {
    // Lo redirigimos al inicio de forma segura
    return <Navigate to="/" replace />;
  }

  // Si tiene permiso, lo dejamos pasar al componente original
  return children;
};

export default ProtectedRoute;