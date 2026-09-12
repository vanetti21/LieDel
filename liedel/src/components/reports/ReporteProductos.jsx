import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  categoryLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 7,
    marginVertical: 3,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 7.5,
    color: '#374151',
  },
  fullWidthChartContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  fullWidthChartImage: {
    width: '100%',
    height: 220,
    objectFit: 'contain',
  },
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
  chartImage: {
    width: '100%',
    height: 180,
    objectFit: 'contain',
    marginVertical: 8,
  },
  table: { width: '100%', marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 4 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', padding: 6, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', padding: 5 },
  col1: { width: '40%' },
  col2: { width: '20%', textAlign: 'center' },
  col3: { width: '20%', textAlign: 'right' },
  col4: { width: '20%', textAlign: 'right' },
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, textAlign: 'center', color: '#94A3B8', fontSize: 8 }
});

const ReporteProductos = ({ reportData, startDate, endDate, chartImages, almacenesData }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Reporte Analítico de Productos</Text>
          <Text style={styles.subtitle}>Período: {startDate} al {endDate}</Text>
        </View>

        {/* Gráfico 1: Evolución de Ventas */}
        {chartImages?.ventas && (
          <View wrap={false}>
            <Image style={styles.chartImage} src={chartImages.ventas} />
          </View>
        )}

        {/* Gráfico 2: Top Ingresos */}
        {chartImages?.topIngresos && (
          <View style={styles.fullWidthChartContainer} wrap={false}>
            <Image 
              style={styles.fullWidthChartImage} 
              src={chartImages.topIngresos} 
            />
          </View>
        )}

        {/* Gráfico de Categorías */}
        {chartImages?.categorias && (
          <View style={{ marginTop: 10, marginBottom: 5, alignItems: 'center', width: '100%' }} wrap={false}>
            <Text style={styles.sectionTitle}>
              Rendimiento Financiero por Categorías
            </Text>

            <Image 
              style={{ width: '100%', height: 185, objectFit: 'contain' }} 
              src={chartImages.categorias} 
            />
          </View>
        )}

        {/* Tabla de Categorías (FORZADA A PÁGINA 2) */}
        <View style={styles.table} break>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={{ width: '50%' }}>Categoría</Text>
            <Text style={{ width: '25%', textAlign: 'center' }}>Unidades Vendidas</Text>
            <Text style={{ width: '25%', textAlign: 'right' }}>Volumen Total ($)</Text>
          </View>
          {reportData?.categorias?.map((cat, index) => {
            const unidadCat = reportData?.categorias_unidades?.find(u => u.categoria === cat.nombre);
            return (
              <View key={index} style={styles.tableRow} wrap={false}>
                <Text style={{ width: '50%' }}>{cat.nombre}</Text>
                <Text style={{ width: '25%', textAlign: 'center' }}>{unidadCat ? unidadCat.total : 0} u.</Text>
                <Text style={{ width: '25%', textAlign: 'right' }}>
                  ${Number(cat.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Tabla: Capital Inmovilizado */}
        <Text style={styles.sectionTitle}>Capital Inmovilizado Activo</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Producto</Text>
            <Text style={styles.col2}>Stock</Text>
            <Text style={styles.col3}>Precio Venta</Text>
            <Text style={styles.col4}>Valor Total</Text>
          </View>
          {reportData?.capital_por_producto?.slice(0, 8).map((item, index) => (
            <View key={index} style={styles.tableRow} wrap={false}>
              <Text style={styles.col1}>{item.Nombre}</Text>
              <Text style={styles.col2}>{item.stock}</Text>
              <Text style={styles.col3}>${Number(item.Precio_venta || 0).toFixed(2)}</Text>
              <Text style={styles.col4}>
                ${Number(item.valor || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
        </View>

        {/* SECCIÓN: ANÁLISIS POR ALMACÉN (lado a lado, como en la app, para ocupar menos alto) */}
        {(chartImages?.variedadAlmacen || chartImages?.distribucionAlmacen) && (
          <View style={{ marginTop: 10, width: '100%' }} wrap={false}>
            <Text style={styles.sectionTitle}>Análisis e Inventario por Almacén / Sucursal</Text>

            <View style={{ flexDirection: 'row', width: '100%', gap: 10 }}>
              {/* Gráfico 1: Variedad de Productos */}
              {chartImages?.variedadAlmacen && (
                <View style={{ width: '50%', alignItems: 'center' }}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 4, color: '#374151' }}>
                    Variedad de Productos por Sucursal
                  </Text>
                  <Image
                    style={{ width: '100%', height: 160, objectFit: 'contain' }}
                    src={chartImages.variedadAlmacen}
                  />
                </View>
              )}

              {/* Gráfico 2: Distribución de Valor Monetario */}
              {chartImages?.distribucionAlmacen && (
                <View style={{ width: '50%', alignItems: 'center' }}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 4, color: '#374151' }}>
                    Distribución de Valor Monetario ($)
                  </Text>
                  <Image
                    style={{ width: '100%', height: 160, objectFit: 'contain' }}
                    src={chartImages.distribucionAlmacen}
                  />
                </View>
              )}
            </View>
          </View>
        )}

        {/* TABLA: Detalle de Productos por Almacén (fuera del bloque wrap={false} de arriba, para que pueda paginar libremente si hay muchas filas) */}
        {almacenesData?.length > 0 && (
          <View style={{ marginTop: 18 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#374151', marginBottom: 6 }}>
              Detalle de Productos por Almacén
            </Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={{ width: '28%' }}>Almacén</Text>
                <Text style={{ width: '37%' }}>Producto</Text>
                <Text style={{ width: '17%', textAlign: 'center' }}>Stock Disponible</Text>
                <Text style={{ width: '18%', textAlign: 'right' }}>Precio Venta</Text>
              </View>
              {almacenesData.map((item, index) => (
                <View key={index} style={styles.tableRow} wrap={false}>
                  <Text style={{ width: '28%', color: '#4338CA', fontWeight: 'bold' }}>{item.almacen}</Text>
                  <Text style={{ width: '37%' }}>{item.Nombre}</Text>
                  <Text style={{ width: '17%', textAlign: 'center' }}>{item.stock} u.</Text>
                  <Text style={{ width: '18%', textAlign: 'right' }}>
                    ${Number(item.Precio_venta || 0).toFixed(2)}
                  </Text>
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

export default ReporteProductos;