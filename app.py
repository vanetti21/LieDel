from flask import Flask, render_template, request, jsonify, send_from_directory
from sklearn.linear_model import LinearRegression
import mysql.connector
from flask_cors import CORS
import plotly.express as px
import pandas as pd
import datetime
import io
import numpy as np

# Configuración de Flask
app = Flask(__name__, template_folder='Home', static_folder='Home/estilo')

CORS(app)  # Permitir solicitudes desde el frontend

# Configuración de la base de datos
db_config = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "Admin12345",
    "database": "tienda_muebles"
}

def conectar_bd():
    """Conectar a la base de datos y devolver la conexión."""
    try:
        conn = mysql.connector.connect(**db_config)
        return conn
    except mysql.connector.Error as e:
        print("Error al conectar a la BD:", e)
        return None


# OverView   
@app.route('/obtener_ventas', methods=['GET'])
def obtener_ventas():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        MONTH(Fecha_venta) AS month, 
        YEAR(Fecha_venta) AS year, 
        SUM(Total) AS sales
    FROM venta
    GROUP BY year, month
    ORDER BY year, month;
    """

    cursor.execute(query)
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    

# Formatear los resultados para que coincidan con el formato esperado en React
    sales_data = []
    for row in results:
        sales_data.append({
            "name": f"{row['month']}/{row['year']}",
            "sales": row['sales']
        })  

    return jsonify(sales_data)

from decimal import Decimal


@app.route('/obtener_categoria_distribucion', methods=['GET'])
def obtener_categoria_distribucion():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    query = """
    SELECT 
        CONCAT(UPPER(LEFT(c.Nombre, 1)), LOWER(SUBSTRING(c.Nombre, 2))) AS categoria,
        SUM(d.subtotal) AS total
    FROM detalle_venta d
    JOIN productos p ON d.Id_producto = p.Id_producto
    JOIN categoria c ON p.Id_categoria = c.Id_categoria
    GROUP BY categoria
    ORDER BY total DESC;
    """

    cursor.execute(query)
    results = cursor.fetchall()
    cursor.close()
    conn.close()

    data = [{"name": nombre.strip(), "value": float(valor)} for nombre, valor in results]  # <-- ¡Aquí el cambio!
    return jsonify(data)

@app.route('/obtener_productos_mas_vendidos', methods=['GET'])
def obtener_productos_mas_vendidos():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        CONCAT(UCASE(LEFT(p.Nombre, 1)), LCASE(SUBSTRING(p.Nombre, 2))) AS product_name,
        SUM(d.Cantidad) AS total_sales
    FROM detalle_venta d
    JOIN productos p ON d.Id_producto = p.Id_producto
    GROUP BY product_name
    ORDER BY total_sales DESC
    LIMIT 10;  # Muestra solo los 10 productos más vendidos
    """

    cursor.execute(query)
    results = cursor.fetchall()
    cursor.close()
    conn.close()

    print("Productos más vendidos:", results)

    # Formatear los resultados para que coincidan con el formato esperado en React
    sales_data = []
    for row in results:
        sales_data.append({
            "name": row['product_name'],
            "value": row['total_sales']
        })  

    return jsonify(sales_data)


@app.route('/obtener_resumen', methods=['GET'])
def obtener_resumen():
    
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    # Total Sales
    cursor.execute("SELECT SUM(Total) AS total_sales FROM venta")
    total_sales = cursor.fetchone()['total_sales']
    if total_sales is None:
        total_sales = 0

    # Total Employees (empleado)
    cursor.execute("SELECT COUNT(DISTINCT Id_empleado) AS employees FROM empleados")
    employees = cursor.fetchone()['employees']
    if employees is None:
        employees = 0

    # Total Products
    cursor.execute("SELECT COUNT(*) AS total_products FROM productos")
    total_products = cursor.fetchone()['total_products']
    if total_products is None:
        total_products = 0

    cursor.close()
    conn.close()

    resumen_data = {
        "total_sales": total_sales,
        "employees": employees,
        "total_products": total_products,
    }
    print("Cantidad de Productos:", resumen_data)

    return jsonify(resumen_data)

#Sales
@app.route('/api/ventas', methods=['GET'])
def obtener_ventas_por_fecha():
    inicio = request.args.get('inicio')
    fin = request.args.get('fin')

    if not inicio or not fin:
        return jsonify({"error": "Debes proporcionar 'inicio' y 'fin' en el query string"}), 400

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT 
            Fecha_venta,
            SUM(Total) AS total
        FROM 
            venta
        WHERE 
            Fecha_venta BETWEEN %s AND %s
        GROUP BY 
            Fecha_venta
        ORDER BY 
            Fecha_venta;
    """
    cursor.execute(query, (inicio, fin))
    resultados = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(resultados)


@app.route("/api/categorias-mas-vendidas")
def categorias_mas_vendidas():
    inicio = request.args.get("inicio")
    fin = request.args.get("fin")

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT c.Nombre AS categoria, SUM(d.Cantidad * d.Precio_unitario) AS total
        FROM detalle_venta d
        JOIN productos p ON d.Id_producto = p.Id_producto
        JOIN categoria c ON p.Id_categoria = c.Id_Categoria
        JOIN venta v ON d.Id_venta = v.Id_venta
        WHERE v.Fecha_venta BETWEEN %s AND %s
        GROUP BY c.Id_categoria
        ORDER BY total DESC;
    """, (inicio, fin))

    resultados = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify(resultados)


#fechas ventas-eso no lo usaremos
@app.route('/api/reporte-fechas', methods=['GET'])
def reporte_por_fechas():
    inicio = request.args.get('inicio')
    fin = request.args.get('fin')

    conn = conectar_bd()
    if not conn:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    cursor = conn.cursor(dictionary=True)

    # Total vendido
    cursor.execute("""
        SELECT SUM(Total) as total FROM venta
        WHERE Fecha_venta BETWEEN %s AND %s
    """, (inicio, fin))
    total = cursor.fetchone()["total"] or 0

    # Categorías más vendidas
    cursor.execute("""
            SELECT c.Nombre, COUNT(*) as total FROM detalle_venta d
            JOIN productos p ON d.Id_producto = p.Id_producto
            JOIN categoria c ON p.Id_Categoria = c.Id_Categoria
            JOIN venta v ON d.Id_venta = v.Id_venta
            WHERE v.Fecha_venta BETWEEN %s AND %s
            GROUP BY c.Id_categoria ORDER BY total DESC
    """, (inicio, fin))
    categorias = cursor.fetchall()

    # Productos más vendidos
    cursor.execute("""
        SELECT p.Nombre, SUM(d.Cantidad) as cant FROM detalle_venta d
        JOIN productos p ON d.Id_producto = p.Id_producto
        JOIN venta v ON d.Id_venta = v.Id_venta
        WHERE v.Fecha_venta BETWEEN %s AND %s
        GROUP BY p.Id_producto ORDER BY cant DESC
    """, (inicio, fin))
    productos = cursor.fetchall()

    # Empleados con más ventas
    cursor.execute("""
        SELECT e.Nombre, SUM(v.Total) as total FROM venta v
        JOIN empleados e ON v.Id_empleado = e.Id_empleado
        WHERE v.Fecha_venta BETWEEN %s AND %s
        GROUP BY e.Id_empleado ORDER BY total DESC
    """, (inicio, fin))
    empleados = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify({
        "total": total,
        "categorias": categorias,
        "productos": productos,
        "empleados": empleados
    })

@app.route('/sales_stats', methods=['GET'])
def sales_stats():
    try:
        conn = conectar_bd()
        cursor = conn.cursor(dictionary=True)

        # 1. Total Revenue (CORREGIDO)
        cursor.execute("SELECT SUM(Total) AS total_revenue FROM venta")
        res_revenue = cursor.fetchone()
        total_revenue = res_revenue['total_revenue'] if res_revenue else 0

        # 2. Cantidad Total de Ventas/Órdenes
        cursor.execute("SELECT COUNT(Id_venta) AS total_orders FROM venta WHERE LOWER(COALESCE(Estado, '')) NOT IN ('cancelada', 'anulada')")
        total_orders = cursor.fetchone()['total_orders']

        # 3. Average Order Value
        cursor.execute("SELECT COALESCE(AVG(Total),0) AS average_order FROM venta WHERE LOWER(COALESCE(Estado, '')) NOT IN ('cancelada', 'anulada')")
        average_order = cursor.fetchone()['average_order']

        # 4. Ventas mes actual
        cursor.execute("""
            SELECT COALESCE(SUM(Total),0) AS current_month
            FROM venta
            WHERE MONTH(Fecha_venta) = MONTH(CURDATE())
            AND YEAR(Fecha_venta) = YEAR(CURDATE())
            AND LOWER(COALESCE(Estado, '')) NOT IN ('cancelada', 'anulada')
        """)
        current_month = float(cursor.fetchone()['current_month'])

        # 5. Ventas mes anterior
        cursor.execute("""
            SELECT COALESCE(SUM(Total),0) AS last_month
            FROM venta
            WHERE MONTH(Fecha_venta) = MONTH(CURDATE() - INTERVAL 1 MONTH)
            AND YEAR(Fecha_venta) = YEAR(CURDATE() - INTERVAL 1 MONTH)
            AND LOWER(COALESCE(Estado, '')) NOT IN ('cancelada', 'anulada')
        """)
        last_month = float(cursor.fetchone()['last_month'])

        # 6. Growth %
        sales_growth = 0
        if last_month > 0:
            sales_growth = ((current_month - last_month) / last_month) * 100

        cursor.close()
        conn.close()

        return jsonify({
            "totalRevenue": round(float(total_revenue or 0), 2),
            "totalOrders": int(total_orders or 0),
            "averageOrderValue": round(float(average_order or 0), 2),
            "salesGrowth": round(sales_growth, 2)
        }), 200

    except Exception as e:
        print("Error en sales_stats:", e)
        return jsonify({"error": "Error obteniendo estadísticas"}), 500


#  Lista detallada de todas las ventas para la tabla
# 🎯 Endpoint actualizado: Lista de ventas con Cliente incluido
@app.route('/api/ventas/lista', methods=['GET'])
def obtener_lista_ventas():
    try:
        conn = conectar_bd()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                v.Id_venta,
                v.Fecha_venta,
                v.Total,
                COALESCE(e.Nombre, 'Sin Asignar') AS empleado,
                COALESCE(c.Nombre, 'Cliente General') AS cliente
            FROM venta v
            LEFT JOIN empleados e ON v.Id_empleado = e.Id_empleado
            LEFT JOIN clientes c ON v.Id_cliente = c.Id_cliente
            ORDER BY v.Fecha_venta DESC
        """)
        ventas = cursor.fetchall()

        cursor.close()
        conn.close()

        for v in ventas:
            v["Total"] = float(v["Total"] or 0)
            if v["Fecha_venta"]:
                v["Fecha_venta"] = str(v["Fecha_venta"])

        return jsonify(ventas)

    except Exception as e:
        print("Error al obtener lista de ventas:", e)
        return jsonify({"error": "Error al obtener lista de ventas"}), 500

@app.route('/top_empleados_ventas', methods=['GET'])
def top_empleados_ventas():
    try:
        conn = conectar_bd()
        cursor = conn.cursor(dictionary=True)

        query = """
        SELECT 
            e.Nombre AS empleado,
            COALESCE(SUM(v.Total), 0) AS total_vendido
        FROM venta v
        JOIN empleados e
            ON v.Id_empleado = e.Id_empleado
        GROUP BY e.Id_empleado, e.Nombre
        ORDER BY total_vendido DESC
        LIMIT 5
        """

        cursor.execute(query)
        resultados = cursor.fetchall()

        return jsonify(resultados)

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Error obteniendo empleados"}), 500    



# 🎯 Endpoint: Detalle completo de una venta por su ID
@app.route('/api/ventas/<int:id_venta>', methods=['GET'])
def obtener_detalle_venta(id_venta):
    try:
        conn = conectar_bd()
        cursor = conn.cursor(dictionary=True)

        # 1. Información principal de la venta
        cursor.execute("""
            SELECT 
                v.Id_venta,
                v.Fecha_venta,
                v.Total,
                COALESCE(e.Nombre, 'Sin Asignar') AS empleado,
                COALESCE(c.Nombre, 'Cliente General') AS cliente,
                COALESCE(c.Contacto_email, 'N/A') AS cliente_email,
                COALESCE(s.Nombre, 'Sucursal General') AS sucursal
            FROM venta v
            LEFT JOIN empleados e ON v.Id_empleado = e.Id_empleado
            LEFT JOIN clientes c ON v.Id_cliente = c.Id_cliente
            LEFT JOIN sucursal s ON v.Id_sucursal = s.Id_sucursal
            WHERE v.Id_venta = %s
        """, (id_venta,))
        
        venta = cursor.fetchone()

        if not venta:
            cursor.close()
            conn.close()
            return jsonify({"error": "Venta no encontrada"}), 404

        # 2. Productos incluidos en el detalle de la venta
        cursor.execute("""
            SELECT 
                d.Id_producto,
                p.Nombre AS producto,
                c.Nombre AS categoria,
                d.Cantidad,
                d.Precio_unitario,
                (d.Cantidad * d.Precio_unitario) AS subtotal
            FROM detalle_venta d
            JOIN productos p ON d.Id_producto = p.Id_producto
            LEFT JOIN categoria c ON p.Id_categoria = c.Id_Categoria
            WHERE d.Id_venta = %s
        """, (id_venta,))
        
        items = cursor.fetchall()

        cursor.close()
        conn.close()

        # Formatear números para JSON
        venta["Total"] = float(venta["Total"] or 0)
        if venta["Fecha_venta"]:
            venta["Fecha_venta"] = str(venta["Fecha_venta"])

        for item in items:
            item["Cantidad"] = int(item["Cantidad"] or 0)
            item["Precio_unitario"] = float(item["Precio_unitario"] or 0)
            item["subtotal"] = float(item["subtotal"] or 0)

        return jsonify({
            "venta": venta,
            "items": items
        })

    except Exception as e:
        print("Error al obtener detalle de venta:", e)
        return jsonify({"error": "Error al obtener detalle de la venta"}), 500

    
    
#Products
@app.route("/api/productos-reporte", methods=["GET"])
def productos_reporte():
    try:
        conn = conectar_bd()
        cursor = conn.cursor(dictionary=True)
        query = """
               SELECT
                    p.Id_producto,
                    p.Nombre AS product,
                    c.Nombre AS category,
                    p.Precio_venta AS price,

                    -- Stock normal más reciente
                    MAX(i.Cantidad_actual) AS stock,

                    -- Total ganado
                    COALESCE(SUM(DISTINCT dv.Subtotal), 0) AS total_earned

                FROM productos p

                LEFT JOIN categoria c
                    ON p.Id_categoria = c.Id_categoria

                LEFT JOIN inventario i
                    ON p.Id_producto = i.Id_producto
                    AND i.estado = 'Normal'

                LEFT JOIN detalle_venta dv
                    ON p.Id_producto = dv.Id_producto

                GROUP BY 
                    p.Id_producto,
                    p.Nombre,
                    c.Nombre,
                    p.Precio_venta

                ORDER BY total_earned DESC;
        """
        cursor.execute(query)
        resultados = cursor.fetchall()
        return jsonify(resultados)
    except Exception as e:
        print("Error al obtener productos:", e)
        return jsonify({"error": "No se pudieron obtener los productos"}), 500


@app.route("/api/productos-almacenes", methods=["GET"])
def productos_almacenes():
    try:
        inicio = request.args.get("inicio")
        fin = request.args.get("fin")

        conn = conectar_bd()
        cursor = conn.cursor(dictionary=True)

        # Si vienen fechas, filtramos por la columna Ultima_actualizacion directa en el WHERE
        if inicio and fin:
            query_resumen = """
                SELECT 
                    COALESCE(a.Nombre, 'Almacén Principal') as nombre,
                    COUNT(DISTINCT i.Id_producto) as total_productos,
                    COALESCE(SUM(i.Cantidad_actual), 0) as unidades_totales,
                    COALESCE(SUM(i.Cantidad_actual * p.Precio_venta), 0) as valor_total
                FROM inventario i
                JOIN productos p ON i.Id_producto = p.Id_producto
                LEFT JOIN almacen a ON i.Id_almacen = a.Id_almacen
                WHERE LOWER(i.estado) = 'normal'
                  AND i.Ultima_actualizacion BETWEEN %s AND %s
                GROUP BY i.Id_almacen
            """

            query_productos = """
                SELECT 
                    p.Nombre,
                    i.Cantidad_actual as stock,
                    p.Precio_venta,
                    COALESCE(a.Nombre, 'Almacén Principal') as almacen
                FROM inventario i
                JOIN productos p ON i.Id_producto = p.Id_producto
                LEFT JOIN almacen a ON i.Id_almacen = a.Id_almacen
                WHERE LOWER(i.estado) = 'normal'
                  AND i.Ultima_actualizacion BETWEEN %s AND %s
                ORDER BY almacen ASC, p.Nombre ASC
            """
            
            params = [inicio, fin]

            cursor.execute(query_resumen, params)
            resumen = cursor.fetchall()

            cursor.execute(query_productos, params)
            productos = cursor.fetchall()

        # Si no hay fechas, traemos todo el stock sin filtro de tiempo
        else:
            query_resumen = """
                SELECT 
                    COALESCE(a.Nombre, 'Almacén Principal') as nombre,
                    COUNT(DISTINCT i.Id_producto) as total_productos,
                    COALESCE(SUM(i.Cantidad_actual), 0) as unidades_totales,
                    COALESCE(SUM(i.Cantidad_actual * p.Precio_venta), 0) as valor_total
                FROM inventario i
                JOIN productos p ON i.Id_producto = p.Id_producto
                LEFT JOIN almacen a ON i.Id_almacen = a.Id_almacen
                WHERE LOWER(i.estado) = 'normal'
                GROUP BY i.Id_almacen
            """

            query_productos = """
                SELECT 
                    p.Nombre,
                    i.Cantidad_actual as stock,
                    p.Precio_venta,
                    COALESCE(a.Nombre, 'Almacén Principal') as almacen
                FROM inventario i
                JOIN productos p ON i.Id_producto = p.Id_producto
                LEFT JOIN almacen a ON i.Id_almacen = a.Id_almacen
                WHERE LOWER(i.estado) = 'normal'
                ORDER BY almacen ASC, p.Nombre ASC
            """

            cursor.execute(query_resumen)
            resumen = cursor.fetchall()

            cursor.execute(query_productos)
            productos = cursor.fetchall()

        cursor.close()
        return jsonify({
            "resumen_almacenes": resumen,
            "productos_por_almacen": productos
        })

    except Exception as e:
        print("Error al obtener datos de almacenes:", e)
        return jsonify({"resumen_almacenes": [], "productos_por_almacen": []}), 500
    
    

@app.route("/api/productos-stats")
def productos_stats():

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    # Total productos
    cursor.execute("""
        SELECT COUNT(*) AS total_productos
        FROM productos
    """)
    total_productos = cursor.fetchone()["total_productos"]

    # Productos vendidos
    cursor.execute("""
        SELECT SUM(d.Cantidad) AS top_selling 
        FROM detalle_venta d
    """)
    top_selling = cursor.fetchone()["top_selling"] or 0

    # Low stock
    cursor.execute("""
       SELECT COUNT(*) AS low_stock
FROM
(
    SELECT
        p.Id_producto,
        p.Nombre,
        p.Precio_base,
        i.Id_almacen,
        i.Cantidad_actual,
        CEILING(IFNULL(v.ConsumoPromedioDiario, 0)) AS ConsumoPromedioDiario,
        CEILING(IFNULL(c.TiempoEntrega, 0)) AS TiempoEntrega,
        CEILING(IFNULL(v.ConsumoPromedioDiario, 0) * 5) AS StockSeguridad,
        CEILING(
            (IFNULL(v.ConsumoPromedioDiario, 0) * IFNULL(c.TiempoEntrega, 0))
            +
            (IFNULL(v.ConsumoPromedioDiario, 0) * 5)
        ) AS StockMinimo,
        i.estado,
        i.Ultima_actualizacion,
        (
            SELECT MAX(v2.Fecha_venta)
            FROM detalle_venta dv2
            JOIN venta v2
                ON dv2.Id_venta = v2.Id_venta
            WHERE dv2.Id_producto = p.Id_producto
        ) AS ultima_venta,
        (
            SELECT MAX(oc2.Fecha_orden)
            FROM detalle_compra dc2
            JOIN orden_compra oc2
                ON dc2.Id_orden_compra = oc2.Id_orden_compra
            WHERE dc2.Id_producto = p.Id_producto
        ) AS ultima_compra,
        ROUND(GREATEST(
            CEILING(
                (IFNULL(v.ConsumoPromedioDiario, 0) * IFNULL(c.TiempoEntrega, 0))
                +
                (IFNULL(v.ConsumoPromedioDiario, 0) * 5)
            ) - i.Cantidad_actual,
            0
        ) * p.Precio_base, 2) AS costo_oportunidad
    FROM productos p
    JOIN inventario i
        ON p.Id_producto = i.Id_producto
    LEFT JOIN
    (
        SELECT
            dv.Id_producto,
            SUM(dv.Cantidad) /
            GREATEST(DATEDIFF(MAX(v.Fecha_venta), MIN(v.Fecha_venta)) + 1, 1)
            AS ConsumoPromedioDiario
        FROM detalle_venta dv
        JOIN venta v
            ON dv.Id_venta = v.Id_venta
        GROUP BY dv.Id_producto
    ) v
        ON p.Id_producto = v.Id_producto
    LEFT JOIN
    (
        SELECT
            dc.Id_producto,
            AVG(DATEDIFF(oc.Fecha_entrega_real, oc.Fecha_orden)) AS TiempoEntrega
        FROM detalle_compra dc
        JOIN orden_compra oc
            ON dc.Id_orden_compra = oc.Id_orden_compra
        WHERE oc.Fecha_entrega_real IS NOT NULL
        GROUP BY dc.Id_producto
    ) c
        ON p.Id_producto = c.Id_producto
    WHERE LOWER(i.estado) = 'normal'
) t
WHERE t.Cantidad_actual <= t.StockMinimo;
    """)
    low_stock = cursor.fetchone()["low_stock"]

    # dead stock
    cursor.execute("""
        SELECT COUNT(*) AS dead_stock
        FROM (
            SELECT
                p.Id_producto
            FROM productos p
            JOIN inventario i
                ON p.Id_producto = i.Id_producto
            LEFT JOIN detalle_venta dv
                ON p.Id_producto = dv.Id_producto
            LEFT JOIN venta v
                ON dv.Id_venta = v.Id_venta
            WHERE
                LOWER(i.estado) = 'normal'
                AND i.Cantidad_actual > 0
            GROUP BY p.Id_producto
            HAVING
                MAX(v.Fecha_venta) IS NULL
                OR MAX(v.Fecha_venta) < DATE_SUB(CURDATE(), INTERVAL 90 DAY)
        ) t;
    """)
    dead_stock = cursor.fetchone()["dead_stock"]
    
    # Revenue
    cursor.execute("""
        SELECT SUM(subtotal) AS total_revenue
        FROM detalle_venta
    """)
    total_revenue = cursor.fetchone()["total_revenue"] or 0

    # Productos defectuosos
    cursor.execute("""
        SELECT COUNT(Id_producto) AS defective_products
        FROM inventario
        WHERE LOWER(estado) = 'defectuoso'
    """)
    defective_products = cursor.fetchone()["defective_products"]

    return jsonify({
        "total_productos": total_productos,
        "top_selling": int(top_selling),
        "low_stock": low_stock,
        "total_revenue": float(total_revenue),
        "defective_products": defective_products,
        "dead_stock": dead_stock,
    })



@app.route('/products/dead-stock')
def dead_stock_products():

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
            SELECT
            p.Id_producto,
            p.Nombre,
            c.Nombre AS categoria,
            SUM(i.Cantidad_actual) AS stock_total,
            p.Precio_venta,
            (SUM(i.Cantidad_actual) * p.Precio_venta) AS dinero_estancado,
            MAX(v.Fecha_venta) AS ultima_venta,
            DATEDIFF(CURDATE(), MAX(v.Fecha_venta)) AS dias_sin_venta,

            CASE
                WHEN MAX(v.Fecha_venta) IS NULL
                    THEN 'Liquidación'
                WHEN DATEDIFF(CURDATE(), MAX(v.Fecha_venta)) > 180
                    THEN 'Baja'
                ELSE 'Liquidación'
            END AS recomendacion,

            CASE
                WHEN MAX(v.Fecha_venta) IS NULL
                    THEN 'Sin ventas registradas'
                WHEN DATEDIFF(CURDATE(), MAX(v.Fecha_venta)) > 180
                    THEN 'Sin rotación por más de 6 meses'
                ELSE 'Sin rotación, se liquida con descuento'
            END AS motivo_recomendacion

        FROM productos p
        JOIN inventario i ON p.Id_producto = i.Id_producto
        LEFT JOIN categoria c ON p.Id_categoria = c.Id_categoria
        LEFT JOIN detalle_venta dv ON p.Id_producto = dv.Id_producto
        LEFT JOIN venta v ON dv.Id_venta = v.Id_venta

        WHERE
            LOWER(i.estado) = 'normal'
            AND i.Cantidad_actual > 0

        GROUP BY
            p.Id_producto,
            p.Nombre,
            c.Nombre,
            p.Precio_venta

        HAVING
            MAX(v.Fecha_venta) IS NULL
            OR MAX(v.Fecha_venta) < DATE_SUB(CURDATE(), INTERVAL 90 DAY)

        ORDER BY dias_sin_venta DESC
    """

    cursor.execute(query)
    data = cursor.fetchall()
    return jsonify(data)


