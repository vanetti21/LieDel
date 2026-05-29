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


#Reportes
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

        # Total Revenue
        cursor.execute("""
            SELECT COALESCE(SUM(Total),0) AS total_revenue
            FROM venta
        """)
        total_revenue = cursor.fetchone()['total_revenue']

        # Average Order Value
        cursor.execute("""
            SELECT COALESCE(AVG(Total),0) AS average_order
            FROM venta
        """)
        average_order = cursor.fetchone()['average_order']

        # Ventas mes actual
        cursor.execute("""
            SELECT COALESCE(SUM(Total),0) AS current_month
            FROM venta
            WHERE MONTH(Fecha_venta) = MONTH(CURDATE())
            AND YEAR(Fecha_venta) = YEAR(CURDATE())
        """)
        current_month = float(cursor.fetchone()['current_month'])

        # Ventas mes anterior
        cursor.execute("""
            SELECT COALESCE(SUM(Total),0) AS last_month
            FROM venta
            WHERE MONTH(Fecha_venta) = MONTH(CURDATE() - INTERVAL 1 MONTH)
            AND YEAR(Fecha_venta) = YEAR(CURDATE() - INTERVAL 1 MONTH)
        """)
        last_month = float(cursor.fetchone()['last_month'])

        # Growth %
        sales_growth = 0

        if last_month > 0:
            sales_growth = ((current_month - last_month) / last_month) * 100

        return jsonify({
            "totalRevenue": round(float(total_revenue), 2),
            "averageOrderValue": round(float(average_order), 2),
            "salesGrowth": round(sales_growth, 2)
        })

    except Exception as e:
        print(e)
        return jsonify({"error": "Error obteniendo estadísticas"}), 500    

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

FROM inventario i

WHERE 
    i.estado = 'Normal'
    AND i.Cantidad_actual < i.Cantidad_minima;
    """)
    low_stock = cursor.fetchone()["low_stock"]
    
    #dead stock
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

    (
        SUM(i.Cantidad_actual) * p.Precio_venta
    ) AS dinero_estancado,

            MAX(v.Fecha_venta) AS ultima_venta,

            DATEDIFF(
                CURDATE(),
                MAX(v.Fecha_venta)
            ) AS dias_sin_venta

        FROM productos p

        JOIN inventario i
            ON p.Id_producto = i.Id_producto

        LEFT JOIN categoria c
            ON p.Id_categoria = c.Id_categoria

        LEFT JOIN detalle_venta dv
            ON p.Id_producto = dv.Id_producto

        LEFT JOIN venta v
            ON dv.Id_venta = v.Id_venta

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

ORDER BY dias_sin_venta DESC;
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

    i.Cantidad_actual,
    i.estado,
    i.Ultima_actualizacion,

    pr.Nombre AS proveedor,
    pr.Pais,

    a.Nombre AS almacen,
    s.Nombre AS sucursal,

    oc.Tipo_envio,

    p.Precio_venta,

    (i.Cantidad_actual * p.Precio_venta) AS perdida_estimada

FROM inventario i

JOIN productos p
    ON i.Id_producto = p.Id_producto

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

WHERE LOWER(i.estado) = 'defectuoso'

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


@app.route('/api/usuarios', methods=['POST'])
def crear_usuario():
    datos = request.get_json()
    Id_empleado = datos.get('Id_empleado')
    usuario = datos.get('usuario')
    clave = datos.get('clave')
    estado = datos.get('estado')

    conn = conectar_bd()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO usuario (Id_empleado, usuario, clave, estado) VALUES (%s, %s, %s, %s)",
                       (Id_empleado, usuario, clave, estado))
        conn.commit()
        return jsonify({'mensaje': 'Usuario creado exitosamente'})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()





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
            SELECT v.Id_cliente,
                   SUM(v.Total) AS gasto_total
            FROM venta v
            GROUP BY v.Id_cliente
            HAVING gasto_total >= 50000
        ) vip
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


#Proveedores
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


@app.route('/proveedores_mapa')
def proveedores_mapa():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        Pais,
        COUNT(*) AS total
    FROM proveedores
    GROUP BY Pais
    """

    cursor.execute(query)
    data = cursor.fetchall()

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
    p.Id_producto,
    p.Nombre,

    i.Id_almacen,
    i.Cantidad_actual,
    i.Cantidad_minima,
    i.estado,
    i.Ultima_actualizacion,

    (
        SELECT MAX(v.Fecha_venta)
        FROM detalle_venta dv
        JOIN venta v
            ON dv.Id_venta = v.Id_venta
        WHERE dv.Id_producto = p.Id_producto
    ) AS ultima_venta,

    (
        SELECT MAX(oc.Fecha_orden)
        FROM detalle_compra dc
        JOIN orden_compra oc
            ON dc.Id_orden_compra = oc.Id_orden_compra
        WHERE dc.Id_producto = p.Id_producto
    ) AS ultima_compra

