# Portafolio interactivo

Portafolio personal desarrollado con React y Vite, con una interfaz temática de terminal interactiva. Permite explorar el perfil mediante comandos como `help`, `about`, `skills`, `projects`, `contact`, `clear` y `download-cv`, además de iniciar conversaciones mediante `escribeme`.

El contenido del perfil está en `src/data/portfolioContent.js`; los comandos y enlaces sociales se configuran en `src/data/command.js` y `src/data/socialLinks.js`. La bienvenida se configura en `src/data/terminalLines.js` como objetos `{ tipo: 'comando' | 'respuesta', texto: '...' }`.

La interfaz separa la ventana, las sugerencias de comandos y el footer en componentes independientes. Los efectos de sonido se activan después de la primera interacción del usuario, según las restricciones del navegador. La animación respeta la preferencia del sistema para reducir movimiento.

Javita, la mascota de la terminal, ofrece sugerencias tras seis segundos de inactividad y reacciona a los comandos. Su ilustración SVG se comparte con `public/favicon.svg`; se oculta en pantallas de hasta 480 px y respeta `prefers-reduced-motion`.

## Tecnologías

- React
- Vite
- JavaScript
- CSS3
- Spring Boot (backend en un repositorio independiente)

## Arquitectura

El proyecto está organizado en dos repositorios independientes:

- **Frontend:** aplicación desarrollada con React y Vite.
- **Backend:** API REST desarrollada con Spring Boot, encargada de procesar los mensajes enviados desde el formulario de contacto.

El frontend se comunica con el backend mediante peticiones HTTP. Esta separación permite mantener la interfaz y la lógica del servidor de manera independiente.

**Repositorio del backend:** Esta en el repositorio https://github.com/WilfredoAM22/portfolio-api
## Funcionalidades

- Terminal interactiva con ejecución de comandos.
- Navegación por las diferentes secciones del perfil.
- Historial y sugerencias de comandos.
- Javita, mascota interactiva con reacciones y sugerencias.
- Efectos de sonido.
- Interfaz adaptable a diferentes tamaños de pantalla.
- Compatibilidad con preferencias de movimiento reducido.
- Formulario de contacto conectado a una API externa.

## Requisitos

- Node.js
- npm
- Git

## Instalación y ejecución

Clona el repositorio:

```sh
git clone https://github.com/WilfredoAM22/cli-portfolio.git
```

Accede al proyecto:

```sh
cd cli-portfolio
```

Instala las dependencias:

```sh
npm install
```

Inicia el servidor de desarrollo:

```sh
npm run dev
```

## Configuración del backend

El formulario envía una petición `POST` a la URL configurada en `VITE_CONTACT_API_URL`.

Copia `.env.example` a `.env.local` y define la URL del endpoint de tu backend:

```env
VITE_CONTACT_API_URL=https://tu-dominio.example/api/contact
```

El endpoint debe aceptar JSON con los campos:

- `name`
- `email`
- `subject`
- `message`

Debe procesar el envío del correo y responder con un estado HTTP exitoso (`2xx`).

Las credenciales del proveedor de correo deben permanecer en el backend, nunca en variables `VITE_` ni en el navegador.

Si la URL no está configurada o el servicio falla, la terminal informa el error y permite reintentar.

## Currículum
Los archivos PDF del currículum no están incluidos en este repositorio.