@app.route('/dead-stock-insights')
def dead_stock_insights():

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    # Categorías con más stock muerto
    cursor.execute("""
        SELECT
            c.Nombre AS categoria,
            COUNT(*) AS productos,
            SUM(i.Cantidad_actual * p.Precio_venta) AS dinero_estancado
        FROM productos p

        JOIN inventario i
            ON p.Id_producto = i.Id_producto

        LEFT JOIN categoria c
            ON p.Id_categoria = c.Id_categoria

        LEFT JOIN detalle_venta dv
            ON p.Id_producto = dv.Id_producto

        LEFT JOIN venta v
            ON dv.Id_venta = v.Id_venta

        GROUP BY c.Nombre

        HAVING
            MAX(v.Fecha_venta) IS NULL
            OR DATEDIFF(CURDATE(), MAX(v.Fecha_venta)) >= 90

        ORDER BY dinero_estancado DESC
    """)

    categories = cursor.fetchall()

    # Productos nunca vendidos
    cursor.execute("""
        SELECT
            p.Nombre,
            i.Cantidad_actual,
            p.Precio_venta,
            (i.Cantidad_actual * p.Precio_venta) AS perdida
        FROM productos p

        JOIN inventario i
            ON p.Id_producto = i.Id_producto

        LEFT JOIN detalle_venta dv
            ON p.Id_producto = dv.Id_producto

        WHERE dv.Id_producto IS NULL

        ORDER BY perdida DESC
        LIMIT 5
    """)

    never_sold = cursor.fetchall()

    # Almacenes con más stock muerto
    cursor.execute("""
        SELECT
            a.Nombre AS almacen,
            COUNT(*) AS productos
        FROM inventario i

        JOIN almacen a
            ON i.Id_almacen = a.Id_almacen

        LEFT JOIN detalle_venta dv
            ON i.Id_producto = dv.Id_producto

        LEFT JOIN venta v
            ON dv.Id_venta = v.Id_venta

        GROUP BY a.Nombre

        HAVING
            MAX(v.Fecha_venta) IS NULL
            OR DATEDIFF(CURDATE(), MAX(v.Fecha_venta)) >= 90

        ORDER BY productos DESC
    """)

    warehouses = cursor.fetchall()

    return jsonify({
        "categories": categories,
        "never_sold": never_sold,
        "warehouses": warehouses
    })

    
