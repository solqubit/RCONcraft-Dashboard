const express = require('express');
const { Rcon } = require('rcon-client');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración del servidor RCON para Minecraft
const RCON_HOST = process.env.RCON_HOST || 'localhost';
const RCON_PORT = parseInt(process.env.RCON_PORT) || 25575;
const RCON_PASSWORD = process.env.RCON_PASSWORD;

if (!RCON_PASSWORD) {
    console.warn('⚠️ ADVERTENCIA: No se ha configurado RCON_PASSWORD en el archivo .env');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para comandos RCON
app.post('/api/rcon', async (req, res) => {
    const { command } = req.body;
    
    if (!command) {
        return res.status(400).json({ error: 'Comando no especificado' });
    }
    
    let rcon = null;
    
    try {
        // Conexión RCON al servidor Minecraft
        rcon = await Rcon.connect({
            host: RCON_HOST,
            port: RCON_PORT,
            password: RCON_PASSWORD,
            timeout: 5000
        });
        
        const response = await rcon.send(command);
        return res.json({ response });
    } catch (error) {
        // Mapeo de errores comunes a respuestas HTTP apropiadas
        const errorMap = {
            'Authentication failed': [401, 'Error de autenticación RCON. Verifica la contraseña en el archivo .env'],
            'connect ECONNREFUSED': [502, 'No se pudo conectar al servidor Minecraft. Verifica que esté en ejecución y que RCON esté habilitado.'],
            'timeout': [504, 'Tiempo de espera agotado al conectar con el servidor Minecraft']
        };
        
        // Buscar el tipo de error para dar una respuesta más específica
        for (const [errorText, [statusCode, errorMessage]] of Object.entries(errorMap)) {
            if (error.message.includes(errorText)) {
                return res.status(statusCode).json({ error: errorMessage });
            }
        }
        
        // Error genérico si no coincide con ninguno de los anteriores
        return res.status(500).json({ error: 'Error al conectar con el servidor RCON' });
    } finally {
        // Cerrar la conexión RCON si existe
        if (rcon) {
            try {
                await rcon.end();
            } catch (error) {
                // Silenciar errores al cerrar la conexión
            }
        }
    }
});

// Asegurarse de que las rutas de los componentes funcionen
app.get('/components/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', req.path));
});

// Manejar rutas SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Conectando a servidor Minecraft en ${RCON_HOST}:${RCON_PORT}`);
});
