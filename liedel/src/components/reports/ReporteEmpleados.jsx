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
  distribucionCargosTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 12,
    marginBottom: 2,
    textAlign: "center",
    width: "100%",
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
  kpiBox: { width: "23%", text: "center" },
  kpiLabel: {
    fontSize: 7,
    color: "#64748B",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  kpiValue: { fontSize: 11, fontWeight: "bold", marginTop: 2 },
  chartTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 4,
    marginBottom: -2,
  },
  chartImage: {
    width: "100%",
    height: 150,
    objectFit: "contain",
    marginTop: -2,
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
  col1: { width: "30%" },
  col2: { width: "18%", textAlign: "center" },
  col3: { width: "16%", textAlign: "center" },
  col4: { width: "18%", textAlign: "right" },
  col5: { width: "18%", textAlign: "right" },
  topCardsRow: { flexDirection: "row", gap: 8 },
  topCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 4,
    padding: 6,
  },
  topBadge: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#4F46E5",
    backgroundColor: "#EEF2FF",
    alignSelf: "flex-start",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 8,
    marginBottom: 4,
  },
  topName: { fontSize: 8, fontWeight: "bold", color: "#111827" },
  topPuesto: { fontSize: 7, color: "#9CA3AF", marginBottom: 6 },
  topGeneradoLabel: {
    fontSize: 6,
    color: "#9CA3AF",
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 1,
  },
  topGenerado: { fontSize: 9, fontWeight: "bold", color: "#16A34A" },
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

const ReporteEmpleadosPDF = ({
  reporteData,
  startDate,
  endDate,
  chartImages,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <Text style={styles.title}>Auditoría de Rendimiento Laboral</Text>
          <Text style={styles.subtitle}>
            Período: {startDate} al {endDate}
          </Text>
        </View>

        {/* METRICAS / KPIS */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Volumen Procesado</Text>
            <Text style={[styles.kpiValue, { color: "#16A34A" }]}>
              $
              {reporteData?.total_recaudado?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Tickets Despachados</Text>
            <Text style={[styles.kpiValue, { color: "#4F46E5" }]}>
              {reporteData?.total_despachado?.toLocaleString()} u.
            </Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Personal Activo</Text>
            <Text style={[styles.kpiValue, { color: "#D97706" }]}>
              {reporteData?.empleados_activos} Colab.
            </Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Media / Colaborador</Text>
            <Text style={[styles.kpiValue, { color: "#9333EA" }]}>
              $
              {reporteData?.rendimiento_medio_empleado?.toLocaleString(
                "en-US",
                { minimumFractionDigits: 2 },
              )}
            </Text>
          </View>
        </View>

        {/* GRÁFICOS EN DOS COLUMNAS */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
          {chartImages?.evolucionVentas && (
            <View style={{ width: "50%" }} wrap={false}>
              <Image
                style={styles.chartImage}
                src={chartImages.evolucionVentas}
              />
            </View>
          )}
          {chartImages?.contrataciones && (
            <View style={{ width: "50%" }} wrap={false}>
              <Image
                style={styles.chartImage}
                src={chartImages.contrataciones}
              />
            </View>
          )}
        </View>

        {/* GRÁFICO + TABLA: DISTRIBUCIÓN POR CARGO (tabla debajo del gráfico) */}
        {(chartImages?.distribucionCargos ||
          reporteData?.distribucion_cargos?.length > 0) && (
          <View style={{ marginBottom: 10 }} wrap={false}>
            <Text style={styles.distribucionCargosTitle}>
              Distribución de Empleados por Cargo
            </Text>
            {chartImages?.distribucionCargos && (
              <View style={{ alignItems: "center", marginBottom: 8 }}>
                <Image
                  style={{ width: "60%", height: 175, objectFit: "contain" }}
                  src={chartImages.distribucionCargos}
                />
              </View>
            )}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ width: "50%" }}>Puesto</Text>
                <Text style={{ width: "25%", textAlign: "center" }}>
                  Cantidad
                </Text>
                <Text style={{ width: "25%", textAlign: "right" }}>
                  % del Total
                </Text>
              </View>
              {reporteData?.distribucion_cargos?.map((c, idx) => {
                const totalCargos = reporteData.distribucion_cargos.reduce(
                  (s, x) => s + (x.cantidad || 0),
                  0,
                );
                const porcentaje =
                  totalCargos > 0
                    ? ((c.cantidad / totalCargos) * 100).toFixed(1)
                    : "0.0";
                return (
                  <View key={idx} style={styles.tableRow} wrap={false}>
                    <Text style={{ width: "50%" }}>{c.puesto}</Text>
                    <Text style={{ width: "25%", textAlign: "center" }}>
                      {c.cantidad}
                    </Text>
                    <Text style={{ width: "25%", textAlign: "right" }}>
                      {porcentaje}%
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* EMPLEADOS CON MAYOR RECAUDACIÓN GENERADA */}
        {reporteData?.top_generadores?.length > 0 && (
          <View style={{ marginBottom: 18, marginTop: -2 }} wrap={false}>
            <Text style={styles.sectionTitle}>
              Empleados con Mayor Recaudación Generada
            </Text>
            <View style={styles.topCardsRow}>
              {reporteData.top_generadores.map((top, idx) => (
                <View key={idx} style={styles.topCard}>
                  <Text style={styles.topBadge}>Top #{idx + 1}</Text>
                  <Text style={styles.topName}>{top.empleado}</Text>
                  <Text style={styles.topPuesto}>
                    {top.puesto || "Vendedor"}
                  </Text>
                  <Text style={styles.topGeneradoLabel}>Generado</Text>
                  <Text style={styles.topGenerado}>
                    $
                    {Number(top.total_generado || 0).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* TABLA PRINCIPAL DE RENDIMIENTO */}
        <View wrap={false}>
          <Text style={styles.sectionTitle}>
            Tabla de Rendimiento Individual
          </Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.col1}>Colaborador</Text>
              <Text style={styles.col2}>Puesto</Text>
              <Text style={styles.col3}>Transacciones</Text>
              <Text style={styles.col4}>Comisión (2%)</Text>
              <Text style={styles.col5}>Total Facturado</Text>
            </View>
            {reporteData?.tabla_empleados?.map((emp, idx) => (
              <View key={idx} style={styles.tableRow} wrap={false}>
                <Text style={styles.col1}>{emp.empleado}</Text>
                <Text style={styles.col2}>{emp.puesto}</Text>
                <Text style={styles.col3}>
                  {emp.operaciones_realizadas} ops.
                </Text>
                <Text style={styles.col4}>
                  $
                  {emp.comision_estimada?.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
                <Text style={styles.col5}>
                  $
                  {emp.total_vendido?.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
            ))}
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

export default ReporteEmpleadosPDF;
