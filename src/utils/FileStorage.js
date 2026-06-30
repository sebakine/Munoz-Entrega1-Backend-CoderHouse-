import fs from 'node:fs/promises';
import path from 'node:path';
import { AppError } from './errors.js';

// Acceso a disco con proteccion contra recorrido de rutas (path traversal):
// el archivo resuelto siempre permanece dentro del directorio autorizado.
export class FileStorage {
  #filePath;

  constructor(baseDir, fileName) {
    const resolvedBase = path.resolve(baseDir);
    const resolvedFile = path.resolve(resolvedBase, fileName);

    const relative = path.relative(resolvedBase, resolvedFile);
    const isInside =
      relative !== '' &&
      !relative.startsWith('..') &&
      !path.isAbsolute(relative);

    if (!isInside) {
      throw new AppError(`Ruta de archivo no permitida: ${fileName}`, 500);
    }

    this.#baseDir = resolvedBase;
    this.#filePath = resolvedFile;
  }

  #baseDir;

  async #ensureFile() {
    await fs.mkdir(this.#baseDir, { recursive: true });
    try {
      await fs.access(this.#filePath);
    } catch {
      await fs.writeFile(this.#filePath, '[]', 'utf-8');
    }
  }

  async readAll() {
    await this.#ensureFile();
    const raw = await fs.readFile(this.#filePath, 'utf-8');
    if (raw.trim() === '') return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new AppError('El archivo de datos esta corrupto (no es un arreglo)', 500);
      }
      return parsed;
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(`No se pudo parsear el archivo de datos: ${err.message}`, 500);
    }
  }

  // Escritura atomica: se escribe a un temporal y luego se renombra para
  // evitar archivos corruptos ante una interrupcion a mitad de escritura.
  async writeAll(collection) {
    await this.#ensureFile();
    const tmpPath = `${this.#filePath}.tmp`;
    const payload = JSON.stringify(collection, null, 2);
    await fs.writeFile(tmpPath, payload, 'utf-8');
    await fs.rename(tmpPath, this.#filePath);
  }
}