@app.route('/api/ventas-mensuales', methods=['GET'])
def get_sales_by_month():
    conn = conectar_bd()
    cursor = conn.cursor()
    try:
        query = """
            SELECT 
                DATE_FORMAT(Fecha_venta, '%Y-%m') AS month, 
                SUM(Total) AS sales
            FROM venta
            GROUP BY month
            ORDER BY month;
        """
        cursor.execute(query)
        result = cursor.fetchall()
        sales_data = [{"month": row[0], "sales": float(row[1])} for row in result]
        return jsonify(sales_data)
    except Exception as e:
        print("Error en /api/ventas-mensuales:", e)
        return jsonify({"error": "Error al obtener datos de ventas"}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/product/<int:id>/insights')
def product_insights(id):
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    # 🏢 SUCURSALES
    cursor.execute("""
        SELECT 
            s.Nombre AS sucursal,
            SUM(dv.Cantidad) AS total_vendido
        FROM detalle_venta dv
        JOIN venta v ON dv.Id_venta = v.Id_venta
        JOIN sucursal s ON v.Id_sucursal = s.Id_sucursal
        WHERE dv.Id_producto = %s
        GROUP BY s.Nombre
        ORDER BY total_vendido DESC
    """, (id,))
    stores = cursor.fetchall()

    # 📅 MESES
    cursor.execute("""
        SELECT 
            DATE_FORMAT(v.Fecha_venta, '%Y-%m') AS mes,
            SUM(dv.Cantidad) AS total_vendido
        FROM detalle_venta dv
        JOIN venta v ON dv.Id_venta = v.Id_venta
        WHERE dv.Id_producto = %s
        GROUP BY mes
        ORDER BY mes DESC
    """, (id,))
    months = cursor.fetchall()

    # 📅 ÚLTIMA VENTA
    cursor.execute("""
        SELECT MAX(v.Fecha_venta) AS ultima_venta
        FROM detalle_venta dv
        JOIN venta v ON dv.Id_venta = v.Id_venta
        WHERE dv.Id_producto = %s
    """, (id,))
    last_sale = cursor.fetchone()

    return jsonify({
        "stores": stores,
        "months": months,
        "last_sale": last_sale["ultima_venta"] if last_sale else None
    })
    
@app.route('/defective_products_stats')
def defective_products_stats():

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT COUNT(DISTINCT Id_producto) AS total
    FROM inventario
    WHERE LOWER(estado) = 'defectuoso'
    """

    cursor.execute(query)
    data = cursor.fetchone()
    return jsonify(data)


@app.route('/products/defective')
def defective_products():

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT
        p.Id_producto,
        p.Nombre,

        p.Estado AS estado_producto,

        i.motivo_defecto,

        pr.Nombre AS proveedor,

        a.Nombre AS almacen,
        s.Nombre AS sucursal,

        oc.Tipo_envio,

        rd.Tipo_resolucion,

        i.Cantidad_actual,

        CASE
            WHEN rd.Tipo_resolucion = 'Baja'
                THEN i.Cantidad_actual * p.Precio_venta

            WHEN rd.Tipo_resolucion = 'Liquidacion'
                THEN (i.Cantidad_actual * p.Precio_venta) * 0.30

            ELSE 0
        END AS perdida_estimada,

        i.Ultima_actualizacion

    FROM inventario i

    JOIN productos p
        ON i.Id_producto = p.Id_producto

    LEFT JOIN resolucion_defecto rd
        ON rd.Id_inventario = i.Id_inventario

    LEFT JOIN (
        SELECT
            dc.Id_producto,
            MAX(dc.Id_orden_compra) AS ultima_orden
        FROM detalle_compra dc
        GROUP BY dc.Id_producto
    ) ult_compra
        ON ult_compra.Id_producto = i.Id_producto

    LEFT JOIN orden_compra oc
        ON oc.Id_orden_compra = ult_compra.ultima_orden

    LEFT JOIN proveedores pr
        ON pr.Id_proveedor = oc.Id_proveedor

    LEFT JOIN almacen a
        ON a.Id_almacen = i.Id_almacen

    LEFT JOIN sucursal s
        ON s.Id_sucursal = a.Id_sucursal

    WHERE LOWER(i.Estado) = 'defectuoso'

    ORDER BY perdida_estimada DESC;
    """

    cursor.execute(query)

    data = cursor.fetchall()

    return jsonify(data)


@app.route('/defect-analysis')
def defect_analysis():

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    # Tipo de envío más frecuente
    cursor.execute("""
    SELECT
        oc.Tipo_envio AS tipo_envio,
        COUNT(*) AS total
    FROM inventario i
    JOIN detalle_compra dc
        ON i.Id_producto = dc.Id_producto
        AND i.Id_almacen = dc.Id_almacen
    JOIN orden_compra oc
        ON dc.Id_orden_compra = oc.Id_orden_compra
    WHERE LOWER(i.estado) = 'defectuoso'
    GROUP BY oc.Tipo_envio
    ORDER BY total DESC
""")
    shipping = cursor.fetchall()

    # Almacenes con más defectos
    cursor.execute("""
        SELECT
            a.Nombre AS almacen,
            COUNT(*) AS total
        FROM inventario i
        JOIN almacen a
            ON i.Id_almacen = a.Id_almacen
        WHERE LOWER(i.estado) = 'defectuoso'
        GROUP BY a.Nombre
        ORDER BY total DESC
    """)
    warehouses = cursor.fetchall()

    # Proveedores con más defectos
    cursor.execute("""
        SELECT
            pr.Nombre AS proveedor,
            COUNT(*) AS total
        FROM inventario i
        JOIN detalle_compra dc
            ON i.Id_producto = dc.Id_producto
            AND i.Id_almacen = dc.Id_almacen
        JOIN orden_compra oc
            ON dc.Id_orden_compra = oc.Id_orden_compra
        JOIN proveedores pr
            ON oc.Id_proveedor = pr.Id_proveedor
        WHERE LOWER(i.estado) = 'defectuoso'
        GROUP BY pr.Nombre
        ORDER BY total DESC
    """)
    suppliers = cursor.fetchall()

    # Productos con más transferencias
    cursor.execute("""
        SELECT
            p.Nombre AS producto,
            COUNT(ts.Id_transferencia) AS movimientos
        FROM transferencia_stock ts
        JOIN productos p
            ON ts.Id_producto = p.Id_producto
        GROUP BY p.Nombre
        ORDER BY movimientos DESC
    """)
    transfers = cursor.fetchall()

    return jsonify({
        "shipping": shipping,
        "warehouses": warehouses,
        "suppliers": suppliers,
        "transfers": transfers
    })


    
#Predictions
@app.route('/predicciones_ventas')
def predicciones_ventas():

    conn = conectar_bd()

    query = """
    SELECT
        Fecha_venta,
        SUM(Total) AS total
    FROM venta
    GROUP BY Fecha_venta
    ORDER BY Fecha_venta
    """

    df = pd.read_sql(query, conn)

    df["Fecha_venta"] = pd.to_datetime(df["Fecha_venta"])

    df["dias"] = (
        df["Fecha_venta"] - df["Fecha_venta"].min()
    ).dt.days

    X = df[["dias"]]
    y = df["total"]

    model = LinearRegression()
    model.fit(X, y)

    futuros = np.array([
        df["dias"].max() + i
        for i in range(1, 31)
    ]).reshape(-1, 1)

    predicciones = model.predict(futuros)

    resultados = []

    ultima_fecha = df["Fecha_venta"].max()

    for i, pred in enumerate(predicciones):
        resultados.append({
            "fecha": str(
                (ultima_fecha + pd.Timedelta(days=i+1)).date()
            ),
            "prediccion": round(float(pred), 2)
        })

    return jsonify(resultados)    

@app.route('/prediccion_stock')
def prediccion_stock():

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT
        p.Nombre AS producto,

        MAX(i.Cantidad_actual) AS stock_actual,

        COALESCE(AVG(dv.Cantidad),0) AS promedio_ventas

    FROM productos p

    LEFT JOIN inventario i
        ON p.Id_producto = i.Id_producto

    LEFT JOIN detalle_venta dv
        ON p.Id_producto = dv.Id_producto

    GROUP BY p.Id_producto, p.Nombre
    """

    cursor.execute(query)
    data = cursor.fetchall()

    resultados = []

    for row in data:

        promedio = float(row["promedio_ventas"])
        stock = int(row["stock_actual"] or 0)

        if promedio > 0:
            dias_restantes = round(stock / promedio)
        else:
            dias_restantes = "∞"

        resultados.append({
            "producto": row["producto"],
            "stock": stock,
            "promedio_ventas": round(promedio,2),
            "dias_restantes": dias_restantes
        })

    return jsonify(resultados)


@app.route('/riesgo_proveedores')
def riesgo_proveedores():

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT

        p.Nombre,

        COUNT(*) AS total_ordenes,

        SUM(
            CASE
                WHEN oc.Fecha_entrega_real >
                     oc.Fecha_entrega_estimada
                THEN 1
                ELSE 0
            END
        ) AS retrasos

    FROM orden_compra oc

    JOIN proveedores p
        ON oc.Id_proveedor = p.Id_proveedor

    GROUP BY p.Nombre
    """

    cursor.execute(query)
    data = cursor.fetchall()

    resultados = []

    for row in data:

        total = row["total_ordenes"]
        retrasos = row["retrasos"]

        riesgo = round((retrasos / total) * 100, 2)

        if riesgo < 20:
            nivel = "Low"

        elif riesgo < 50:
            nivel = "Medium"

        else:
            nivel = "High"

        resultados.append({
            "proveedor": row["Nombre"],
            "riesgo": riesgo,
            "nivel": nivel
        })

    return jsonify(resultados)


@app.route('/api/ai-business-insights')
def ai_business_insights():

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    insights = []

    # =========================
    # LOW STOCK + HIGH DEMAND
    # =========================

    query_stock = """
    SELECT
        p.Nombre,
        MAX(i.Cantidad_actual) AS stock,
        COALESCE(SUM(dv.Cantidad),0) AS ventas
    FROM productos p
    LEFT JOIN inventario i
        ON p.Id_producto = i.Id_producto
    LEFT JOIN detalle_venta dv
        ON p.Id_producto = dv.Id_producto
    GROUP BY p.Id_producto, p.Nombre
    ORDER BY ventas DESC
    LIMIT 5
    """

    cursor.execute(query_stock)
    stock_data = cursor.fetchall()

    for item in stock_data:

        if item["stock"] is not None and item["stock"] < 10:

            insights.append({
                "type": "restock",
                "priority": "high",
                "title": "Restock Recommended",
                "message":
                    f'{item["Nombre"]} has high sales and low stock.'
            })

    # =========================
    # LOW SALES PRODUCTS
    # =========================

    query_low = """
    SELECT
        p.Nombre,
        COALESCE(SUM(dv.Cantidad),0) AS ventas
    FROM productos p
    LEFT JOIN detalle_venta dv
        ON p.Id_producto = dv.Id_producto
    GROUP BY p.Id_producto, p.Nombre
    ORDER BY ventas ASC
    LIMIT 3
    """

    cursor.execute(query_low)
    low_products = cursor.fetchall()

    for item in low_products:

        insights.append({
            "type": "risk",
            "priority": "medium",
            "title": "Low Demand Detected",
            "message":
                f'{item["Nombre"]} sales are decreasing.'
        })

    # =========================
    # SUPPLIER DELAYS
    # =========================

    query_supplier = """
    SELECT
        p.Nombre,
        AVG(
            DATEDIFF(
                Fecha_entrega_real,
                Fecha_entrega_estimada
            )
        ) AS retraso
    FROM orden_compra oc
    JOIN proveedores p
        ON oc.Id_proveedor = p.Id_proveedor
    WHERE Fecha_entrega_real IS NOT NULL
    GROUP BY p.Nombre
    HAVING retraso > 3
    LIMIT 3
    """

    cursor.execute(query_supplier)
    suppliers = cursor.fetchall()

    for item in suppliers:

        insights.append({
            "type": "supplier",
            "priority": "high",
            "title": "Supplier Delay Risk",
            "message":
                f'{item["Nombre"]} deliveries are taking longer than expected.'
        })

    # =========================
    # VIP CUSTOMERS
    # =========================

    query_vip = """
    SELECT
        c.Nombre,
        SUM(v.Total) AS total
    FROM clientes c
    JOIN venta v
        ON c.Id_cliente = v.Id_cliente
    GROUP BY c.Id_cliente, c.Nombre
    ORDER BY total DESC
    LIMIT 3
    """

    cursor.execute(query_vip)
    vip_clients = cursor.fetchall()

    for item in vip_clients:

        insights.append({
            "type": "vip",
            "priority": "low",
            "title": "VIP Customer Detected",
            "message":
                f'{item["Nombre"]} is becoming a high-value customer.'
        })

    return jsonify(insights)


@app.route('/customer_insights')
def customer_insights():

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT
        c.Nombre,
        COUNT(v.Id_venta) AS compras,
        SUM(v.Total) AS total_gastado
    FROM clientes c
    JOIN venta v
        ON c.Id_cliente = v.Id_cliente
    GROUP BY c.Nombre
    ORDER BY total_gastado DESC
    LIMIT 10
    """

    cursor.execute(query)
    data = cursor.fetchall()
    return jsonify(data)


@app.route('/api/predict-demand')
def predict_demand():

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT
        p.Nombre AS producto,
        v.Fecha_venta,
        SUM(dv.Cantidad) AS total_vendido
    FROM detalle_venta dv
    JOIN venta v
        ON dv.Id_venta = v.Id_venta
    JOIN productos p
        ON dv.Id_producto = p.Id_producto
    GROUP BY p.Nombre, v.Fecha_venta
    ORDER BY v.Fecha_venta
    """

    cursor.execute(query)
    rows = cursor.fetchall()
    df = pd.DataFrame(rows)

    if df.empty:
        return jsonify([])
    
    predictions = []
    productos = df["producto"].unique()

    for producto in productos:

        producto_df = df[df["producto"] == producto].copy()

        producto_df["Fecha_venta"] = pd.to_datetime(
            producto_df["Fecha_venta"]
        )

        producto_df = producto_df.sort_values("Fecha_venta")

        producto_df["dias"] = (
            producto_df["Fecha_venta"]
            - producto_df["Fecha_venta"].min()
        ).dt.days

        X = producto_df[["dias"]]
        y = producto_df["total_vendido"]

        if len(producto_df) < 2:
            continue

        model = LinearRegression()
        model.fit(X, y)

        future_day = np.array([[producto_df["dias"].max() + 30]])

        prediction = model.predict(future_day)[0]

        tendencia = (
            "High Demand"
            if prediction > y.mean()
            else "Low Demand"
        )

        predictions.append({
            "producto": producto,
            "prediccion": round(float(prediction), 2),
            "promedio_actual": round(float(y.mean()), 2),
            "tendencia": tendencia
        })

    predictions = sorted(
        predictions,
        key=lambda x: x["prediccion"],
        reverse=True
    )

    return jsonify(predictions)


#Settings
@app.route('/api/empleados', methods=['GET'])
def verificar_empleados():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT Id_empleado, nombre FROM empleados")
    empleados = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(empleados)








# Employees
@app.route('/obtener_empleados', methods=['GET'])
def obtener_empleados():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    # Total empleados
    cursor.execute("SELECT COUNT(*) AS total FROM empleados")
    total = cursor.fetchone()['total']

    # Empleados activos
    cursor.execute("SELECT COUNT(*) AS activos FROM empleados WHERE estado = 'activo'")
    activos = cursor.fetchone()['activos']

    # Empleados inactivos (para churn)
    inactivos = total - activos
    churn_rate = round((inactivos / total) * 100, 2) if total > 0 else 0

    return jsonify({
        "employees": total,
        "active": activos,
        "churn_rate": churn_rate
    })


# -------------------------------------------------------------
# Endpoint para listar todos los empleados en la tabla
# -------------------------------------------------------------
@app.route('/api/empleados/lista', methods=['GET'])
def listar_empleados_tabla():
    try:
        conn = conectar_bd()
        if not conn:
            return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                Id_empleado, 
                Nombre, 
                Contacto_telefono, 
                Contacto_email, 
                Cargo,
                Estado, 
                Fecha_ingreso 
            FROM empleados
            ORDER BY Id_empleado ASC;
        """
        cursor.execute(query)
        empleados = cursor.fetchall()
        print(empleados)
        
        cursor.close()
        conn.close()

        # Formateamos las fechas a string para evitar inconvenientes al deserializar JSON
        for emp in empleados:
            if emp.get('Fecha_ingreso'):
                emp['Fecha_ingreso'] = emp['Fecha_ingreso'].strftime('%Y-%m-%d')

        return jsonify(empleados), 200

    except Exception as e:
        print("Error en /api/empleados/lista:", e)
        return jsonify({"error": "Error interno al obtener la lista de empleados"}), 500




# Ruta para obtener los empleados
@app.route('/listar_empleados', methods=['GET'])
def get_employees():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        cursor.execute("" \
        """ 
        SELECT 
            Id_empleado, 
            Nombre, 
            Contacto_telefono, 
            Contacto_email, 
            Estado, 
            Fecha_ingreso 
        FROM 
            empleados;
 
        """
        )
        results = cursor.fetchall()

        # Transformamos los datos si quieres hacerlos más amigables al frontend
        employees = []
        for row in results:
            employees.append({
                'id': row['Id_empleado'],
                'name': row['Nombre'],
                'email': row['Contacto_email'],
                'phone': row['Contacto_telefono'],
                'status': "Active" if row['Estado'].lower() == 'activo' else "Inactive",
                'hireDate': row['Fecha_ingreso']
            })

        return jsonify(employees)

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'Database connection failed'}), 500

    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/empleados/crecimiento', methods=['GET'])
def employee_growth():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT 
            DATE_FORMAT(Fecha_ingreso, '%b %Y') AS month, 
            COUNT(*) AS hires
        FROM empleados
        WHERE Fecha_ingreso IS NOT NULL
        GROUP BY month
        ORDER BY STR_TO_DATE(month, '%b %Y')
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    # Aseguramos tipo numérico en hires
    for r in rows:
        r['hires'] = int(r['hires'] or 0)

    return jsonify(rows)

@app.route('/actividad_empleados', methods=['GET'])
def actividad_empleados():
    try:
        conn = conectar_bd()
        cursor = conn.cursor(dictionary=True)

        query = """
        SELECT 
            DAYOFWEEK(Fecha_venta) AS dia_num,
            COUNT(*) AS total_ventas
        FROM venta
        GROUP BY DAYOFWEEK(Fecha_venta)
        ORDER BY dia_num
        """

        cursor.execute(query)
        resultados = cursor.fetchall()

        dias = {
            1: {"name": "Sun", "ventas": 0},
            2: {"name": "Mon", "ventas": 0},
            3: {"name": "Tue", "ventas": 0},
            4: {"name": "Wed", "ventas": 0},
            5: {"name": "Thu", "ventas": 0},
            6: {"name": "Fri", "ventas": 0},
            7: {"name": "Sat", "ventas": 0},
        }

        for row in resultados:
            dias[row["dia_num"]]["ventas"] = row["total_ventas"]

        return jsonify(list(dias.values()))

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Error obteniendo actividad"}), 500


#Clientes
@app.route('/clientes_por_ubicacion')
def clientes_por_ubicacion():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        Ubicacion AS ubicacion,
        COUNT(*) AS total
    FROM clientes
    GROUP BY Ubicacion
    ORDER BY total DESC
    """

    cursor.execute(query)
    data = cursor.fetchall()

    return jsonify(data)


@app.route('/top_clientes')
def top_clientes():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        c.Nombre AS cliente,
        COUNT(v.Id_venta) AS compras,
        COALESCE(SUM(v.Total),0) AS total_gastado
    FROM clientes c
    LEFT JOIN venta v
        ON c.Id_cliente = v.Id_cliente
    GROUP BY c.Id_cliente, c.Nombre
    ORDER BY total_gastado DESC
    LIMIT 5
    """

    cursor.execute(query)
    data = cursor.fetchall()

    return jsonify(data)

@app.route('/api/client-stats')
def client_stats():

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    # Total clientes
    cursor.execute("""
        SELECT COUNT(*) AS total_clients
        FROM clientes
    """)
    total_clients = cursor.fetchone()["total_clients"]

    # VIP = clientes que más gastan
    cursor.execute("""
       SELECT COUNT(*) AS vip_clients
        FROM (
            SELECT v.Id_cliente
            FROM venta v
            WHERE LOWER(COALESCE(v.Estado, '')) NOT IN ('cancelada', 'anulada')
            GROUP BY v.Id_cliente
            HAVING AVG(v.Total) > (
                SELECT COALESCE(AVG(Total), 0) 
                FROM venta 
                WHERE LOWER(COALESCE(Estado, '')) NOT IN ('cancelada', 'anulada')
            )
        ) sub
    """)
    vip_clients = cursor.fetchone()["vip_clients"]

    # Fieles = compran desde hace tiempo y siguen comprando
    cursor.execute("""
        SELECT COUNT(*) AS loyal_clients
        FROM (
            SELECT
                Id_cliente,
                MIN(Fecha_venta) AS primera_compra,
                MAX(Fecha_venta) AS ultima_compra
            FROM venta
            GROUP BY Id_cliente
            HAVING
                DATEDIFF(CURDATE(), primera_compra) >= 180
                AND DATEDIFF(CURDATE(), ultima_compra) <= 60
        ) loyal
    """)
    loyal_clients = cursor.fetchone()["loyal_clients"]

    # Inactivos
    cursor.execute("""
        SELECT COUNT(*) AS inactive_clients
        FROM (
            SELECT
                Id_cliente,
                MAX(Fecha_venta) AS ultima_compra
            FROM venta
            GROUP BY Id_cliente
            HAVING DATEDIFF(CURDATE(), ultima_compra) > 120
        ) inactive
    """)
    inactive_clients = cursor.fetchone()["inactive_clients"]

    return jsonify({
        "total_clients": total_clients,
        "vip_clients": vip_clients,
        "loyal_clients": loyal_clients,
        "inactive_clients": inactive_clients
    })


@app.route('/api/clients-table')
def clients_table():

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT
        c.Id_cliente,
        c.Nombre AS cliente,

        c.Ubicacion AS ubicacion,

        COUNT(v.Id_venta) AS total_compras,

        COALESCE(SUM(v.total), 0) AS total_gastado,

        MAX(v.Fecha_venta) AS ultima_compra

    FROM clientes c

    LEFT JOIN venta v
        ON c.Id_cliente = v.Id_cliente

    GROUP BY
        c.Id_cliente,
        c.Nombre,
        c.Ubicacion

    ORDER BY total_gastado DESC
    """

    cursor.execute(query)

    data = cursor.fetchall()

    return jsonify(data)




@app.route('/api/clientes-vip', methods=['GET'])
def get_clientes_vip():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    try:
        # 1. Obtener el ticket promedio general de la empresa
        cursor.execute("""
            SELECT COALESCE(AVG(Total), 0) AS ticket_promedio_general
            FROM venta
            WHERE LOWER(COALESCE(Estado, '')) NOT IN ('cancelada', 'anulada')
        """)
        res_promedio = cursor.fetchone()
        ticket_promedio_general = float(res_promedio['ticket_promedio_general']) if res_promedio else 0.0

        # 2. Obtener los clientes VIP (cuyo promedio individual > promedio general)
        query_vip = """
            SELECT 
                c.Id_cliente,
                c.Nombre AS cliente,
                c.Contacto_telefono,
                c.Contacto_email,
                COUNT(v.Id_venta) AS total_compras,
                ROUND(SUM(v.Total), 2) AS total_gastado,
                ROUND(AVG(v.Total), 2) AS ticket_promedio_cliente,
                MAX(v.Fecha_venta) AS ultima_compra
            FROM clientes c
            JOIN venta v ON c.Id_cliente = v.Id_cliente
            WHERE LOWER(COALESCE(v.Estado, '')) NOT IN ('cancelada', 'anulada')
            GROUP BY c.Id_cliente, c.Nombre, c.Contacto_telefono, c.Contacto_email
            HAVING AVG(v.Total) > %s
            ORDER BY total_gastado DESC
        """
        cursor.execute(query_vip, (ticket_promedio_general,))
        clientes_vip = cursor.fetchall()

        # 3. Formatear datos y obtener el producto favorito de cada VIP
        for cliente in clientes_vip:
            cliente['total_gastado'] = float(cliente['total_gastado'] or 0)
            cliente['ticket_promedio_cliente'] = float(cliente['ticket_promedio_cliente'] or 0)
            cliente['ultima_compra'] = cliente['ultima_compra'].strftime('%Y-%m-%d') if cliente['ultima_compra'] else None

            # Consulta rápida para ver el producto que más compra este cliente VIP
            query_top_producto = """
                SELECT p.Nombre AS producto
                FROM venta v
                JOIN detalle_venta dv ON v.Id_venta = dv.Id_venta
                JOIN productos p ON dv.Id_producto = p.Id_producto
                WHERE v.Id_cliente = %s AND LOWER(COALESCE(v.Estado, '')) NOT IN ('cancelada', 'anulada')
                GROUP BY p.Id_producto, p.Nombre
                ORDER BY SUM(dv.Cantidad) DESC
                LIMIT 1
            """
            cursor.execute(query_top_producto, (cliente['Id_cliente'],))
            top_p = cursor.fetchone()
            cliente['producto_favorito'] = top_p['producto'] if top_p else "Sin registros"

        return jsonify({
            "ticket_promedio_general": ticket_promedio_general,
            "total_vip": len(clientes_vip),
            "clientes": clientes_vip
        }), 200

    except Exception as e:
        print(f"Error al obtener clientes VIP: {e}")
        return jsonify({"error": "Error interno al procesar los clientes VIP"}), 500

    finally:
        cursor.close()
        conn.close()





# 📌 Endpoint para ver el detalle profundo de un Cliente por ID
@app.route('/api/client-detail/<int:client_id>')
def client_detail(client_id):
    try:
        conn = conectar_bd()
        cursor = conn.cursor(dictionary=True)

        # 1. Datos básicos del cliente
        query_cliente = """
            SELECT 
                c.Id_cliente,
                c.Nombre,
                COALESCE(c.Contacto_email, 'N/A') AS Contacto_email,
                COALESCE(c.Contacto_telefono, 'N/A') AS Contacto_telefono,
                COALESCE(c.Ubicacion, 'No especificada') AS Ubicacion
            FROM clientes c
            WHERE c.Id_cliente = %s
        """
        cursor.execute(query_cliente, (client_id,))
        cliente = cursor.fetchone()

        if not cliente:
            return jsonify({"error": "Cliente no encontrado"}), 404

        # 2. Historial de Compras y Estado
        query_compras = """
            SELECT 
                v.Id_venta,
                DATE_FORMAT(v.Fecha_venta, '%Y-%m-%d') AS fecha,
                COALESCE(v.total, 0) AS monto,
                COALESCE(v.Canal, 'Físico') AS canal,
                COALESCE(v.Estado, 'Completada') AS estado
            FROM venta v
            WHERE v.Id_cliente = %s
            ORDER BY v.Fecha_venta DESC
        """
        cursor.execute(query_compras, (client_id,))
        compras = cursor.fetchall()

        # Conversiones decimal
        for c in compras:
            c['monto'] = float(c['monto'])

        # 3. Métricas calculadas
        total_compras = len(compras)
        compras_completadas = [c for c in compras if c['estado'].lower() not in ['cancelada', 'anulada']]
        compras_canceladas = [c for c in compras if c['estado'].lower() in ['cancelada', 'anulada']]
        
        monto_total_gastado = sum(c['monto'] for c in compras_completadas)

        # Criterio Cliente Leal: Por ejemplo, más de 5 compras completadas o más de $10,000 gastados
        es_cliente_leal = total_compras >= 5 or monto_total_gastado >= 10000

        # 4. Agrupación por Canales de Compra (ej. Tienda, Web, Whatsapp)
        canales_dict = {}
        for c in compras_completadas:
            canal = c['canal']
            canales_dict[canal] = canales_dict.get(canal, 0) + c['monto']
        
        canales_data = [{"canal": k, "monto": v} for k, v in canales_dict.items()]

        # 5. Evolución temporal para gráfico (Aumentado / Bajado compras)
        query_tendencia = """
            SELECT 
                DATE_FORMAT(v.Fecha_venta, '%Y-%m') AS mes,
                COALESCE(SUM(v.total), 0) AS total_mes
            FROM venta v
            WHERE v.Id_cliente = %s AND LOWER(COALESCE(v.Estado, '')) NOT IN ('cancelada', 'anulada')
            GROUP BY DATE_FORMAT(v.Fecha_venta, '%Y-%m')
            ORDER BY mes ASC
        """
        cursor.execute(query_tendencia, (client_id,))
        tendencia = cursor.fetchall()
        
        for t in tendencia:
            t['total_mes'] = float(t['total_mes'])
        print(tendencia)

        # 6. Sucursales en las que compra y total gastado por sucursal
        query_sucursales = """
            SELECT 
                COALESCE(s.Nombre, 'Sucursal General') AS sucursal,
                COUNT(v.Id_venta) AS compras,
                COALESCE(SUM(v.total), 0) AS total_gastado
            FROM venta v
            LEFT JOIN sucursal s ON v.Id_sucursal = s.Id_sucursal
            WHERE v.Id_cliente = %s AND LOWER(COALESCE(v.Estado, '')) NOT IN ('cancelada', 'anulada')
            GROUP BY s.Id_sucursal, s.Nombre
            ORDER BY total_gastado DESC
        """
        cursor.execute(query_sucursales, (client_id,))
        sucursales = cursor.fetchall()

        print(sucursales)
        for s in sucursales:
            s['total_gastado'] = float(s['total_gastado'])

        # 7. Productos más comprados por el cliente
        query_productos = """
            SELECT 
                p.Nombre AS producto,
                COALESCE(cat.Nombre, 'Sin categoría') AS categoria,
                SUM(dv.Cantidad) AS cantidad_comprada,
                SUM(dv.Subtotal) AS total_invertido
            FROM venta v
            JOIN detalle_venta dv ON v.Id_venta = dv.Id_venta
            JOIN productos p ON dv.Id_producto = p.Id_producto
            LEFT JOIN categoria cat ON p.Id_categoria = cat.Id_categoria
            WHERE v.Id_cliente = %s AND LOWER(COALESCE(v.Estado, '')) NOT IN ('cancelada', 'anulada')
            GROUP BY p.Id_producto, p.Nombre, cat.Nombre
            ORDER BY cantidad_comprada DESC
        """
        cursor.execute(query_productos, (client_id,))
        productos = cursor.fetchall()

        for p in productos:
            p['cantidad_comprada'] = int(p['cantidad_comprada'] or 0)
            p['total_invertido'] = float(p['total_invertido'])
        
        
        

        cursor.close()
        conn.close()

        return jsonify({
            "cliente": cliente,
            "resumen": {
                "total_compras": total_compras,
                "monto_total_gastado": monto_total_gastado,
                "canceladas_cant": len(compras_canceladas),
                "es_leal": es_cliente_leal
            },
            "historial_compras": compras,
            "comparativa_canales": canales_data,
            "tendencia_compras": tendencia,
            "sucursales": sucursales,
            "productos_comprados": productos
        })

    except Exception as e:
        print("Error en client_detail:", e)
        return jsonify({"error": str(e)}), 500




#Proveedores

@app.route('/api/suppliers/list', methods=['GET'])
def get_suppliers_list():
    try:
        conn = conectar_bd()
        cursor = conn.cursor(dictionary=True)

        # Ajusta los nombres de las columnas a como los tengas en tu tabla 'proveedores'
        cursor.execute("""
            SELECT 
                Id_proveedor AS id,
                Nombre AS nombre,
                Contacto_email AS contacto,
                Contacto_telefono AS telefono,
                Ubicacion AS direccion
            FROM proveedores
            ORDER BY Nombre ASC
        """)
        proveedores = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(proveedores), 200

    except Exception as e:
        print("Error al obtener lista de proveedores:", e)
        return jsonify({"error": "Error interno al consultar proveedores"}), 500


@app.route('/api/suppliers/<int:supplier_id>', methods=['GET'])
def get_supplier_detail(supplier_id):
    try:
        conn = conectar_bd()
        cursor = conn.cursor(dictionary=True)

        # 1. Datos del proveedor
        cursor.execute("""
            SELECT 
                Id_proveedor AS id,
                Nombre AS nombre,
                Contacto_telefono AS telefono,
                Contacto_email AS email,
                Ubicacion AS direccion
            FROM proveedores
            WHERE Id_proveedor = %s
        """, (supplier_id,))
        supplier = cursor.fetchone()

        if not supplier:
            return jsonify({"error": "Proveedor no encontrado"}), 404

        # 2. Productos provistos según las Órdenes de Compra vinculadas
        cursor.execute("""
            SELECT DISTINCT
                p.Id_producto,
                p.Nombre AS nombre,
                COALESCE(SUM(i.Cantidad_actual), 0) AS stock,
                COALESCE(p.Precio_base, 0) AS precio_compra
            FROM orden_compra oc
            INNER JOIN detalle_compra doc ON oc.Id_orden_compra = doc.Id_orden_compra
            INNER JOIN productos p ON doc.Id_producto = p.Id_producto
            LEFT JOIN inventario i ON p.Id_producto = i.Id_producto
            WHERE oc.Id_proveedor = %s
            GROUP BY p.Id_producto, p.Nombre, p.Precio_base
        """, (supplier_id,))
        productos = cursor.fetchall()

        # 3. Inversión Total acumulada desde las Órdenes de Compra
        cursor.execute("""
            SELECT 
                COALESCE(SUM(Costo_total), 0) AS total_invertido,
                COUNT(DISTINCT Id_orden_compra) AS total_ordenes
            FROM orden_compra
            WHERE Id_proveedor = %s
            AND LOWER(COALESCE(Estado, '')) NOT IN ('cancelada', 'anulada')
        """, (supplier_id,))
        stats = cursor.fetchone()

        supplier['productos'] = productos
        supplier['total_productos'] = len(productos)
        supplier['total_invertido'] = float(stats['total_invertido']) if stats else 0.0
        supplier['total_ordenes'] = stats['total_ordenes'] if stats else 0

        cursor.close()
        conn.close()

        return jsonify(supplier), 200

    except Exception as e:
        print("Error obteniendo detalle de proveedor:", e)
        return jsonify({"error": "Error interno al consultar el detalle"}), 500

    
@app.route('/proveedores_por_pais')
def proveedores_por_pais():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        Pais AS pais,
        COUNT(*) AS total
    FROM proveedores
    GROUP BY Pais
    ORDER BY total DESC
    """

    cursor.execute(query)
    data = cursor.fetchall()

    return jsonify(data)

@app.route('/top_proveedores')
def top_proveedores():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        Nombre,
        Pais,
        Ubicacion
    FROM proveedores
    LIMIT 5
    """

    cursor.execute(query)
    data = cursor.fetchall()

    return jsonify(data)


from flask import Flask, jsonify, request

from flask import Flask, jsonify, request

@app.route('/proveedores_mapa', methods=['GET'])
def proveedores_mapa():
    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')
    
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    # Subconsulta para obtener la primera fecha de registro/compra de cada proveedor
    # Asumiendo que la tabla orden_compra tiene los campos: Id_proveedor y fecha
    query = """
        SELECT 
            p.Pais,
            COUNT(DISTINCT p.Id_proveedor) AS Total
        FROM proveedores p
        INNER JOIN (
            SELECT 
                Id_proveedor, 
                MIN(Fecha_orden) AS primera_fecha
            FROM orden_compra
            GROUP BY Id_proveedor
        ) oc ON p.Id_proveedor = oc.Id_proveedor
    """
    params = []

    # Filtrar por el rango según la primera fecha de registro
    if fecha_inicio and fecha_fin:
        query += " WHERE oc.primera_fecha BETWEEN %s AND %s"
        params.extend([fecha_inicio, fecha_fin])

    query += " GROUP BY p.Pais"

    cursor.execute(query, params)
    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(data)

@app.route('/top_proveedores_rendimiento')
def top_proveedores_rendimiento():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        p.Nombre AS proveedor,
        p.Pais,

        COUNT(oc.Id_orden_compra) AS total_ordenes,

        ROUND(AVG(
            DATEDIFF(
                oc.Fecha_entrega_real,
                oc.Fecha_orden
            )
        ), 1) AS promedio_entrega,

        SUM(oc.Costo_total) AS total_compras

    FROM proveedores p

    JOIN orden_compra oc
        ON p.Id_proveedor = oc.Id_proveedor

    WHERE oc.Fecha_entrega_real IS NOT NULL

    GROUP BY 
        p.Id_proveedor,
        p.Nombre,
        p.Pais

    ORDER BY promedio_entrega ASC, total_compras DESC
    LIMIT 5
    """

    cursor.execute(query)
    data = cursor.fetchall()

    return jsonify(data)


@app.route('/suppliers_stats')
def suppliers_stats():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT
        (SELECT COUNT(*) FROM proveedores) AS total_suppliers,

        (SELECT COUNT(*) FROM orden_compra) AS total_orders,

        (
            SELECT COALESCE(SUM(Costo_total),0)
            FROM orden_compra
        ) AS supplier_revenue
    """

    cursor.execute(query)
    data = cursor.fetchone()

    return jsonify({
        "totalSuppliers": int(data["total_suppliers"] or 0),
        "productsSupplied": int(data["total_orders"] or 0),
        "supplierRevenue": float(data["supplier_revenue"] or 0)
    })
#Low Stock
@app.route('/products/low-stock')
def low_stock():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        t.*,
        -- Calculamos la oportunidad perdida en base a las unidades faltantes para el mínimo seguro
        ROUND(GREATEST(t.StockMinimo - t.Cantidad_actual, 0) * t.Precio_base, 2) AS costo_oportunidad
    FROM
    (
        SELECT
            p.Id_producto,
            p.Nombre,
            p.Precio_base, -- Necesario para la valorización financiera

            i.Id_almacen,
            i.Cantidad_actual,

            CEILING(IFNULL(v.ConsumoPromedioDiario, 0)) AS ConsumoPromedioDiario,

            CEILING(IFNULL(c.TiempoEntrega, 0)) AS TiempoEntrega,

            CEILING(IFNULL(v.ConsumoPromedioDiario, 0) * 5) AS StockSeguridad,

            CEILING(
                (IFNULL(v.ConsumoPromedioDiario, 0) * IFNULL(c.TiempoEntrega, 0))
                +
                (IFNULL(v.ConsumoPromedioDiario, 0) * 5)
            ) AS StockMinimo,

            i.estado,
            i.Ultima_actualizacion,

            (
                SELECT MAX(v2.Fecha_venta)
                FROM detalle_venta dv2
                JOIN venta v2
                    ON dv2.Id_venta = v2.Id_venta
                WHERE dv2.Id_producto = p.Id_producto
            ) AS ultima_venta,

            (
                SELECT MAX(oc2.Fecha_orden)
                FROM detalle_compra dc2
                JOIN orden_compra oc2
                    ON dc2.Id_orden_compra = oc2.Id_orden_compra
                WHERE dc2.Id_producto = p.Id_producto
            ) AS ultima_compra

        FROM productos p

        JOIN inventario i
            ON p.Id_producto = i.Id_producto

        LEFT JOIN
        (
            SELECT
                dv.Id_producto,
                SUM(dv.Cantidad) /
                GREATEST(DATEDIFF(MAX(v.Fecha_venta), MIN(v.Fecha_venta)) + 1, 1)
                AS ConsumoPromedioDiario
            FROM detalle_venta dv
            JOIN venta v
                ON dv.Id_venta = v.Id_venta
            GROUP BY dv.Id_producto
        ) v
            ON p.Id_producto = v.Id_producto

        LEFT JOIN
        (
            SELECT
                dc.Id_producto,
                AVG(DATEDIFF(oc.Fecha_entrega_real, oc.Fecha_orden)) AS TiempoEntrega
            FROM detalle_compra dc
            JOIN orden_compra oc
                ON dc.Id_orden_compra = oc.Id_orden_compra
            WHERE oc.Fecha_entrega_real IS NOT NULL
            GROUP BY dc.Id_producto
        ) c
            ON p.Id_producto = c.Id_producto

        WHERE LOWER(i.estado) = 'normal'
    ) t

    WHERE t.Cantidad_actual <= t.StockMinimo

    -- Ordenamos de mayor a menor pérdida financiera potencial
    ORDER BY costo_oportunidad DESC;
    """

    cursor.execute(query)
    data = cursor.fetchall()
    
    # Aseguramos que los valores decimales pasen limpios como float al JSON
    for item in data:
        item["costo_oportunidad"] = float(item["costo_oportunidad"] or 0)
        item["Precio_base"] = float(item["Precio_base"] or 0)

    cursor.close()
    conn.close()
    return jsonify(data)

@app.route('/product/<int:id>')
def product_detail(id):
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT
        p.*,
        c.Nombre AS categoria,

        i.Cantidad_actual,
        i.Ultima_actualizacion,

        CEILING(IFNULL(v.ConsumoPromedioDiario, 0)) AS ConsumoPromedioDiario,

        CEILING(IFNULL(t.TiempoEntrega, 0)) AS TiempoEntrega,

        CEILING(IFNULL(v.ConsumoPromedioDiario, 0) * 5) AS StockSeguridad,

        CEILING(
            (IFNULL(v.ConsumoPromedioDiario, 0) * IFNULL(t.TiempoEntrega, 0))
            +
            (IFNULL(v.ConsumoPromedioDiario, 0) * 5)
        ) AS StockMinimo

    FROM productos p

    JOIN categoria c
        ON p.Id_categoria = c.Id_categoria

    JOIN inventario i
        ON p.Id_producto = i.Id_producto

    LEFT JOIN
    (
        SELECT
            dv.Id_producto,
            SUM(dv.Cantidad) /
            GREATEST(DATEDIFF(MAX(v.Fecha_venta), MIN(v.Fecha_venta)) + 1, 1)
            AS ConsumoPromedioDiario
        FROM detalle_venta dv
        JOIN venta v
            ON dv.Id_venta = v.Id_venta
        GROUP BY dv.Id_producto
    ) v
        ON p.Id_producto = v.Id_producto

    LEFT JOIN
    (
        SELECT
            dc.Id_producto,
            AVG(DATEDIFF(oc.Fecha_entrega_real, oc.Fecha_orden)) AS TiempoEntrega
        FROM detalle_compra dc
        JOIN orden_compra oc
            ON dc.Id_orden_compra = oc.Id_orden_compra
        WHERE oc.Fecha_entrega_real IS NOT NULL
        GROUP BY dc.Id_producto
    ) t
        ON p.Id_producto = t.Id_producto

    WHERE p.Id_producto = %s
    """

    cursor.execute(query, (id,))
    return jsonify(cursor.fetchone())

@app.route('/product/<int:id>/sales')
def product_sales(id):
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        SUM(dv.Cantidad) AS total_vendido,
        MAX(v.Fecha_venta) AS ultima_venta,
        s.Nombre AS sucursal
    FROM detalle_venta dv
    JOIN venta v ON dv.Id_venta = v.Id_venta
    JOIN sucursal s ON v.Id_sucursal = s.Id_sucursal
    WHERE dv.Id_producto = %s
    GROUP BY s.Id_sucursal
    """

    cursor.execute(query, (id,))
    return jsonify(cursor.fetchall())

@app.route('/product/<int:id>/purchases')
def product_purchases(id):
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        MAX(oc.Fecha_orden) AS ultima_orden,
        pr.Nombre AS proveedor,
        SUM(dc.Cantidad) AS total_comprado
    FROM detalle_compra dc
    JOIN orden_compra oc ON dc.Id_orden_compra = oc.Id_orden_compra
    JOIN proveedores pr ON oc.Id_proveedor = pr.Id_proveedor
    WHERE dc.Id_producto = %s
    GROUP BY pr.Id_proveedor
    """

    cursor.execute(query, (id,))
    return jsonify(cursor.fetchall())


@app.route('/product/<int:id>/price-history')
def price_history(id):
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT Precio, Fecha_cambio, Motivo_cambio
    FROM precio_historico
    WHERE Id_producto = %s
    ORDER BY Fecha_cambio ASC
    """

    cursor.execute(query, (id,))
    return jsonify(cursor.fetchall())




#Ordenes
@app.route('/orders_stats')
def orders_stats():

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT

        COUNT(*) AS total_orders,

        COUNT(
            CASE 
                WHEN LOWER(Estado) = 'pendiente'
                THEN 1
            END
        ) AS pending_orders,

        COUNT(
            CASE 
                WHEN LOWER(Estado) IN ('completada', 'entregada')
                THEN 1
            END
        ) AS completed_orders,

        COUNT(
            CASE
                WHEN LOWER(Estado) = 'cancelada'
                THEN 1
            END
        ) AS cancelled_orders,

        COALESCE(SUM(Costo_total),0) AS total_revenue

    FROM orden_compra
    """

    cursor.execute(query)

    data = cursor.fetchone()

    print(data)

    return jsonify({

        "totalOrders": int(data["total_orders"] or 0),

        "pendingOrders": int(data["pending_orders"] or 0),

        "completedOrders": int(data["completed_orders"] or 0),

        "cancelledOrders": int(data["cancelled_orders"] or 0),

        "totalRevenue": float(data["total_revenue"] or 0)

    })

@app.route('/daily_orders')
def daily_orders():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT
        Fecha_orden AS fecha,
        COUNT(*) AS total
    FROM orden_compra
    GROUP BY Fecha_orden
    ORDER BY Fecha_orden
    """

    cursor.execute(query)
    data = cursor.fetchall()

    return jsonify(data)


@app.route('/orders_distribution')
def orders_distribution():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT
        Estado,
        COUNT(*) AS total
    FROM orden_compra
    GROUP BY Estado
    """

    cursor.execute(query)
    data = cursor.fetchall()

    return jsonify(data)


@app.route('/orders_table')
def orders_table():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT
        oc.Id_orden_compra,
        p.Nombre AS proveedor,
        oc.Fecha_orden,
        oc.Fecha_entrega_real,
        oc.Estado,
        oc.Costo_total,
        oc.Tipo_envio

    FROM orden_compra oc

    JOIN proveedores p
        ON oc.Id_proveedor = p.Id_proveedor

    ORDER BY oc.Fecha_orden DESC
    """

    cursor.execute(query)
    data = cursor.fetchall()

    return jsonify(data)


@app.route('/delivery_performance')
def delivery_performance():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT
            SUM(
                CASE
                    WHEN Fecha_entrega_real <= Fecha_entrega_estimada THEN 1
                    ELSE 0
                END
            ) AS on_time,

            SUM(
                CASE
                    WHEN Fecha_entrega_real > Fecha_entrega_estimada THEN 1
                    ELSE 0
                END
            ) AS `delayed`

        FROM orden_compra
        WHERE Fecha_entrega_real IS NOT NULL;
    """

    cursor.execute(query)
    data = cursor.fetchone()

    return jsonify(data)


@app.route('/monthly_purchase_trend')
def monthly_purchase_trend():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT
        DATE_FORMAT(Fecha_orden, '%Y-%m') AS mes,
        SUM(Costo_total) AS total
    FROM orden_compra
    GROUP BY mes
    ORDER BY mes
    """

    cursor.execute(query)
    data = cursor.fetchall()

    return jsonify(data)


@app.route('/orders/pending')
def pending_orders():

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT
        oc.Id_orden_compra,
        pr.Nombre AS proveedor,
        s.Nombre AS sucursal,
        oc.Estado,
        oc.Fecha_orden,
        oc.Fecha_entrega_estimada,
        oc.Costo_total,
        oc.Tipo_envio
    FROM orden_compra oc

    LEFT JOIN proveedores pr
        ON oc.Id_proveedor = pr.Id_proveedor

    LEFT JOIN sucursal s
        ON oc.Id_sucursal = s.Id_sucursal

    WHERE LOWER(oc.Estado) = 'pendiente'

    ORDER BY oc.Fecha_orden DESC
    """

    cursor.execute(query)

    return jsonify(cursor.fetchall())



@app.route('/orders/completed')
def completed_orders():

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT
        oc.Id_orden_compra,
        pr.Nombre AS proveedor,
        s.Nombre AS sucursal,
        oc.Estado,
        oc.Fecha_orden,
        oc.Fecha_entrega_estimada,
        oc.Fecha_entrega_real,
        oc.Costo_total,
        oc.Tipo_envio
    FROM orden_compra oc

    LEFT JOIN proveedores pr
        ON oc.Id_proveedor = pr.Id_proveedor

    LEFT JOIN sucursal s
        ON oc.Id_sucursal = s.Id_sucursal

    WHERE LOWER(oc.Estado) = 'entregada'

    ORDER BY oc.Fecha_entrega_real DESC
    """

    cursor.execute(query)

    return jsonify(cursor.fetchall())

@app.route('/orders/cancelled')
def cancelled_orders():

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT
        oc.Id_orden_compra,
        pr.Nombre AS proveedor,
        s.Nombre AS sucursal,
        oc.Estado,
        oc.Fecha_orden,
        oc.Costo_total,
        oc.Tipo_envio
    FROM orden_compra oc

    LEFT JOIN proveedores pr
        ON oc.Id_proveedor = pr.Id_proveedor

    LEFT JOIN sucursal s
        ON oc.Id_sucursal = s.Id_sucursal

    WHERE LOWER(oc.Estado) = 'cancelada'

    ORDER BY oc.Fecha_orden DESC
    """

    cursor.execute(query)

    return jsonify(cursor.fetchall())



#login
@app.route('/images/<path:filename>')
def serve_images(filename):
    return send_from_directory('Home/images', filename)

@app.route('/login', methods=['GET'])
def login_page():
    return render_template('login.html')  # Sirve la página de login

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    conn = conectar_bd()
    if conn: 
        cursor = conn.cursor(dictionary=True)
        # 1. Buscamos al usuario de forma habitual
        cursor.execute("""
            SELECT u.Id_Empleado, u.usuario, e.nombre, e.Contacto_email, e.Cargo
            FROM usuario u
            JOIN empleados e ON u.Id_Empleado = e.Id_Empleado
            WHERE u.usuario = %s AND u.clave = %s
        """, (username, password))
        user = cursor.fetchone()

        if user:
            # 2. Si existe, buscamos la lista de permisos usando su id_usuario
            cursor.execute("""
                SELECT p.nombre_permiso 
                FROM usuario_permisos up
                JOIN permisos p ON up.id_permiso = p.id_permiso
                WHERE up.Id_Empleado = %s
            """, (user["Id_Empleado"],))
            
            permisos_rows = cursor.fetchall()
            lista_permisos = [row["nombre_permiso"] for row in permisos_rows]

            cursor.close()
            conn.close()

            # Convertimos la lista de permisos a un string separado por comas
            # para que sea 100% compatible con lo que tu frontend lee en el localStorage
            permisos_string = ",".join(lista_permisos)

            print(f"✅ Login Exitoso para {user['usuario']}. Permisos: {permisos_string}")
            
            # 3. Retornamos el JSON con los nombres exactos que tu App.jsx va a buscar en la URL
            return jsonify({
                "success": True,
                "usuario": user["usuario"],
                "nombre": user["nombre"],
                "Contacto_email": user["Contacto_email"],
                "Cargo": user["Cargo"],          # Esto viaja en el JSON
                "puesto": user["Cargo"],         # <-- Duplicado como 'puesto' para que coincida con tu redirect
                "permisos": permisos_string      # <-- Enviado como string "Permiso1,Permiso2"
            }), 200
        else:
            cursor.close()
            conn.close()
            return jsonify({"success": False, "message": "Usuario o contraseña incorrectos"}), 401
    else:
        return jsonify({"success": False, "message": "Error de conexión a la BD"}), 500

@app.route('/', methods=['GET'])
def index():
    return render_template('login.html')

#Analystics
@app.route("/revenue_data")
def revenue_data():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT 
            t.mes, 
            t.ano, 
            IFNULL(SUM(v.importe), 0) AS revenue,
            t.objetivo AS target
        FROM target t
        LEFT JOIN venta v 
            ON MONTH(v.fecha) = t.mes 
            AND YEAR(v.fecha) = t.ano
        GROUP BY t.ano, t.mes, t.objetivo
        ORDER BY t.ano, t.mes
        """
    cursor.execute(query)
    data = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify(data)



@app.route('/api/product-performance')
def get_product_performance():
    query = """
        SELECT 
            p.nombre AS name,
            COUNT(d.idprod) AS sales, 
            SUM(v.importe) AS revenue,
            SUM(d.cant * p.precio) AS profit
        FROM venta v
        JOIN detalle d ON v.idventa = d.idventa
        JOIN producto p ON d.idprod = p.idprod
        GROUP BY p.nombre
    """
    
    # Establecer conexión con la base de datos
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute(query)
    data = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    # Preparar los datos para la respuesta
    product_performance_data = [
        {
            "name": row['name'],
            "sales": row['sales'],
            "revenue": row['revenue'],
            "profit": row['profit'],
        }
        for row in data
    ]

    return jsonify(product_performance_data)


@app.route('/api/customer-segmentation')
def get_customer_segmentation():
    query = """
        SELECT 
            c.segmento AS name,
            COUNT(v.idventa) AS performance
        FROM venta v
        JOIN cliente c ON v.idcliente = c.idcliente
        GROUP BY c.segmento
    """
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(query)
    data = cursor.fetchall()
    
    print(data)  # Verifica los datos recibidos
   
    cursor.close()
    conn.close()
    
    segmentation_data = [
        {
            "name": row['name'],
            "performance": row['performance'],
        }
        for row in data
    ]
    
    return jsonify(segmentation_data)



@app.route('/homes', methods=['GET'])
def home():
    conn = conectar_bd()
    
    # Obtener gráfico de ventas totales
    graph_ventas_html = ""
    if conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT fecha, SUM(importe) AS total_ventas FROM venta GROUP BY fecha ORDER BY fecha")
        data = cursor.fetchall()
        conn.close()

        if data:
            df = pd.DataFrame(data)
            fig_ventas = px.line(df, x="fecha", y="total_ventas", title="Ventas Totales por Día", labels={"fecha": "Fecha", "total_ventas": "Total Ventas ($)"})
            graph_ventas_html = fig_ventas.to_html(full_html=False)
    
    # Obtener gráfico de productos vendidos
    graph_productos_html = ""
    if conn:
        conn = conectar_bd()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT p.nombre, SUM(d.cant) AS total_vendido
            FROM detalle d
            JOIN producto p ON d.idprod = p.idprod
            GROUP BY p.nombre
            ORDER BY total_vendido DESC
        """)
        data = cursor.fetchall()
        conn.close()

        if data:
            df_productos = pd.DataFrame(data)
            fig_productos = px.bar(df_productos, x="nombre", y="total_vendido", title="Productos Vendidos", labels={"nombre": "Producto", "total_vendido": "Cantidad Vendida"})
            graph_productos_html = fig_productos.to_html(full_html=False)

    # Obtener gráfico de ventas por categoría
    graph_categoria_html = ""
    if conn:
        conn = conectar_bd()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT c.nombre, SUM(d.subtotal) AS total_ventas
            FROM detalle d
            JOIN producto p ON d.idprod = p.idprod
            JOIN categoria c ON p.idcat = c.idcat
            GROUP BY c.nombre
            ORDER BY total_ventas DESC
        """)
        data = cursor.fetchall()
        conn.close()

        if data:
            df_categoria = pd.DataFrame(data)
            fig_categoria = px.bar(df_categoria, x="nombre", y="total_ventas", title="Ventas por Categoría", labels={"nombre": "Categoría", "total_ventas": "Ventas Totales ($)"})
            graph_categoria_html = fig_categoria.to_html(full_html=False)

    return render_template('homes.html', graph_ventas_html=graph_ventas_html, graph_productos_html=graph_productos_html, graph_categoria_html=graph_categoria_html)



#Sales
@app.route('/crear_reporte', methods=['GET'])
def crear_reporte_form():
    return render_template('crear_reporte.html')  # Página de formulario para crear reporte

@app.route('/crear_reporte', methods=['POST'])
def crear_reporte():
    # Obtener fechas desde la solicitud
    data = request.json
    start_date = data['start_date']
    end_date = data['end_date']

    # Convertir las fechas a objetos datetime
    start_date_obj = datetime.datetime.strptime(start_date, "%Y-%m-%d")
    end_date_obj = datetime.datetime.strptime(end_date, "%Y-%m-%d")

    conn = conectar_bd()
    
    graph_ventas_html = ""
    if conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT fecha, SUM(importe) AS total_ventas
            FROM venta
            WHERE fecha BETWEEN %s AND %s
            GROUP BY fecha
            ORDER BY fecha
        """, (start_date_obj, end_date_obj))
        data = cursor.fetchall()
        conn.close()

        if data:
            df = pd.DataFrame(data)
            fig_ventas = px.line(df, x="fecha", y="total_ventas", title="Ventas Totales por Día",
                                 labels={"fecha": "Fecha", "total_ventas": "Total Ventas ($)"})
            graph_ventas_html = fig_ventas.to_html(full_html=False)

    graph_productos_html = ""
    if conn:
        conn = conectar_bd()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT p.nombre, SUM(d.cant) AS total_vendido
            FROM detalle d
            JOIN producto p ON d.idprod = p.idprod
            WHERE d.fecha BETWEEN %s AND %s
            GROUP BY p.nombre
            ORDER BY total_vendido DESC
        """, (start_date_obj, end_date_obj))
        data = cursor.fetchall()
        conn.close()

        if data:
            df_productos = pd.DataFrame(data)
            fig_productos = px.bar(df_productos, x="nombre", y="total_vendido", title="Productos Vendidos",
                                   labels={"nombre": "Producto", "total_vendido": "Cantidad Vendida"})
            graph_productos_html = fig_productos.to_html(full_html=False)

    graph_categoria_html = ""
    if conn:
        conn = conectar_bd()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT c.nombre, SUM(d.subtotal) AS total_ventas
            FROM detalle d
            JOIN producto p ON d.idprod = p.idprod
            JOIN categoria c ON p.idcat = c.idcat
            WHERE d.fecha BETWEEN %s AND %s
            GROUP BY c.nombre
            ORDER BY total_ventas DESC
        """, (start_date_obj, end_date_obj))
        data = cursor.fetchall()
        conn.close()

        if data:
            df_categoria = pd.DataFrame(data)
            fig_categoria = px.bar(df_categoria, x="nombre", y="total_ventas", title="Ventas por Categoría",
                                   labels={"nombre": "Categoría", "total_ventas": "Ventas Totales ($)"})
            graph_categoria_html = fig_categoria.to_html(full_html=False)

    return jsonify({
        'graph_ventas_html': graph_ventas_html,
        'graph_productos_html': graph_productos_html,
        'graph_categoria_html': graph_categoria_html
    })


