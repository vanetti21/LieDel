from flask import Flask, render_template, request, jsonify
import mysql.connector
from flask_cors import CORS
import os

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

@app.route('/homes', methods=['GET'])
def home():
    return render_template('homes.html')  # Sirve la página home.html

@app.route('/index', methods=['GET'])
def index():
    return render_template('index.html')  # Sirve la página index.html

if __name__ == '__main__':
    app.run(debug=True)
