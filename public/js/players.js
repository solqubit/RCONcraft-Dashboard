import { sendRconCommand } from './rcon.js';

export function initPlayers() {
    // Elementos DOM
    const refreshPlayerList = document.getElementById('refreshPlayerList');
    const playerList = document.getElementById('playerList');
    const playerName = document.getElementById('playerName');
    const toggleEditMode = document.getElementById('toggleEditMode');
    const playerButtons = document.querySelectorAll('.player-btn:not(#tpToCoords)'); // Excluir el botón de teletransporte a coordenadas
    const targetPlayerSelect = document.getElementById('targetPlayer');
    const tpToCoords = document.getElementById('tpToCoords');
    const playerSearch = document.getElementById('playerSearch'); // Nuevo elemento para búsqueda
    
    // Estado de editable
    let isEditMode = true; // Comenzamos en modo editable
    
    // Función para extraer jugadores de la respuesta del servidor
    const extractPlayers = (response) => {
        if (!response || response.trim() === '') {
            return [];
        }
        
        let players = [];
        let match = response.match(/There are \d+ of a max of \d+ players online:?(.*)/); 
        
        if (match) {
            const playerList = match[1].trim();
            if (playerList) {
                players = playerList.split(',').map(p => p.trim()).filter(p => p);
            }
        } else if (response.includes('players online:')) {
            const playerList = response.split('players online:')[1].trim();
            if (playerList) {
                players = playerList.split(',').map(p => p.trim()).filter(p => p);
            }
        } else if (!response.toLowerCase().includes('error')) {
            players = response.split(',').map(p => p.trim()).filter(p => p);
        }
        
        return players;
    };
    
    // Cargar lista de jugadores
    const loadPlayerList = async () => {
        playerList.innerHTML = '<div class="loading">Cargando jugadores...</div>';
        
        try {
            const response = await sendRconCommand('list');
            const players = extractPlayers(response);
            
            // Generar HTML para la lista de jugadores
            if (players.length === 0) {
                playerList.innerHTML = '<div class="no-players"><i class="fas fa-user-slash"></i> No hay jugadores conectados</div>';
            } else {
                playerList.innerHTML = players.map(player => 
                    `<div class="player-item" data-player="${player}">
                        <i class="fas fa-user"></i> ${player}
                    </div>`
                ).join('');
            }
            
            // Actualizar contador de jugadores
            const playerCount = document.getElementById('playerCount');
            if (playerCount) {
                playerCount.textContent = players.length;
            }
            
            // Actualizar select de jugadores destino
            updateTargetPlayerSelect(players);
            
            // Añadir eventos a cada jugador en la lista
            document.querySelectorAll('.player-item').forEach(item => {
                item.addEventListener('click', () => {
                    const name = item.dataset.player;
                    playerName.value = name;
                    highlightSelectedPlayer(item);
                });
            });
        } catch (error) {
            playerList.innerHTML = '<div class="error"><i class="fas fa-exclamation-triangle"></i> Error al cargar jugadores: ' + error.message + '</div>';
        }
    };
    
    // Actualizar select de jugadores destino
    const updateTargetPlayerSelect = (players) => {
        if (!targetPlayerSelect) return;
        
        // Guardar el valor seleccionado actualmente
        const currentValue = targetPlayerSelect.value;
        
        // Limpiar opciones actuales excepto la primera
        while (targetPlayerSelect.options.length > 1) {
            targetPlayerSelect.remove(1);
        }
        
        // Añadir nuevas opciones
        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            targetPlayerSelect.appendChild(option);
        });
        
        // Restaurar valor seleccionado si existía
        if (currentValue && players.includes(currentValue)) {
            targetPlayerSelect.value = currentValue;
        }
    };
    
    // Resaltar jugador seleccionado
    const highlightSelectedPlayer = (selectedItem) => {
        document.querySelectorAll('.player-item').forEach(item => {
            item.classList.remove('selected');
        });
        selectedItem.classList.add('selected');
    };
    
    // Mostrar mensaje de alerta
    const showAlert = (message) => {
        alert(message);
    };
    
    // Ejecutar comando RCON
    const executeCommand = async (command) => {
        try {
            const response = await sendRconCommand(command);
            return response;
        } catch (error) {
            showAlert('Error al ejecutar comando: ' + error.message);
            return null;
        }
    };
    
    // Alternar modo de edición
    const toggleEditableMode = () => {
        isEditMode = !isEditMode;
        
        if (isEditMode) {
            // Activar modo editable
            playerName.removeAttribute('readonly');
            toggleEditMode.classList.add('active');
            toggleEditMode.title = 'Desactivar edición manual';
            toggleEditMode.querySelector('i').className = 'fas fa-check';
        } else {
            // Desactivar modo editable
            playerName.setAttribute('readonly', 'readonly');
            toggleEditMode.classList.remove('active');
            toggleEditMode.title = 'Activar edición manual';
            toggleEditMode.querySelector('i').className = 'fas fa-edit';
        }
    };
    
    // Event listeners para los botones de jugadores
    playerButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const command = button.dataset.command;
            const name = playerName.value.trim();
            
            if (!name) {
                showAlert('Por favor, selecciona o ingresa un nombre de jugador');
                return;
            }
            
            let fullCommand = '';
            
            switch (command) {
                case 'op':
                    fullCommand = `op ${name}`;
                    break;
                case 'deop':
                    fullCommand = `deop ${name}`;
                    break;
                case 'ban':
                    fullCommand = `ban ${name}`;
                    break;
                case 'pardon':
                    fullCommand = `pardon ${name}`;
                    break;
                case 'kick':
                    fullCommand = `kick ${name}`;
                    break;
                case 'tp-death':
                    fullCommand = `tp ${name} ~ ~ ~`; // Teletransportar al último lugar de muerte
                    break;
                default:
                    return;
            }
            
            await executeCommand(fullCommand);
        });
    });
    
    // Event listener para teletransportar a otro jugador
    if (document.getElementById('tpToPlayer')) {
        document.getElementById('tpToPlayer').addEventListener('click', async () => {
            const name = playerName.value.trim();
            const targetPlayer = targetPlayerSelect.value;
            
            if (!name) {
                showAlert('Por favor, selecciona o ingresa un nombre de jugador');
                return;
            }
            
            if (!targetPlayer) {
                showAlert('Por favor, selecciona un jugador destino');
                return;
            }
            
            const fullCommand = `tp ${name} ${targetPlayer}`;
            await executeCommand(fullCommand);
        });
    }
    
    // Event listener para teletransportar a coordenadas
    tpToCoords.addEventListener('click', async () => {
        const name = playerName.value.trim();
        const x = document.getElementById('tpX').value;
        const y = document.getElementById('tpY').value;
        const z = document.getElementById('tpZ').value;
        
        if (!name) {
            showAlert('Por favor, selecciona o ingresa un nombre de jugador');
            return;
        }
        
        if (!x || !y || !z) {
            showAlert('Por favor, ingresa las coordenadas X, Y y Z');
            return;
        }
        
        // Mantener el formato original sin parsear las coordenadas
        const fullCommand = `tp ${name} ${x} ${y} ${z}`;
        await executeCommand(fullCommand);
    });
    
    // Funcionalidad de búsqueda de jugadores
    const filterPlayers = (searchTerm) => {
        const playerItems = document.querySelectorAll('.player-item');
        let hasVisiblePlayers = false;
        
        playerItems.forEach(item => {
            const playerNameText = item.textContent.trim().toLowerCase();
            if (playerNameText.includes(searchTerm.toLowerCase())) {
                item.style.display = 'flex';
                hasVisiblePlayers = true;
            } else {
                item.style.display = 'none';
            }
        });
        
        // Mostrar mensaje si no hay resultados
        const noResultsElement = document.querySelector('.no-search-results');
        if (!hasVisiblePlayers) {
            if (!noResultsElement) {
                const noResults = document.createElement('div');
                noResults.className = 'no-search-results';
                noResults.innerHTML = `<i class="fas fa-search"></i> No se encontraron jugadores con "${searchTerm}"`;
                playerList.appendChild(noResults);
            }
        } else if (noResultsElement) {
            noResultsElement.remove();
        }
    };
    
    // Event listeners
    if (refreshPlayerList) {
        refreshPlayerList.addEventListener('click', loadPlayerList);
    }
    
    // Event listener para la búsqueda de jugadores
    if (playerSearch) {
        playerSearch.addEventListener('input', (e) => {
            filterPlayers(e.target.value);
        });
    }
    
    // Event listener para alternar modo de edición
    if (toggleEditMode) {
        toggleEditMode.addEventListener('click', toggleEditableMode);
        // Iniciar en modo editable
        toggleEditableMode();
    }
    
    // Cargar la lista de jugadores al iniciar
    loadPlayerList();
}
