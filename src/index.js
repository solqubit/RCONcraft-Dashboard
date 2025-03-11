const express = require('express');
const { Rcon } = require('rcon-client');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const rconConfig = {
    host: process.env.RCON_HOST || 'localhost',
    port: parseInt(process.env.RCON_PORT || '25575'),
    password: process.env.RCON_PASSWORD || '060506'
};

// Ruta para la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Middleware para loguear todas las solicitudes
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
    }
    next();
});

// Mantener la ruta original /command que está usando el cliente
app.post('/command', async (req, res) => {
    console.log('Recibida solicitud de comando en /command:', req.body.command);
    try {
        console.log('Intentando conectar a RCON con config:', {
            host: rconConfig.host,
            port: rconConfig.port,
            password: '***' // Ocultamos la contraseña en los logs
        });
        const rcon = await Rcon.connect(rconConfig);
        console.log('Conexión RCON exitosa');
        const response = await rcon.send(req.body.command);
        console.log('Respuesta del servidor:', response);
        await rcon.end();
        res.json({ success: true, response });
    } catch (error) {
        console.error('Error RCON:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// También mantener la ruta /api/command para futuras actualizaciones del cliente
app.post('/api/command', async (req, res) => {
    console.log('Recibida solicitud de comando:', req.body.command);
    try {
        console.log('Intentando conectar a RCON con config:', {
            host: rconConfig.host,
            port: rconConfig.port,
            password: '***' // Ocultamos la contraseña en los logs
        });
        const rcon = await Rcon.connect(rconConfig);
        console.log('Conexión RCON exitosa');
        const response = await rcon.send(req.body.command);
        console.log('Respuesta del servidor:', response);
        await rcon.end();
        res.json({ success: true, response });
    } catch (error) {
        console.error('Error RCON:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the panel at http://localhost:${PORT}`);
    console.log(`RCON configurado para conectar a ${rconConfig.host}:${rconConfig.port}`);
});