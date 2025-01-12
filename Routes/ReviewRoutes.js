const express = require("express")

const router = express.Router()

const ReviewController = require("../controllers/ReviewController")

router.post("/createreview",ReviewController.createReview)
router.get("/getreview",ReviewController.getReview)
router.get("/topavgrating",ReviewController.TopAverageRating)
router.get("/allavgrating", ReviewController.AllAverageRating)

module.exports = router