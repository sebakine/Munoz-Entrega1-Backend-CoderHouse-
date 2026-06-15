import { FileStorage } from '../utils/FileStorage.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { validateNewProduct, validateProductUpdate } from '../utils/validators.js';
import { config } from '../config/config.js';

// Logica de negocio y persistencia de productos, desacoplada de la capa HTTP.
// Todos los metodos son asincronos y trabajan sobre products.json.
export class ProductManager {
  #storage;

  constructor(storage) {
    this.#storage = storage ?? new FileStorage(config.DATA_DIR, config.PRODUCTS_FILE);
  }

  async getAll() {
    return this.#storage.readAll();
  }

  async getById(id) {
    const productos = await this.#storage.readAll();
    const producto = productos.find((p) => String(p.id) === String(id));
    if (!producto) {
      throw new NotFoundError(`No existe un producto con id ${id}`);
    }
    return producto;
  }

  // El id se autogenera (max + 1) garantizando unicidad dentro del archivo.
  // El code es unico a nivel de negocio.
  async create(payload) {
    const data = validateNewProduct(payload);
    const productos = await this.#storage.readAll();

    const codeDuplicado = productos.some((p) => p.code === data.code);
    if (codeDuplicado) {
      throw new ConflictError(`Ya existe un producto con el code "${data.code}"`);
    }

    const nuevoProducto = { id: this.#generateId(productos), ...data };
    productos.push(nuevoProducto);
    await this.#storage.writeAll(productos);
    return nuevoProducto;
  }

  async update(id, payload) {
    const update = validateProductUpdate(payload);
    const productos = await this.#storage.readAll();
    const index = productos.findIndex((p) => String(p.id) === String(id));
    if (index === -1) {
      throw new NotFoundError(`No existe un producto con id ${id}`);
    }

    if (update.code) {
      const codeDuplicado = productos.some(
        (p) => p.code === update.code && String(p.id) !== String(id)
      );
      if (codeDuplicado) {
        throw new ConflictError(`Ya existe un producto con el code "${update.code}"`);
      }
    }

    // Se preserva el id original: nunca se actualiza ni elimina.
    const productoActualizado = { ...productos[index], ...update, id: productos[index].id };
    productos[index] = productoActualizado;
    await this.#storage.writeAll(productos);
    return productoActualizado;
  }

  async delete(id) {
    const productos = await this.#storage.readAll();
    const index = productos.findIndex((p) => String(p.id) === String(id));
    if (index === -1) {
      throw new NotFoundError(`No existe un producto con id ${id}`);
    }
    const [eliminado] = productos.splice(index, 1);
    await this.#storage.writeAll(productos);
    return eliminado;
  }

  #generateId(productos) {
    const maxId = productos.reduce((max, p) => {
      const numerico = Number(p.id);
      return Number.isFinite(numerico) && numerico > max ? numerico : max;
    }, 0);
    return maxId + 1;
  }
}
