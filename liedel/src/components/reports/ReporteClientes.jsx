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
  chartTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
    textAlign: "center",
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
  kpiCaption: { fontSize: 6, color: "#94A3B8", marginTop: 1 },
  fullWidthChartImage: {
    width: "100%",
    height: 150,
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

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ec4899"];

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getMedalOrRank = (idx) => {
  if (idx === 0) return "#1";
  if (idx === 1) return "#2";
  if (idx === 2) return "#3";
  return `#${idx + 1}`;
};

const ReporteClientesPDF = ({ data, fechaInicio, fechaFin, chartImages }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Auditoría Comercial y Retención de Clientes
          </Text>
          <Text style={styles.subtitle}>
            Período: {formatDate(fechaInicio)} al {formatDate(fechaFin)}
          </Text>
        </View>

        {/* KPIS */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Recaudación Total</Text>
            <Text style={[styles.kpiValue, { color: "#16A34A" }]}>
              $
              {data?.facturacion_total?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </Text>
            <Text style={styles.kpiCaption}>Ingreso bruto neto facturado</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Clientes Compradores</Text>
            <Text style={[styles.kpiValue, { color: "#4F46E5" }]}>
              {data?.clientes_activos?.toLocaleString()} Únicos
            </Text>
            <Text style={styles.kpiCaption}>Generaron ingresos</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Transacciones</Text>
            <Text style={[styles.kpiValue, { color: "#D97706" }]}>
              {data?.total_transacciones} Ventas
            </Text>
            <Text style={styles.kpiCaption}>Tickets emitidos</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Consumo Promedio</Text>
            <Text style={[styles.kpiValue, { color: "#7C3AED" }]}>
              $
              {data?.ticket_promedio_general?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </Text>
            <Text style={styles.kpiCaption}>Valor medio del ticket</Text>
          </View>
          {data?.ciclo_dias_promedio !== undefined && (
            <View style={styles.kpiBox}>
              <Text style={styles.kpiLabel}>Ciclo Recompra</Text>
              <Text style={[styles.kpiValue, { color: "#2563EB" }]}>
                {data?.ciclo_dias_promedio || 0} Días
              </Text>
              <Text style={styles.kpiCaption}>Frecuencia entre compras</Text>
            </View>
          )}
        </View>

        {/* TENDENCIA DE INGRESOS Y TRÁFICO (título incluido en la imagen) */}
        {chartImages?.evolucionClientes && (
          <View style={{ marginBottom: 10 }} wrap={false}>
            <Image
              style={styles.fullWidthChartImage}
              src={chartImages.evolucionClientes}
            />
          </View>
        )}

        {/* CARTERA POR SEGMENTO + TOP CLIENTES */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
          {/* CARTERA POR SEGMENTO */}
          <View style={{ width: "35%" }}>
            <Text style={[styles.sectionTitle, { textAlign: "center" }]}>
              Cartera por Segmento
            </Text>
            {chartImages?.segmentacion && (
              <View
                style={{
                  alignItems: "center",
                  marginTop: 35,
                  marginBottom: 25,
                }}
                wrap={false}
              >
                <Image
                  style={{ width: "75%", height: 100, objectFit: "contain" }}
                  src={chartImages.segmentacion}
                />
              </View>
            )}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ width: "45%" }}>Segmento</Text>
                <Text style={{ width: "20%", textAlign: "center" }}>
                  Clientes
                </Text>
                <Text style={{ width: "35%", textAlign: "right" }}>
                  Aportado
                </Text>
              </View>
              {data?.segmentacion?.map((seg, idx) => (
                <View key={idx} style={styles.tableRow} wrap={false}>
                  <View
                    style={{
                      width: "45%",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: COLORS[idx % COLORS.length] },
                      ]}
                    />
                    <Text style={{ fontWeight: "bold", fontSize: 8 }}>
                      {seg.segmento}
                    </Text>
                  </View>
                  <Text style={{ width: "20%", textAlign: "center" }}>
                    {seg.cantidad_clientes}
                  </Text>
                  <Text
                    style={{
                      width: "35%",
                      textAlign: "right",
                      color: "#16A34A",
                      fontWeight: "bold",
                    }}
                  >
                    $
                    {Number(seg.aporte_financiero || 0).toLocaleString(
                      "en-US",
                      { minimumFractionDigits: 0 },
                    )}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* TOP CLIENTES */}
          <View style={{ width: "65%" }}>
            <Text style={styles.sectionTitle}>
              Ranking Top Clientes de Mayor Valor (CLV)
            </Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ width: "8%" }}>#</Text>
                <Text style={{ width: "37%" }}>Cliente</Text>
                <Text style={{ width: "20%", textAlign: "center" }}>
                  Frecuencia
                </Text>
                <Text style={{ width: "17%", textAlign: "right" }}>
                  Ticket Prom.
                </Text>
                <Text style={{ width: "18%", textAlign: "right" }}>
                  Total Aportado
                </Text>
              </View>
              {data?.top_clientes?.length > 0 ? (
                data.top_clientes.slice(0, 10).map((cl, idx) => (
                  <View key={idx} style={styles.tableRow} wrap={false}>
                    <Text
                      style={{
                        width: "8%",
                        color: "#94A3B8",
                        fontWeight: "bold",
                      }}
                    >
                      {getMedalOrRank(idx)}
                    </Text>
                    <View style={{ width: "37%" }}>
                      <Text style={{ fontWeight: "bold" }}>{cl.cliente}</Text>
                      <Text style={{ fontSize: 7, color: "#94A3B8" }}>
                        {cl.Contacto_telefono || cl.Telefono || "S/N"}
                      </Text>
                    </View>
                    <Text style={{ width: "20%", textAlign: "center" }}>
                      {cl.compras_realizadas} trans.
                    </Text>
                    <Text
                      style={{
                        width: "17%",
                        textAlign: "right",
                        color: "#4F46E5",
                        fontWeight: "bold",
                      }}
                    >
                      $
                      {cl.ticket_promedio?.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                    <Text
                      style={{
                        width: "18%",
                        textAlign: "right",
                        color: "#16A34A",
                        fontWeight: "bold",
                      }}
                    >
                      $
                      {cl.total_gastado?.toLocaleString("en-US", {
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
                    Ninguna transacción registrada en este rango temporal.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

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

export default ReporteClientesPDF;
