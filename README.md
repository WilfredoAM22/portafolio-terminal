# Portafolio interactivo

Este Portafolio con tematica de terminal creado con React y Vite. La terminal presenta una bienvenida animada y permite explorar el perfil con `help`, `about`, `skills`, `projects`, `contact` y `clear`, además de iniciar un flujo de contacto con `escribeme`.

La bienvenida se configura en `src/data/terminalLines.js` como objetos `{ tipo: 'comando' | 'respuesta', texto: '...' }`. Los efectos de sonido se activan después de la primera interacción del usuario, según las restricciones del navegador. La animación respeta la preferencia del sistema para reducir movimiento.

## Desarrollo

```sh
npm install
npm run dev
```

## Configurar el envío de mensajes

El formulario envía una petición `POST` a la URL configurada en `VITE_CONTACT_API_URL`. Copia `.env.example` a `.env.local` y define la URL del endpoint de tu backend:

```env
VITE_CONTACT_API_URL=https://tu-dominio.example/api/contact
```

El endpoint debe aceptar JSON con los campos `name`, `email`, `subject` y `message`, procesar el envío del correo y responder con un estado HTTP exitoso (`2xx`). Las credenciales del proveedor de correo deben permanecer en el backend, nunca en variables `VITE_` ni en el navegador. Si la URL no está configurada o el servicio falla, la terminal informa el error y permite reintentar.
