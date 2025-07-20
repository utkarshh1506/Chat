const Room = require("../models/Room");
const User = require("../models/User");

// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const { name, roomImg, users } = req.body;

    if (!name || !users || users.length < 2) {
      return res
        .status(400)
        .json({ message: "Room must have a name and at least 2 users." });
    }

    // Optional: Check for room name conflict
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ message: "Room name already exists." });
    }

    const newRoom = await Room.create({ name, roomImg, users });
    const populatedRoom = await newRoom.populate(
      "users",
      "fullname profile isOnline"
    );

    res.status(201).json(populatedRoom);
  } catch (err) {
    console.error("❌ Error creating room:", err.message);
    res
      .status(500)
      .json({ message: "Room creation failed", error: err.message });
  }
};

// Get all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate("users", "fullname profile isOnline")
      .sort({ createdAt: -1 });

    res.status(200).json(rooms);
  } catch (err) {
    console.error("❌ Error fetching rooms:", err.message);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
};

// Get rooms of a specific user
exports.getRoomsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const rooms = await Room.find({ users: userId })
      .populate("users", "fullname profile isOnline")
      .sort({ updatedAt: -1 });

    res.status(200).json(rooms);
  } catch (err) {
    console.error("❌ Error fetching user rooms:", err.message);
    res.status(500).json({ message: "Failed to fetch user rooms" });
  }
};
