import { FileStorage } from '../utils/FileStorage.js';
import { NotFoundError } from '../utils/errors.js';
import { config } from '../config/config.js';

// Logica de negocio y persistencia de carritos, desacoplada de la capa HTTP.
// Recibe un ProductManager para validar la existencia de los productos.
export class CartManager {
  #storage;
  #productManager;

  constructor(productManager, storage) {
    this.#productManager = productManager;
    this.#storage = storage ?? new FileStorage(config.DATA_DIR, config.CARTS_FILE);
  }

  async getAll() {
    return this.#storage.readAll();
  }

  async create() {
    const carritos = await this.#storage.readAll();
    const nuevoCarrito = { id: this.#generateId(carritos), products: [] };
    carritos.push(nuevoCarrito);
    await this.#storage.writeAll(carritos);
    return nuevoCarrito;
  }

  async getById(id) {
    const carritos = await this.#storage.readAll();
    const carrito = carritos.find((c) => String(c.id) === String(id));
    if (!carrito) {
      throw new NotFoundError(`No existe un carrito con id ${id}`);
    }
    return carrito;
  }

  async getProducts(cartId) {
    const carrito = await this.getById(cartId);
    return carrito.products;
  }

  // Agrega el producto al carrito de a uno. Si ya existe, incrementa quantity.
  async addProduct(cartId, productId) {
    // Garantiza que el producto exista antes de asociarlo al carrito.
    await this.#productManager.getById(productId);

    const carritos = await this.#storage.readAll();
    const index = carritos.findIndex((c) => String(c.id) === String(cartId));
    if (index === -1) {
      throw new NotFoundError(`No existe un carrito con id ${cartId}`);
    }

    const carrito = carritos[index];
    const itemExistente = carrito.products.find(
      (item) => String(item.product) === String(productId)
    );

    if (itemExistente) {
      itemExistente.quantity += 1;
    } else {
      carrito.products.push({ product: productId, quantity: 1 });
    }

    carritos[index] = carrito;
    await this.#storage.writeAll(carritos);
    return carrito;
  }

  #generateId(carritos) {
    const maxId = carritos.reduce((max, c) => {
      const numerico = Number(c.id);
      return Number.isFinite(numerico) && numerico > max ? numerico : max;
    }, 0);
    return maxId + 1;
  }
}
