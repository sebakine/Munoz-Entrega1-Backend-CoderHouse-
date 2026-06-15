import { sendSuccess } from '../utils/httpResponse.js';

// Controlador HTTP de carritos: delega la logica al CartManager inyectado.
export class CartsController {
  #manager;

  constructor(manager) {
    this.#manager = manager;
  }

  create = async (req, res) => {
    const carrito = await this.#manager.create();
    sendSuccess(res, 201, carrito);
  };

  getProducts = async (req, res) => {
    const productos = await this.#manager.getProducts(req.params.cid);
    sendSuccess(res, 200, productos);
  };

  addProduct = async (req, res) => {
    const carrito = await this.#manager.addProduct(req.params.cid, req.params.pid);
    sendSuccess(res, 200, carrito);
  };
}
