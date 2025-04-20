// Import necessary libraries and packages
const express = require('express'); // Express.js to create server and handle routing
const mongoose = require("mongoose"); // Mongoose for MongoDB connectivity
const nodemon = require("nodemon"); // Automatically restarts the server when changes are made (during development)
const bodyparser = require("body-parser"); // Middleware to parse incoming request bodies
const cors = require('cors'); // Middleware for enabling Cross-Origin Resource Sharing (CORS)

// Import other necessary modules
const multer = require('multer'); // Middleware for handling multipart/form-data (file uploads)
const path = require('path'); // Utility for handling file paths
const shortid = require('shortid'); // Library to generate unique short IDs
const crypto = require("crypto"); // For generating HMAC for security verification
const Razorpay = require('razorpay'); // Razorpay API for payment processing
require("dotenv").config(); // Loads environment variables from .env file

// Create the Express server
const server = express();

// Use middleware
server.use(cors()); // Enable CORS for all origins
server.use(bodyparser.json()); // Parse incoming JSON data in the body of the requests

// Initialize Razorpay instance with API keys from environment variables
var razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // API Key ID
  key_secret: process.env.RAZORPAY_KEY_SECRET, // API Key Secret
});

// Verification route for Razorpay to validate the authenticity of payment callback
server.post("/verification", (req, res) => {
  const secret = "razorpaysecret"; // Secret key for HMAC

  // Generate HMAC digest using the secret key and request body
  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  // Compare generated HMAC digest with Razorpay's signature in headers
  if (digest === req.headers["x-razorpay-signature"]) {
    console.log("Request is legit");
    res.status(200).json({
      message: "OK", // If signature matches, respond with success
    });
  } else {
    res.status(403).json({ message: "Invalid" }); // If signature does not match, return error
  }
});

// Payment creation route to initiate a Razorpay order
server.post("/razorpay", async (req, res) => {
  const payment_capture = 1; // Automatically capture payment
  const amount = req.body.amt * 100; // Amount is provided in rupees, multiply by 100 for paise
  const currency = "INR"; // Currency type

  const options = {
    amount, // Amount to be captured
    currency, // Currency to be used
    receipt: shortid.generate(), // Unique receipt ID
    payment_capture, // Set to 1 to auto-capture payment
  };

  try {
    const response = await razorpay.orders.create(options); // Create Razorpay order
    res.status(200).json({
      id: response.id, // Order ID returned from Razorpay
      currency: response.currency, // Currency used in the order
      amount: response.amount, // Amount to be captured
    });
  } catch (err) {
    console.log(err); // Log errors
    res.status(500).send("Error while creating payment order"); // Error response
  }
});

// Multer configuration for file upload
const fileStorage = multer.diskStorage({
  destination: 'Uploads', // Directory to store uploaded files
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname)); // Filename format
  },
});

const uploadConfig = multer({
  storage: fileStorage, // Use custom storage configuration
  fileFilter(req, file, cb) { // Only allow specific file types (image formats)
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error('Upload Correct file')); // Reject non-image files
    }
    cb(undefined, true); // Accept image files
  },
});

// Connect to MongoDB database
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true, // Use the new URL parser for MongoDB
}).then((result) => {
  console.log("DB Connected"); // Successful DB connection message
}).catch((err) => {
  console.log("DB Not Connected"); // Error message for failed connection
});

// File upload route to handle file uploads
server.post('/uploadfile', uploadConfig.single('image'), (req, res) => {
  res.status(200).json({
    filepath: "/images/".concat(req.file.filename), // Send the uploaded file's path
    uploaded: true, // Confirm the file upload
  });
}, (err, req, res, next) => {
  res.status(400).send({ error: err.message }); // Handle errors if file is invalid
});

// Basic route for testing
server.get('/', (req, res) => {
  res.send("Hello"); // Simple response for root URL
});

// Sample route to handle customer requests
server.get('/customers', (req, res) => {
  res.send("Hello Customers"); // Simple response for customers route
});

// Import route files for handling various API endpoints
const orderRoutes = require('./Routes/OrderRoutes');
const customerRoutes = require('./Routes/CustomerRoutes');
const foodRoutes = require('./Routes/FoodRoutes');
const messageRoutes = require('./Routes/MessageRoutes');
const PaymentRoutes = require('./Routes/paymentRoutes');
const reviewRoutes = require('./Routes/ReviewRoutes');

// Use imported route handlers
server.use("/api/", orderRoutes);
server.use("/api/", customerRoutes);
server.use("/api/", foodRoutes);
server.use("/api/", messageRoutes);
server.use("/api/", reviewRoutes);
// server.use("/api", PaymentRoutes); // Payment routes (commented out)

server.use(express.static("Uploads")); // Serve static files from 'Uploads' directory
server.use("/images", express.static("Uploads")); // Serve uploaded images from 'Uploads' directory

