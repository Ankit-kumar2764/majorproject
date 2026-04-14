const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: String,
    Image:{ 
        type: String ,
        default:"https://unsplash.com/photos/lush-green-hills-surround-dark-blue-lakes-under-cloudy-sky-mN9lPqJifwE",
        set:(v)=>v===""?"https://unsplash.com/photos/lush-green-hills-surround-dark-blue-lakes-under-cloudy-sky-mN9lPqJifwE":v,
    },
    price: Number,
    location: String,   
    Country: String,
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;