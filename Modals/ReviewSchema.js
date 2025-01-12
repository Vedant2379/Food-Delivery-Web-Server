const mongoose = require("mongoose")

const Review = mongoose.Schema({
    CustomerId: { type: mongoose.Types.ObjectId, ref: "Customers", required: true },
    FoodId: { type: mongoose.Schema.Types.ObjectId, ref: "Foods" },
    ReviewDate: { type: Date, default: new Date() },
    Comment: { type: String },
    Rating: { type: Number, required: true }
})

const review = mongoose.model("Review", Review)

module.exports = review