// Start the server on port 5000
server.listen(5000, () => {
  console.log("Server Started"); // Confirmation message when server starts
});

/*
// Method: server.use(cors())
// Purpose: Enables Cross-Origin Resource Sharing (CORS) to allow client-side applications
//          from different origins to interact with the server. This is especially useful
//          for API calls from different domains during frontend development.
// Link for reference: https://expressjs.com/en/resources/middleware/cors.html

// Method: server.use(bodyparser.json())
// Purpose: Parses incoming request bodies as JSON format. This allows us to easily handle
//          JSON data sent in POST requests.
// Link for reference: https://www.npmjs.com/package/body-parser

// Method: razorpay.orders.create(options)
// Purpose: Creates an order in Razorpay's system based on the provided options, including
//          the amount, currency, and receipt ID. This method is used to initiate the payment.
// Link for reference: https://razorpay.com/docs/api/orders/

// Method: mongoose.connect("mongodb://127.0.0.1:27017/FoodDeliveryDB", { useNewUrlParser: true })
// Purpose: Establishes a connection to the MongoDB database named 'FoodDeliveryDB' using Mongoose.
// Link for reference: https://mongoosejs.com/docs/connections.html

// Method: multer.diskStorage()
// Purpose: Configures where uploaded files will be stored and how the filenames are generated.
// Link for reference: https://www.npmjs.com/package/multer#diskstorage

// Method: uploadConfig.single('image')
// Purpose: Middleware for handling single file uploads, where the file field in the form is named 'image'.
// Link for reference: https://www.npmjs.com/package/multer#singlefieldname

// Method: server.use(express.static("Uploads"))
// Purpose: Serves static files (like images or documents) from the "Uploads" directory. This allows the
//          client-side application to access uploaded files via URLs like /images/filename.
// Link for reference: https://expressjs.com/en/starter/static-files.html

// Method: server.listen(5000, () => {...})
// Purpose: Starts the Express server on port 5000, and logs a confirmation message when the server is running.
// Link for reference: https://expressjs.com/en/starter/hello-world.html
*/

