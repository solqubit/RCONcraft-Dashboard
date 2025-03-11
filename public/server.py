from flask import Flask, request, jsonify, send_from_directory
from mcrcon import MCRcon
import os

app = Flask(__name__, static_folder='.')

# Configuración RCON
RCON_HOST = 'localhost'  # Usando localhost ya que el servidor está en la misma máquina
RCON_PORT = 25575
RCON_PASSWORD = '060506'

def execute_rcon_command(command):
    try:
        with MCRcon(RCON_HOST, RCON_PASSWORD, RCON_PORT) as mcr:
            response = mcr.command(command)
            return response
    except Exception as e:
        return f"Error: {str(e)}"

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    if os.path.exists(path):
        return send_from_directory('.', path)
    return send_from_directory('.', 'index.html')

@app.route('/api/rcon', methods=['POST'])
def rcon_command():
    data = request.get_json()
    if not data or 'command' not in data:
        return jsonify({'error': 'No se proporcionó ningún comando'}), 400

    command = data['command'].strip()
    if not command:
        return jsonify({'error': 'El comando está vacío'}), 400

    try:
        response = execute_rcon_command(command)
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print(f"Iniciando servidor RCON en {RCON_HOST}:{RCON_PORT}")
    app.run(host='0.0.0.0', port=8000)
