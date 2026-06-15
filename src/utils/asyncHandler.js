// Envuelve controladores asincronos y canaliza cualquier rechazo de promesa
// hacia el middleware global de errores, evitando unhandled rejections.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
