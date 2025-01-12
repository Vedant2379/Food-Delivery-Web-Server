const Customer = require("../Modals/CustomerSchema")

exports.addCustomer = (req, res) => {
    const customer = new Customer({
        CustomerName: req.body.CustomerName,
        CustomerEmail: req.body.CustomerEmail,
        CustomerPassword: req.body.CustomerPassword,
        CustomerAddress: req.body.CustomerAddress,
        CustomerMob: req.body.CustomerMob
    })

    customer.save()
        .then((result) => {
            console.log(result)
            res.status(200).json(result)
        }).catch((err) => {
            res.status(500).send(err)
        });
}

exports.getAllCustomers = (req, res) => {
    Customer.find()
        .then((result) => {
            res.status(200).json(result)
        }).catch((err) => {
            res.status(500).send(err)
        });
}

exports.custmerLogin = (req, res) => {
    Customer.findOne({
        CustomerEmail: req.body.CustomerEmail,
        CustomerPassword: req.body.CustomerPassword,
    }).then((cust) => {
        if (cust) { 
            res.status(200).json({ success: true, data: cust })
        } else {
            res.status(200).json({ success: false, data: {} })
        }
    }).catch((err) => {
        res.status(500).send(err)
    });
}

exports.updateProfile = (req, res) => {
    Customer.findByIdAndUpdate(req.body.custid,
        {
            CustomerPassword: req.body.CustomerPassword
        }, { new: true }).then((result) => { 
            console.log(result)
            res.status(200).json(result)
        })
        .catch(() => { 
            res.status(500).send(err)
        })
}
