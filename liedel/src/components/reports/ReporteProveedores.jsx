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
  kpiBox: { width: '32%', textAlign: 'center' },
  kpiLabel: { fontSize: 6.5, color: '#64748B', textTransform: 'uppercase', fontWeight: 'bold' },
  kpiValue: { fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  fullWidthChartImage: {
    width: '100%',
    height: 180,
    objectFit: 'contain',
  },
  table: { width: '100%', marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 4 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', padding: 6, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', padding: 5 },
  badge: { fontSize: 7, fontWeight: 'bold', paddingVertical: 2, paddingHorizontal: 5, borderRadius: 8 },
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, textAlign: 'center', color: '#94A3B8', fontSize: 8 }
});

const getConfiabilidadColors = (valor) => {
  return valor >= 85
    ? { bg: '#D1FAE5', color: '#065F46' }
    : { bg: '#FEE2E2', color: '#991B1B' };
};

const ReporteProveedoresPDF = ({ data, fechaInicio, fechaFin, chartImages }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ENCABEZADO */}
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard de Analítica de Proveedores</Text>
          <Text style={styles.subtitle}>Período: {fechaInicio} al {fechaFin}</Text>
        </View>

        {/* KPIS */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Proveedores Activos</Text>
            <Text style={[styles.kpiValue, { color: '#4F46E5' }]}>
              {data?.total_proveedores}
            </Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Órdenes Emitidas</Text>
            <Text style={[styles.kpiValue, { color: '#059669' }]}>
              {data?.total_ordenes}
            </Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Inversión en Abastecimiento</Text>
            <Text style={[styles.kpiValue, { color: '#D97706' }]}>
              ${(data?.inversion_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* TABLA: ANÁLISIS COMPARATIVO Y DESEMPEÑO DE PROVEEDORES */}
        {data?.lista_proveedores?.length > 0 && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>Análisis Comparativo y Desempeño de Proveedores</Text>
          </View>
        )}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ width: '24%' }}>Proveedor</Text>
            <Text style={{ width: '12%', textAlign: 'center' }}>Órdenes</Text>
            <Text style={{ width: '18%', textAlign: 'right' }}>Total Invertido</Text>
            <Text style={{ width: '16%', textAlign: 'center' }}>Demora Prom.</Text>
            <Text style={{ width: '14%', textAlign: 'center' }}>Confiabilidad</Text>
            <Text style={{ width: '16%' }}>Contacto</Text>
          </View>
          {data?.lista_proveedores?.length > 0 ? (
            data.lista_proveedores.map((prov) => {
              const badge = getConfiabilidadColors(prov.confiabilidad);
              return (
                <View key={prov.Id_proveedor} style={styles.tableRow} wrap={false}>
                  <Text style={{ width: '24%', fontWeight: 'bold' }}>{prov.proveedor}</Text>
                  <Text style={{ width: '12%', textAlign: 'center' }}>{prov.total_compras}</Text>
                  <Text style={{ width: '18%', textAlign: 'right', fontWeight: 'bold' }}>
                    ${prov.total_invertido?.toFixed(2)}
                  </Text>
                  <Text style={{ width: '16%', textAlign: 'center', color: '#64748B' }}>
                    {prov.tiempo_entrega_promedio} días
                  </Text>
                  <View style={{ width: '14%', alignItems: 'center' }}>
                    <Text style={[styles.badge, { backgroundColor: badge.bg, color: badge.color }]}>
                      {prov.confiabilidad}%
                    </Text>
                  </View>
                  <Text style={{ width: '16%', color: '#94A3B8', fontSize: 7.5 }}>
                    {prov.Contacto_telefono || 'S/N'}
                  </Text>
                </View>
              );
            })
          ) : (
            <View style={styles.tableRow}>
              <Text style={{ width: '100%', textAlign: 'center', color: '#94A3B8' }}>
                No se encontraron datos en este rango.
              </Text>
            </View>
          )}
        </View>

        {/* GRÁFICO DE VOLUMEN DE COMPRAS */}
        {chartImages?.volumenCompras && (
          <View style={{ marginBottom: 10 }} wrap={false}>
            <Text style={styles.chartTitle}>Volumen de Compras por Proveedor ($)</Text>
            <Image style={styles.fullWidthChartImage} src={chartImages.volumenCompras} />
          </View>
        )}

        {/* ÓRDENES CRÍTICAS RETRASADAS */}
        {data?.ordenes_retrasadas?.length > 0 && (
          <View>
            <Text style={[styles.sectionTitle, { color: '#991B1B' }]}>
              Órdenes Críticas Retrasadas en el Periodo
            </Text>
            <View style={styles.table}>
              <View style={[styles.tableHeader, { backgroundColor: '#FEF2F2' }]}>
                <Text style={{ width: '15%' }}>ID Orden</Text>
                <Text style={{ width: '40%' }}>Proveedor</Text>
                <Text style={{ width: '20%', textAlign: 'center' }}>Retraso</Text>
                <Text style={{ width: '25%', textAlign: 'center' }}>Estado</Text>
              </View>
              {data.ordenes_retrasadas.map((oc) => (
                <View key={oc.Id_orden_compra} style={styles.tableRow} wrap={false}>
                  <Text style={{ width: '15%', color: '#94A3B8' }}>#{oc.Id_orden_compra}</Text>
                  <Text style={{ width: '40%', fontWeight: 'bold' }}>{oc.proveedor}</Text>
                  <Text style={{ width: '20%', textAlign: 'center', color: '#DC2626', fontWeight: 'bold' }}>
                    {oc.dias_retraso} días
                  </Text>
                  <View style={{ width: '25%', alignItems: 'center' }}>
                    <Text style={[styles.badge, { backgroundColor: '#FEF3C7', color: '#92400E' }]}>
                      {oc.Estado}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* MAPA MUNDIAL DE PROVEEDORES (opcional, solo si se captura) */}
        {chartImages?.mapaProveedores && (
          <View style={{ marginBottom: 10 }} wrap={false} break>
            <Text style={styles.sectionTitle}>Distribución Geográfica de Proveedores</Text>
            <Image style={{ width: '100%', height: 220, objectFit: 'contain' }} src={chartImages.mapaProveedores} />
          </View>
        )}

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} fixed />
      </Page>
    </Document>
  );
};

export default ReporteProveedoresPDF;