@app.route('/api/reportes/<tipo>')
def reportes(tipo):

    inicio = request.args.get("inicio")
    fin = request.args.get("fin")

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    # ==========================
    # GENERAL
    # ==========================

    if tipo == "general":

        cursor.execute("""
        SELECT SUM(Total) total
        FROM venta
        WHERE Fecha_venta BETWEEN %s AND %s
        """,(inicio,fin))

        total = cursor.fetchone()

        cursor.execute("""
        SELECT c.Nombre nombre,
               SUM(dv.Subtotal) total
        FROM detalle_venta dv
        JOIN productos p
            ON dv.Id_producto = p.Id_producto
        JOIN categoria c
            ON p.Id_categoria = c.Id_categoria
        JOIN venta v
            ON dv.Id_venta = v.Id_venta
        WHERE v.Fecha_venta BETWEEN %s AND %s
        GROUP BY c.Nombre
        """,(inicio,fin))

        categorias = cursor.fetchall()

        cursor.execute("""
        SELECT p.Nombre nombre,
               SUM(dv.Cantidad) cant
        FROM detalle_venta dv
        JOIN productos p
            ON p.Id_producto = dv.Id_producto
        JOIN venta v
            ON v.Id_venta = dv.Id_venta
        WHERE v.Fecha_venta BETWEEN %s AND %s
        GROUP BY p.Nombre
        ORDER BY cant DESC
        LIMIT 10
        """,(inicio,fin))

        productos = cursor.fetchall()

        cursor.execute("""
        SELECT e.Nombre nombre,
               SUM(v.Total) total
        FROM venta v
        JOIN empleados e
            ON e.Id_empleado=v.Id_empleado
        WHERE v.Fecha_venta BETWEEN %s AND %s
        GROUP BY e.Nombre
        ORDER BY total DESC
        LIMIT 10
        """,(inicio,fin))

        empleados = cursor.fetchall()

        conn.close()

        return jsonify({
            "tipo":"general",
            "total":total["total"],
            "categorias":categorias,
            "productos":productos,
            "empleados":empleados
        })

    # ==========================
    # PRODUCTOS
    # ==========================

    elif tipo == "productos":

        cursor.execute("""
        SELECT
            p.Nombre,
            SUM(dv.Cantidad) vendidos
        FROM detalle_venta dv
        JOIN productos p
        ON p.Id_producto=dv.Id_producto
        GROUP BY p.Nombre
        ORDER BY vendidos DESC
        """)
        
        data = cursor.fetchall()

        return jsonify({
            "tipo":"productos",
            "productos":data
        })

    # ==========================
    # CLIENTES
    # ==========================

    elif tipo == "clientes":

        cursor.execute("""
        SELECT
            c.Nombre,
            COUNT(v.Id_venta) compras,
            SUM(v.Total) total
        FROM clientes c
        JOIN venta v
        ON c.Id_cliente=v.Id_cliente
        GROUP BY c.Nombre
        ORDER BY total DESC
        """)

        data = cursor.fetchall()

        return jsonify({
            "tipo":"clientes",
            "clientes":data
        })

    # ==========================
    # EMPLEADOS
    # ==========================

    elif tipo == "empleados":

        cursor.execute("""
        SELECT
            e.Nombre,
            COUNT(v.Id_venta) ventas,
            SUM(v.Total) total
        FROM empleados e
        JOIN venta v
        ON e.Id_empleado=v.Id_empleado
        GROUP BY e.Nombre
        ORDER BY total DESC
        """)

        data = cursor.fetchall()

        return jsonify({
            "tipo":"empleados",
            "empleados":data
        })

    # ==========================
    # PROVEEDORES
    # ==========================

    elif tipo == "proveedores":

        cursor.execute("""
        SELECT
            Nombre,
            Pais,
            Contacto_email
        FROM proveedores
        """)

        data = cursor.fetchall()

        return jsonify({
            "tipo":"proveedores",
            "proveedores":data
        })

    # ==========================
    # COMPRAS
    # ==========================

    elif tipo == "compras":

        cursor.execute("""
        SELECT
            Fecha_orden,
            SUM(Costo_total) total
        FROM orden_compra
        GROUP BY Fecha_orden
        """)

        data = cursor.fetchall()

        return jsonify({
            "tipo":"compras",
            "compras":data
        })

    # ==========================
    # INVENTARIO
    # ==========================

    elif tipo == "inventario":

        cursor.execute("""
        SELECT
            p.Nombre,
            i.Cantidad_actual,
            i.Cantidad_minima
        FROM inventario i
        JOIN productos p
        ON p.Id_producto=i.Id_producto
        """)

        data = cursor.fetchall()

        return jsonify({
            "tipo":"inventario",
            "inventario":data
        })
