import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#333333',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 30,
  },
  header: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 10,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  subtitle: { fontSize: 9, color: '#64748B', marginTop: 4 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#1E293B', marginTop: 12, marginBottom: 6 },
  chartTitle: { fontSize: 9, fontWeight: 'bold', color: '#374151', marginBottom: 4 },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiBox: { width: '18%', textAlign: 'center' },
  kpiLabel: { fontSize: 6.5, color: '#64748B', textTransform: 'uppercase', fontWeight: 'bold' },
  kpiValue: { fontSize: 9.5, fontWeight: 'bold', marginTop: 2 },
  chartImage: {
    width: '100%',
    height: 150,
    objectFit: 'contain',
  },
  fullWidthChartImage: {
    width: '100%',
    height: 200,
    objectFit: 'contain',
  },
  table: { width: '100%', marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 4 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', padding: 6, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', padding: 5 },
  legendDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, textAlign: 'center', color: '#94A3B8', fontSize: 8 }
});

const COLORS_PAGO = ["#10B981", "#6366F1", "#8B5CF6", "#F59E0B", "#EC4899"];

// Helper para numerar el top 3, igual que en la app
const getMedalOrRank = (idx) => {
  if (idx === 0) return '#1';
  if (idx === 1) return '#2';
  if (idx === 2) return '#3';
  return `#${idx + 1}`;
};

