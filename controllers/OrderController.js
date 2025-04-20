// File: ordercontroller.explained.js

const Order = require("../Modals/OrderSchema") // Import the Order schema/model

// Controller function to add a new order
exports.addOrder = (req, res) => {
    // Create a new instance of Order with fields from request body
    const order = new Order({
        NoOfItems: req.body.NoOfItems,          // Number of items in the order
        TotalAmt: req.body.TotalAmt,            // Total amount of the order
        UserId: req.body.UserId,                // Reference to the user placing the order
        OrderItems: req.body.OrderItems         // List of items ordered (array of objects)
    })

    // Save the order to the database
    order.save()
        .then((result) => {
            console.log(result)                 // Log the saved order
            res.status(200).json(result)        // Respond with status 200 and saved order data
        }).catch((err) => {
            res.status(500).send(err)           // Handle errors with status 500
        });
}

// Controller to get all orders
exports.getAllOrders = (req, res) => {
    Order.find()                                // Find all orders
        .then((result) => {
            res.status(200).json(result)        // Send result in JSON format
        }).catch((err) => {
            res.status(500).send(err)           // Handle errors
        });
}

// Controller to get all orders by specific customer ID
exports.getOrderbyCustId = (req, res) => {
    Order.find({ UserId: req.body.cid })         // Find orders matching customer ID
        .then((result) => {
            res.status(200).json(result)
        }).catch((err) => {
            res.status(500).send(err)
        });
}

// Controller to get a specific order by order ID
exports.getOrderbyId = (req, res) => { 
    Order.findOne({ _id: req.body.oid })         // Find order by order ID
        .populate('UserId')                      // Populate UserId field with user details
        .populate('OrderItems.FoodId')           // Populate each FoodId inside OrderItems with food details
        .then((result) => {
            res.status(200).json(result)
        }).catch((err) => {
            res.status(500).send(err)
        }); 
}

// Controller to update order status
exports.updateStatus = (req, res) => {
    Order.findByIdAndUpdate(                     // Find order by ID and update
        { _id: req.body.oid },                   // Order ID to find
        { OrderStatus: req.body.orderstatus }    // New status to update
    )
    .then((result) => {
        res.status(200).json(result)             // Send updated order as response
    }).catch((err) => {
        res.status(500).send(err)                // Handle error
    });
}  

/*
 1. mongoose.Model.save()
 - Saves the document to MongoDB.
 - Returns a promise.
 - Docs: https://mongoosejs.com/docs/api/model.html#Model.prototype.save()

 2. mongoose.Model.find()
 - Finds all documents that match the query.
 - Returns an array.
 - Docs: https://mongoosejs.com/docs/api/model.html#Model.find()

 3. mongoose.Model.findOne()
 - Finds the first document that matches the query.
 - Returns a single object.
 - Docs: https://mongoosejs.com/docs/api/model.html#Model.findOne()

 4. mongoose.Model.findByIdAndUpdate()
 - Finds a document by ID and updates it.
 - Returns the original document (by default).
 - To return the updated document, pass { new: true } as third argument.
 - Docs: https://mongoosejs.com/docs/api/model.html#Model.findByIdAndUpdate()

 5. .populate()
 - Replaces the specified field(s) with document(s) from another collection.
 - Example: .populate('UserId') replaces ObjectId with full user data.
 - Docs: https://mongoosejs.com/docs/populate.html

 Example before populate:
 {
   _id: "123",
   UserId: "u123",
   OrderItems: [ { FoodId: "f101" } ]
 }

 Example after populate:
 {
   _id: "123",
   UserId: {
     _id: "u123",
     name: "John"
   },
   OrderItems: [ {
     FoodId: {
       _id: "f101",
       name: "Pizza"
     }
   } ]
}
*/