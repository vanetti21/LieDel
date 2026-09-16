import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#FFFFFF",
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#333333",
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 30,
  },
  header: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 10,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#1E293B" },
  subtitle: { fontSize: 9, color: "#64748B", marginTop: 4 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 12,
    marginBottom: 6,
  },
  kpiContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  kpiBox: { width: "19%", textAlign: "center" },
  kpiLabel: {
    fontSize: 6.5,
    color: "#64748B",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  kpiValue: { fontSize: 9.5, fontWeight: "bold", marginTop: 2 },
  fullWidthChartImage: {
    width: "100%",
    height: 170,
    objectFit: "contain",
  },
  table: {
    width: "100%",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    padding: 6,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    padding: 5,
  },
  legendDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  statusBadge: {
    fontSize: 7,
    fontWeight: "bold",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 8,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 8,
  },
});

const COLORS_ESTADOS = [
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#6366F1",
  "#8B5CF6",
  "#f15cf6",
];

const getStatusColors = (estado) => {
  const est = estado?.toLowerCase();
  if (est === "pendiente") return { bg: "#FEF3C7", color: "#92400E" };
  if (["completada", "entregada"].includes(est))
    return { bg: "#D1FAE5", color: "#065F46" };
  return { bg: "#FEE2E2", color: "#991B1B" };
};

