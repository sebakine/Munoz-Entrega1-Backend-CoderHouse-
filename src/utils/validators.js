import { ValidationError } from './errors.js';

const isString = (v) => typeof v === 'string';
const isNumber = (v) => typeof v === 'number' && Number.isFinite(v);
const isBoolean = (v) => typeof v === 'boolean';

// Contrato de un producto nuevo. Devuelve un objeto saneado o lanza
// ValidationError (HTTP 400) con el detalle de cada campo invalido.
export const validateNewProduct = (payload) => {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    throw new ValidationError('El cuerpo de la peticion debe ser un objeto');
  }

  const errores = [];
  const { title, description, code, price, status, stock, category, thumbnails } = payload;

  if (!isString(title) || title.trim() === '') errores.push('title debe ser un string no vacio');
  if (!isString(description) || description.trim() === '') errores.push('description debe ser un string no vacio');
  if (!isString(code) || code.trim() === '') errores.push('code debe ser un string no vacio');
  if (!isNumber(price) || price < 0) errores.push('price debe ser un numero mayor o igual a 0');
  if (stock === undefined || !Number.isInteger(stock) || stock < 0) errores.push('stock debe ser un entero mayor o igual a 0');
  if (!isString(category) || category.trim() === '') errores.push('category debe ser un string no vacio');

  const statusFinal = status === undefined ? true : status;
  if (!isBoolean(statusFinal)) errores.push('status debe ser booleano');

  let thumbnailsFinal = [];
  if (thumbnails !== undefined) {
    if (!Array.isArray(thumbnails) || !thumbnails.every(isString)) {
      errores.push('thumbnails debe ser un arreglo de strings');
    } else {
      thumbnailsFinal = thumbnails;
    }
  }

  if (errores.length > 0) {
    throw new ValidationError('Validacion de producto fallida', errores);
  }

  return {
    title: title.trim(),
    description: description.trim(),
    code: code.trim(),
    price,
    status: statusFinal,
    stock,
    category: category.trim(),
    thumbnails: thumbnailsFinal
  };
};

// Validacion de campos parciales para actualizacion (PUT). Ignora id.
export const validateProductUpdate = (payload) => {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    throw new ValidationError('El cuerpo de la peticion debe ser un objeto');
  }

  const errores = [];
  const update = {};
  const { title, description, code, price, status, stock, category, thumbnails } = payload;

  if (title !== undefined) {
    if (!isString(title) || title.trim() === '') errores.push('title debe ser un string no vacio');
    else update.title = title.trim();
  }
  if (description !== undefined) {
    if (!isString(description) || description.trim() === '') errores.push('description debe ser un string no vacio');
    else update.description = description.trim();
  }
  if (code !== undefined) {
    if (!isString(code) || code.trim() === '') errores.push('code debe ser un string no vacio');
    else update.code = code.trim();
  }
  if (price !== undefined) {
    if (!isNumber(price) || price < 0) errores.push('price debe ser un numero mayor o igual a 0');
    else update.price = price;
  }
  if (status !== undefined) {
    if (!isBoolean(status)) errores.push('status debe ser booleano');
    else update.status = status;
  }
  if (stock !== undefined) {
    if (!Number.isInteger(stock) || stock < 0) errores.push('stock debe ser un entero mayor o igual a 0');
    else update.stock = stock;
  }
  if (category !== undefined) {
    if (!isString(category) || category.trim() === '') errores.push('category debe ser un string no vacio');
    else update.category = category.trim();
  }
  if (thumbnails !== undefined) {
    if (!Array.isArray(thumbnails) || !thumbnails.every(isString)) errores.push('thumbnails debe ser un arreglo de strings');
    else update.thumbnails = thumbnails;
  }

  if (errores.length > 0) {
    throw new ValidationError('Validacion de actualizacion fallida', errores);
  }
  if (Object.keys(update).length === 0) {
    throw new ValidationError('No se enviaron campos validos para actualizar');
  }

  return update;
};
