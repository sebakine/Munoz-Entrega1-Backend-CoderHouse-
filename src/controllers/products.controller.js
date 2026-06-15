import { sendSuccess } from '../utils/httpResponse.js';

// Controlador HTTP de productos: traduce peticiones/respuestas y delega
// toda la logica al ProductManager inyectado.
export class ProductsController {
  #manager;

  constructor(manager) {
    this.#manager = manager;
  }

  getAll = async (req, res) => {
    const productos = await this.#manager.getAll();
    sendSuccess(res, 200, productos);
  };

  getById = async (req, res) => {
    const producto = await this.#manager.getById(req.params.pid);
    sendSuccess(res, 200, producto);
  };

  create = async (req, res) => {
    const producto = await this.#manager.create(req.body);
    sendSuccess(res, 201, producto);
  };

  update = async (req, res) => {
    const producto = await this.#manager.update(req.params.pid, req.body);
    sendSuccess(res, 200, producto);
  };

  delete = async (req, res) => {
    const producto = await this.#manager.delete(req.params.pid);
    sendSuccess(res, 200, { message: `Producto ${producto.id} eliminado`, producto });
  };
}
