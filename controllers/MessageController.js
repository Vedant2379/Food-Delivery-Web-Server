const Message = require("../Modals/MessageSchema")

exports.sendMessage = (req, res) => {
    const message = new Message({
        SenderName: req.body.SenderName,
        SenderEmail: req.body.SenderEmail,
        SenderMessage: req.body.SenderMessage,
    }) 

    message.save()
        .then((result) => {
            console.log(result)
            res.status(200).json(result)
        }).catch((err) => {
            res.status(500).send(err)
        });
}

exports.getAllMessages = (req, res) => {
    Message.find()
        .then((result) => {
            res.status(200).json(result)
        }).catch((err) => {
            res.status(500).send(err)
        });
}