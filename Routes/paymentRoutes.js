const express = require("express")
const CustomerController = require("../controllers/paymentController")

const router = express.Router();

router.route("/checkout").post(CustomerController.checkout);

router.route("/paymentverification").post(CustomerController.paymentVerification);

module.exports = router