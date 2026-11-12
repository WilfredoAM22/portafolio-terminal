const contactApiUrl = import.meta.env.VITE_CONTACT_API_URL;

export async function sendContactMessage(message) {
    if (!contactApiUrl) {
        throw new Error('El servicio de contacto no está configurado. Define VITE_CONTACT_API_URL para habilitar los envíos.');
    }

    let response;
    try {
        response = await fetch(contactApiUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(message),
        });
    } catch {
        throw new Error('No se pudo conectar con el servicio de contacto. Revisa tu conexión e inténtalo nuevamente.');
    }

    if (!response.ok) {
        throw new Error(`El servicio respondió con un error (${response.status}). Inténtalo nuevamente más tarde.`);
    }
}
