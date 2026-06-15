// Estructura corporativa estandar de respuesta.

export const sendSuccess = (res, statusCode, data) =>
  res.status(statusCode).json({ status: 'success', data });

export const sendError = (res, statusCode, message, details = null) => {
  const body = { status: 'error', message };
  if (details) body.details = details;
  return res.status(statusCode).json(body);
};
