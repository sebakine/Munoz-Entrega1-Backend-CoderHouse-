import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..', '..');

export const config = {
  PORT: Number(process.env.PORT) || 8080,
  ROOT_DIR,
  DATA_DIR: path.join(ROOT_DIR, 'data'),
  PRODUCTS_FILE: 'products.json',
  CARTS_FILE: 'carts.json'
};
