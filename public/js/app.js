// Importar módulos
import { initializeUI } from './ui.js';
import { initPlayers } from './players.js';
import { initSecurity } from './security.js';
import { initConsole } from './console.js';

// Cargar componentes HTML
async function loadComponents() {
    const playerTab = document.getElementById('players-tab');
    const securityTab = document.getElementById('security-tab');
    const consoleTab = document.getElementById('console-tab');
    
    // Verificar que todos los tabs existen
    if (!playerTab || !securityTab || !consoleTab) {
        document.body.innerHTML = `
            <div class="error-container" style="padding: 20px; text-align: center; margin: 50px auto; max-width: 600px;">
                <h2>Error cargando la aplicación</h2>
                <p>No se pudieron encontrar los contenedores de pestañas necesarios.</p>
                <p>Verifica que la estructura HTML sea correcta.</p>
            </div>
        `;
        return;
    }
    
    try {
        // Cargar componentes HTML con manejo de errores
        const loadComponent = async (url) => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.text();
            } catch (error) {
                return `<div class="error-container">
                    <h3>Error cargando el componente</h3>
                    <p>${error.message}</p>
                    <p>Verifica que todos los archivos estén en la ubicación correcta.</p>
                </div>`;
            }
        };
        
        // Cargar todos los componentes
        const [playersHtml, securityHtml, consoleHtml] = await Promise.all([
            loadComponent('./components/players.html'),
            loadComponent('./components/security.html'),
            loadComponent('./components/console.html')
        ]);
        
        // Insertar componentes en el DOM
        playerTab.innerHTML = playersHtml;
        securityTab.innerHTML = securityHtml;
        consoleTab.innerHTML = consoleHtml;
        
        // Inicializar todos los módulos
        initializeUI();
        initPlayers();
        initSecurity();
        initConsole();
        
    } catch (error) {
        document.getElementById('components-container').innerHTML = `
            <div class="error-container">
                <h2>Error cargando la aplicación</h2>
                <p>${error.message}</p>
                <p>Verifica que todos los archivos estén en la ubicación correcta y que el servidor esté en ejecución.</p>
            </div>
        `;
    }
}

// Iniciar la aplicación cuando se carga el documento
document.addEventListener('DOMContentLoaded', loadComponents);
