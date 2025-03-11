# Panel RCON Minecraft

Este es un panel web para administrar servidores de Minecraft a través del protocolo RCON. Permite ejecutar comandos, gestionar jugadores y monitorear el estado del servidor desde una interfaz web moderna.

## Características

- Interfaz web moderna y responsive
- Gestión de jugadores (teletransporte, permisos, moderación)
- Consola para ejecutar comandos directos
- Soporte para servidores locales y remotos
- Tema claro/oscuro (tema oscuro por defecto)

## Características Detalladas

### Panel Principal
- **Estado del Servidor**: Muestra información en tiempo real sobre el servidor:
  - Estado de conexión (online/offline)
  - Jugadores conectados

### Gestión de Jugadores
- **Lista de Jugadores**: Visualiza todos los jugadores conectados con actualización automática
- **Acciones Rápidas**: Botones de acceso rápido para:
  - Expulsar jugador (kick)
  - Banear jugador
  - Dar OP (permisos de operador)
  - Quitar OP

### Sistema de Teletransporte
- **Teletransporte Directo**: Mueve jugadores a coordenadas específicas
  - Campos X, Y, Z para coordenadas exactas
  - Mantiene el formato original de coordenadas para compatibilidad máxima
- **Teletransporte entre Jugadores**: Teletransporta un jugador a la ubicación de otro
- **Último Lugar de Muerte**: Permite teletransportar al jugador a su última ubicación de muerte

### Consola RCON
- **Consola Interactiva**: Terminal completa para ejecutar comandos de servidor
  - Historial de comandos con desplazamiento
  - Resaltado de sintaxis para mejor legibilidad
  - Respuestas del servidor en tiempo real

### Interfaz de Usuario
- **Diseño Responsivo**: Funciona en dispositivos móviles, tabletas y escritorio
- **Tema Oscuro/Claro**: Cambia entre temas para mayor comodidad visual
  - Tema oscuro por defecto para uso nocturno
  - Tema claro para entornos brillantes
- **Notificaciones**: Sistema de alertas para acciones importantes
- **Diseño Intuitivo**: Interfaz clara y fácil de usar para administradores nuevos y experimentados

### Seguridad
- **Conexión Segura**: Utiliza el protocolo RCON oficial de Minecraft
- **Registro de Actividad**: Seguimiento de comandos ejecutados

## Requisitos

- Node.js (versión 14.x o superior)
- Un servidor Minecraft con RCON habilitado

## Configuración del servidor Minecraft

Para habilitar RCON en tu servidor Minecraft:

1. Detén el servidor si está en ejecución
2. Edita el archivo `server.properties` de tu servidor Minecraft
3. Configura estas opciones:
   ```
   enable-rcon=true
   rcon.port=25575
   rcon.password=tu_contraseña_segura
   ```
4. Reinicia tu servidor Minecraft

## Instalación

1. Clona este repositorio o descárgalo
   ```bash
   git clone https://github.com/solqubit/RCONcraft-Dashboard.git
   cd RCONcraft-Dashboard
   ```

2. Instala las dependencias
   ```bash
   npm install
   ```

3. Modifica el archivo `.env` con tus propios valores:
   ```
   PORT=3000
   RCON_HOST=localhost     # Cambia a la IP de tu servidor Minecraft
   RCON_PORT=25575         # Puerto RCON de tu servidor Minecraft
   RCON_PASSWORD=your_rcon_password_here  # Tu contraseña RCON
   ```

## Configuración para servidores en la nube

Para conectarte a un servidor Minecraft en la nube o remoto:

1. Edita el archivo `.env` y cambia `RCON_HOST` a la dirección IP pública o privada de tu servidor, si es local puedes dejarlo `localhost`:
   ```
   RCON_HOST=localhost
   ```

2. Asegúrate de que el puerto RCON (por defecto 25575) esté abierto en el firewall del servidor.

3. Si tu servidor está detrás de un NAT, configura el reenvío de puertos adecuadamente.

## Ejecución

1. Inicia el servidor:
   ```bash
   npm start
   ```

2. Para desarrollo con recarga automática:
   ```bash
   npm run dev
   ```

3. Abre tu navegador y visita `http://localhost:3000` (o el puerto que hayas configurado)

## Despliegue en producción

Para desplegar en un entorno de producción:

1. Configura un servicio como PM2 para mantener la aplicación en ejecución:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "minecraft-panel"
   pm2 save
   ```

2. Considera usar un proxy inverso como Nginx para servir la aplicación de forma segura.

## Notas importantes sobre el teletransporte

El teletransporte funciona mejor cuando se mantiene el formato original de las coordenadas sin parsearlas:

```javascript
const x = document.getElementById('tpX').value;
const y = document.getElementById('tpY').value;
const z = document.getElementById('tpZ').value;

fullCommand = `tp ${name} ${x} ${y} ${z}`;
```

Cualquier intento de parsear o modificar las coordenadas puede causar problemas con la coordenada Z.

## Solución de problemas

Si encuentras errores de conexión:

1. Verifica que tu servidor Minecraft esté en ejecución
2. Asegúrate de que RCON esté habilitado en `server.properties`
3. Confirma que la contraseña RCON en el archivo `.env` coincide con la del servidor
4. Si usas un servidor remoto, verifica que el puerto RCON esté abierto en el firewall
5. Revisa los logs del servidor para más detalles sobre posibles errores

## Licencia

MIT
