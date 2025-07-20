const express = require("express");
const router = express.Router();
const { sendRoomMessage, getRoomMessages } = require("../controllers/roomMessage.controller");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.post("/", sendRoomMessage); // send message
router.get("/:roomId", getRoomMessages); // fetch messages for a room

module.exports = router;
