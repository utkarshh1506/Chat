const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createRoom,
  getAllRooms,
  getRoomsByUser,
} = require("../controllers/room.controller");

router.use(authMiddleware);

router.post("/", createRoom);
router.get("/", getAllRooms);
router.get("/user/:userId", getRoomsByUser); // get rooms joined by a user

module.exports = router;
