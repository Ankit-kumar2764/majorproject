const mongoose = require('mongoose');
const Listing = require("../models/listing.js");
const initdata=require("./data.js");


const MONGO_URI = "mongodb://localhost:27017/wonderlust"

Main().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});

async function Main() {
    await mongoose.connect(MONGO_URI)
    }


    const initDB = async () => {
        await Listing.deleteMany({});
        await Listing.insertMany(initdata.data);
        console.log("Database initialized with sample data");
    };
    initDB();