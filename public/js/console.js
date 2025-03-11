import { sendRconCommand } from './rcon.js';

export function initConsole() {
    const consoleOutput = document.getElementById('consoleOutput');
    const commandInput = document.getElementById('commandInput');
    const sendCommand = document.getElementById('sendCommand');
    
    if (!consoleOutput || !commandInput || !sendCommand) {
        console.error('Error: No se pudieron encontrar los elementos necesarios para la consola');
        return;
    }
    
    let commandHistory = [];
    let historyIndex = -1;
    
    const addConsoleMessage = (message, type = 'response') => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('console-message', type);
        
        // Formatear el mensaje según el tipo
        switch (type) {
            case 'command':
                messageElement.innerHTML = `<span class="prompt">&gt;</span> ${message}`;
                break;
            case 'error':
                messageElement.innerHTML = `<span class="error-icon">❌</span> ${message}`;
                break;
            case 'info':
                messageElement.innerHTML = `<span class="info-icon">ℹ️</span> ${message}`;
                break;
            case 'success':
                messageElement.innerHTML = `<span class="success-icon">✅</span> ${message}`;
                break;
            default:
                // Detectar si es un error basado en el contenido
                if (message.toLowerCase().includes('error') || message.toLowerCase().includes('unknown')) {
                    messageElement.classList.add('error');
                    messageElement.innerHTML = `<span class="error-icon">❌</span> ${message}`;
                } else {
                    messageElement.textContent = message;
                }
        }
        
        // Insertar el mensaje y hacer scroll
        consoleOutput.appendChild(messageElement);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
        
        // Forzar repaint para asegurar que el mensaje sea visible
        messageElement.offsetHeight;
        
        // Guardar el scroll para después
        const shouldScroll = consoleOutput.scrollHeight - consoleOutput.scrollTop === consoleOutput.clientHeight;
        
        // Asegurar que el mensaje sea visible
        if (shouldScroll) {
            setTimeout(() => {
                consoleOutput.scrollTop = consoleOutput.scrollHeight;
            }, 10);
        }
    };
    
    const executeCommand = async () => {
        const command = commandInput.value.trim();
        
        if (!command) return;
        
        // Guardar en historial
        if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== command) {
            commandHistory.push(command);
            if (commandHistory.length > 50) commandHistory.shift();
        }
        historyIndex = commandHistory.length;
        
        localStorage.setItem('commandHistory', JSON.stringify(commandHistory));
        
        // Mostrar el comando en la consola
        addConsoleMessage(command, 'command');
        
        // Deshabilitar input mientras se ejecuta
        commandInput.disabled = true;
        sendCommand.disabled = true;
        
        try {
            const response = await sendRconCommand(command);
            console.log('Respuesta del servidor:', response); // Debug
            
            // Determinar el tipo de mensaje basado en el contenido
            let messageType = 'response';
            if (response.toLowerCase().includes('error') || response.toLowerCase().includes('unknown')) {
                messageType = 'error';
            } else if (response.toLowerCase().includes('done') || response.toLowerCase().includes('success')) {
                messageType = 'success';
            }
            
            addConsoleMessage(response, messageType);
        } catch (error) {
            console.error('Error ejecutando comando:', error); // Debug
            addConsoleMessage(error.message, 'error');
        } finally {
            commandInput.disabled = false;
            sendCommand.disabled = false;
            commandInput.value = '';
            commandInput.focus();
        }
    };
    
    sendCommand.addEventListener('click', executeCommand);
    
    commandInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            executeCommand();
        }
    });
    
    commandInput.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp') {
            if (historyIndex > 0) {
                historyIndex--;
                commandInput.value = commandHistory[historyIndex];
            }
            event.preventDefault();
        } else if (event.key === 'ArrowDown') {
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                commandInput.value = commandHistory[historyIndex];
            } else if (historyIndex === commandHistory.length - 1) {
                historyIndex = commandHistory.length;
                commandInput.value = '';
            }
            event.preventDefault();
        }
    });
    
    // Cargar historial guardado
    try {
        const savedHistory = localStorage.getItem('commandHistory');
        if (savedHistory) {
            commandHistory = JSON.parse(savedHistory);
            historyIndex = commandHistory.length;
        }
    } catch (error) {
        console.error('Error cargando historial:', error);
    }
    
    // Mensajes iniciales
    addConsoleMessage('Consola RCON iniciada. Escribe un comando para empezar.', 'info');
    addConsoleMessage('Usa las teclas ↑/↓ para navegar por el historial.', 'info');
}
