const contactApiUrl = import.meta.env.VITE_CONTACT_API_URL;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_FIELDS = ['name', 'email', 'subject', 'message'];

function validateMessage(message) {
    if (!message || typeof message !== 'object') {
        throw new Error('Completa todos los campos antes de enviar el mensaje.');
    }

    for (const field of CONTACT_FIELDS) {
        if (typeof message[field] !== 'string' || !message[field].trim()) {
            throw new Error('Completa todos los campos antes de enviar el mensaje.');
        }
    }

    if (!EMAIL_PATTERN.test(message.email.trim())) {
        throw new Error('El correo electrónico no tiene un formato válido.');
    }

    return Object.fromEntries(
        CONTACT_FIELDS.map((field) => [field, message[field].trim()]),
    );
}

export async function sendContactMessage(message) {
    const validatedMessage = validateMessage(message);

    if (!contactApiUrl) {
        throw new Error('El servicio de contacto no está configurado. Define VITE_CONTACT_API_URL para habilitar los envíos.');
    }

    let response;
    try {
        response = await fetch(contactApiUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(validatedMessage),
        });
    } catch {
        throw new Error('No se pudo conectar con el servicio de contacto. Revisa tu conexión e inténtalo nuevamente.');
    }

    if (!response.ok) {
        throw new Error(`El servicio respondió con un error (${response.status}). Inténtalo nuevamente más tarde.`);
    }
}
