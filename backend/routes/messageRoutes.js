const express = require("express");
const router = express.Router();
const { sendMessage, getMessages } = require("../controllers/message.controller");

// POST /api/messages
router.post("/", sendMessage);
router.get('/:user1/:user2', getMessages);

module.exports = router;
