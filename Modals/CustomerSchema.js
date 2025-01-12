const mongoose=require('mongoose')

const CustomerSchema=mongoose.Schema({
    CustomerName: String,
    CustomerEmail: String,
    CustomerPassword: String, 
    CustomerAddress: String,
    CustomerMob: Number
})

module.exports = mongoose.model("Customers",CustomerSchema)