/*
// // const express = require('express')
// // const mongoose = require("mongoose")
// // const nodemon = require("nodemon")
// // const bodyparser = require("body-parser")
// // const cors = require('cors')

// // const multer = require('multer')
// // const path = require('path')

// // //create server
// // const server = express()

// // server.use(cors())

// // server.use(bodyparser.json())

// // //storage config
// // const fileStorage = multer.diskStorage({
// //     destination: 'Uploads',
// //     filename: (req, file, cb) => {
// //         cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
// //     }
// // })

// // //upload config
// // const uploadConfig = multer({
// //     storage: fileStorage,
// //     fileFilter(req, file, cb) {
// //         if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
// //             return cb(new Error('Upload Correct file'))
// //         }
// //         cb(undefined, true)
// //     }
// // })

// // //database connectivity
// // mongoose.connect("mongodb://127.0.0.1:27017/FoodDeliveryDB", {
// //     useNewUrlParser: true
// // }).then((result) => {
// //     console.log("DB Connected")
// // }).catch((err) => {
// //     console.log("DB Not Connected")
// // });


// // server.post('/uploadfile', uploadConfig.single('image'), (req, res) => {
// //     res.status(200).json({
// //         filepath: "/images/".concat(req.file.filename),
// //         uploaded: true
// //     })
// // }, (err, req, res, next) => {
// //     res.status(400).send({ error: err.message})
// // })

// // server.get('/', (req, res) => {
// //     res.send("Hello")
// // })

// // server.get('/customers', (req, res) => {
// //     res.send("Hello Customers")
// // })


// // const orderRoutes = require('./Routes/OrderRoutes')
// // const customerRoutes = require('./Routes/CustomerRoutes')
// // const foodRoutes = require('./Routes/FoodRoutes')

// // server.use("/api/", orderRoutes)
// // server.use("/api/", customerRoutes)
// // server.use("/api/", foodRoutes)

// // server.use(express.static("Uploads"));
// // server.use("/images", express.static("Uploads"));

// // server.listen(5000, () => {
// //     console.log("Server Started")
// // })

// // Import necessary libraries and packages
// const express = require('express'); // Express.js to create server and handle routing
// const mongoose = require("mongoose"); // Mongoose for MongoDB connectivity
// const nodemon = require("nodemon"); // Automatically restarts the server when changes are made (during development)
// const bodyparser = require("body-parser"); // Middleware to parse incoming request bodies
// const cors = require('cors'); // Middleware for enabling Cross-Origin Resource Sharing (CORS)

// // Import other necessary modules
// const multer = require('multer'); // Middleware for handling multipart/form-data (file uploads)
// const path = require('path'); // Utility for handling file paths
// const shortid = require('shortid'); // Library to generate unique short IDs
// const crypto = require("crypto"); // For generating HMAC for security verification
// const Razorpay = require('razorpay'); // Razorpay API for payment processing
// require("dotenv").config(); // Loads environment variables from .env file

// // Create the Express server
// const server = express();

// // Use middleware
// server.use(cors()); // Enable CORS for all origins
// server.use(bodyparser.json()); // Parse incoming JSON data in the body of the requests

// // Initialize Razorpay instance with API keys from environment variables
// var razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID, // API Key ID
//   key_secret: process.env.RAZORPAY_KEY_SECRET, // API Key Secret
// });

// // Verification route for Razorpay to validate the authenticity of payment callback
// server.post("/verification", (req, res) => {
//   const secret = "razorpaysecret"; // Secret key for HMAC

//   // Generate HMAC digest using the secret key and request body
//   const shasum = crypto.createHmac("sha256", secret);
//   shasum.update(JSON.stringify(req.body));
//   const digest = shasum.digest("hex");

//   // Compare generated HMAC digest with Razorpay's signature in headers
//   if (digest === req.headers["x-razorpay-signature"]) {
//     console.log("Request is legit");
//     res.status(200).json({
//       message: "OK", // If signature matches, respond with success
//     });
//   } else {
//     res.status(403).json({ message: "Invalid" }); // If signature does not match, return error
//   }
// });

// // Payment creation route to initiate a Razorpay order
// server.post("/razorpay", async (req, res) => {
//   const payment_capture = 1; // Automatically capture payment
//   const amount = req.body.amt * 100; // Amount is provided in rupees, multiply by 100 for paise
//   const currency = "INR"; // Currency type

//   const options = {
//     amount, // Amount to be captured
//     currency, // Currency to be used
//     receipt: shortid.generate(), // Unique receipt ID
//     payment_capture, // Set to 1 to auto-capture payment
//   };

//   try {
//     const response = await razorpay.orders.create(options); // Create Razorpay order
//     res.status(200).json({
//       id: response.id, // Order ID returned from Razorpay
//       currency: response.currency, // Currency used in the order
//       amount: response.amount, // Amount to be captured
//     });
//   } catch (err) {
//     console.log(err); // Log errors
//     res.status(500).send("Error while creating payment order"); // Error response
//   }
// });

// // Multer configuration for file upload
// const fileStorage = multer.diskStorage({
//   destination: 'Uploads', // Directory to store uploaded files
//   filename: (req, file, cb) => {
//     cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname)); // Filename format
//   },
// });

// const uploadConfig = multer({
//   storage: fileStorage, // Use custom storage configuration
//   fileFilter(req, file, cb) { // Only allow specific file types (image formats)
//     if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
//       return cb(new Error('Upload Correct file')); // Reject non-image files
//     }
//     cb(undefined, true); // Accept image files
//   },
// });

// // Connect to MongoDB database
// mongoose.connect("mongodb://127.0.0.1:27017/FoodDeliveryDB", {
//   useNewUrlParser: true, // Use the new URL parser for MongoDB
// }).then((result) => {
//   console.log("DB Connected"); // Successful DB connection message
// }).catch((err) => {
//   console.log("DB Not Connected"); // Error message for failed connection
// });

// // File upload route to handle file uploads
// server.post('/uploadfile', uploadConfig.single('image'), (req, res) => {
//   res.status(200).json({
//     filepath: "/images/".concat(req.file.filename), // Send the uploaded file's path
//     uploaded: true, // Confirm the file upload
//   });
// }, (err, req, res, next) => {
//   res.status(400).send({ error: err.message }); // Handle errors if file is invalid
// });

// // Basic route for testing
// server.get('/', (req, res) => {
//   res.send("Hello"); // Simple response for root URL
// });

// // Sample route to handle customer requests
// server.get('/customers', (req, res) => {
//   res.send("Hello Customers"); // Simple response for customers route
// });

// // Import route files for handling various API endpoints
// const orderRoutes = require('./Routes/OrderRoutes');
// const customerRoutes = require('./Routes/CustomerRoutes');
// const foodRoutes = require('./Routes/FoodRoutes');
// const messageRoutes = require('./Routes/MessageRoutes');
// const PaymentRoutes = require('./Routes/paymentRoutes');
// const reviewRoutes = require('./Routes/ReviewRoutes');

// // Use imported route handlers
// server.use("/api/", orderRoutes);
// server.use("/api/", customerRoutes);
// server.use("/api/", foodRoutes);
// server.use("/api/", messageRoutes);
// server.use("/api/", reviewRoutes);
// // server.use("/api", PaymentRoutes); // Payment routes (commented out)

// server.use(express.static("Uploads")); // Serve static files from 'Uploads' directory
// server.use("/images", express.static("Uploads")); // Serve uploaded images from 'Uploads' directory

// // Start the server on port 5000
// server.listen(5000, () => {
//   console.log("Server Started"); // Confirmation message when server starts
// });
*/

// https://food-delivery-web-server-1.onrender.com