const ReporteVentasPDF = ({ reportData, startDate, endDate, chartImages }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <Text style={styles.title}>Auditoría Comercial y de Ventas</Text>
          <Text style={styles.subtitle}>Período: {startDate} al {endDate}</Text>
        </View>

        {/* METRICAS / KPIS */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Ingresos Netos</Text>
            <Text style={[styles.kpiValue, { color: '#16A34A' }]}>
              ${reportData?.ingresos_totales?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Transacciones</Text>
            <Text style={[styles.kpiValue, { color: '#1E293B' }]}>
              {reportData?.transacciones_totales} ops
            </Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Ticket Promedio</Text>
            <Text style={[styles.kpiValue, { color: '#4F46E5' }]}>
              ${reportData?.ticket_promedio?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Cajero Top</Text>
            <Text style={[styles.kpiValue, { color: '#D97706' }]}>
              {reportData?.empleado_top || 'N/A'}
            </Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Cliente VIP</Text>
            <Text style={[styles.kpiValue, { color: '#0EA5E9' }]}>
              {reportData?.cliente_top || 'N/A'}
            </Text>
          </View>
        </View>

        {/* GRÁFICA: CURVA TEMPORAL DE RECAUDACIÓN */}
        {chartImages?.tendenciaVentas && (
          <View style={{ marginBottom: 10 }} wrap={false}>
            <Image style={styles.fullWidthChartImage} src={chartImages.tendenciaVentas} />
          </View>
        )}

        {/* TABLAS EN DOS COLUMNAS: EMPLEADOS Y CATEGORÍAS */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }} wrap={false}>
          {/* CUOTA POR EMPLEADO */}
          <View style={{ width: '50%' }}>
            <Text style={styles.sectionTitle}>Cuota por Empleado</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ width: '50%' }}>Empleado</Text>
                <Text style={{ width: '50%', textAlign: 'right' }}>Total Facturado</Text>
              </View>
              {reportData?.ventas_empleados?.slice(0, 8).map((emp, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={{ width: '50%' }}>{emp.empleado}</Text>
                  <Text style={{ width: '50%', textAlign: 'right' }}>${emp.total_facturado?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* RENDIMIENTO POR CATEGORÍA */}
          <View style={{ width: '50%' }}>
            <Text style={styles.sectionTitle}>Ventas por Categoría</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ width: '50%' }}>Categoría</Text>
                <Text style={{ width: '50%', textAlign: 'right' }}>Total Facturado</Text>
              </View>
              {reportData?.ventas_categorias?.slice(0, 8).map((cat, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={{ width: '50%' }}>{cat.categoria}</Text>
                  <Text style={{ width: '50%', textAlign: 'right' }}>${cat.total_facturado?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* TABLAS EN DOS COLUMNAS: TOP CLIENTES Y TOP PRODUCTOS */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          {/* TOP 10 CLIENTES CON MAYOR FACTURACIÓN */}
          <View style={{ width: '50%' }}>
            <Text style={styles.sectionTitle}>Top 10 Clientes con Mayor Facturación</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ width: '12%' }}>#</Text>
                <Text style={{ width: '48%' }}>Cliente</Text>
                <Text style={{ width: '15%', textAlign: 'center' }}>Compras</Text>
                <Text style={{ width: '25%', textAlign: 'right' }}>Total Acumulado</Text>
              </View>
              {reportData?.top_clientes?.slice(0, 10).map((cli, idx) => (
                <View key={cli.Id_cliente || idx} style={styles.tableRow} wrap={false}>
                  <Text style={{ width: '12%', color: '#94A3B8', fontWeight: 'bold' }}>{getMedalOrRank(idx)}</Text>
                  <Text style={{ width: '48%' }}>{cli.cliente}</Text>
                  <Text style={{ width: '15%', textAlign: 'center' }}>{cli.total_compras} ops.</Text>
                  <Text style={{ width: '25%', textAlign: 'right', color: '#16A34A', fontWeight: 'bold' }}>
                    ${cli.total_gastado?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* TOP 10 PRODUCTOS MÁS VENDIDOS */}
          <View style={{ width: '50%' }}>
            <Text style={styles.sectionTitle}>Top 10 Productos Más Vendidos</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ width: '12%' }}>#</Text>
                <Text style={{ width: '43%' }}>Producto</Text>
                <Text style={{ width: '20%', textAlign: 'center' }}>Unidades</Text>
                <Text style={{ width: '25%', textAlign: 'right' }}>Total Generado</Text>
              </View>
              {reportData?.top_productos?.slice(0, 10).map((prod, idx) => (
                <View key={idx} style={styles.tableRow} wrap={false}>
                  <Text style={{ width: '12%', color: '#94A3B8', fontWeight: 'bold' }}>{getMedalOrRank(idx)}</Text>
                  <Text style={{ width: '43%' }}>{prod.producto}</Text>
                  <Text style={{ width: '20%', textAlign: 'center' }}>{prod.unidades_vendidas} u.</Text>
                  <Text style={{ width: '25%', textAlign: 'right', color: '#16A34A', fontWeight: 'bold' }}>
                    ${prod.total_generado?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* DISTRIBUCIÓN POR CANAL DE VENTA (dona arriba, tabla debajo) */}
        {chartImages?.canalesVenta && (
          <View style={{ marginBottom: 10 }} wrap={false}>
            <Text style={[styles.sectionTitle, { textAlign: 'center', marginBottom: 0 }]}>Distribución por Canal de Venta</Text>

            {/* Gráfico de dona, centrado */}
            <View style={{ alignItems: 'center', marginBottom: 8 }}>
              <Image style={{ width: '55%', height: 170, objectFit: 'contain' }} src={chartImages.canalesVenta} />
            </View>

            {/* Tabla de detalle por canal, debajo */}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ width: '35%' }}>Canal</Text>
                <Text style={{ width: '20%', textAlign: 'center' }}>Ops.</Text>
                <Text style={{ width: '45%', textAlign: 'right' }}>Monto Generado</Text>
              </View>
              {reportData?.canales_venta?.map((c, idx) => {
                const porcentaje = reportData?.ingresos_totales > 0
                  ? ((c.total_monto / reportData.ingresos_totales) * 100).toFixed(1)
                  : 0;
                return (
                  <View key={idx} style={styles.tableRow}>
                    <View style={{ width: '35%', flexDirection: 'row', alignItems: 'center' }}>
                      <View style={[styles.legendDot, { backgroundColor: COLORS_PAGO[idx % COLORS_PAGO.length] }]} />
                      <Text style={{ fontWeight: 'bold' }}>{c.canal}</Text>
                    </View>
                    <Text style={{ width: '20%', textAlign: 'center' }}>{c.operaciones}</Text>
                    <View style={{ width: '45%' }}>
                      <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>
                        ${c.total_monto?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Text>
                      <Text style={{ textAlign: 'right', fontSize: 7, color: '#94A3B8' }}>
                        {porcentaje}% del total
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* GRÁFICA: VOLUMEN VS RECAUDACIÓN (ahora después de Canal de Venta) */}
        {chartImages?.volumenVsRecaudacion && (
          <View style={{ marginBottom: 10 }} wrap={false}>
            <Image style={styles.fullWidthChartImage} src={chartImages.volumenVsRecaudacion} />
          </View>
        )}

        {/* TABLA TOP TRANSACCIONES (ahora con las 10 filas y columna de cajero, igual que en la app) */}
        {reportData?.top_transacciones?.length > 0 && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>Registro de Transacciones de Mayor Volumen (Top 10)</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={{ width: '15%' }}>ID Venta</Text>
                <Text style={{ width: '18%' }}>Fecha</Text>
                <Text style={{ width: '27%' }}>Cliente</Text>
                <Text style={{ width: '22%' }}>Cajero Atendió</Text>
                <Text style={{ width: '18%', textAlign: 'right' }}>Monto</Text>
              </View>
              {reportData.top_transacciones.slice(0, 10).map((trans, idx) => (
                <View key={idx} style={styles.tableRow} wrap={false}>
                  <Text style={{ width: '15%' }}>#00{trans.Id_venta}</Text>
                  <Text style={{ width: '18%' }}>{trans.Fecha_venta}</Text>
                  <Text style={{ width: '27%' }}>{trans.cliente}</Text>
                  <Text style={{ width: '22%' }}>{trans.empleado}</Text>
                  <Text style={{ width: '18%', textAlign: 'right' }}>${trans.total?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} fixed />
      </Page>
    </Document>
  );
};

export default ReporteVentasPDF;