const ReporteOrdenesPDF = ({ reportData, startDate, endDate, chartImages }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <Text style={styles.title}>Auditoría de Órdenes y Logística</Text>
          <Text style={styles.subtitle}>
            Período: {startDate} al {endDate}
          </Text>
        </View>

        {/* KPIS */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Inversión Total</Text>
            <Text style={[styles.kpiValue, { color: "#4F46E5" }]}>
              $
              {reportData?.inversion_total?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Órdenes Registradas</Text>
            <Text style={[styles.kpiValue, { color: "#1E293B" }]}>
              {reportData?.total_ordenes} ops
            </Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Costo Promedio</Text>
            <Text style={[styles.kpiValue, { color: "#16A34A" }]}>
              $
              {reportData?.orden_promedio?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Pendientes</Text>
            <Text style={[styles.kpiValue, { color: "#D97706" }]}>
              {reportData?.pendientes}
            </Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Completadas</Text>
            <Text style={[styles.kpiValue, { color: "#059669" }]}>
              {reportData?.completadas}
            </Text>
          </View>
        </View>

        {/* CURVA TEMPORAL DE INVERSIÓN EN COMPRAS (título ya incluido en la imagen) */}
        {chartImages?.tendenciaCompras && (
          <View style={{ marginBottom: 5 }} wrap={false}>
            <Image
              style={styles.fullWidthChartImage}
              src={chartImages.tendenciaCompras}
            />
          </View>
        )}

        {/* LOGÍSTICA Y TIPOS DE ENVÍO + PRODUCTOS MÁS ORDENADOS */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
          {/* LOGÍSTICA */}
          <View style={{ width: "50%" }}>
            <Text style={styles.sectionTitle}>Logística y Tipos de Envío</Text>
            {chartImages?.tiposEnvio && (
              <View style={{ marginBottom: 6 }} wrap={false}>
                <Image
                  style={{ width: "100%", height: 130, objectFit: "contain" }}
                  src={chartImages.tiposEnvio}
                />
              </View>
            )}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ width: "40%" }}>Tipo de Envío</Text>
                <Text style={{ width: "25%", textAlign: "center" }}>
                  Órdenes
                </Text>
                <Text style={{ width: "35%", textAlign: "right" }}>
                  Total Invertido
                </Text>
              </View>
              {reportData?.tipos_envio?.map((env, idx) => (
                <View key={idx} style={styles.tableRow} wrap={false}>
                  <Text style={{ width: "40%" }}>{env.tipo_envio}</Text>
                  <Text style={{ width: "25%", textAlign: "center" }}>
                    {env.cantidad}
                  </Text>
                  <Text
                    style={{
                      width: "35%",
                      textAlign: "right",
                      color: "#4F46E5",
                      fontWeight: "bold",
                    }}
                  >
                    $
                    {env.total_invertido?.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                    })}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* PRODUCTOS MÁS ORDENADOS */}
          <View style={{ width: "50%" }}>
            <Text style={styles.sectionTitle}>
              Productos / Insumos Más Ordenados
            </Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ width: "50%" }}>Producto</Text>
                <Text style={{ width: "20%", textAlign: "center" }}>
                  Unidades
                </Text>
                <Text style={{ width: "30%", textAlign: "right" }}>
                  Monto Gastado
                </Text>
              </View>
              {reportData?.productos_mas_ordenados?.length > 0 ? (
                reportData.productos_mas_ordenados
                  .slice(0, 10)
                  .map((prod, idx) => (
                    <View key={idx} style={styles.tableRow} wrap={false}>
                      <Text style={{ width: "50%" }}>
                        {prod.producto || "Producto sin nombre"}
                      </Text>
                      <Text style={{ width: "20%", textAlign: "center" }}>
                        {prod.cantidad_total?.toLocaleString()} u.
                      </Text>
                      <Text
                        style={{
                          width: "30%",
                          textAlign: "right",
                          color: "#16A34A",
                          fontWeight: "bold",
                        }}
                      >
                        $
                        {prod.total_gastado?.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                    </View>
                  ))
              ) : (
                <View style={styles.tableRow}>
                  <Text
                    style={{
                      width: "100%",
                      textAlign: "center",
                      color: "#94A3B8",
                    }}
                  >
                    Sin registro de ítems en el periodo seleccionado.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* TOP PROVEEDORES + DISTRIBUCIÓN POR ESTADO */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
          {/* TOP PROVEEDORES */}
          <View style={{ width: "50%" }}>
            <Text style={styles.sectionTitle}>
              Inversión por Proveedor (Top 10)
            </Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ width: "50%" }}>Proveedor</Text>
                <Text style={{ width: "20%", textAlign: "center" }}>
                  Órdenes
                </Text>
                <Text style={{ width: "30%", textAlign: "right" }}>
                  Total Invertido
                </Text>
              </View>
              {reportData?.ventas_proveedores?.slice(0, 10).map((p, idx) => (
                <View key={idx} style={styles.tableRow} wrap={false}>
                  <Text style={{ width: "50%" }}>{p.proveedor}</Text>
                  <Text style={{ width: "20%", textAlign: "center" }}>
                    {p.total_ordenes} ops.
                  </Text>
                  <Text
                    style={{
                      width: "30%",
                      textAlign: "right",
                      color: "#4F46E5",
                      fontWeight: "bold",
                    }}
                  >
                    $
                    {p.total_invertido?.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* DISTRIBUCIÓN POR ESTADO */}
          <View style={{ width: "50%" }}>
            <Text
              style={[
                styles.sectionTitle,
                { textAlign: "center", marginBottom: 0 },
              ]}
            >
              Distribución por Estado
            </Text>
            {chartImages?.distribucionEstados && (
              <View
                style={{ alignItems: "center", marginBottom: 6 }}
                wrap={false}
              >
                <Image
                  style={{ width: "65%", height: 110, objectFit: "contain" }}
                  src={chartImages.distribucionEstados}
                />
              </View>
            )}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ width: "40%" }}>Estado</Text>
                <Text style={{ width: "25%", textAlign: "center" }}>Cant.</Text>
                <Text style={{ width: "35%", textAlign: "right" }}>Monto</Text>
              </View>
              {reportData?.distribucion_estados?.map((est, idx) => (
                <View key={idx} style={styles.tableRow} wrap={false}>
                  <View
                    style={{
                      width: "40%",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={[
                        styles.legendDot,
                        {
                          backgroundColor:
                            COLORS_ESTADOS[idx % COLORS_ESTADOS.length],
                        },
                      ]}
                    />
                    <Text style={{ fontWeight: "bold" }}>{est.estado}</Text>
                  </View>
                  <Text style={{ width: "25%", textAlign: "center" }}>
                    {est.cantidad}
                  </Text>
                  <Text
                    style={{
                      width: "35%",
                      textAlign: "right",
                      fontWeight: "bold",
                    }}
                  >
                    $
                    {est.total_monto?.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* REGISTRO DE ÓRDENES RELEVANTES */}
        {reportData?.detalle_ordenes?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>
              Registro de Órdenes Relevantes
            </Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={{ width: "10%" }}># Orden</Text>
                <Text style={{ width: "20%" }}>Proveedor</Text>
                <Text style={{ width: "15%" }}>Sucursal</Text>
                <Text style={{ width: "15%" }}>Fecha</Text>
                <Text style={{ width: "15%", textAlign: "center" }}>
                  Estado
                </Text>
                <Text style={{ width: "10%" }}>Envío</Text>
                <Text style={{ width: "15%", textAlign: "right" }}>
                  Costo Total
                </Text>
              </View>
              {reportData.detalle_ordenes.slice(0, 15).map((ord) => {
                const badge = getStatusColors(ord.Estado);
                return (
                  <View
                    key={ord.Id_orden_compra}
                    style={styles.tableRow}
                    wrap={false}
                  >
                    <Text
                      style={{
                        width: "10%",
                        color: "#4F46E5",
                        fontWeight: "bold",
                      }}
                    >
                      #{ord.Id_orden_compra}
                    </Text>
                    <Text style={{ width: "20%" }}>
                      {ord.proveedor || "N/A"}
                    </Text>
                    <Text style={{ width: "15%" }}>
                      {ord.sucursal || "N/A"}
                    </Text>
                    <Text style={{ width: "15%" }}>{ord.fecha_orden}</Text>
                    <View style={{ width: "15%", alignItems: "center" }}>
                      <Text
                        style={[
                          styles.statusBadge,
                          { backgroundColor: badge.bg, color: badge.color },
                        ]}
                      >
                        {ord.Estado}
                      </Text>
                    </View>
                    <Text style={{ width: "10%" }}>
                      {ord.Tipo_envio || "Estándar"}
                    </Text>
                    <Text
                      style={{
                        width: "15%",
                        textAlign: "right",
                        fontWeight: "bold",
                      }}
                    >
                      $
                      {ord.Costo_total?.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export default ReporteOrdenesPDF;
