const express = require("express")

const router = express.Router()

const MessageController = require("../controllers/MessageController")

router.post("/sendmessage", MessageController.sendMessage)
router.get("/allmessage", MessageController.getAllMessages)

module.exports = router