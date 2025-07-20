const RoomMessage = require("../models/RoomMessage");

exports.sendRoomMessage = async (req, res) => {
  try {
    const { roomId, senderId, message } = req.body;

    const newMessage = await RoomMessage.create({ roomId, senderId, message });

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(400).json({ message: "Failed to send room message", error: err.message });
  }
};

exports.getRoomMessages = async (req, res) => {
  try {
    const roomId = req.params.roomId;

    const messages = await RoomMessage.find({ roomId }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch room messages", error: err.message });
  }
};
