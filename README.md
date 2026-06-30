# Ecommerce Backend - Entrega N° 2

Servidor en Node.js + Express para la gestión de **productos** y **carritos de compra**, con persistencia en sistema de archivos (`products.json` y `carts.json`). La Entrega N° 2 incorpora **vistas con Handlebars** y **actualización en tiempo real con Socket.IO**, manteniendo intacta la API REST de la Entrega N° 1.

## Requisitos

- Node.js >= 18

## Instalación

```bash
npm install
```

## Ejecución

```bash
# Producción
npm start

# Desarrollo (recarga automática con nodemon)
npm run dev
```

El servidor escucha en `http://localhost:8080`.

## Smoke test

```bash
npm run smoke
```

## Vistas

| Ruta                | Vista                        | Descripción                                                        |
|---------------------|------------------------------|--------------------------------------------------------------------|
| `GET /`             | `home.handlebars`            | Listado completo de productos renderizado en el servidor.          |
| `GET /realtimeproducts` | `realTimeProducts.handlebars` | Listado que se actualiza solo (sin refrescar) vía WebSocket.   |

Ambas vistas reutilizan el layout `views/layouts/main.handlebars`.

## Tiempo real (Socket.IO)

En `/realtimeproducts` los formularios de **crear** y **eliminar** se comunican exclusivamente por WebSocket. Toda creación o eliminación se difunde (*broadcast*) a todos los clientes conectados, que actualizan su listado al instante.

| Evento            | Dirección          | Payload                              |
|-------------------|--------------------|--------------------------------------|
| `products:list`   | Servidor a Cliente | Arreglo de productos (estado actual) |
| `products:create` | Cliente a Servidor | Datos del producto + *ack*           |
| `products:delete` | Cliente a Servidor | `id` del producto + *ack*            |

El *ack* devuelve `{ ok: true }` o `{ ok: false, error, details }`, de modo que los errores de validación regresan únicamente al cliente que originó la operación, mientras que `products:list` se difunde a todos.

El socket no contiene lógica de negocio: delega íntegramente en el `ProductManager` existente (validación, persistencia, unicidad de `code`) y solo coordina la comunicación.

## Arquitectura

Arquitectura en capas con responsabilidades separadas. Un único `ProductManager` se crea en el *composition root* (`server.js`) y se inyecta en la API REST, las vistas y el socket.

```
src/
├── config/          Configuración central (puerto, rutas de datos, vistas y estáticos)
├── controllers/     Capa HTTP: traduce request/response y delega
├── managers/        Lógica de negocio y persistencia (ProductManager, CartManager)
├── middlewares/     Middleware global de errores y 404
├── routes/          Routers de Express (/api/products, /api/carts, vistas)
├── sockets/         Coordinación de eventos Socket.IO (sin lógica de negocio)
├── views/           Plantillas Handlebars (layout, home, realTimeProducts)
├── public/          Estáticos servidos (css, cliente Socket.IO)
├── utils/           Errores personalizados, respuestas, almacenamiento, validadores
├── app.js           Ensamblado de la app Express (Handlebars, estáticos, routers)
└── server.js        Arranque HTTP + Socket.IO y manejo de señales
```

Toda respuesta de la API REST sigue el contrato corporativo:

```json
{ "status": "success", "data": ... }
{ "status": "error", "message": "...", "details": ... }
```

## Endpoints REST

### Productos — `/api/products`

| Método | Ruta        | Descripción                                  |
|--------|-------------|----------------------------------------------|
| GET    | `/`         | Lista todos los productos                    |
| GET    | `/:pid`     | Obtiene un producto por id                   |
| POST   | `/`         | Crea un producto (id autogenerado)           |
| PUT    | `/:pid`     | Actualiza campos (no modifica el id)         |
| DELETE | `/:pid`     | Elimina un producto                          |

Campos del producto: `title`, `description`, `code` (único), `price`, `status` (default `true`), `stock`, `category`, `thumbnails` (array de strings). El `id` se autogenera.

### Carritos — `/api/carts`

| Método | Ruta                      | Descripción                                       |
|--------|---------------------------|---------------------------------------------------|
| POST   | `/`                       | Crea un carrito vacío                             |
| GET    | `/:cid`                   | Lista los productos del carrito                   |
| POST   | `/:cid/product/:pid`      | Agrega un producto (incrementa quantity si existe)|

## Decisiones de diseño

- **SOLID / DRY**: managers desacoplados de HTTP, inyección de dependencias, controladores delgados, un único `ProductManager` compartido por REST, vistas y socket.
- **Resiliencia**: middleware global de errores, clases de error con código HTTP semántico, sin `try/catch` vacíos, captura de `unhandledRejection`, cierre ordenado de HTTP + Socket.IO.
- **Seguridad**: validación estricta de payloads (también en los eventos de socket, reutilizando los validadores existentes), protección anti *path traversal* en el acceso a archivos, escritura atómica para evitar corrupción, render del lado del cliente con `textContent` para neutralizar XSS.
```
