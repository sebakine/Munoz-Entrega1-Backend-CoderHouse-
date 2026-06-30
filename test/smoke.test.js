// Prueba de humo automatizada: levanta el servidor real en un puerto efimero,
// ejecuta peticiones a todos los endpoints con el cliente fetch nativo y
// verifica los contratos de respuesta. Sale con codigo 1 ante cualquier fallo.

import { createApp } from '../src/app.js';

let passed = 0;
let failed = 0;

const assert = (condicion, descripcion) => {
  if (condicion) {
    passed += 1;
    console.log(`  PASS  ${descripcion}`);
  } else {
    failed += 1;
    console.error(`  FAIL  ${descripcion}`);
  }
};

const run = async () => {
  const app = createApp();
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const { port } = server.address();
  const base = `http://localhost:${port}/api`;

  const req = async (method, path, body) => {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, json };
  };

  try {
    console.log('\n== Health ==');
    const health = await req('GET', '/health');
    assert(health.status === 200 && health.json.status === 'success', 'GET /health responde 200 success');

    console.log('\n== Productos ==');
    const listaInicial = await req('GET', '/products');
    assert(listaInicial.status === 200 && Array.isArray(listaInicial.json.data), 'GET /products devuelve un arreglo');

    const nuevo = {
      title: 'Teclado mecanico',
      description: 'Switches rojos retroiluminado',
      code: `SKU-${Date.now()}`,
      price: 49999.99,
      stock: 25,
      category: 'perifericos',
      thumbnails: ['/img/teclado.png']
    };
    const creado = await req('POST', '/products', nuevo);
    assert(creado.status === 201 && creado.json.status === 'success', 'POST /products crea con 201');
    assert(creado.json.data?.id !== undefined, 'El producto creado tiene id autogenerado');
    assert(creado.json.data?.status === true, 'status por defecto es true');
    const pid = creado.json.data.id;

    const invalido = await req('POST', '/products', { title: 'sin campos' });
    assert(invalido.status === 400 && invalido.json.status === 'error', 'POST /products invalido responde 400');

    const codigoDup = await req('POST', '/products', { ...nuevo });
    assert(codigoDup.status === 409, 'POST /products con code duplicado responde 409');

    const porId = await req('GET', `/products/${pid}`);
    assert(porId.status === 200 && String(porId.json.data.id) === String(pid), 'GET /products/:pid trae el producto');

    const inexistente = await req('GET', '/products/999999');
    assert(inexistente.status === 404, 'GET /products/:pid inexistente responde 404');

    const actualizado = await req('PUT', `/products/${pid}`, { price: 38000, stock: 10 });
    assert(actualizado.status === 200 && actualizado.json.data.price === 38000, 'PUT /products/:pid actualiza campos');
    assert(String(actualizado.json.data.id) === String(pid), 'PUT no modifica el id');

    const intentoCambiarId = await req('PUT', `/products/${pid}`, { id: 7777, title: 'Nuevo titulo' });
    assert(String(intentoCambiarId.json.data.id) === String(pid), 'PUT ignora intento de cambiar id');

    console.log('\n== Carritos ==');
    const carrito = await req('POST', '/carts');
    assert(carrito.status === 201 && Array.isArray(carrito.json.data.products), 'POST /carts crea carrito con products[]');
    const cid = carrito.json.data.id;

    const add1 = await req('POST', `/carts/${cid}/product/${pid}`);
    assert(add1.status === 200, 'POST /carts/:cid/product/:pid agrega producto');
    const item1 = add1.json.data.products.find((i) => String(i.product) === String(pid));
    assert(item1?.quantity === 1, 'quantity inicia en 1');

    const add2 = await req('POST', `/carts/${cid}/product/${pid}`);
    const item2 = add2.json.data.products.find((i) => String(i.product) === String(pid));
    assert(item2?.quantity === 2, 'quantity se incrementa al repetir producto');

    const addProdInexistente = await req('POST', `/carts/${cid}/product/999999`);
    assert(addProdInexistente.status === 404, 'Agregar producto inexistente responde 404');

    const cartProducts = await req('GET', `/carts/${cid}`);
    assert(cartProducts.status === 200 && Array.isArray(cartProducts.json.data), 'GET /carts/:cid lista los productos');

    const cartInexistente = await req('GET', '/carts/999999');
    assert(cartInexistente.status === 404, 'GET /carts/:cid inexistente responde 404');

    console.log('\n== Limpieza ==');
    const eliminado = await req('DELETE', `/products/${pid}`);
    assert(eliminado.status === 200, 'DELETE /products/:pid elimina el producto');

    const rutaInexistente = await req('GET', '/no-existe');
    assert(rutaInexistente.status === 404 && rutaInexistente.json.status === 'error', 'Ruta inexistente responde 404 estandar');
  } finally {
    server.close();
  }

  console.log(`\nResultado: ${passed} OK, ${failed} fallidos`);
  if (failed > 0) process.exit(1);
  console.log('SMOKE TEST EXITOSO');
};

run().catch((err) => {
  console.error('Smoke test abortado:', err);
  process.exit(1);
});
