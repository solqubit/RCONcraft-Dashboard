// Funciones para comunicación con el servidor RCON

// Función para enviar comandos RCON al servidor Minecraft
export async function sendRconCommand(command) {
    try {
        const response = await fetch('/api/rcon', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ command })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        throw error;
    }
}
