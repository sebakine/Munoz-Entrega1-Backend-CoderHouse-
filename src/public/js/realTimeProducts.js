const socket = io();

const createForm = document.getElementById('create-form');
const deleteForm = document.getElementById('delete-form');
const productsList = document.getElementById('products-list');
const feedback = document.getElementById('feedback');

const showFeedback = (message, variant) => {
  feedback.textContent = message;
  feedback.dataset.variant = variant;
};

const deleteProduct = (id) => {
  socket.emit('products:delete', id, (response) => {
    if (response?.ok) {
      showFeedback(`Producto ${id} eliminado.`, 'success');
    } else {
      showFeedback(response?.error ?? 'No se pudo eliminar el producto.', 'error');
    }
  });
};

const buildField = (label, value) => {
  const span = document.createElement('span');
  span.className = 'product-list__field';
  span.textContent = `${label}: ${value}`;
  return span;
};

const buildItem = (product) => {
  const item = document.createElement('li');
  item.className = 'product-list__item';

  const title = document.createElement('span');
  title.className = 'product-list__name';
  title.textContent = product.title;

  const removeButton = document.createElement('button');
  removeButton.className = 'btn btn--danger btn--small';
  removeButton.type = 'button';
  removeButton.textContent = 'Eliminar';
  removeButton.addEventListener('click', () => deleteProduct(product.id));

  item.append(
    title,
    buildField('ID', product.id),
    buildField('Código', product.code),
    buildField('Precio', product.price),
    buildField('Stock', product.stock),
    removeButton
  );
  return item;
};

const renderProducts = (products) => {
  productsList.replaceChildren(...products.map(buildItem));
};

socket.on('products:list', renderProducts);

createForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(createForm);
  const payload = {
    title: data.get('title').trim(),
    description: data.get('description').trim(),
    code: data.get('code').trim(),
    price: Number(data.get('price')),
    stock: Number(data.get('stock')),
    category: data.get('category').trim()
  };

  socket.emit('products:create', payload, (response) => {
    if (response?.ok) {
      createForm.reset();
      showFeedback('Producto creado correctamente.', 'success');
    } else {
      const detail = response?.details?.length ? ` (${response.details.join(', ')})` : '';
      showFeedback(`${response?.error ?? 'No se pudo crear el producto.'}${detail}`, 'error');
    }
  });
});

deleteForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const id = Number(new FormData(deleteForm).get('id'));
  deleteProduct(id);
  deleteForm.reset();
});
