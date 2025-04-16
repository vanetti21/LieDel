from flask import Flask, render_template, request, jsonify, send_from_directory
import mysql.connector
from flask_cors import CORS
import plotly.express as px
import pandas as pd
import datetime


# Configuración de Flask
app = Flask(__name__, template_folder='Home', static_folder='Home/estilo')  # Usamos 'estilo' para static

CORS(app)  # Permitir solicitudes desde el frontend

# Configuración de la base de datos
db_config = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "Admin12345",
    "database": "ventas"
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
        MONTH(fecha) AS month, 
        YEAR(fecha) AS year, 
        SUM(importe) AS sales
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
        CONCAT(UPPER(LEFT(c.nombre, 1)), LOWER(SUBSTRING(c.nombre, 2))) AS categoria,
        SUM(d.subtotal) AS total
    FROM detalle d
    JOIN producto p ON d.idprod = p.idprod
    JOIN categoria c ON p.idcat = c.idcat
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
        CONCAT(UCASE(LEFT(p.nombre, 1)), LCASE(SUBSTRING(p.nombre, 2))) AS product_name,
        SUM(d.cant) AS total_sales
    FROM detalle d
    JOIN producto p ON d.idprod = p.idprod
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
    cursor.execute("SELECT SUM(importe) AS total_sales FROM venta")
    total_sales = cursor.fetchone()['total_sales']
    if total_sales is None:
        total_sales = 0

    # Total Employees (empleado)
    cursor.execute("SELECT COUNT(DISTINCT idemp) AS employees FROM empleado")
    employees = cursor.fetchone()['employees']
    if employees is None:
        employees = 0

    # Total Products
    cursor.execute("SELECT COUNT(*) AS total_products FROM producto")
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


# Employees
@app.route('/obtener_empleados', methods=['GET'])
def obtener_empleados():

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT COUNT(DISTINCT idemp) AS employees FROM empleado")
    employees = cursor.fetchone()['employees']
    if employees is None:
        employees = 0

    cursor.close()
    conn.close()

    resumen_data = {
        "employees": employees,
    }

    return jsonify(resumen_data)

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
        cursor.execute("SELECT * FROM usuario WHERE usuario = %s AND clave = %s", (username, password))
        user = cursor.fetchone()
        conn.close()

        if user:
            return jsonify({"success": True, "message": "Inicio de sesión exitoso", "redirect": "/homes"}), 200
        else:
            return jsonify({"success": False, "message": "Usuario o contraseña incorrectos"}), 401
    else:
        return jsonify({"success": False, "message": "Error de conexión a la BD"}), 500

@app.route('/index', methods=['GET'])
def index():
    return render_template('index.html')  # Asegúrate de tener tu archivo index.html en la carpeta templates

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

    # Renderizar la página de inicio con los gráficos actuales
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

    # Conectar a la base de datos
    conn = conectar_bd()
    
    # Obtener gráfico de ventas totales en el rango de fechas
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

    # Obtener gráfico de productos vendidos en el rango de fechas
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

    # Obtener gráfico de ventas por categoría en el rango de fechas
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

    # Retornar los gráficos generados al frontend
    return jsonify({
        'graph_ventas_html': graph_ventas_html,
        'graph_productos_html': graph_productos_html,
        'graph_categoria_html': graph_categoria_html
    })
    
    

 
    
    

if __name__ == '__main__':
    app.run(debug=True)
