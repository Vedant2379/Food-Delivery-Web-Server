const Order = require("../Modals/OrderSchema")

exports.addOrder = (req, res) => {
    const order = new Order({
        NoOfItems: req.body.NoOfItems,
        TotalAmt: req.body.TotalAmt,
        UserId: req.body.UserId,
        OrderItems: req.body.OrderItems

    })

    order.save()
        .then((result) => {
            console.log(result)
            res.status(200).json(result)
        }).catch((err) => {
            res.status(500).send(err)
        });
}

exports.getAllOrders = (req, res) => {
    Order.find()
        .then((result) => {
            res.status(200).json(result)
        }).catch((err) => {
            res.status(500).send(err)
        });
}

exports.getOrderbyCustId = (req, res) => {
    Order.find({ UserId: req.body.cid })
        .then((result) => {
            res.status(200).json(result)
        }).catch((err) => {
            res.status(500).send(err)
        });
}

exports.getOrderbyId = (req, res) => { 
    Order.findOne({ _id: req.body.oid })
        .populate('UserId')
        .populate('OrderItems.FoodId')
        .then((result) => {
            res.status(200).json(result)
        }).catch((err) => {
            res.status(500).send(err)
        });
}

exports.updateStatus = (req, res) => {
    Order.findByIdAndUpdate({ _id: req.body.oid },
        { OrderStatus: req.body.orderstatus })
        .then((result) => {
            res.status(200).json(result)
        }).catch((err) => {
            res.status(500).send(err)
        });
}