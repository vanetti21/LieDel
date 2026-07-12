export const hasPermission = (permisoBuscado) => {
  try {
    const rawPermisos = localStorage.getItem("permisos");
    if (!rawPermisos) return false;

    // Convertimos la lista de comas en un array real de strings limpios
    const listaTexto = rawPermisos.split(",").map(p => p.trim());
    
    return listaTexto.includes(permisoBuscado.trim());
  } catch (error) {
    console.error("Error en hasPermission:", error);
    return false;
  }
};