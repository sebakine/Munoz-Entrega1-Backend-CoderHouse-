export const registerProductsSocket = (io, productManager) => {
  const broadcastList = async () => {
    io.emit('products:list', await productManager.getAll());
  };

  const handle = (operation) => async (input, ack) => {
    try {
      await operation(input);
      await broadcastList();
      ack?.({ ok: true });
    } catch (error) {
      ack?.({ ok: false, error: error.message, details: error.details ?? null });
    }
  };

  io.on('connection', async (socket) => {
    socket.emit('products:list', await productManager.getAll());
    socket.on('products:create', handle((payload) => productManager.create(payload)));
    socket.on('products:delete', handle((id) => productManager.delete(id)));
  });
};
