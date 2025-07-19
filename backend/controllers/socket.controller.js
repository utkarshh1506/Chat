const mongoose = require("mongoose");
const User = require("../models/User");
const Room = require("../models/Room");
const Message = require("../models/Message");

const handleSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("setOnline", async (userId) => {
    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      socketId: socket.id,
    });
    io.emit("userStatusChanged");
  });

    socket.on("joinRoom", async ({ username, room }) => {
      try {
        const user = await User.findOneAndUpdate(
          { username },
          { socketId: socket.id, room },
          { new: true }
        );

        if (!user) return socket.emit("error", "User not found");

        // Check if room exists
        let roomDoc = await Room.findOne({ name: room });

        if (!roomDoc) {
          // Find all users assigned to this room
          const usersInRoom = await User.find({ room });

          if (usersInRoom.length >= 2) {
            // Create room with users
            const userIds = usersInRoom.map((u) => u._id);
            roomDoc = await Room.create({ name: room, users: userIds });
            console.log(`Room '${room}' created with ${userIds.length} users.`);
          } else {
            return socket.emit(
              "error",
              "At least 2 users are required to create a room."
            );
          }
        }

        socket.join(room);

        const messages = await Message.find({ room }).sort({ createdAt: 1 });
        socket.emit("chatHistory", messages);

        const onlineUsers = await User.find({ room, socketId: { $ne: null } });
        io.to(room).emit("onlineUsers", onlineUsers);
      } catch (err) {
        console.error("JoinRoom error:", err.message);
        socket.emit("error", err.message);
      }
    });

    socket.on("chatMessage", async ({ room, username, message }) => {
      try {
        const newMsg = await Message.create({ room, username, message });
        io.to(room).emit("chatMessage", newMsg);
      } catch (err) {
        console.error("ChatMessage error:", err.message);
      }
    });

    socket.on("typing", ({ room, username }) => {
      socket.to(room).emit("typing", { username });
    });

    socket.on("disconnect", async () => {
      try {
        const user = await User.findOne({ socketId: socket.id });
        if (!user) return;

        const roomName = user.room;

        await User.findByIdAndUpdate(user._id, { socketId: null, room: null });

        const usersInRoom = await User.find({
          room: roomName,
          socketId: { $ne: null },
        });
        io.to(roomName).emit("onlineUsers", usersInRoom);

        console.log("User disconnected:", socket.id);
      } catch (err) {
        console.error("Disconnect error:", err.message);
      }
    });
  });
};

module.exports = handleSocket;