@app.route('/api/reporte-productos')
def reporte_productos():
    inicio = request.args.get('inicio')
    fin = request.args.get('fin')

    if not inicio or not fin:
        return jsonify({"error": "Faltan las fechas de inicio o fin"}), 400

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    # 1. Total unidades vendidas
    cursor.execute("""
        SELECT COALESCE(SUM(dv.Cantidad), 0) AS total
        FROM detalle_venta dv
        JOIN venta v ON dv.Id_venta = v.Id_venta
        WHERE v.Fecha_venta BETWEEN %s AND %s
    """, (inicio, fin))
    total_productos = cursor.fetchone()["total"]

    # 2. Ingresos Totales
    cursor.execute("""
        SELECT COALESCE(SUM(dv.Subtotal), 0) AS ingresos
        FROM detalle_venta dv
        JOIN venta v ON dv.Id_venta = v.Id_venta
        WHERE v.Fecha_venta BETWEEN %s AND %s
    """, (inicio, fin))
    ingresos_total = cursor.fetchone()["ingresos"]

    # 3. Producto líder
    cursor.execute("""
        SELECT p.Nombre, SUM(dv.Cantidad) AS vendidos
        FROM detalle_venta dv
        JOIN productos p ON dv.Id_producto = p.Id_producto
        JOIN venta v ON dv.Id_venta = v.Id_venta
        WHERE v.Fecha_venta BETWEEN %s AND %s
        GROUP BY p.Id_producto, p.Nombre
        ORDER BY vendidos DESC LIMIT 1
    """, (inicio, fin))
    producto_top_res = cursor.fetchone()
    producto_top = producto_top_res["Nombre"] if producto_top_res else "N/A"

    # 4. Stock crítico
    cursor.execute("""
         SELECT COUNT(*) AS total
    FROM
    (
        SELECT
            p.Id_producto,
            i.Cantidad_actual,

            CEILING(
                (IFNULL(v.ConsumoPromedioDiario,0) * IFNULL(c.TiempoEntrega,0))
                +
                (IFNULL(v.ConsumoPromedioDiario,0) * 5)
            ) AS StockMinimo

        FROM productos p

        JOIN inventario i
            ON p.Id_producto = i.Id_producto

        LEFT JOIN
        (
            SELECT
                dv.Id_producto,
                SUM(dv.Cantidad) /
                GREATEST(DATEDIFF(MAX(v.Fecha_venta), MIN(v.Fecha_venta)) + 1, 1)
                AS ConsumoPromedioDiario
            FROM detalle_venta dv
            JOIN venta v
                ON dv.Id_venta = v.Id_venta
            GROUP BY dv.Id_producto
        ) v
            ON p.Id_producto = v.Id_producto

        LEFT JOIN
        (
            SELECT
                dc.Id_producto,
                AVG(DATEDIFF(oc.Fecha_entrega_real, oc.Fecha_orden)) AS TiempoEntrega
            FROM detalle_compra dc
            JOIN orden_compra oc
                ON dc.Id_orden_compra = oc.Id_orden_compra
            WHERE oc.Fecha_entrega_real IS NOT NULL
            GROUP BY dc.Id_producto
        ) c
            ON p.Id_producto = c.Id_producto

        WHERE LOWER(i.estado)='normal'
    ) t

    WHERE Cantidad_actual <= StockMinimo
    """)
    stock_critico = cursor.fetchone()["total"]
    
    # 5. SKUs únicos vendidos
    cursor.execute("""
        SELECT COUNT(DISTINCT dv.Id_producto) AS total
        FROM detalle_venta dv
        JOIN venta v ON dv.Id_venta = v.Id_venta
        WHERE v.Fecha_venta BETWEEN %s AND %s
    """, (inicio, fin))
    productos_vendidos = cursor.fetchone()["total"]

    # 6. Categoría líder
    cursor.execute("""
        SELECT c.Nombre, SUM(dv.Subtotal) AS ingresos
        FROM detalle_venta dv
        JOIN productos p ON dv.Id_producto = p.Id_producto
        JOIN categoria c ON p.Id_categoria = c.Id_categoria
        JOIN venta v ON dv.Id_venta = v.Id_venta
        WHERE v.Fecha_venta BETWEEN %s AND %s
        GROUP BY c.Id_categoria, c.Nombre
        ORDER BY ingresos DESC LIMIT 1
    """, (inicio, fin))
    categoria_top_res = cursor.fetchone()
    categoria_top = categoria_top_res["Nombre"] if categoria_top_res else "N/A"

    # 7. Capital inmovilizado
    cursor.execute("""
        SELECT COALESCE(SUM(i.Cantidad_actual * p.Precio_venta), 0) AS total
        FROM inventario i
        JOIN productos p ON i.Id_producto = p.Id_producto
        WHERE LOWER(i.estado) = 'normal'
    """)
    capital_inmovilizado = cursor.fetchone()["total"]

    # 8. % Stock crítico
    cursor.execute("SELECT COUNT(*) AS total FROM inventario WHERE LOWER(estado)='normal'")
    inventario_total = cursor.fetchone()["total"]
    porcentaje_stock_critico = round((stock_critico / inventario_total) * 100, 2) if inventario_total > 0 else 0
    
    # 9. Top 10 vendidos (Unidades)
    cursor.execute("""
        SELECT p.Nombre, SUM(dv.Cantidad) AS total_vendido
        FROM detalle_venta dv
        JOIN productos p ON dv.Id_producto = p.Id_producto
        JOIN venta v ON dv.Id_venta = v.Id_venta
        WHERE v.Fecha_venta BETWEEN %s AND %s
        GROUP BY p.Id_producto, p.Nombre
        ORDER BY total_vendido DESC LIMIT 10
    """, (inicio, fin))
    top_productos = cursor.fetchall()

    # 10. Top 10 ingresos ($)
    cursor.execute("""
        SELECT p.Nombre, SUM(dv.Subtotal) AS ingresos
        FROM detalle_venta dv
        JOIN productos p ON dv.Id_producto = p.Id_producto
        JOIN venta v ON dv.Id_venta = v.Id_venta
        WHERE v.Fecha_venta BETWEEN %s AND %s
        GROUP BY p.Id_producto, p.Nombre
        ORDER BY ingresos DESC LIMIT 10
    """, (inicio, fin))
    top_ingresos = cursor.fetchall()

    # 11. Tendencia Temporal de Ventas -> ARREGLADO (Agrupando exactamente por la expresión formateada)
    cursor.execute("""
       SELECT
            DATE(v.Fecha_venta) AS fecha,
            SUM(dv.Cantidad) AS unidades_vendidas
        FROM venta v
        INNER JOIN detalle_venta dv
            ON v.Id_venta = dv.Id_venta
        WHERE v.Fecha_venta BETWEEN %s AND %s
        GROUP BY DATE(v.Fecha_venta)
        ORDER BY DATE(v.Fecha_venta);
    """, (inicio, fin))
    tendencia_ventas = cursor.fetchall()

    # 12. Participación financiera por Categorías
    cursor.execute("""
            SELECT
        c.Nombre AS nombre,
        ROUND(SUM(dv.Subtotal),2) AS total
    FROM detalle_venta dv
    INNER JOIN productos p
        ON dv.Id_producto = p.Id_producto
    INNER JOIN categoria c
        ON p.Id_categoria = c.Id_categoria
    INNER JOIN venta v
        ON dv.Id_venta = v.Id_venta
    WHERE v.Fecha_venta BETWEEN %s AND %s
    GROUP BY c.Id_categoria, c.Nombre
    ORDER BY total DESC;
    """, (inicio, fin))
    categorias = cursor.fetchall()

    for categoria in categorias:
        categoria["total"] = float(categoria["total"] or 0)
    
    # 13. Unidades vendidas por categoría
    cursor.execute("""
        SELECT c.Nombre AS categoria, SUM(dv.Cantidad) AS total
        FROM detalle_venta dv
        JOIN productos p ON dv.Id_producto = p.Id_producto
        JOIN categoria c ON p.Id_categoria = c.Id_categoria
        JOIN venta v ON dv.Id_venta = v.Id_venta
        WHERE v.Fecha_venta BETWEEN %s AND %s
        GROUP BY c.Id_categoria, c.Nombre
        ORDER BY total DESC
    """, (inicio, fin))
    categorias_unidades = cursor.fetchall()

    # 14. Estado actual de inventario general
    cursor.execute("SELECT estado, SUM(Cantidad_actual) AS total FROM inventario GROUP BY estado")
    inventario_estado = cursor.fetchall()
    
    # 15. Capital inmovilizado desglosado por Producto
    cursor.execute("""
        SELECT p.Nombre, SUM(i.Cantidad_actual) AS stock, p.Precio_venta,
               (SUM(i.Cantidad_actual) * p.Precio_venta) AS valor
        FROM inventario i
        JOIN productos p ON i.Id_producto = p.Id_producto
        WHERE LOWER(i.estado)='normal'
        GROUP BY p.Id_producto, p.Nombre, p.Precio_venta
        ORDER BY valor DESC LIMIT 15
    """)
    capital_por_producto = cursor.fetchall()

    # 16. Productos con Stock Bajo / Crítico -> ARREGLADO (MySQL requería meter la función DATEDIFF/Fecha_venta bajo un agregado o en GROUP BY)
    cursor.execute("""
            SELECT *
    FROM
    (
        SELECT
            p.Nombre,

            c.Nombre AS categoria,

            i.Cantidad_actual AS stock,

            CEILING(
                (IFNULL(v.ConsumoPromedioDiario,0) * IFNULL(t.TiempoEntrega,0))
                +
                (IFNULL(v.ConsumoPromedioDiario,0) * 5)
            ) AS minimo,

            DATEDIFF(CURDATE(), MAX(ve.Fecha_venta)) AS dias_sin_venta

        FROM productos p

        JOIN inventario i
            ON p.Id_producto = i.Id_producto

        LEFT JOIN categoria c
            ON p.Id_categoria = c.Id_categoria

        LEFT JOIN detalle_venta dv
            ON p.Id_producto = dv.Id_producto

        LEFT JOIN venta ve
            ON dv.Id_venta = ve.Id_venta

        LEFT JOIN
        (
            SELECT
                dv.Id_producto,
                SUM(dv.Cantidad) /
                GREATEST(DATEDIFF(MAX(v.Fecha_venta), MIN(v.Fecha_venta)) + 1,1)
                AS ConsumoPromedioDiario
            FROM detalle_venta dv
            JOIN venta v
                ON dv.Id_venta = v.Id_venta
            GROUP BY dv.Id_producto
        ) v
            ON p.Id_producto = v.Id_producto

        LEFT JOIN
        (
            SELECT
                dc.Id_producto,
                AVG(DATEDIFF(oc.Fecha_entrega_real, oc.Fecha_orden)) AS TiempoEntrega
            FROM detalle_compra dc
            JOIN orden_compra oc
                ON dc.Id_orden_compra = oc.Id_orden_compra
            WHERE oc.Fecha_entrega_real IS NOT NULL
            GROUP BY dc.Id_producto
        ) t
            ON p.Id_producto = t.Id_producto

        WHERE LOWER(i.estado)='normal'

        GROUP BY
            p.Id_producto,
            p.Nombre,
            c.Nombre,
            i.Cantidad_actual,
            v.ConsumoPromedioDiario,
            t.TiempoEntrega
    ) x

    WHERE stock <= minimo

    ORDER BY stock ASC

    LIMIT 15
    """)
    stock_bajo = cursor.fetchall()

    # Limpieza de conexiones
    cursor.close()
    conn.close()

    return jsonify({
        "total_productos": total_productos,
        "productos_vendidos": productos_vendidos,
        "ingresos": float(ingresos_total or 0),
        "producto_top": producto_top,
        "categoria_top": categoria_top,
        "stock_critico": stock_critico,
        "porcentaje_stock_critico": porcentaje_stock_critico,
        "capital_inmovilizado": float(capital_inmovilizado or 0),
        "top_productos": top_productos,
        "top_ingresos": top_ingresos,
        "categorias": categorias,
        "categorias_unidades": categorias_unidades,
        "inventario_estado": inventario_estado,
        "tendencia_ventas": tendencia_ventas,
        "capital_por_producto": capital_por_producto,
        "stock_bajo": stock_bajo
    })




   
# 📌 1. Endpoint auxiliar para el select de sucursales en React
@app.route('/api/sucursales')
def obtener_sucursales():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT Id_sucursal, Nombre FROM sucursal ORDER BY Nombre ASC")
        sucursales = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(sucursales)
    except Exception as e:
        print("Error obteniendo sucursales:", e)
        return jsonify({"error": str(e)}), 500


# 💰 2. Endpoint Reporte de Ventas (Tu código base con el filtro opcional de sucursal)
@app.route('/api/reporte-ventas')
def reporte_ventas():
    inicio = request.args.get('inicio')
    fin = request.args.get('fin')
    id_sucursal = request.args.get('sucursal')  # Capturamos sucursal ('todas' u ID)

    if not inicio or not fin:
        return jsonify({"error": "Faltan las fechas de inicio o fin"}), 400

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    # 🎯 Construcción del condicional de sucursal para tus SQLs
    sucursal_where = ""
    params = [inicio, fin]

    if id_sucursal and id_sucursal != "todas":
        sucursal_where = " AND v.Id_sucursal = %s "
        params.append(id_sucursal)

    # 1. Resumen Financiero General (Ingresos, Transacciones y Ticket Promedio)
    cursor.execute(f"""
        SELECT 
            COALESCE(SUM(v.Total), 0) AS ingresos_totales,
            COUNT(v.Id_venta) AS transacciones_totales,
            COALESCE(AVG(v.Total), 0) AS ticket_promedio
        FROM venta v
        WHERE v.Fecha_venta BETWEEN %s AND %s {sucursal_where}
    """, params)
    resumen = cursor.fetchone()

    # 2. Empleado Estrella (Mayor facturación)
    cursor.execute(f"""
        SELECT e.Nombre, SUM(v.Total) AS total_vendido
        FROM venta v
        JOIN empleados e ON v.Id_empleado = e.Id_empleado
        WHERE v.Fecha_venta BETWEEN %s AND %s {sucursal_where}
        GROUP BY e.Id_empleado, e.Nombre
        ORDER BY total_vendido DESC LIMIT 1
    """, params)
    empleado_top_res = cursor.fetchone()
    empleado_top = empleado_top_res["Nombre"] if empleado_top_res else "N/A"

    # 3. Cliente Más Valioso (Fidelidad / Mayor Gasto)
    cursor.execute(f"""
        SELECT c.Nombre, SUM(v.Total) AS total_gastado
        FROM venta v
        JOIN clientes c ON v.Id_cliente = c.Id_cliente
        WHERE v.Fecha_venta BETWEEN %s AND %s {sucursal_where}
        GROUP BY c.Id_cliente, c.Nombre
        ORDER BY total_gastado DESC LIMIT 1
    """, params)
    cliente_top_res = cursor.fetchone()
    cliente_top = cliente_top_res["Nombre"] if cliente_top_res else "N/A"

    # 4. Tendencia Temporal de Ventas (Evolución de Ingresos del día a día)
    cursor.execute(f"""
        SELECT 
            DATE_FORMAT(v.Fecha_venta, '%Y-%m-%d') AS fecha,
            ROUND(SUM(v.Total), 2) AS ingresos
        FROM venta v
        WHERE v.Fecha_venta BETWEEN %s AND %s {sucursal_where}
        GROUP BY DATE_FORMAT(v.Fecha_venta, '%Y-%m-%d')
        ORDER BY fecha ASC
    """, params)
    tendencia_ventas = cursor.fetchall()
    for t in tendencia_ventas:
        t["ingresos"] = float(t["ingresos"] or 0)

    # 5. Desglose de Ventas por Empleado (Métrica del Personal)
    cursor.execute(f"""
        SELECT 
            e.Nombre AS empleado,
            COUNT(v.Id_venta) AS operaciones,
            ROUND(SUM(v.Total), 2) AS total_facturado
        FROM venta v
        JOIN empleados e ON v.Id_empleado = e.Id_empleado
        WHERE v.Fecha_venta BETWEEN %s AND %s {sucursal_where}
        GROUP BY e.Id_empleado, e.Nombre
        ORDER BY total_facturado DESC
    """, params)
    ventas_empleados = cursor.fetchall()
    for emp in ventas_empleados:
        emp["total_facturado"] = float(emp["total_facturado"] or 0)

    # 6. Historial Detallado de Grandes Transacciones (Auditoría)
    cursor.execute(f"""
        SELECT 
            v.Id_venta,
            DATE_FORMAT(v.Fecha_venta, '%Y-%m-%d') AS Fecha_venta,
            c.Nombre AS cliente,
            e.Nombre AS empleado,
            ROUND(v.Total, 2) AS total
        FROM venta v
        JOIN clientes c ON v.Id_cliente = c.Id_cliente
        JOIN empleados e ON v.Id_empleado = e.Id_empleado
        WHERE v.Fecha_venta BETWEEN %s AND %s {sucursal_where}
        ORDER BY v.Total DESC LIMIT 10
    """, params)
    top_transacciones = cursor.fetchall()
    for trans in top_transacciones:
        trans["total"] = float(trans["total"] or 0)

    # 7. Volumen Transaccional vs Recaudación Diaria (Gráfica combinada)
    cursor.execute(f"""
        SELECT 
            DATE_FORMAT(v.Fecha_venta, '%Y-%m-%d') AS fecha,
            COUNT(v.Id_venta) AS transacciones,
            ROUND(SUM(v.Total), 2) AS recaudacion
        FROM venta v
        WHERE v.Fecha_venta BETWEEN %s AND %s {sucursal_where}
        GROUP BY DATE_FORMAT(v.Fecha_venta, '%Y-%m-%d')
        ORDER BY fecha ASC
    """, params)
    volumen_vs_recaudacion = cursor.fetchall()
    for registro in volumen_vs_recaudacion:
        registro["recaudacion"] = float(registro["recaudacion"] or 0)    
        
    # 8. Ventas por Categoría (Tu consulta original exacta)
    cursor.execute(f"""
        SELECT 
            COALESCE(c.Nombre, 'Sin Categoría') AS categoria,
            COUNT(d.Id_venta) AS unidades_vendidas,
            ROUND(SUM(d.Cantidad * d.Precio_unitario), 2) AS total_facturado
        FROM detalle_venta d
        JOIN productos p ON d.Id_producto = p.Id_producto
        LEFT JOIN categoria c ON p.Id_categoria = c.Id_Categoria
        JOIN venta v ON d.Id_venta = v.Id_venta
        WHERE v.Fecha_venta BETWEEN %s AND %s {sucursal_where}
        GROUP BY c.Id_Categoria, c.Nombre
        ORDER BY total_facturado DESC
    """, params)
    ventas_categorias = cursor.fetchall()
    for cat in ventas_categorias:
        cat["total_facturado"] = float(cat["total_facturado"] or 0)
    
    # 9. Top 10 Clientes que más compran (Fidelidad y Facturación)
    cursor.execute(f"""
        SELECT 
            c.Id_cliente,
            c.Nombre AS cliente,
            COUNT(v.Id_venta) AS total_compras,
            ROUND(SUM(v.Total), 2) AS total_gastado
        FROM venta v
        JOIN clientes c ON v.Id_cliente = c.Id_cliente
        WHERE v.Fecha_venta BETWEEN %s AND %s {sucursal_where}
        GROUP BY c.Id_cliente, c.Nombre
        ORDER BY total_gastado DESC 
        LIMIT 10
    """, params)
    top_clientes = cursor.fetchall()
    for cli in top_clientes:
        cli["total_gastado"] = float(cli["total_gastado"] or 0)

    # 10. Top 10 Productos Más Vendidos
    cursor.execute(f"""
        SELECT 
            p.Nombre AS producto,
            SUM(d.Cantidad) AS unidades_vendidas,
            ROUND(SUM(d.Cantidad * d.Precio_unitario), 2) AS total_generado
        FROM detalle_venta d
        JOIN productos p ON d.Id_producto = p.Id_producto
        JOIN venta v ON d.Id_venta = v.Id_venta
        WHERE v.Fecha_venta BETWEEN %s AND %s {sucursal_where}
        GROUP BY p.Id_producto, p.Nombre
        ORDER BY unidades_vendidas DESC 
        LIMIT 10
    """, params)
    top_productos = cursor.fetchall()
    for prod in top_productos:
        prod["total_generado"] = float(prod["total_generado"] or 0)
        prod["unidades_vendidas"] = int(prod["unidades_vendidas"] or 0)
    
    
    # 11. Desglose por Canal de Venta
    cursor.execute(f"""
        SELECT 
            COALESCE(v.Canal, 'Presencial / Online') AS canal,
            COUNT(v.Id_venta) AS operaciones,
            ROUND(SUM(v.Total), 2) AS total_monto
        FROM venta v
        WHERE v.Fecha_venta BETWEEN %s AND %s {sucursal_where}
        GROUP BY v.Canal
        ORDER BY total_monto DESC
    """, params)
    canales_venta = cursor.fetchall()
    for c in canales_venta:
        c["total_monto"] = float(c["total_monto"] or 0)
    
    cursor.close()
    conn.close()

    return jsonify({
        "ingresos_totales": float(resumen["ingresos_totales"] or 0),
        "transacciones_totales": resumen["transacciones_totales"] or 0,
        "ticket_promedio": float(resumen["ticket_promedio"] or 0),
        "empleado_top": empleado_top,
        "cliente_top": cliente_top,
        "tendencia_ventas": tendencia_ventas,
        "ventas_empleados": ventas_empleados,
        "top_transacciones": top_transacciones,
        "volumen_vs_recaudacion": volumen_vs_recaudacion,
        "ventas_categorias": ventas_categorias,
        "top_clientes": top_clientes,
        "top_productos":top_productos,
        "canales_venta": canales_venta
    })




