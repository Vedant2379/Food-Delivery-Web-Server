const express = require('express')
const mongoose = require("mongoose")
const nodemon = require("nodemon")
const bodyparser = require("body-parser")
const cors = require('cors')
// import Razorpay from 'razorpay'
// import paymentRoute from "./Routes/paymentRoutes"

const multer = require('multer')
const path = require('path')

const shortid = require('shortid')
const crypto = require("crypto")
const Razorpay = require('razorpay')
require("dotenv").config();

//create server
const server = express()

server.use(cors())

server.use(bodyparser.json())

var razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


server.post("/verification", (req, res) => {
  const secret = "razorpaysecret";

  console.log(req.body);

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  console.log(digest, req.headers["x-razorpay-signature"]);

  if (digest === req.headers["x-razorpay-signature"]) {
    console.log("request is legit");
    res.status(200).json({
      message: "OK",
    });
  } else {
    res.status(403).json({ message: "Invalid" });
  }
});


server.post("/razorpay", async (req, res) => {
  const payment_capture = 1;
  const amount = req.body.amt * 100;
  const currency = "INR";

  const options = {
    amount,
    currency,
    receipt: shortid.generate(),
    payment_capture,
  };

  try {
    const response = await razorpay.orders.create(options);
    console.log(response);
    res.status(200).json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (err) {
    console.log(err);
  }
});

//storage config
const fileStorage = multer.diskStorage({
  destination: 'Uploads',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
  }
})

//upload config
const uploadConfig = multer({
  storage: fileStorage,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error('Upload Correct file'))
    }
    cb(undefined, true)
  }
})

//database connectivity
const url=process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;
mongoose.connect(url, {
  useNewUrlParser: true
}).then((result) => {
  console.log("DB Connected")
}).catch((err) => {
  console.log("DB Not Connected")
});


server.post('/uploadfile', uploadConfig.single('image'), (req, res) => {
  res.status(200).json({
    filepath: "/images/".concat(req.file.filename),
    uploaded: true
  })
}, (err, req, res, next) => {
  res.status(400).send({ error: err.message })
})

server.get('/', (req, res) => {
  res.send("Hello")
})

server.get('/customers', (req, res) => {
  res.send("Hello Customers")
})


const orderRoutes = require('./Routes/OrderRoutes')
const customerRoutes = require('./Routes/CustomerRoutes')
const foodRoutes = require('./Routes/FoodRoutes')
const messageRoutes = require('./Routes/MessageRoutes')
const PaymentRoutes = require('./Routes/paymentRoutes')
const reviewRoutes = require('./Routes/ReviewRoutes')

server.use("/api/", orderRoutes)
server.use("/api/", customerRoutes)
server.use("/api/", foodRoutes)
server.use("/api/", messageRoutes)
server.use("/api/", reviewRoutes)
// server.use("/api", PaymentRoutes);

server.use(express.static("Uploads"));
server.use("/images", express.static("Uploads"));

server.listen(PORT, () => {
  console.log("Server Started")
})



// const express = require('express')
// const mongoose = require("mongoose")
// const nodemon = require("nodemon")
// const bodyparser = require("body-parser")
// const cors = require('cors')

// const multer = require('multer')
// const path = require('path')

// //create server
// const server = express()

// server.use(cors())

// server.use(bodyparser.json())

// //storage config
// const fileStorage = multer.diskStorage({
//     destination: 'Uploads',
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
//     }
// })

// //upload config
// const uploadConfig = multer({
//     storage: fileStorage,
//     fileFilter(req, file, cb) {
//         if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
//             return cb(new Error('Upload Correct file'))
//         }
//         cb(undefined, true)
//     }
// })

// //database connectivity
// mongoose.connect("mongodb://127.0.0.1:27017/FoodDeliveryDB", {
//     useNewUrlParser: true
// }).then((result) => {
//     console.log("DB Connected")
// }).catch((err) => {
//     console.log("DB Not Connected")
// });


// server.post('/uploadfile', uploadConfig.single('image'), (req, res) => {
//     res.status(200).json({
//         filepath: "/images/".concat(req.file.filename),
//         uploaded: true
//     })
// }, (err, req, res, next) => {
//     res.status(400).send({ error: err.message})
// })

// server.get('/', (req, res) => {
//     res.send("Hello")
// })

// server.get('/customers', (req, res) => {
//     res.send("Hello Customers")
// })


// const orderRoutes = require('./Routes/OrderRoutes')
// const customerRoutes = require('./Routes/CustomerRoutes')
// const foodRoutes = require('./Routes/FoodRoutes')

// server.use("/api/", orderRoutes)
// server.use("/api/", customerRoutes)
// server.use("/api/", foodRoutes)

// server.use(express.static("Uploads"));
// server.use("/images", express.static("Uploads"));

// server.listen(5000, () => {
//     console.log("Server Started")
// })