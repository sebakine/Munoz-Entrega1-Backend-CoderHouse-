# Ecommerce Backend - Entrega N° 1

Servidor REST en Node.js + Express para la gestión de **productos** y **carritos de compra**, con persistencia en sistema de archivos (`products.json` y `carts.json`).

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

## Arquitectura

Arquitectura en capas con responsabilidades separadas:

```
src/
├── config/          Configuración central (puerto, rutas de datos)
├── controllers/     Capa HTTP: traduce request/response y delega
├── managers/        Lógica de negocio y persistencia (ProductManager, CartManager)
├── middlewares/     Middleware global de errores y 404
├── routes/          Routers de Express (/api/products, /api/carts)
├── utils/           Errores personalizados, respuestas, almacenamiento, validadores
├── app.js           Ensamblado de la app Express
└── server.js        Arranque del servidor y manejo de señales
```

Toda respuesta sigue el contrato corporativo:

```json
{ "status": "success", "data": ... }
{ "status": "error", "message": "...", "details": ... }
```

## Endpoints

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

- **SOLID / DRY**: managers desacoplados de HTTP, inyección de dependencias, controladores delgados.
- **Resiliencia**: middleware global de errores, clases de error con código HTTP semántico, sin `try/catch` vacíos, captura de `unhandledRejection`.
- **Seguridad**: validación estricta de payloads (HTTP 400 con detalle), protección anti *path traversal* en el acceso a archivos, escritura atómica para evitar corrupción.
