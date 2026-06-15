import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/httpResponse.js';

// Middleware para rutas inexistentes (404).
export const notFoundHandler = (req, res) => {
  sendError(res, 404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`);
};

// Global Error Boundary: unico punto de salida para cualquier excepcion.
// Distingue errores operacionales (controlados) de fallos inesperados.
// eslint-disable-next-line no-unused-vars
export const globalErrorHandler = (err, req, res, next) => {
  if (err instanceof AppError && err.isOperational) {
    return sendError(res, err.statusCode, err.message, err.details ?? null);
  }

  // Body JSON malformado emitido por express.json().
  if (err?.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return sendError(res, 400, 'El cuerpo de la peticion no es un JSON valido');
  }

  console.error('[ERROR NO CONTROLADO]', err);
  return sendError(res, 500, 'Error interno del servidor');
};
