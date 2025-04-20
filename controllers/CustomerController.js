// Importing the Customer model
const Customer = require("../Modals/CustomerSchema")

// Controller to add a new customer
exports.addCustomer = (req, res) => {
    // Create a new Customer document using request body
    const customer = new Customer({
        CustomerName: req.body.CustomerName, // req.body contains the data sent from the client
        CustomerEmail: req.body.CustomerEmail,
        CustomerPassword: req.body.CustomerPassword,
        CustomerAddress: req.body.CustomerAddress,
        CustomerMob: req.body.CustomerMob
    })

    // Save the new customer to the database
    customer.save()
        .then((result) => {
            // Respond with saved data
            console.log(result) // `result` is the saved customer document, including its _id
            // Response structure for res.json:
            // res.status(200).json({
            //    success: true,
            //    data: result // the saved customer object
            // })
            res.status(200).json(result) // The response will contain the saved customer document
        }).catch((err) => {
            // Handle errors
            // In case of error, send an error response with status 500
            res.status(500).send(err)
        });
}

// Controller to get all customers from the database
exports.getAllCustomers = (req, res) => {
    // Fetch all documents from Customer collection
    Customer.find()
        .then((result) => {
            // Return all customers
            // The result is an array of customer documents from the database
            // Response structure for res.json:
            // res.status(200).json(result) // result is an array of customer objects
            res.status(200).json(result) // Returning all customer documents
        }).catch((err) => {
            // Handle error
            res.status(500).send(err) // Error response structure for res.status(500).send
        });
}

// Controller for customer login
exports.custmerLogin = (req, res) => {
    // Find one customer that matches email and password
    Customer.findOne({
        CustomerEmail: req.body.CustomerEmail,
        CustomerPassword: req.body.CustomerPassword,
    }).then((cust) => {
        // If customer found, return success with data
        if (cust) {
            // If login is successful, return success status and customer data
            // Response structure for res.json:
            // res.status(200).json({
            //    success: true,
            //    data: cust // the customer document returned from the database
            // })
            res.status(200).json({ success: true, data: cust }) // Returning the customer document
        } else {
            // If not found, return false with empty object
            res.status(200).json({ success: false, data: {} }) // If no customer found, empty object is returned
        }
    }).catch((err) => {
        // Handle error
        res.status(500).send(err) // Error response structure
    });
}

// Controller to update customer password
exports.updateProfile = (req, res) => {
    // Find customer by ID and update password
    Customer.findByIdAndUpdate(
        req.body.custid, // req.body.custid contains the customer ID for the update
        {
            CustomerPassword: req.body.CustomerPassword // req.body.CustomerPassword contains the new password
        },
        { new: true } // Return updated document
    ).then((result) => {
        console.log(result) // `result` contains the updated customer document
        // Response structure for res.json:
        // res.status(200).json({
        //    success: true,
        //    data: result // updated customer document
        // })
        res.status(200).json(result) // Returning the updated customer document
    }).catch((err) => {
        res.status(500).send(err) // Error response
    })
}

/*
Customer - A Mongoose model connected to MongoDB, used to perform CRUD on customer data.

.save() - Saves a new document to the database.
Example:
  const user = new User({name: "Ali"});
  user.save(); // Saves user to MongoDB
Output:
  On success: The saved document with its _id and all its fields.
  Example: { _id: '60adf469f42b8b32461bfad0', name: 'Ali', ... }

.find() - Fetches all documents from a collection.
Example:
  User.find(); // returns array of all users
Output:
  An array of documents. Example: [{ _id: 'id1', name: 'Ali' }, { _id: 'id2', name: 'John' }]

.findOne(query) - Finds the first document matching the query.
Example:
  User.findOne({ email: "test@example.com" });
Output:
  A single document. Example: { _id: 'id1', name: 'Ali', email: 'test@example.com' }

.findByIdAndUpdate(id, update, options) - Finds a document by ID and updates it.
- options: { new: true } returns the updated doc instead of original.
Example:
  User.findByIdAndUpdate("id123", { name: "Ali" }, { new: true });
Output:
  The updated document. Example: { _id: 'id123', name: 'Ali' }

req.body - Contains incoming POST request data sent by the client.
- Example: { CustomerName: "John", CustomerEmail: "john@example.com" }
- Can be accessed as req.body.<fieldName>

res.status(code).json(data) - Sends a JSON response with status code.
Example:
  res.status(200).json({ success: true }); // Successful response with 200 status
Output:
  { success: true } // This is the data sent back to the client

res.status(500).send(err) - Sends an error response with status 500.
Example:
  res.status(500).send("Internal Server Error"); // Error response sent back
Output:
  A string message or error details. Example: "Internal Server Error"

Notes:
- No password hashing is done here (should use bcrypt).
- No validation for existing email before registering.
- Error handling can be improved with try/catch and async/await.

Useful Links:
- Mongoose Docs: https://mongoosejs.com/docs/guide.html
- MongoDB Query Operators: https://www.mongodb.com/docs/manual/reference/operator/query/
- Express req/res: https://expressjs.com/en/api.html#req
 */