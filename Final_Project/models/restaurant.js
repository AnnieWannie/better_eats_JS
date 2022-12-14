let mongoose = require("mongoose");

let restaurauntSchema = mongoose.Schema({
    name: {
        type: String,
        retuired: true
    },
    country: {
        type: String,
        required: true
    },
    province: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    rating: {
        type: Number,
        required: true
    },
    posted_by: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Restaurant", restaurauntSchema)