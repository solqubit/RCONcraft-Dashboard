// Funciones para manejar la interfaz de usuario global

export async function initializeUI() {
    // Gestión de pestañas
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            
            // Desactivar todas las pestañas
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activar la pestaña seleccionada
            button.classList.add('active');
            document.getElementById(`${tab}-tab`).classList.add('active');
        });
    });
    
    // Modo oscuro
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // Verificar si hay una preferencia guardada, si no, usar tema oscuro por defecto
    let isDarkMode = localStorage.getItem('darkMode');
    
    // Si no hay preferencia guardada o no es 'false', usar tema oscuro por defecto
    if (isDarkMode === null || isDarkMode !== 'false') {
        isDarkMode = true;
        localStorage.setItem('darkMode', 'true');
    } else {
        isDarkMode = isDarkMode === 'true';
    }
    
    // Función para actualizar la UI según el modo oscuro
    const updateDarkModeUI = (isDarkMode) => {
        document.body.classList.toggle('dark-mode', isDarkMode);
        if (isDarkMode) {
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            darkModeToggle.title = 'Cambiar a tema claro';
        } else {
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            darkModeToggle.title = 'Cambiar a tema oscuro';
        }
        localStorage.setItem('darkMode', isDarkMode);
    };
    
    // Aplicar el tema inicial
    updateDarkModeUI(isDarkMode);
    
    // Habilitar el evento click para cambiar el tema
    darkModeToggle.addEventListener('click', () => {
        const currentMode = document.body.classList.contains('dark-mode');
        updateDarkModeUI(!currentMode);
    });
    
    // Manejar el overlay de carga
    handleLoadingOverlay();
    
    // Inicializar sistema de notificaciones
    initNotificationSystem();
    
    // Manejar el botón de actualización
    initRefreshButton();
    
    // Obtener datos iniciales del servidor
    try {
        await Promise.all([
            updatePlayerCount()
        ]);
        await simulateServerData();
    } catch (error) {
        console.error('Error al obtener datos iniciales:', error);
    }
}

// Función para manejar el overlay de carga
function handleLoadingOverlay() {
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // Si no existe el overlay, no hacer nada
    if (!loadingOverlay) return;
    
    // Ocultar el overlay después de que todo esté cargado
    if (document.readyState === 'complete') {
        // Si ya está cargado, ocultar después de un breve retraso
        setTimeout(() => {
            loadingOverlay.classList.add('fade-out');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }, 800);
    } else {
        // Si aún no está cargado, esperar al evento load
        window.addEventListener('load', () => {
            setTimeout(() => {
                loadingOverlay.classList.add('fade-out');
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                }, 500);
            }, 800);
        });
    }
}

// Sistema de notificaciones
export function initNotificationSystem() {
    const container = document.getElementById('notification-container');
    
    // Si no existe el contenedor, no inicializar
    if (!container) return;
    
    // Si ya existe, no lo inicializamos de nuevo
    if (window.notificationSystem) return;
    
    // Crear sistema de notificaciones global
    window.notificationSystem = {
        show: function(message, type = 'info', duration = 3000) {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            
            // Iconos según el tipo
            let icon = 'info-circle';
            if (type === 'success') icon = 'check-circle';
            if (type === 'error') icon = 'exclamation-circle';
            if (type === 'warning') icon = 'exclamation-triangle';
            
            notification.innerHTML = `
                <i class="fas fa-${icon}"></i>
                <span>${message}</span>
                <button class="close-btn"><i class="fas fa-times"></i></button>
            `;
            
            container.appendChild(notification);
            
            // Animación de entrada
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            // Botón para cerrar
            const closeBtn = notification.querySelector('.close-btn');
            closeBtn.addEventListener('click', () => {
                closeNotification(notification);
            });
            
            // Auto cerrar después del tiempo
            if (duration > 0) {
                setTimeout(() => {
                    closeNotification(notification);
                }, duration);
            }
            
            return notification;
        }
    };
    
    function closeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

// Función para inicializar el botón de actualización
function initRefreshButton() {
    const refreshButton = document.getElementById('refreshButton');
    
    // Si no existe el botón, no inicializar
    if (!refreshButton) return;
    
    refreshButton.addEventListener('click', async () => {
        // Añadir clase para animación de rotación
        refreshButton.classList.add('rotating');
        
        try {
            // Actualizar datos del servidor
            await simulateServerData(true);
            
            // Mostrar notificación
            if (window.notificationSystem) {
                window.notificationSystem.show('Datos actualizados correctamente', 'success');
            }
        } catch (error) {
            console.error('Error al actualizar datos:', error);
            if (window.notificationSystem) {
                window.notificationSystem.show('Error al actualizar los datos', 'error');
            }
        } finally {
            // Quitar animación
            setTimeout(() => {
                refreshButton.classList.remove('rotating');
            }, 300);
        }
    });
}

// Variables para mantener los datos del servidor consistentes
let serverData = {
    players: 0,
    isOnline: true
};

// Función para obtener el número real de jugadores
async function updatePlayerCount() {
    try {
        const response = await fetch('/api/rcon', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ command: 'list' })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        const match = data.response.match(/There are (\d+) of/);
        if (match) {
            serverData.players = parseInt(match[1]);
            serverData.isOnline = true;
        }
    } catch (error) {
        console.error('Error al obtener jugadores:', error);
        serverData.isOnline = false;
    }
}

// Función para actualizar datos del servidor
async function simulateServerData(isRefresh = false) {
    const playerCount = document.getElementById('playerCount');
    const statusIndicator = document.querySelector('.status-indicator');
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    
    // Si no existen los elementos, no hacer nada
    if (!playerCount || !statusIndicator || !statusText || !statusDot) return;
    
    // Actualizar datos del servidor
    if (isRefresh) {
        await updatePlayerCount();
    }
    
    // Actualizar UI
    if (isRefresh) {
        // Animar cambio de números solo si realmente cambiaron
        if (playerCount.textContent !== serverData.players.toString()) {
            animateNumberChange(playerCount, serverData.players);
        }
    } else {
        playerCount.textContent = serverData.players;
    }
    
    // Actualizar estado del servidor
    if (serverData.isOnline) {
        statusDot.classList.add('online');
        statusText.textContent = 'Online';
    } else {
        statusDot.classList.remove('online');
        statusText.textContent = 'Offline';
    }
}

// Función para animar cambio de números
function animateNumberChange(element, newValue) {
    const currentValue = parseInt(element.textContent);
    const diff = newValue - currentValue;
    const steps = 10;
    const stepValue = diff / steps;
    let currentStep = 0;
    
    const interval = setInterval(() => {
        currentStep++;
        const intermediateValue = Math.round(currentValue + stepValue * currentStep);
        element.textContent = intermediateValue;
        
        if (currentStep >= steps) {
            clearInterval(interval);
            element.textContent = newValue;
        }
    }, 50);
}