# 📌 Endpoint para el Reporte Consolidado de Órdenes de Compra (Actualizado)
@app.route('/api/reporte-ordenes')
def reporte_ordenes():
    try:
        inicio = request.args.get('inicio')
        fin = request.args.get('fin')
        sucursal = request.args.get('sucursal')

        conn = conectar_bd()
        cursor = conn.cursor(dictionary=True)

        params = []
        where_conditions = []

        if inicio and fin:
            where_conditions.append("oc.Fecha_orden BETWEEN %s AND %s")
            params.extend([inicio, fin])

        if sucursal and sucursal != "todas":
            where_conditions.append("oc.Id_sucursal = %s")
            params.append(sucursal)

        where_clause = " WHERE " + " AND ".join(where_conditions) if where_conditions else ""

        # 1. Métricas / Totales Generales
        query_stats = f"""
            SELECT 
                COUNT(*) AS total_ordenes,
                COALESCE(SUM(oc.Costo_total), 0) AS inversion_total,
                COALESCE(AVG(oc.Costo_total), 0) AS orden_promedio,
                COUNT(CASE WHEN LOWER(oc.Estado) = 'pendiente' THEN 1 END) AS pendientes,
                COUNT(CASE WHEN LOWER(oc.Estado) IN ('completada', 'entregada') THEN 1 END) AS completadas,
                COUNT(CASE WHEN LOWER(oc.Estado) = 'cancelada' THEN 1 END) AS canceladas
            FROM orden_compra oc
            {where_clause}
        """
        cursor.execute(query_stats, params)
        stats = cursor.fetchone()

        # 2. Inversión por Proveedor
        query_proveedores = f"""
            SELECT 
                p.Nombre AS proveedor,
                COUNT(oc.Id_orden_compra) AS total_ordenes,
                COALESCE(SUM(oc.Costo_total), 0) AS total_invertido
            FROM orden_compra oc
            JOIN proveedores p ON oc.Id_proveedor = p.Id_proveedor
            {where_clause}
            GROUP BY p.Id_proveedor, p.Nombre
            ORDER BY total_invertido DESC
            LIMIT 10
        """
        cursor.execute(query_proveedores, params)
        ventas_proveedores = cursor.fetchall()

        # 3. Distribución por Estado de Orden
        query_estados = f"""
            SELECT 
                oc.Estado AS estado,
                COUNT(*) AS cantidad,
                COALESCE(SUM(oc.Costo_total), 0) AS total_monto
            FROM orden_compra oc
            {where_clause}
            GROUP BY oc.Estado
        """
        cursor.execute(query_estados, params)
        distribucion_estados = cursor.fetchall()

        # 4. Tendencia Diaria de Compras
        query_tendencia = f"""
            SELECT 
                DATE_FORMAT(oc.Fecha_orden, '%Y-%m-%d') AS fecha,
                COUNT(*) AS ordenes,
                COALESCE(SUM(oc.Costo_total), 0) AS inversion
            FROM orden_compra oc
            {where_clause}
            GROUP BY DATE_FORMAT(oc.Fecha_orden, '%Y-%m-%d')
            ORDER BY fecha ASC
        """
        cursor.execute(query_tendencia, params)
        tendencia_compras = cursor.fetchall()

        # 5. NUEVO: Gestión de Logística y Tipos de Envío
        query_envios = f"""
            SELECT 
                COALESCE(oc.Tipo_envio, 'No especificado') AS tipo_envio,
                COUNT(*) AS cantidad,
                COALESCE(SUM(oc.Costo_total), 0) AS total_invertido
            FROM orden_compra oc
            {where_clause}
            GROUP BY oc.Tipo_envio
            ORDER BY cantidad DESC
        """
        cursor.execute(query_envios, params)
        tipos_envio = cursor.fetchall()

        # 6. NUEVO: Productos / Ítems más ordenados
        
        query_productos = f"""
            SELECT 
                p.Nombre AS producto,
                SUM(dc.Cantidad) AS cantidad_total,
                COALESCE(SUM(dc.Cantidad * dc.Precio_unitario), 0) AS total_gastado
            FROM detalle_compra dc
            JOIN orden_compra oc ON dc.Id_orden_compra = oc.Id_orden_compra
            LEFT JOIN productos p ON dc.Id_producto = p.Id_producto
            {where_clause}
            GROUP BY p.Id_producto, p.Nombre
            ORDER BY cantidad_total DESC
            LIMIT 10
        """
        try:
            cursor.execute(query_productos, params)
            productos_mas_ordenados = cursor.fetchall()
        except Exception as err_prod:
            print("Aviso: No se pudo obtener detalle de productos:", err_prod)
            productos_mas_ordenados = []

        # 7. Listado de Órdenes Relevantes / Detalle
        query_detalle = f"""
            SELECT 
                oc.Id_orden_compra,
                p.Nombre AS proveedor,
                s.Nombre AS sucursal,
                DATE_FORMAT(oc.Fecha_orden, '%Y-%m-%d') AS fecha_orden,
                DATE_FORMAT(oc.Fecha_entrega_estimada, '%Y-%m-%d') AS fecha_estimada,
                DATE_FORMAT(oc.Fecha_entrega_real, '%Y-%m-%d') AS fecha_real,
                oc.Estado,
                oc.Tipo_envio,
                oc.Costo_total
            FROM orden_compra oc
            LEFT JOIN proveedores p ON oc.Id_proveedor = p.Id_proveedor
            LEFT JOIN sucursal s ON oc.Id_sucursal = s.Id_sucursal
            {where_clause}
            ORDER BY oc.Fecha_orden DESC
            LIMIT 15
        """
        cursor.execute(query_detalle, params)
        detalle_ordenes = cursor.fetchall()

        cursor.close()
        conn.close()

        # Conversiones para JSON
        for p in ventas_proveedores:
            p['total_invertido'] = float(p['total_invertido'])
        for e in distribucion_estados:
            e['total_monto'] = float(e['total_monto'])
        for t in tendencia_compras:
            t['inversion'] = float(t['inversion'])
        for env in tipos_envio:
            env['total_invertido'] = float(env['total_invertido'])
        for prod in productos_mas_ordenados:
            prod['cantidad_total'] = int(prod['cantidad_total'] or 0)
            prod['total_gastado'] = float(prod['total_gastado'] or 0)
        for d in detalle_ordenes:
            d['Costo_total'] = float(d['Costo_total'])

        return jsonify({
            "total_ordenes": int(stats['total_ordenes']),
            "inversion_total": float(stats['inversion_total']),
            "orden_promedio": float(stats['orden_promedio']),
            "pendientes": int(stats['pendientes']),
            "completadas": int(stats['completadas']),
            "canceladas": int(stats['canceladas']),
            "ventas_proveedores": ventas_proveedores,
            "distribucion_estados": distribucion_estados,
            "tendencia_compras": tendencia_compras,
            "tipos_envio": tipos_envio,
            "productos_mas_ordenados": productos_mas_ordenados,
            "detalle_ordenes": detalle_ordenes
        })

    except Exception as e:
        print("Error en reporte_ordenes:", e)
        return jsonify({"error": str(e)}), 500



 
@app.route('/api/reporte-inventario', methods=['GET'])
def reporte_inventario():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    # Capturar parámetros de fecha enviados por el frontend
    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')

    # Rangos por defecto en caso de que no se envíen
    if not fecha_fin:
        fecha_fin = datetime.now().strftime('%Y-%m-%d')
    if not fecha_inicio:
        fecha_inicio = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')

    # 1. KPIs Generales utilizando 'Precio_base' e 'inventario' (Original)
    cursor.execute("""
        SELECT 
            COUNT(DISTINCT p.Id_producto) AS total_productos,
            SUM(i.Cantidad_actual) AS unidades_totales,
            ROUND(SUM(i.Cantidad_actual * p.Precio_base), 2) AS capital_inmovilizado
        FROM productos p
        JOIN inventario i ON p.Id_producto = i.Id_producto
        WHERE LOWER(i.estado) = 'normal'
    """)
    resumen = cursor.fetchone()

    # 2. Distribución de Existencias y Capital por ALMACÉN (Original)
    cursor.execute("""
       SELECT 
            al.Nombre AS almacen,
            s.Ubicacion AS ubicacion,
            COUNT(DISTINCT i.Id_producto) AS variedades,
            SUM(i.Cantidad_actual) AS unidades,
            ROUND(SUM(i.Cantidad_actual * p.Precio_base), 2) AS capital_almacen
        FROM inventario i
        JOIN almacen al ON i.Id_almacen = al.Id_almacen
        JOIN sucursal s ON al.Id_sucursal = s.Id_sucursal
        JOIN productos p ON i.Id_producto = p.Id_producto
        WHERE LOWER(i.estado) = 'normal'
        GROUP BY al.Id_almacen, al.Nombre, s.Ubicacion
        ORDER BY capital_almacen DESC
    """)
    inventario_almacenes = cursor.fetchall()
    for alm in inventario_almacenes:
        alm["capital_almacen"] = float(alm["capital_almacen"] or 0)
        alm["unidades"] = int(alm["unidades"] or 0)
        alm["variedades"] = int(alm["variedades"] or 0)
        
    # 3. Distribución Financiera por Categoría (Original)
    cursor.execute("""
        SELECT 
            c.Nombre AS categoria,
            SUM(i.Cantidad_actual) AS stock_categoria,
            ROUND(SUM(i.Cantidad_actual * p.Precio_base), 2) AS inversion_categoria
        FROM productos p
        JOIN inventario i ON p.Id_producto = i.Id_producto
        JOIN categoria c ON p.Id_categoria = c.Id_categoria
        WHERE LOWER(i.estado) = 'normal'
        GROUP BY c.Id_categoria, c.Nombre
        ORDER BY inversion_categoria DESC
    """)
    distribucion_categorias = cursor.fetchall()
    for cat in distribucion_categorias:
        cat["inversion_categoria"] = float(cat["inversion_categoria"] or 0)
        cat["stock_categoria"] = int(cat["stock_categoria"] or 0)

    # 4. Top 10 Artículos con Mayor Capital Inmovilizado (Original)
    cursor.execute("""
        SELECT 
            p.Id_producto,
            p.Nombre AS producto,
            c.Nombre AS categoria,
            SUM(i.Cantidad_actual) AS stock,
            ROUND(p.Precio_base, 2) AS costo_unitario,
            ROUND(SUM(i.Cantidad_actual * p.Precio_base), 2) AS valor_total
        FROM productos p
        JOIN inventario i ON p.Id_producto = i.Id_producto
        JOIN categoria c ON p.Id_categoria = c.Id_categoria
        WHERE LOWER(i.estado) = 'normal'
        GROUP BY p.Id_producto, p.Nombre, c.Nombre, p.Precio_base
        HAVING stock > 0
        ORDER BY valor_total DESC
        LIMIT 10
    """)
    top_inversion = cursor.fetchall()
    for item in top_inversion:
        item["costo_unitario"] = float(item["costo_unitario"] or 0)
        item["valor_total"] = float(item["valor_total"] or 0)
        item["stock"] = int(item["stock"] or 0)

    # 5. Auditoría Dinámica Completa usando tu Query Predictiva (CON FILTRO DE FECHAS)
    cursor.execute("""
        SELECT x.* FROM (
            SELECT
                p.Id_producto,
                p.Nombre AS producto,
                IFNULL(i.Cantidad_actual, 0) AS stock,
                CEILING(IFNULL(v.ConsumoPromedioDiario, 0)) AS consumo_diario,
                CEILING(IFNULL(c.TiempoEntrega, 0)) AS tiempo_entrega,
                CEILING(IFNULL(v.ConsumoPromedioDiario, 0) * 5) AS stock_seguridad,
                CEILING(
                    (IFNULL(v.ConsumoPromedioDiario, 0) * IFNULL(c.TiempoEntrega, 0))
                    +
                    (IFNULL(v.ConsumoPromedioDiario, 0) * 5)
                ) AS minimo
            FROM productos p
            LEFT JOIN inventario i ON p.Id_producto = i.Id_producto
            LEFT JOIN (
                SELECT
                    dv.Id_producto,
                    SUM(dv.Cantidad) / GREATEST(DATEDIFF(MAX(v.Fecha_venta), MIN(v.Fecha_venta)) + 1, 1) AS ConsumoPromedioDiario
                FROM detalle_venta dv
                INNER JOIN venta v ON dv.Id_venta = v.Id_venta
                WHERE v.Fecha_venta BETWEEN %s AND %s
                GROUP BY dv.Id_producto
            ) v ON p.Id_producto = v.Id_producto
            LEFT JOIN (
                SELECT
                    dc.Id_producto,
                    AVG(DATEDIFF(oc.Fecha_entrega_real, oc.Fecha_orden)) AS TiempoEntrega
                FROM detalle_compra dc
                INNER JOIN orden_compra oc ON dc.Id_orden_compra = oc.Id_orden_compra
                WHERE oc.Fecha_entrega_real IS NOT NULL AND oc.Fecha_orden BETWEEN %s AND %s
                GROUP BY dc.Id_producto
            ) c ON p.Id_producto = c.Id_producto
            WHERE LOWER(i.estado) = 'normal'
        ) x
        WHERE x.stock <= x.minimo
        ORDER BY x.stock ASC
    """, (fecha_inicio, fecha_fin, fecha_inicio, fecha_fin))
    
    lista_criticos = cursor.fetchall()
    productos_criticos = len(lista_criticos)

    cursor.close()
    conn.close()

    return jsonify({
        "total_productos": resumen["total_productos"] or 0,
        "unidades_totales": int(resumen["unidades_totales"] or 0),
        "capital_inmovilizado": float(resumen["capital_inmovilizado"] or 0),
        "productos_criticos": productos_criticos,
        "inventario_almacenes": inventario_almacenes,
        "distribucion_categorias": distribucion_categorias,
        "top_inversion": top_inversion,
        "lista_criticos": lista_criticos[:15]  # Limitado a los 15 más urgentes tal cual tu return
    })
 
 
@app.route('/api/reporte-proveedores', methods=['GET'])
def reporte_proveedores():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    # 1. Capturar parámetros de fecha
    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')

    # Rango por defecto (últimos 12 meses si no se especifican)
    if not fecha_fin:
        fecha_fin = datetime.now().strftime('%Y-%m-%d')
    if not fecha_inicio:
        fecha_inicio = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')

    # 1. KPIs Generales de Abastecimiento en el periodo
    cursor.execute("""
        SELECT 
            COALESCE(COUNT(DISTINCT Id_proveedor), 0) AS total_proveedores,
            COALESCE(COUNT(Id_orden_compra), 0) AS total_ordenes,
            ROUND(COALESCE(SUM(Costo_total), 0), 2) AS inversion_total
        FROM orden_compra
        WHERE Fecha_orden BETWEEN %s AND %s
    """, (fecha_inicio, fecha_fin))
    kpis = cursor.fetchone()

    # 2. Análisis del Desempeño de Proveedores en el periodo (CORREGIDO EXACTO)
    cursor.execute("""
        SELECT 
            prov.Id_proveedor,
            prov.Nombre AS proveedor,
            COUNT(DISTINCT oc.Id_orden_compra) AS total_compras,
            ROUND(COALESCE(SUM(dc.Cantidad * dc.Precio_unitario), 0), 2) AS total_invertido,
            ROUND(COALESCE(AVG(DATEDIFF(oc.Fecha_entrega_real, oc.Fecha_orden)), 0), 1) AS tiempo_entrega_promedio,
            -- Confiabilidad usando tu fórmula original adaptada al periodo
            ROUND(
                COALESCE(
                    SUM(CASE WHEN oc.Fecha_entrega_real <= oc.Fecha_entrega_estimada THEN 1 ELSE 0 END) * 100.0 / 
                    NULLIF(COUNT(oc.Id_orden_compra), 0), 
                    100.0
                ), 1
            ) AS confiabilidad,
            prov.Contacto_telefono,
            prov.Contacto_email,
            prov.Pais,
            prov.Ubicacion
        FROM proveedores prov
        LEFT JOIN orden_compra oc ON prov.Id_proveedor = oc.Id_proveedor AND oc.Fecha_orden BETWEEN %s AND %s
        LEFT JOIN detalle_compra dc ON oc.Id_orden_compra = dc.Id_orden_compra
        GROUP BY prov.Id_proveedor, prov.Nombre, prov.Contacto_telefono, prov.Contacto_email, prov.Pais, prov.Ubicacion
        ORDER BY total_invertido DESC
    """, (fecha_inicio, fecha_fin))
    lista_proveedores = cursor.fetchall()
    
    # Sanitizar tipos de datos para evitar errores en JSON
    for prov in lista_proveedores:
        prov["total_compras"] = int(prov["total_compras"] or 0)
        prov["total_invertido"] = float(prov["total_invertido"] or 0)
        prov["tiempo_entrega_promedio"] = float(prov["tiempo_entrega_promedio"] or 0)
        prov["confiabilidad"] = float(prov["confiabilidad"] or 100.0)

    # 3. Órdenes Críticas Actualmente Retrasadas que correspondan a ese periodo
    cursor.execute("""
         SELECT 
            oc.Id_orden_compra,
            prov.Nombre AS proveedor,
            oc.Fecha_orden,
            oc.Fecha_entrega_estimada,
            DATEDIFF(CURDATE(), oc.Fecha_entrega_estimada) AS dias_retraso,
            oc.Estado
        FROM orden_compra oc
        JOIN proveedores prov ON oc.Id_proveedor = prov.Id_proveedor
        WHERE oc.Fecha_entrega_real IS NULL 
          AND oc.Fecha_entrega_estimada < CURDATE() 
          AND (oc.Estado = 'En tránsito' OR oc.Estado = 'Pendiente')
          AND oc.Fecha_orden BETWEEN %s AND %s
        ORDER BY dias_retraso DESC
    """, (fecha_inicio, fecha_fin))
    ordenes_retrasadas = cursor.fetchall()

    for orden in ordenes_retrasadas:
        orden["Fecha_orden"] = str(orden["Fecha_orden"])
        orden["Fecha_entrega_estimada"] = str(orden["Fecha_entrega_estimada"])

    cursor.close()
    conn.close()

    return jsonify({
        "total_proveedores": int(kpis["total_proveedores"]),
        "total_ordenes": int(kpis["total_ordenes"]),
        "inversion_total": float(kpis["inversion_total"] or 0),
        "lista_proveedores": lista_proveedores,
        "ordenes_retrasadas": ordenes_retrasadas
    }) 
 
@app.route('/api/reporte-compras')
def reporte_compras():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    # Capturar fechas desde el frontend (Query Params)
    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')

    # Rango por defecto (últimos 12 meses) si no se envían parámetros
    if not fecha_fin:
        fecha_fin = datetime.now().strftime('%Y-%m-%d')
    if not fecha_inicio:
        fecha_inicio = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')

    # Filtros SQL basados en parámetros seguros
    where_fecha = "AND oc.Fecha_orden BETWEEN %s AND %s"
    where_fecha_oc_solamente = "WHERE Fecha_orden BETWEEN %s AND %s"

    # 1. KPIs Avanzados Generales (Inversión, Unidades, Ticket Promedio, Lead Time del Periodo)
    cursor.execute(f"""
        SELECT 
            COUNT(DISTINCT oc.Id_orden_compra) AS total_ordenes,
            IFNULL(SUM(dc.Cantidad), 0) AS unidades_compradas,
            ROUND(IFNULL(SUM(dc.Cantidad * dc.Precio_unitario), 0), 2) AS inversion_total,
            ROUND(IFNULL(SUM(dc.Cantidad * dc.Precio_unitario), 0) / GREATEST(COUNT(DISTINCT CASE WHEN LOWER(oc.Estado) != 'cancelada' THEN oc.Id_orden_compra END), 1), 2) AS ticket_promedio,
            -- Lead Time Promedio del periodo seleccionado (Solo órdenes completadas con entrega real)
            ROUND(AVG(DATEDIFF(oc.Fecha_entrega_real, oc.Fecha_orden)), 1) AS lead_time_promedio,
            -- Tasa de Cancelación del periodo
            ROUND(SUM(CASE WHEN LOWER(oc.Estado) = 'cancelada' THEN 1 ELSE 0 END) * 100.0 / COUNT(oc.Id_orden_compra), 1) AS tasa_cancelacion
        FROM orden_compra oc
        LEFT JOIN detalle_compra dc ON oc.Id_orden_compra = dc.Id_orden_compra
        WHERE oc.Fecha_orden BETWEEN %s AND %s
    """, (fecha_inicio, fecha_fin))
    resumen = cursor.fetchone()

    # 2. Distribución del Gasto por Estado de la Orden
    cursor.execute(f"""
        SELECT 
            Estado AS estado,
            COUNT(Id_orden_compra) AS cantidad,
            ROUND(IFNULL(SUM(Costo_total), 0), 2) AS valor_total
        FROM orden_compra
        {where_fecha_oc_solamente}
        GROUP BY Estado
    """, (fecha_inicio, fecha_fin))
    estados_ordenes = cursor.fetchall()
    for est in estados_ordenes:
        est["valor_total"] = float(est["valor_total"] or 0)

    # 3. Top 5 Categorías con Mayor Inversión
    cursor.execute(f"""
        SELECT 
            c.Nombre AS categoria,
            SUM(dc.Cantidad) AS unidades,
            ROUND(SUM(dc.Cantidad * dc.Precio_unitario), 2) AS total_invertido
        FROM detalle_compra dc
        JOIN productos p ON dc.Id_producto = p.Id_producto
        JOIN categoria c ON p.Id_categoria = c.Id_categoria
        JOIN orden_compra oc ON dc.Id_orden_compra = oc.Id_orden_compra
        WHERE LOWER(oc.Estado) != 'cancelada' {where_fecha}
        GROUP BY c.Id_categoria, c.Nombre
        ORDER BY total_invertido DESC
        LIMIT 5
    """, (fecha_inicio, fecha_fin))
    categorias_top = cursor.fetchall()
    for cat in categorias_top:
        cat["total_invertido"] = float(cat["total_invertido"] or 0)

    # 4. Concentración de Compras por Proveedor (Pareto Logístico)
    cursor.execute(f"""
        SELECT 
            prov.Nombre AS proveedor,
            COUNT(DISTINCT oc.Id_orden_compra) AS ordenes,
            ROUND(SUM(dc.Cantidad * dc.Precio_unitario), 2) AS monto_total
        FROM orden_compra oc
        JOIN proveedores prov ON oc.Id_proveedor = prov.Id_proveedor
        JOIN detalle_compra dc ON oc.Id_orden_compra = dc.Id_orden_compra
        WHERE LOWER(oc.Estado) != 'cancelada' {where_fecha}
        GROUP BY prov.Id_proveedor, prov.Nombre
        ORDER BY monto_total DESC
        LIMIT 5
    """, (fecha_inicio, fecha_fin))
    top_proveedores_gasto = cursor.fetchall()
    for prov in top_proveedores_gasto:
        prov["monto_total"] = float(prov["monto_total"] or 0)

    # 5. Línea de Tiempo Dinámica: Gasto Mensual
    cursor.execute(f"""
        SELECT 
            DATE_FORMAT(oc.Fecha_orden, '%Y-%m') AS periodo,
            ROUND(SUM(dc.Cantidad * dc.Precio_unitario), 2) AS monto
        FROM orden_compra oc
        JOIN detalle_compra dc ON oc.Id_orden_compra = dc.Id_orden_compra
        WHERE LOWER(oc.Estado) != 'cancelada' {where_fecha}
        GROUP BY DATE_FORMAT(oc.Fecha_orden, '%Y-%m')
        ORDER BY periodo ASC
    """, (fecha_inicio, fecha_fin))
    evolucion_gasto = cursor.fetchall()
    for evo in evolucion_gasto:
        evo["monto"] = float(evo["monto"] or 0)

    # 6. Historial Completo Filtrado
    cursor.execute(f"""
        SELECT 
            oc.Id_orden_compra,
            prov.Nombre AS proveedor,
            oc.Fecha_orden,
            oc.Estado,
            ROUND(oc.Costo_total, 2) AS total
        FROM orden_compra oc
        JOIN proveedores prov ON oc.Id_proveedor = prov.Id_proveedor
        WHERE oc.Fecha_orden BETWEEN %s AND %s
        ORDER BY oc.Fecha_orden DESC
    """, (fecha_inicio, fecha_fin))
    historial_ordenes = cursor.fetchall()
    for ord in historial_ordenes:
        ord["total"] = float(ord["total"] or 0)
        ord["Fecha_orden"] = str(ord["Fecha_orden"])

    cursor.close()
    conn.close()

    return jsonify({
        "inversion_total": float(resumen["inversion_total"] or 0),
        "unidades_compradas": int(resumen["unidades_compradas"] or 0),
        "total_ordenes": resumen["total_ordenes"] or 0,
        "ticket_promedio": float(resumen["ticket_promedio"] or 0),
        "lead_time_promedio": float(resumen["lead_time_promedio"] or 0),
        "tasa_cancelacion": float(resumen["tasa_cancelacion"] or 0),
        "estados_ordenes": estados_ordenes,
        "categorias_top": categorias_top,
        "top_proveedores_gasto": top_proveedores_gasto,
        "evolucion_gasto": evolucion_gasto,
        "historial_ordenes": historial_ordenes
    })
 
 
 
