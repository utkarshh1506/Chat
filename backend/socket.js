
let io;

module.exports = {
  init: (serverInstance) => {
    io = serverInstance;
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  }
};