FROM inventario i

JOIN productos p
    ON p.Id_producto = i.Id_producto

WHERE 
    LOWER(i.estado) = 'normal'
    AND i.Cantidad_actual <= i.Cantidad_minima

ORDER BY i.Cantidad_actual ASC;
    """

    cursor.execute(query)
    data = cursor.fetchall()

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
        i.Cantidad_minima,
        i.Ultima_actualizacion
    FROM productos p
    JOIN categoria c ON p.Id_categoria = c.Id_categoria
    JOIN inventario i ON p.Id_producto = i.Id_producto
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
        cursor.execute("""
            SELECT u.usuario, e.nombre, e.Contacto_email, e.Cargo
            FROM usuario u
            JOIN empleados e ON u.Id_Empleado = e.Id_Empleado
            WHERE u.usuario = %s AND u.clave = %s
        """, (username, password))
        user = cursor.fetchone()
        conn.close()

        if user:
            print(f"✅ Login: {user}")
            return jsonify({
                "success": True,
                "usuario": user["usuario"],
                "nombre": user["nombre"],
                "Contacto_email": user["Contacto_email"],
                "Cargo": user["Cargo"]
            }), 200
        else:
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

    conn = conectar_bd()
    if not conn:
        return jsonify({"error": "No se pudo conectar a la BD"}), 500

    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT
            v.Id_venta,
            DATE_FORMAT(v.Fecha_venta, '%Y-%m-%d')   AS fecha,
            cl.Nombre                                  AS cliente,
            v.Total                                    AS importe,
            v.Canal,
            v.Estado,
            s.Nombre                                   AS sucursal,
            e.Nombre                                   AS empleado,
            cat.Nombre                                 AS categoria,
            p.Nombre                                   AS producto,
            dv.Cantidad,
            dv.Precio_unitario,
            dv.Descuento,
            dv.Subtotal
        FROM venta v
        JOIN clientes   cl  ON v.Id_cliente  = cl.Id_cliente
        JOIN empleados  e   ON v.Id_empleado = e.Id_empleado
        JOIN sucursal   s   ON v.Id_sucursal = s.Id_sucursal
        JOIN detalle_venta dv ON v.Id_venta  = dv.Id_venta
        JOIN productos  p   ON dv.Id_producto = p.Id_producto
        JOIN categoria  cat ON p.Id_categoria = cat.Id_categoria
    """

    if inicio and fin:
        query += " WHERE v.Fecha_venta BETWEEN %s AND %s"
        cursor.execute(query, (inicio, fin))
    else:
        cursor.execute(query)

    df = pd.DataFrame(cursor.fetchall())
    cursor.close()
    conn.close()

    if df.empty:
        return jsonify({"mensaje": "Sin datos"}), 204

    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine='openpyxl') as writer:

        # Hoja 1 — detalle completo
        df.to_excel(writer, index=False, sheet_name='Ventas')

        # Hoja 2 — resumen por categoría
        df.groupby('categoria').agg(
            total_vendido=('Subtotal', 'sum'),
            cantidad=('Cantidad', 'sum')
        ).reset_index().to_excel(writer, index=False, sheet_name='Por_Categoria')

        # Hoja 3 — resumen por empleado
        df.groupby('empleado').agg(
            total_ventas=('importe', 'sum')
        ).reset_index().to_excel(writer, index=False, sheet_name='Por_Empleado')

        # Hoja 4 — resumen por sucursal  (bonus, tenías la info disponible)
        df.groupby('sucursal').agg(
            total_ventas=('importe', 'sum'),
            num_ventas=('Id_venta', 'nunique')
        ).reset_index().to_excel(writer, index=False, sheet_name='Por_Sucursal')

    buf.seek(0)
    return app.response_class(
        buf.getvalue(),
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={"Content-Disposition": "attachment; filename=ventas.xlsx"}
    )

if __name__ == '__main__':
    app.run(debug=True)