@app.route('/api/reporte-clientes')
def reporte_clientes():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    # Capturar fechas desde el frontend (Query Params)
    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')

    # Rango por defecto: últimos 12 meses si viene vacío
    if not fecha_fin:
        fecha_fin = datetime.now().strftime('%Y-%m-%d')
    if not fecha_inicio:
        fecha_inicio = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')

    # Filtros SQL basados en las fechas de las ventas/facturas
    where_fecha = "WHERE v.Fecha_venta BETWEEN %s AND %s"

    # 1. KPIs Generales del Comportamiento de Clientes
    cursor.execute(f"""
        SELECT 
            COUNT(DISTINCT v.Id_cliente) AS clientes_activos,
            COUNT(v.Id_venta) AS total_transacciones,
            ROUND(IFNULL(SUM(v.Total), 0), 2) AS facturacion_total,
            -- Ticket Promedio General
            ROUND(IFNULL(SUM(v.Total), 0) / GREATEST(COUNT(v.Id_venta), 1), 2) AS ticket_promedio_general
        FROM venta v
        {where_fecha}
    """, (fecha_inicio, fecha_fin))
    resumen = cursor.fetchone()

    # 2. Top 10 Clientes que Más Capital han Aportado (Ranking CLV)
    cursor.execute(f"""
        SELECT 
            c.Id_cliente,
            c.Nombre AS cliente,
            c.Contacto_telefono,
            c.Contacto_email,
            COUNT(v.Id_venta) AS compras_realizadas,
            ROUND(SUM(v.Total), 2) AS total_gastado,
            ROUND(SUM(v.Total) / COUNT(v.Id_venta), 2) AS ticket_promedio
        FROM clientes c
        JOIN venta v ON c.Id_cliente = v.Id_cliente
        {where_fecha}
        GROUP BY c.Id_cliente, c.Nombre, c.Contacto_telefono, c.Contacto_email
        ORDER BY total_gastado DESC
        LIMIT 10
    """, (fecha_inicio, fecha_fin))
    top_clientes = cursor.fetchall()
    for cl in top_clientes:
        cl["total_gastado"] = float(cl["total_gastado"] or 0)
        cl["ticket_promedio"] = float(cl["ticket_promedio"] or 0)

    # 3. Evolución Temporal de Ventas/Ingresos por Mes (Línea de tendencia)
    cursor.execute(f"""
        SELECT 
            DATE_FORMAT(v.Fecha_venta, '%Y-%m') AS periodo,
            COUNT(DISTINCT v.Id_cliente) AS compradores_unicos,
            ROUND(SUM(v.Total), 2) AS ingresos
        FROM venta v
        {where_fecha}
        GROUP BY DATE_FORMAT(v.Fecha_venta, '%Y-%m')
        ORDER BY periodo ASC
    """, (fecha_inicio, fecha_fin))
    evolucion_clientes = cursor.fetchall()
    for evo in evolucion_clientes:
        evo["ingresos"] = float(evo["ingresos"] or 0)

    # 4. Segmentación de Clientes por volumen de compra (Para gráfico de dona)
    cursor.execute(f"""
        SELECT 
            CASE 
                WHEN sub.total_gastado >= 50000 THEN 'Premium (>= 50K)'
                WHEN sub.total_gastado BETWEEN 15000 AND 49999 THEN 'Regular (15K - 50K)'
                ELSE 'Ocasional (< 15K)'
            END AS segmento,
            COUNT(sub.Id_cliente) AS cantidad_clientes,
            ROUND(SUM(sub.total_gastado), 2) AS aporte_financiero
        FROM (
            SELECT Id_cliente, SUM(Total) AS total_gastado
            FROM venta v
            {where_fecha}
            GROUP BY Id_cliente
        ) sub
        GROUP BY segmento
    """, (fecha_inicio, fecha_fin))
    segmentacion = cursor.fetchall()
    for seg in segmentacion:
        seg["aporte_financiero"] = float(seg["aporte_financiero"] or 0)

    
    # 1. KPIs Generales + CICLO PROMEDIO ENTRE COMPRAS
    cursor.execute(f"""
        SELECT 
            COUNT(DISTINCT v.Id_cliente) AS clientes_activos,
            COUNT(v.Id_venta) AS total_transacciones,
            ROUND(IFNULL(SUM(v.Total), 0), 2) AS facturacion_total,
            ROUND(IFNULL(SUM(v.Total), 0) / GREATEST(COUNT(v.Id_venta), 1), 2) AS ticket_promedio_general
        FROM venta v
        {where_fecha}
    """, (fecha_inicio, fecha_fin))
    resumen = cursor.fetchone()

    # 1.1 Consulta para calcular el promedio de días entre compras por cliente recurrente
    cursor.execute(f"""
        SELECT ROUND(AVG(dias_diferencia), 0) AS ciclo_dias_promedio
        FROM (
            SELECT 
                v.Id_cliente,
                DATEDIFF(
                    v.Fecha_venta, 
                    LAG(v.Fecha_venta) OVER (PARTITION BY v.Id_cliente ORDER BY v.Fecha_venta)
                ) AS dias_diferencia
            FROM venta v
            {where_fecha}
        ) sub
        WHERE dias_diferencia IS NOT NULL AND dias_diferencia > 0
    """, (fecha_inicio, fecha_fin))
    ciclo_res = cursor.fetchone()
    ciclo_dias = int(ciclo_res["ciclo_dias_promedio"]) if ciclo_res and ciclo_res["ciclo_dias_promedio"] else 0
    
    
    cursor.close()
    conn.close()

    return jsonify({
      "facturacion_total": float(resumen["facturacion_total"] or 0),
        "total_transacciones": int(resumen["total_transacciones"] or 0),
        "clientes_activos": int(resumen["clientes_activos"] or 0),
        "ticket_promedio_general": float(resumen["ticket_promedio_general"] or 0),
        "ciclo_dias_promedio": ciclo_dias,
        "top_clientes": top_clientes,
        "evolucion_clientes": evolucion_clientes,
        "segmentacion": segmentacion
    })
 
 
 

# 2. Endpoint del reporte con filtro de fechas + sucursal
@app.route('/api/reporte-empleados')
def reporte_empleados():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')
    id_sucursal = request.args.get('id_sucursal')

    if not fecha_fin:
        fecha_fin = datetime.now().strftime('%Y-%m-%d')
    if not fecha_inicio:
        fecha_inicio = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')

    # Construir filtros dinámicos SQL
    where_venta = "WHERE v.Fecha_venta BETWEEN %s AND %s"
    params_venta = [fecha_inicio, fecha_fin]

    where_empleado = "WHERE e.Fecha_ingreso BETWEEN %s AND %s"
    params_empleado = [fecha_inicio, fecha_fin]

    # Filtro base sin rango de fechas de ingreso para distribución total de cargos
    where_cargo = "WHERE 1=1"
    params_cargo = []

    if id_sucursal and id_sucursal != "todas":
        where_venta += " AND v.Id_sucursal = %s"
        params_venta.append(id_sucursal)
        
        where_empleado += " AND e.Id_sucursal = %s"
        params_empleado.append(id_sucursal)

        where_cargo += " AND e.Id_sucursal = %s"
        params_cargo.append(id_sucursal)

    # 1. KPIs Generales
    cursor.execute(f"""
        SELECT 
            COUNT(DISTINCT v.Id_empleado) AS empleados_activos,
            COUNT(v.Id_venta) AS total_despachado,
            ROUND(IFNULL(SUM(v.Total), 0), 2) AS total_recaudado,
            ROUND(IFNULL(SUM(v.Total), 0) / GREATEST(COUNT(DISTINCT v.Id_empleado), 1), 2) AS rendimiento_medio_empleado
        FROM venta v
        {where_venta}
    """, tuple(params_venta))
    resumen = cursor.fetchone()

    # 2. Ranking de Rendimiento por Empleado
    cursor.execute(f"""
        SELECT 
            e.Id_empleado,
            e.Nombre AS empleado,
            e.Cargo AS puesto,
            COUNT(v.Id_venta) AS operaciones_realizadas,
            ROUND(SUM(v.Total), 2) AS total_vendido,
            ROUND(SUM(v.Total) / COUNT(v.Id_venta), 2) AS ticket_promedio,
            ROUND(SUM(v.Total) * 0.02, 2) AS comision_estimada
        FROM empleados e
        JOIN venta v ON e.Id_empleado = v.Id_empleado
        {where_venta}
        GROUP BY e.Id_empleado, e.Nombre, e.Cargo
        ORDER BY total_vendido DESC
    """, tuple(params_venta))
    tabla_empleados = cursor.fetchall()
    for emp in tabla_empleados:
        emp["total_vendido"] = float(emp["total_vendido"] or 0)
        emp["ticket_promedio"] = float(emp["ticket_promedio"] or 0)
        emp["comision_estimada"] = float(emp["comision_estimada"] or 0)

    # 3. Evolución de Ventas Operativas
    cursor.execute(f"""
        SELECT 
            DATE_FORMAT(v.Fecha_venta, '%Y-%m') AS periodo,
            COUNT(v.Id_venta) AS tickets_emitidos,
            ROUND(SUM(v.Total), 2) AS monto_procesado
        FROM venta v
        {where_venta}
        GROUP BY DATE_FORMAT(v.Fecha_venta, '%Y-%m')
        ORDER BY periodo ASC
    """, tuple(params_venta))
    evolucion_laboral = cursor.fetchall()
    for evo in evolucion_laboral:
        evo["monto_procesado"] = float(evo["monto_procesado"] or 0)

    # 4. Evolución de Nuevas Contrataciones
    cursor.execute(f"""
        SELECT 
            DATE_FORMAT(e.Fecha_ingreso, '%Y-%m') AS periodo,
            COUNT(e.Id_empleado) AS contrataciones
        FROM empleados e
        {where_empleado}
        GROUP BY DATE_FORMAT(e.Fecha_ingreso, '%Y-%m')
        ORDER BY periodo ASC
    """, tuple(params_empleado))
    evolucion_contrataciones = cursor.fetchall()
    for evo in evolucion_contrataciones:
        evo["contrataciones"] = int(evo["contrataciones"] or 0)

    # 5. Top 5 Empleados
    cursor.execute(f"""
        SELECT 
            e.Nombre AS empleado,
            e.Cargo AS puesto,
            ROUND(SUM(v.Total), 2) AS total_generado
        FROM empleados e
        JOIN venta v ON e.Id_empleado = v.Id_empleado
        {where_venta}
        GROUP BY e.Id_empleado, e.Nombre, e.Cargo
        ORDER BY total_generado DESC
        LIMIT 5
    """, tuple(params_venta))
    top_generadores = cursor.fetchall()
    for top in top_generadores:
        top["total_generado"] = float(top["total_generado"] or 0)

    # 6. DISTRIBUCIÓN POR CARGO (NUEVO: Para el Gráfico de Pastel)
    cursor.execute(f"""
        SELECT 
            IFNULL(e.Cargo, 'Sin Cargo') AS puesto,
            COUNT(e.Id_empleado) AS cantidad
        FROM empleados e
        {where_cargo}
        GROUP BY e.Cargo
        ORDER BY cantidad DESC
    """, tuple(params_cargo))
    distribucion_cargos = cursor.fetchall()

   

    cursor.close()
    conn.close()

    return jsonify({
        "total_recaudado": float(resumen["total_recaudado"] or 0),
        "total_despachado": int(resumen["total_despachado"] or 0),
        "empleados_activos": int(resumen["empleados_activos"] or 0),
        "rendimiento_medio_empleado": float(resumen["rendimiento_medio_empleado"] or 0),
        "tabla_empleados": tabla_empleados,
        "evolucion_laboral": evolucion_laboral,
        "evolucion_contrataciones": evolucion_contrataciones,
        "top_generadores": top_generadores,
        "distribucion_cargos": distribucion_cargos,  # 👈 Nuevo
        
    })
    
    
    
@app.route('/api/reporte-producto-especifico', methods=['GET'])
def reporte_producto_especifico():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    id_producto = request.args.get('id_producto')
    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')

    if not id_producto:
        return jsonify({"error": "Debe especificar un ID de producto"}), 400

    if not fecha_fin:
        fecha_fin = datetime.now().strftime('%Y-%m-%d') 
    if not fecha_inicio:
        fecha_inicio = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d') 

    # 0. Información Base del Producto
    cursor.execute("""
        SELECT 
            p.Nombre as Nombre_producto, 
            p.SKU, 
            c.Nombre AS categoria, 
            COALESCE(p.Precio_base, 0) AS Precio_base, 
            COALESCE(p.Precio_venta, 0) AS Precio_venta
            
        FROM productos p
        JOIN categoria c ON p.Id_categoria = c.Id_categoria
        WHERE p.Id_producto = %s
    """, (id_producto,))
    producto_info = cursor.fetchone()

    if not producto_info:
        cursor.close()
        conn.close()
        return jsonify({"error": "Producto no encontrado"}), 404

    # Stock actual total
    cursor.execute("""
        SELECT COALESCE(SUM(Cantidad_actual), 0) AS stock_total 
        FROM inventario 
        WHERE Id_producto = %s
    """, (id_producto,))
    stock_resumen = cursor.fetchone()

    # Ventas totales históricas globales (sin límite de fecha)
    cursor.execute("""
        SELECT COALESCE(SUM(Cantidad), 0) AS total_historico
        FROM detalle_venta
        WHERE Id_producto = %s
    """, (id_producto,))
    historico_resumen = cursor.fetchone()
    
    

    # 1. KPIs del Periodo Filtrado
    cursor.execute("""
        SELECT 
            COALESCE(SUM(dv.Cantidad), 0) AS unidades_vendidas,
            ROUND(COALESCE(SUM(dv.Subtotal), 0), 2) AS ingresos_totales,
            ROUND(COALESCE(SUM(dv.Cantidad * p.Precio_base), 0), 2) AS costo_total_estimado
        FROM detalle_venta dv
        JOIN venta v ON dv.Id_venta = v.Id_venta
        JOIN productos p ON dv.Id_producto = p.Id_producto
        WHERE dv.Id_producto = %s AND v.Fecha_venta BETWEEN %s AND %s
    """, (id_producto, fecha_inicio, fecha_fin))
    ventas_resumen = cursor.fetchone()

    ingresos = float(ventas_resumen["ingresos_totales"] or 0)
    costos = float(ventas_resumen["costo_total_estimado"] or 0) 
    ganancia_neta = round(ingresos - costos, 2) 
    margen_porcentaje = round((ganancia_neta / max(ingresos, 1)) * 100, 1)

    # 2. Historial de Ventas
    cursor.execute("""
        SELECT 
            v.Id_venta,
            cl.Nombre AS cliente,
            v.Fecha_venta AS fecha,
            dv.Cantidad AS unidades,
            ROUND(dv.Precio_unitario, 2) AS precio_unitario,
            ROUND(dv.Subtotal, 2) AS total
        FROM detalle_venta dv
        JOIN venta v ON dv.Id_venta = v.Id_venta
        LEFT JOIN clientes cl ON v.Id_cliente = cl.Id_cliente
        WHERE dv.Id_producto = %s AND v.Fecha_venta BETWEEN %s AND %s
        ORDER BY v.Fecha_venta DESC 
    """, (id_producto, fecha_inicio, fecha_fin))
    historial_ventas = cursor.fetchall()
    for vnt in historial_ventas:
        vnt["precio_unitario"] = float(vnt["precio_unitario"] or 0) 
        vnt["total"] = float(vnt["total"] or 0) 
        vnt["fecha"] = str(vnt["fecha"]) 

    # 3. Historial de Compras
    cursor.execute("""
        SELECT 
            oc.Id_orden_compra,
            prov.Nombre AS proveedor,
            oc.Fecha_orden AS fecha,
            dc.Cantidad AS unidades,
            ROUND(dc.Precio_unitario, 2) AS costo_unitario,
            oc.Estado
        FROM detalle_compra dc
        JOIN orden_compra oc ON dc.Id_orden_compra = oc.Id_orden_compra
        JOIN proveedores prov ON oc.Id_proveedor = prov.Id_proveedor
        WHERE dc.Id_producto = %s AND oc.Fecha_orden BETWEEN %s AND %s
        ORDER BY oc.Fecha_orden DESC
    """, (id_producto, fecha_inicio, fecha_fin))
    historial_compras = cursor.fetchall()
    for cmp in historial_compras:
        cmp["costo_unitario"] = float(cmp["costo_unitario"] or 0) 
        cmp["fecha"] = str(cmp["fecha"]) 

    # 4. Tendencia de Ventas
    cursor.execute("""
        SELECT 
            LAST_DAY(v.Fecha_venta) AS periodo,
            SUM(dv.Cantidad) AS unidades_vendidas
        FROM detalle_venta dv
        JOIN venta v ON dv.Id_venta = v.Id_venta
        WHERE dv.Id_producto = %s AND v.Fecha_venta BETWEEN %s AND %s
        GROUP BY LAST_DAY(v.Fecha_venta)
        ORDER BY periodo ASC
    """, (id_producto, fecha_inicio, fecha_fin))
    tendencia_ventas = cursor.fetchall()
    for tv in tendencia_ventas:
        if tv["periodo"]:
            tv["periodo"] = str(tv["periodo"])

    # 5. Transferencias Stock
    cursor.execute("""
        SELECT 
            t.Id_transferencia,
            ao.Nombre AS almacen_origen,
            ad.Nombre AS almacen_destino,
            t.Cantidad AS unidades,
            t.Fecha AS fecha
        FROM transferencia_stock t
        JOIN almacen ao ON t.Id_almacen_origen = ao.Id_almacen
        JOIN almacen ad ON t.Id_almacen_destino = ad.Id_almacen
        WHERE t.Id_producto = %s AND t.Fecha BETWEEN %s AND %s
        ORDER BY t.Fecha DESC
    """, (id_producto, fecha_inicio, fecha_fin))
    historial_transferencias = cursor.fetchall()
    for tf in historial_transferencias:
        tf["fecha"] = str(tf["fecha"])

    # 6. Historial de Precios
    cursor.execute("""
        SELECT 
            Id_precio,
            Precio AS precio_nuevo,
            Fecha_cambio AS fecha,
            Motivo_cambio AS motivo
        FROM precio_historico
        WHERE Id_producto = %s AND Fecha_cambio BETWEEN %s AND %s
        ORDER BY Fecha_cambio ASC
    """, (id_producto, fecha_inicio, fecha_fin))
    
    registros_planos = cursor.fetchall()
    historial_precios = []
    
    for i, hp in enumerate(registros_planos):
        precio_actual = float(hp["precio_nuevo"] or 0)
        precio_anterior = float(registros_planos[i-1]["precio_nuevo"] or 0) if i > 0 else precio_actual
        
        historial_precios.append({
            "Id_precio": hp["Id_precio"],
            "fecha": str(hp["fecha"]),
            "precio_nuevo": precio_actual,
            "precio_anterior": precio_anterior,
            "motivo": hp["motivo"] or "No especificado"
        })
        
    historial_precios.reverse()

    # 7. Proveedores Vinculados
    cursor.execute("""
        SELECT DISTINCT 
            pr.Nombre AS nombre,
            pr.Contacto_email AS rnc_codigo,
            COALESCE(dc.Precio_unitario, p.Precio_base) AS costo_pactado,
            3 AS lead_time_dias,
            'Activo' AS estado
        FROM detalle_compra dc
        JOIN orden_compra oc ON dc.Id_orden_compra = oc.Id_orden_compra
        JOIN proveedores pr ON oc.Id_proveedor = pr.Id_proveedor
        JOIN productos p ON dc.Id_producto = p.Id_producto
        WHERE dc.Id_producto = %s
    """, (id_producto,))
    proveedores = cursor.fetchall()
    for prov in proveedores:
        prov["costo_pactado"] = float(prov["costo_pactado"] or 0)
        
        
    # 3. Cálculo de Stock Mínimo (Consulta Optimizada)
    cursor.execute("""
        SELECT 
            CEILING(
                (IFNULL(v.ConsumoPromedioDiario, 0) * IFNULL(c.TiempoEntrega, 0)) +
                (IFNULL(v.ConsumoPromedioDiario, 0) * 5)
            ) AS StockMinimo
        FROM productos p
        LEFT JOIN (
            SELECT 
                dv.Id_producto,
                SUM(dv.Cantidad) / GREATEST(DATEDIFF(MAX(v.Fecha_venta), MIN(v.Fecha_venta)) + 1, 1) AS ConsumoPromedioDiario
            FROM detalle_venta dv
            JOIN venta v ON dv.Id_venta = v.Id_venta
            WHERE dv.Id_producto = %s
            GROUP BY dv.Id_producto
        ) v ON p.Id_producto = v.Id_producto
        LEFT JOIN (
            SELECT 
                dc.Id_producto,
                AVG(DATEDIFF(oc.Fecha_entrega_real, oc.Fecha_orden)) AS TiempoEntrega
            FROM detalle_compra dc
            JOIN orden_compra oc ON dc.Id_orden_compra = oc.Id_orden_compra
            WHERE dc.Id_producto = %s AND oc.Fecha_entrega_real IS NOT NULL
            GROUP BY dc.Id_producto
        ) c ON p.Id_producto = c.Id_producto
        WHERE p.Id_producto = %s
    """, (id_producto, id_producto, id_producto))
    
    resumen_stock = cursor.fetchone()
    stock_minimo_calculado = int(resumen_stock["StockMinimo"]) if (resumen_stock and resumen_stock["StockMinimo"]) else 0    

    cursor.close()
    conn.close()

    precio_v = float(producto_info["Precio_venta"] or 0)
    costo_u = float(producto_info["Precio_base"] or 0)
    total_ventas_hist = int(historico_resumen["total_historico"] or 0)
    fecha_alta = str(producto_info.get("Fecha_creacion") or "2024-01-01")

    
    

    return jsonify({
        "producto": producto_info["Nombre_producto"],
        "codigo": producto_info["SKU"],
        "stock_actual": int(stock_resumen["stock_total"]),
        "categoria": producto_info["categoria"],
        "Precio_venta": precio_v,
        "costo_actual": costo_u,
        "stock_minimo": stock_minimo_calculado,
        
        # Objeto de Stats Globales exigidos por el Frontend
        "stats_globales": {
            "Precio_base": costo_u,
            "costo_unitario": costo_u,
            "precio_venta": precio_v,
            "stock_minimo": stock_minimo_calculado,
            "punto_reorden": 10,
            "total_ventas_historico": total_ventas_hist,
            "fecha_creacion": fecha_alta
        },

        "unidades_vendidas": int(ventas_resumen["unidades_vendidas"] or 0),
        "ingresos_totales": ingresos,
        "ganancia_neta": ganancia_neta,
        "margen_porcentaje": margen_porcentaje,
        "proveedores": proveedores,
        "historial_ventas": historial_ventas,
        "historial_compras": historial_compras,
        "tendencia_ventas": tendencia_ventas,
        "historial_transferencias": historial_transferencias,
        "historial_precios": historial_precios
    })




   
