import { sendRconCommand } from './rcon.js';

export function initSecurity() {
    // Elementos DOM
    const refreshBans = document.getElementById('refreshBans');
    const refreshIpBans = document.getElementById('refreshIpBans');
    const refreshWhitelist = document.getElementById('refreshWhitelist');
    const banList = document.getElementById('banList');
    const ipBanList = document.getElementById('ipBanList');
    const whitelistList = document.getElementById('whitelistList');
    const whitelistName = document.getElementById('whitelistName');
    const whitelistButtons = document.querySelectorAll('.whitelist-btn');
    
    // Cargar listas
    const loadBanList = async () => {
        banList.innerHTML = '<div class="loading">Cargando lista de baneados...</div>';
        try {
            const response = await sendRconCommand('banlist');
            banList.innerHTML = parseList(response, 'banlist');
        } catch (error) {
            banList.innerHTML = '<div class="error">Error al cargar la lista</div>';
        }
    };
    
    const loadIpBanList = async () => {
        ipBanList.innerHTML = '<div class="loading">Cargando lista de IPs baneadas...</div>';
        try {
            const response = await sendRconCommand('banlist ips');
            ipBanList.innerHTML = parseList(response, 'banlist-ip');
        } catch (error) {
            ipBanList.innerHTML = '<div class="error">Error al cargar la lista</div>';
        }
    };
    
    const loadWhitelist = async () => {
        whitelistList.innerHTML = '<div class="loading">Cargando whitelist...</div>';
        try {
            const response = await sendRconCommand('whitelist list');
            whitelistList.innerHTML = parseList(response, 'whitelist');
        } catch (error) {
            whitelistList.innerHTML = '<div class="error">Error al cargar la whitelist</div>';
        }
    };
    
    // Procesar respuestas de las listas
    const parseList = (response, type) => {
        if (response.includes('There are no')) {
            return '<div class="empty-list">La lista está vacía</div>';
        }
        
        let players = [];
        
        if (type === 'whitelist') {
            const match = response.match(/There are (\d+) whitelisted players:(.*)/);
            if (match && match[2]) {
                players = match[2].trim().split(',').map(p => p.trim()).filter(p => p);
            }
        } else {
            // Banlist y IP banlist tienen formato similar
            const lines = response.split('\n');
            players = lines.filter(line => line && !line.includes('There are')).map(line => line.trim());
        }
        
        if (players.length === 0) {
            return '<div class="empty-list">La lista está vacía</div>';
        }
        
        const icon = type === 'whitelist' ? 'fa-user-check' : 'fa-ban';
        
        return players.map(player => 
            `<div class="list-item">
                <i class="fas ${icon}"></i> ${player}
            </div>`
        ).join('');
    };
    
    // Configurar eventos
    refreshBans.addEventListener('click', loadBanList);
    refreshIpBans.addEventListener('click', loadIpBanList);
    refreshWhitelist.addEventListener('click', loadWhitelist);
    
    // Manejar botones de whitelist
    whitelistButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const command = button.dataset.command;
            
            // Para los comandos que necesitan un nombre de jugador
            if (command.includes('add') || command.includes('remove')) {
                const name = whitelistName.value.trim();
                if (!name) {
                    alert('Debes ingresar un nombre de jugador');
                    return;
                }
                
                try {
                    const response = await sendRconCommand(`${command} ${name}`);
                    alert(`Comando ejecutado: ${command} ${name}\nRespuesta: ${response}`);
                    // Actualizar la lista después de una acción
                    loadWhitelist();
                } catch (error) {
                    alert(`Error ejecutando comando: ${error.message}`);
                }
            } else {
                // Para comandos como "whitelist on/off"
                try {
                    const response = await sendRconCommand(command);
                    alert(`Comando ejecutado: ${command}\nRespuesta: ${response}`);
                } catch (error) {
                    alert(`Error ejecutando comando: ${error.message}`);
                }
            }
        });
    });
    
    // Cargar listas al inicializar
    loadBanList();
    loadIpBanList();
    loadWhitelist();
}
