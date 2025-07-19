

const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;
    const newMessage = await Message.create({ senderId, receiverId, message });
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: "Failed to send message", error: err.message });
  }
};

// controllers/messageController.js

exports.getMessages = async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages", error: err.message });
  }
};