# Perfil
@app.route('/api/usuario-perfil', methods=['GET'])
def usuario_perfil():
    usuario = request.args.get('usuario')
    if not usuario:
        return jsonify({"error": "Usuario requerido"}), 400

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT e.Nombre, e.Contacto_email
        FROM usuario u
        JOIN empleados e ON u.Id_Empleado = e.Id_empleado
        WHERE u.usuario = %s
    """, (usuario,))
    perfil = cursor.fetchone()
    cursor.close()
    conn.close()

    if perfil:
        print(f"✅ Perfil encontrado: {perfil}")  # ← AGREGA ESTO
        return jsonify(perfil)
    print(f"❌ Usuario no encontrado: {usuario}")
    return jsonify({"error": "Usuario no encontrado"}), 404  

# Logout
@app.route('/api/logout', methods=['POST'])
def logout():
    return jsonify({"success": True, "redirect": "/"})


# Excel
@app.route('/api/exportar-excel', methods=['GET'])
def exportar_excel():
    inicio = request.args.get('inicio')
    fin    = request.args.get('fin')
    # Hojas solicitadas; si no se manda nada, se generan todas
    hojas  = request.args.get('hojas', 'detalle,canal,clientes,suc_mes,stock,defectuoso,dead_stock,compras_detalle,proveedores,empleados').split(',')
 
    conn = conectar_bd()
    if not conn:
        return jsonify({"error": "No se pudo conectar a la BD"}), 500
 
    cursor = conn.cursor(dictionary=True)
 
    # Parámetros de fecha reutilizables 
    usa_fechas = bool(inicio and fin)
    filtro_venta      = "WHERE v.Fecha_venta BETWEEN %s AND %s"         if usa_fechas else ""
    filtro_venta_and  = "AND v.Fecha_venta BETWEEN %s AND %s"           if usa_fechas else ""
    filtro_orden      = "WHERE oc.Fecha_orden BETWEEN %s AND %s"        if usa_fechas else ""
    params            = (inicio, fin) if usa_fechas else ()
 
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine='openpyxl') as writer:
 
        # 1. DETALLE COMPLETO DE VENTAS 
        if 'detalle' in hojas:
            cursor.execute(f"""
                SELECT
                    v.Id_venta,
                    DATE_FORMAT(v.Fecha_venta, '%Y-%m-%d') AS fecha,
                    cl.Nombre       AS cliente,
                    v.Total         AS importe,
                    v.Canal,
                    v.Estado,
                    s.Nombre        AS sucursal,
                    e.Nombre        AS empleado,
                    cat.Nombre      AS categoria,
                    p.Nombre        AS producto,
                    dv.Cantidad,
                    dv.Precio_unitario,
                    dv.Descuento,
                    dv.Subtotal
                FROM venta v
                JOIN clientes      cl  ON v.Id_cliente   = cl.Id_cliente
                JOIN empleados     e   ON v.Id_empleado  = e.Id_empleado
                JOIN sucursal      s   ON v.Id_sucursal  = s.Id_sucursal
                JOIN detalle_venta dv  ON v.Id_venta     = dv.Id_venta
                JOIN productos     p   ON dv.Id_producto = p.Id_producto
                JOIN categoria     cat ON p.Id_categoria = cat.Id_categoria
                {filtro_venta}
                ORDER BY v.Fecha_venta DESC
            """, params)
            df_detalle = pd.DataFrame(cursor.fetchall())
            if not df_detalle.empty:
                df_detalle.to_excel(writer, index=False, sheet_name='Detalle_Ventas')
 
        # 2. POR CANAL (Presencial vs Online) ──────────────────────────────
        if 'canal' in hojas:
            cursor.execute(f"""
                SELECT
                    v.Canal,
                    COUNT(DISTINCT v.Id_venta)  AS num_ventas,
                    SUM(v.Total)                AS total_vendido,
                    ROUND(AVG(v.Total), 2)      AS ticket_promedio
                FROM venta v
                {filtro_venta}
                GROUP BY v.Canal
                ORDER BY total_vendido DESC
            """, params)
            df_canal = pd.DataFrame(cursor.fetchall())
            if not df_canal.empty:
                df_canal.to_excel(writer, index=False, sheet_name='Por_Canal')
 
        # ── 3. TOP CLIENTES ──────────────────────────────────────────────────
        if 'clientes' in hojas:
            cursor.execute(f"""
                SELECT
                    cl.Nombre                           AS cliente,
                    cl.Ubicacion                        AS ubicacion,
                    cl.Contacto_email                   AS email,
                    COUNT(DISTINCT v.Id_venta)          AS num_compras,
                    SUM(v.Total)                        AS total_gastado,
                    ROUND(AVG(v.Total), 2)              AS ticket_promedio,
                    MAX(v.Fecha_venta)                  AS ultima_compra
                FROM clientes cl
                JOIN venta v ON cl.Id_cliente = v.Id_cliente
                {filtro_venta_and.replace('AND', 'WHERE v.Fecha_venta BETWEEN %s AND %s') if usa_fechas else ''}
                GROUP BY cl.Id_cliente, cl.Nombre, cl.Ubicacion, cl.Contacto_email
                ORDER BY total_gastado DESC
            """, params)
            df_clientes = pd.DataFrame(cursor.fetchall())
            if not df_clientes.empty:
                df_clientes.to_excel(writer, index=False, sheet_name='Top_Clientes')
 
        # ── 4. VENTAS POR SUCURSAL Y MES ─────────────────────────────────────
        if 'suc_mes' in hojas:
            cursor.execute(f"""
                SELECT
                    s.Nombre                            AS sucursal,
                    DATE_FORMAT(v.Fecha_venta, '%Y-%m') AS mes,
                    COUNT(DISTINCT v.Id_venta)          AS num_ventas,
                    SUM(v.Total)                        AS total_vendido
                FROM venta v
                JOIN sucursal s ON v.Id_sucursal = s.Id_sucursal
                {filtro_venta}
                GROUP BY s.Id_sucursal, s.Nombre, mes
                ORDER BY sucursal, mes
            """, params)
            df_suc_mes = pd.DataFrame(cursor.fetchall())
            if not df_suc_mes.empty:
                df_suc_mes.to_excel(writer, index=False, sheet_name='Ventas_Sucursal_Mes')
 
        # 5. STOCK ACTUAL POR SUCURSAL ──────────────────────────────────────
        # Esta hoja no usa filtro de fechas (es el estado actual del inventario)
        if 'stock' in hojas:
            cursor.execute("""
                SELECT
                    p.Nombre                AS producto,
                    cat.Nombre              AS categoria,
                    p.SKU,
                    p.Precio_venta,
                    a.Nombre                AS almacen,
                    s.Nombre                AS sucursal,
                    i.Cantidad_actual       AS stock_actual,
                    i.Cantidad_minima       AS stock_minimo,
                    i.Cantidad_maxima       AS stock_maximo,
                    CASE
                        WHEN i.Cantidad_actual <= i.Cantidad_minima THEN 'Bajo'
                        WHEN i.Cantidad_actual >= i.Cantidad_maxima THEN 'Alto'
                        ELSE 'Normal'
                    END                     AS nivel_stock,
                    i.Ultima_actualizacion
                FROM inventario i
                JOIN productos  p   ON i.Id_producto = p.Id_producto
                JOIN almacen    a   ON i.Id_almacen  = a.Id_almacen
                JOIN sucursal   s   ON a.Id_sucursal = s.Id_sucursal
                JOIN categoria  cat ON p.Id_categoria = cat.Id_categoria
                WHERE LOWER(i.estado) = 'normal'
                ORDER BY s.Nombre, p.Nombre
            """)
            df_stock = pd.DataFrame(cursor.fetchall())
            if not df_stock.empty:
                df_stock.to_excel(writer, index=False, sheet_name='Stock_Actual')
 
        # 6. PRODUCTOS DEFECTUOSOS ──────────────────────────────────────────
        if 'defectuoso' in hojas:
            cursor.execute("""
                SELECT
                    p.Nombre                AS producto,
                    p.SKU,
                    cat.Nombre              AS categoria,
                    i.motivo_defecto,
                    rd.Tipo_resolucion      AS resolucion,
                    rd.Fecha_resolucion,
                    rd.Observacion,
                    a.Nombre                AS almacen,
                    s.Nombre                AS sucursal,
                    i.Cantidad_actual       AS cantidad,
                    p.Precio_venta,
                    CASE
                        WHEN rd.Tipo_resolucion = 'Baja'
                            THEN i.Cantidad_actual * p.Precio_venta
                        WHEN rd.Tipo_resolucion = 'Liquidacion'
                            THEN (i.Cantidad_actual * p.Precio_venta) * 0.30
                        ELSE 0
                    END                     AS perdida_estimada,
                    i.Ultima_actualizacion
                FROM inventario i
                JOIN productos  p   ON i.Id_producto  = p.Id_producto
                JOIN categoria  cat ON p.Id_categoria = cat.Id_categoria
                JOIN almacen    a   ON i.Id_almacen   = a.Id_almacen
                JOIN sucursal   s   ON a.Id_sucursal  = s.Id_sucursal
                LEFT JOIN resolucion_defecto rd ON rd.Id_inventario = i.Id_inventario
                WHERE LOWER(i.estado) = 'defectuoso'
                ORDER BY perdida_estimada DESC
            """)
            df_defectuoso = pd.DataFrame(cursor.fetchall())
            if not df_defectuoso.empty:
                df_defectuoso.to_excel(writer, index=False, sheet_name='Defectuosos')
 
        # 7. DEAD STOCK 
        if 'dead_stock' in hojas:
            cursor.execute("""
                SELECT
                    p.Nombre                                        AS producto,
                    p.SKU,
                    cat.Nombre                                      AS categoria,
                    SUM(i.Cantidad_actual)                          AS stock_total,
                    p.Precio_venta,
                    SUM(i.Cantidad_actual) * p.Precio_venta        AS dinero_estancado,
                    MAX(v.Fecha_venta)                              AS ultima_venta,
                    DATEDIFF(CURDATE(), MAX(v.Fecha_venta))        AS dias_sin_venta,
                    CASE
                        WHEN MAX(v.Fecha_venta) IS NULL            THEN 'Liquidación'
                        WHEN DATEDIFF(CURDATE(), MAX(v.Fecha_venta)) > 180 THEN 'Baja'
                        ELSE 'Liquidación'
                    END                                             AS recomendacion
                FROM productos p
                JOIN inventario     i   ON p.Id_producto  = i.Id_producto
                JOIN categoria      cat ON p.Id_categoria = cat.Id_categoria
                LEFT JOIN detalle_venta dv ON p.Id_producto  = dv.Id_producto
                LEFT JOIN venta         v  ON dv.Id_venta    = v.Id_venta
                WHERE LOWER(i.estado) = 'normal'
                  AND i.Cantidad_actual > 0
                GROUP BY p.Id_producto, p.Nombre, p.SKU, cat.Nombre, p.Precio_venta
                HAVING MAX(v.Fecha_venta) IS NULL
                    OR MAX(v.Fecha_venta) < DATE_SUB(CURDATE(), INTERVAL 90 DAY)
                ORDER BY dias_sin_venta DESC
            """)
            df_dead = pd.DataFrame(cursor.fetchall())
            if not df_dead.empty:
                df_dead.to_excel(writer, index=False, sheet_name='Dead_Stock')
 
        # 8. DETALLE DE COMPRAS 
        if 'compras_detalle' in hojas:
            cursor.execute(f"""
                SELECT
                    oc.Id_orden_compra,
                    DATE_FORMAT(oc.Fecha_orden, '%Y-%m-%d')           AS fecha_orden,
                    DATE_FORMAT(oc.Fecha_entrega_estimada, '%Y-%m-%d') AS entrega_estimada,
                    DATE_FORMAT(oc.Fecha_entrega_real, '%Y-%m-%d')    AS entrega_real,
                    pr.Nombre                                          AS proveedor,
                    pr.Pais                                            AS pais_proveedor,
                    s.Nombre                                           AS sucursal_destino,
                    p.Nombre                                           AS producto,
                    cat.Nombre                                         AS categoria,
                    dc.Cantidad,
                    dc.Precio_unitario,
                    dc.Costo_flete,
                    (dc.Cantidad * dc.Precio_unitario) + dc.Costo_flete AS costo_total_linea,
                    oc.Tipo_envio,
                    oc.Estado
                FROM orden_compra  oc
                JOIN proveedores   pr  ON oc.Id_proveedor   = pr.Id_proveedor
                JOIN sucursal      s   ON oc.Id_sucursal    = s.Id_sucursal
                JOIN detalle_compra dc ON oc.Id_orden_compra = dc.Id_orden_compra
                JOIN productos     p   ON dc.Id_producto    = p.Id_producto
                JOIN categoria     cat ON p.Id_categoria    = cat.Id_categoria
                {filtro_orden}
                ORDER BY oc.Fecha_orden DESC
            """, params)
            df_compras = pd.DataFrame(cursor.fetchall())
            if not df_compras.empty:
                df_compras.to_excel(writer, index=False, sheet_name='Detalle_Compras')
 
        # 9. RESUMEN POR PROVEEDOR 
        if 'proveedores' in hojas:
            cursor.execute(f"""
                SELECT
                    pr.Nombre                                           AS proveedor,
                    pr.Pais,
                    COUNT(DISTINCT oc.Id_orden_compra)                 AS total_ordenes,
                    SUM(oc.Costo_total)                                AS total_comprado,
                    ROUND(AVG(
                        DATEDIFF(oc.Fecha_entrega_real, oc.Fecha_entrega_estimada)
                    ), 1)                                               AS promedio_retraso_dias,
                    SUM(CASE
                        WHEN oc.Fecha_entrega_real > oc.Fecha_entrega_estimada THEN 1
                        ELSE 0
                    END)                                                AS ordenes_con_retraso
                FROM orden_compra oc
                JOIN proveedores pr ON oc.Id_proveedor = pr.Id_proveedor
                {filtro_orden}
                GROUP BY pr.Id_proveedor, pr.Nombre, pr.Pais
                ORDER BY total_comprado DESC
            """, params)
            df_prov = pd.DataFrame(cursor.fetchall())
            if not df_prov.empty:
                df_prov.to_excel(writer, index=False, sheet_name='Resumen_Proveedores')
 
        # 10. RANKING DE EMPLEADOS 
        if 'empleados' in hojas:
            cursor.execute(f"""
                SELECT
                    e.Nombre                            AS empleado,
                    e.Cargo,
                    s.Nombre                            AS sucursal,
                    COUNT(DISTINCT v.Id_venta)          AS num_ventas,
                    SUM(v.Total)                        AS total_vendido,
                    ROUND(AVG(v.Total), 2)              AS ticket_promedio,
                    MAX(v.Fecha_venta)                  AS ultima_venta
                FROM empleados e
                JOIN venta    v ON e.Id_empleado = v.Id_empleado
                JOIN sucursal s ON e.Id_sucursal = s.Id_sucursal
                {filtro_venta_and.replace('AND', 'WHERE v.Fecha_venta BETWEEN %s AND %s') if usa_fechas else ''}
                GROUP BY e.Id_empleado, e.Nombre, e.Cargo, s.Nombre
                ORDER BY total_vendido DESC
            """, params)
            df_emp = pd.DataFrame(cursor.fetchall())
            if not df_emp.empty:
                df_emp.to_excel(writer, index=False, sheet_name='Ranking_Empleados')
 
    cursor.close()
    conn.close()
 
    buf.seek(0)
 
    # Si el buffer está vacío (todas las hojas sin datos), avisar
    if buf.getbuffer().nbytes == 0:
        return jsonify({"mensaje": "Sin datos para las hojas seleccionadas"}), 204
 
    return app.response_class(
        buf.getvalue(),
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={"Content-Disposition": "attachment; filename=reporte_muebleria.xlsx"}
    )
 
 
 
 
@app.route('/api/users/stats', methods=['GET'])
def user_stats():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)
    
    
    # 1. Obtenemos las estadísticas básicas de la tabla usuario
    cursor.execute("""
        SELECT
            COUNT(*) AS totalUsers,
            SUM(CASE WHEN estado = 1 THEN 1 ELSE 0 END) AS activeUsers,
            SUM(CASE WHEN estado = 0 THEN 1 ELSE 0 END) AS inactiveUsers
        FROM usuario
    """)
    stats = cursor.fetchone()

    # 2. Contamos cuántos usuarios tienen TODOS los permisos existentes (Admins)
    cursor.execute("""
        SELECT COUNT(*) AS adminUsers
        FROM (
            SELECT id_empleado
            FROM usuario_permisos 
            GROUP BY id_empleado 
            HAVING COUNT(id_permiso) = (SELECT COUNT(*) FROM permisos)
        ) AS t_admins
    """)
    admin_stats = cursor.fetchone()

    # Unimos e imprimimos todo en la consola para depuración
    print(f"Stats: {stats} | Admins: {admin_stats}")  

    return jsonify({
        "totalUsers": int(stats["totalUsers"] or 0),
        "activeUsers": int(stats["activeUsers"] or 0),
        "inactiveUsers": int(stats["inactiveUsers"] or 0),
        "adminUsers": int(admin_stats["adminUsers"] or 0) # <--- Enviamos el dato correcto a React
    })

    
    cursor.close()
    conn.close()


# ==========================================
# ENDPOINT PARA LA TABLA DE USUARIOS
# ==========================================
@app.route('/api/users/table', methods=['GET'])
def user_table():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            u.id_empleado AS Id_Empleado,
            u.usuario AS usuario,
            e.nombre AS Nombre,
            e.cargo AS Cargo,
            e.contacto_email AS Contacto_email,
            CASE WHEN u.estado = 1 THEN 'Active' ELSE 'Inactive' END AS estado
        FROM usuario u
        INNER JOIN empleados e ON u.id_empleado = e.id_empleado
    """)
        
    # CORREGIDO: fetchall() para traer todos los registros en vez de uno solo
    usuarios = cursor.fetchall()
    print(usuarios)  # Ahora verás la lista completa en tu CMD

    cursor.close()
    conn.close()

    # CORREGIDO: Retornar la respuesta al frontend en formato JSON
    return jsonify(usuarios)



# ==========================================
# 1. TRAER EMPLEADOS QUE NO TIENEN USUARIO
# ==========================================
@app.route('/api/empleados-disponibles', methods=['GET'])
def empleados_disponibles():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)
    try:
        # LEFT JOIN buscando los empleados que NO existen en la tabla usuario
        query = """
            SELECT e.id_empleado, e.nombre, e.cargo 
            FROM empleados e
            LEFT JOIN usuario u ON e.id_empleado = u.id_empleado
            WHERE u.id_empleado IS NULL
        """
        cursor.execute(query)
        empleados = cursor.fetchall()
        return jsonify(empleados)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ==========================================
# 2. ENDPOINT INTELIGENTE PARA CREAR USUARIO
# ==========================================
@app.route('/api/users/create', methods=['POST'])
def create_user():
    data = request.get_json()
    id_empleado = data.get('id_empleado')
    username = data.get('usuario')
    password = data.get('password')  # Lo ideal a futuro es usar hash (ej. bcrypt)
    

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)
    try:
        # Validación A: Que el empleado no tenga ya un usuario asignado
        cursor.execute("SELECT id_empleado FROM usuario WHERE id_empleado = %s", (id_empleado,))
        if cursor.fetchone():
            return jsonify({"error": "This employee already has a system user account."}), 400

        # Validación B: Que el nombre de usuario no esté duplicado en el sistema
        cursor.execute("SELECT id_empleado FROM usuario WHERE LOWER(usuario) = LOWER(%s)", (username,))
        if cursor.fetchone():
            return jsonify({"error": "Username is already taken."}), 400

        # Inserción (Se asigna estado = 1 por defecto al crearse)
        insert_query = """
            INSERT INTO usuario (id_empleado, usuario, clave, estado) 
            VALUES (%s, %s, %s, 1)
        """
        cursor.execute(insert_query, (id_empleado, username, password))
        conn.commit()

        return jsonify({"message": "User created successfully"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ==========================================
# OBTENER DETALLES DE UN USUARIO INDIVIDUAL
# ==========================================
@app.route('/api/users/<int:id_empleado>', methods=['GET'])
def get_user_details(id_empleado):
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT u.usuario, u.estado, e.nombre AS Nombre, e.cargo AS Cargo
            FROM usuario u
            INNER JOIN empleados e ON u.id_empleado = e.id_empleado
            WHERE u.id_empleado = %s
        """
        cursor.execute(query, (id_empleado,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        return jsonify(user)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ==========================================
# ACTUALIZAR DATOS DEL USUARIO
# ==========================================
@app.route('/api/users/<int:id_empleado>', methods=['PUT'])
def update_user(id_empleado):
    data = request.get_json()
    username = data.get('usuario')
    password = data.get('password')
    estado = data.get('estado')

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)
    try:
        # 1. Validar que el username no esté ocupado por OTRO usuario
        cursor.execute("SELECT id_empleado FROM usuario WHERE LOWER(usuario) = LOWER(%s) AND id_empleado != %s", (username, id_empleado))
        if cursor.fetchone():
            return jsonify({"error": "Username is already taken by another employee."}), 400

        # 2. Si envió una nueva contraseña, la actualizamos junto con el usuario y estado
        if password and password.strip() != "":
            query = """
                UPDATE usuario 
                SET usuario = %s, clave = %s, estado = %s 
                WHERE id_empleado = %s
            """
            cursor.execute(query, (username, password, estado, id_empleado))
        else:
            # Si no envió contraseña, solo cambiamos usuario y estado
            query = """
                UPDATE usuario 
                SET usuario = %s, estado = %s 
                WHERE id_empleado = %s
            """
            cursor.execute(query, (username, estado, id_empleado))

        conn.commit()
        return jsonify({"message": "User updated successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()



# ==========================================
# 1. OBTENER PERMISOS DE UN USUARIO ESPECÍFICO
# ==========================================
@app.route('/api/users/<int:id_empleado>/permisos', methods=['GET'])
def get_user_permissions(id_empleado):
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)
    try:
        # Primero buscamos el id_usuario interno usando el id_empleado
        cursor.execute("SELECT id_empleado FROM usuario WHERE id_empleado = %s", (id_empleado,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        id_usuario = user['id_empleado']

        # Traemos TODOS los permisos de la base de datos y marcamos cuáles tiene el usuario
        query = """
            SELECT p.id_permiso, p.nombre_permiso, p.categoria,
                   CASE WHEN up.id_empleado IS NOT NULL THEN 1 ELSE 0 END AS asignado
            FROM permisos p
            LEFT JOIN usuario_permisos up ON p.id_permiso = up.id_permiso AND up.id_empleado = %s
            ORDER BY p.categoria, p.id_permiso
        """
        cursor.execute(query, (id_usuario,))
        permisos = cursor.fetchall()
        return jsonify(permisos)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ==========================================
# 2. GUARDAR LOS PERMISOS ASIGNADOS A UN USUARIO
# ==========================================
@app.route('/api/users/<int:id_empleado>/permisos', methods=['PUT'])
def update_user_permissions(id_empleado):
    data = request.get_json()
    id_permisos_nuevos = data.get('permisos', []) # Lista de IDs de permisos que quedaron en True

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)
    try:
        # Buscamos el id_usuario
        cursor.execute("SELECT id_empleado FROM usuario WHERE id_empleado = %s", (id_empleado,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        id_usuario = user['id_empleado']

        # Limpiamos los permisos viejos del usuario para no duplicar
        cursor.execute("DELETE FROM usuario_permisos WHERE id_empleado = %s", (id_usuario,))

        # Insertamos los nuevos permisos seleccionados
        if id_permisos_nuevos:
            insert_query = "INSERT INTO usuario_permisos (id_empleado, id_permiso) VALUES (%s, %s)"
            for id_permiso in id_permisos_nuevos:
                cursor.execute(insert_query, (id_usuario, id_permiso))
        
        conn.commit()
        return jsonify({"message": "Permissions updated successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()





if __name__ == '__main__':
    app.run(debug=True)