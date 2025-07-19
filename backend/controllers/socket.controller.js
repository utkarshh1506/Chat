const Message = require("../models/Message");

const connectedUsers = {}; // { userId: { _id, fullname, profile, socketId, isOnline } }

const socketController = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);

    // When a user joins (after login)
    socket.on("userConnected", (user) => {
      if (!user || !user._id) return;

      connectedUsers[user._id] = {
        ...user,
        socketId: socket.id,
        isOnline: true,
      };

      console.log("👥 Connected users:", Object.keys(connectedUsers));
      io.emit("allUsers", Object.values(connectedUsers));
    });

    // When a user sends a message
    socket.on("chatMessage", async ({ senderId, receiverId, message }) => {
      try {
        const newMessage = await Message.create({
          senderId,
          receiverId,
          message,
        });

        // Emit message to both sender and receiver if they are connected
        const senderSocket = connectedUsers[senderId]?.socketId;
        const receiverSocket = connectedUsers[receiverId]?.socketId;

        if (senderSocket) io.to(senderSocket).emit("chatMessage", newMessage);
        if (receiverSocket)
          io.to(receiverSocket).emit("chatMessage", newMessage);
      } catch (err) {
        console.error("❌ ChatMessage error:", err.message);
      }
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
      const disconnectedUserId = Object.keys(connectedUsers).find(
        (key) => connectedUsers[key].socketId === socket.id
      );

      if (disconnectedUserId) {
        delete connectedUsers[disconnectedUserId];
        console.log(`❌ User disconnected: ${disconnectedUserId}`);
        io.emit("allUsers", Object.values(connectedUsers));
      }
    });
  });
};

module.exports = socketController;
