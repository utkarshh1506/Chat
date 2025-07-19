// controllers/userController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io"); // socket.io instance to emit real-time updates
const socket = require('../socket')

// Get current logged in user
exports.getMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    res.status(200).json(user);
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Get all users except current
exports.getAllUsers = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const users = await User.find({ _id: { $ne: decoded.id } }).select(
      "-password"
    );
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Update user's socketId (for login/connection)
exports.updateSocketId = async (req, res) => {
  try {
    const { userId, socketId } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { socketId, isOnline: true },
      { new: true }
    );

    // Notify others that this user is online
    Server.io.emit("user-online", { userId });

    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ message: "Unable to update socketId" });
  }
};

// Logout (mark offline)
exports.logoutUser = async (req, res) => {
  try {
    const { userId } = req.body;
    await User.findByIdAndUpdate(userId, { isOnline: false, socketId: "" });

    // Notify others that this user is offline
    Server.io.emit("user-offline", { userId });

    res.status(200).json({ message: "Logged out" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed" });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to get user" });
  }
};

// Update user profile
exports.updateUser = async (req, res) => {
  try {
    const updates = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const io = socket.getIO()
    io.emit("user-updated", user);

    res.status(200).json(user);
  } catch (err) {
    console.error("Update error:", err.message);
    res.status(400).json({ message: "Update failed", error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    // Notify client about user deletion
    Server.io.emit("user-deleted", { userId: req.params.id });

    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Deletion failed" });
  }
};
