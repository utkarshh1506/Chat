const Message = require("../models/Message");

const connectedUsers = {}; // { userId: { _id, fullname, profile, socketIds: [], isOnline } }

const socketController = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);

    // When a user joins (after login)
    socket.on("userConnected", (user) => {
      if (!user || !user._id) return;

      if (!connectedUsers[user._id]) {
        connectedUsers[user._id] = {
          ...user,
          socketIds: [],
          isOnline: true,
        };
      }

      connectedUsers[user._id].socketIds.push(socket.id);
      connectedUsers[user._id].isOnline = true;

      console.log("👥 Connected users:", Object.keys(connectedUsers));
      io.emit("userStatusChanged", Object.values(connectedUsers));
    });

    // When a user sends a message
    socket.on("chatMessage", async ({ senderId, receiverId, message }) => {
      try {
        const newMessage = await Message.create({
          senderId,
          receiverId,
          message,
        });

        const cleanMsg = {
          ...newMessage._doc,
          senderId: newMessage.senderId.toString(),
          receiverId: newMessage.receiverId.toString(),
        };

        const senderSockets = connectedUsers[senderId]?.socketIds || [];
        const receiverSockets = connectedUsers[receiverId]?.socketIds || [];

        senderSockets.forEach((id) => io.to(id).emit("chatMessage", cleanMsg));
        receiverSockets.forEach((id) => {
          if (!senderSockets.includes(id)) {
            io.to(id).emit("chatMessage", cleanMsg);
          }
        });

        console.log("📤 Message sent:", cleanMsg);
      } catch (err) {
        console.error("❌ ChatMessage error:", err.message);
      }
    });

    socket.on("typing", ({ from, to, isTyping }) => {
      const receiverSockets = connectedUsers[to]?.socketIds || [];
      receiverSockets.forEach((id) => {
        io.to(id).emit("typing", { from, isTyping });
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      const userId = Object.keys(connectedUsers).find((key) =>
        connectedUsers[key].socketIds.includes(socket.id)
      );

      if (userId) {
        const user = connectedUsers[userId];
        user.socketIds = user.socketIds.filter((id) => id !== socket.id);

        if (user.socketIds.length === 0) {
          user.isOnline = false;
        }

        console.log(`❌ Disconnected socket ${socket.id} for user ${userId}`);
        io.emit("userStatusChanged", Object.values(connectedUsers));
      }
    });
  });
};

module.exports = socketController;
