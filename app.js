
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const Listing = require("./models/listing")



const MONGO_URI = "mongodb://localhost:27017/wonderlust"

Main().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});

async function Main() {
    await mongoose.connect(MONGO_URI)
    }

app.get("/", (req, res) => {
    res.send("Hi i am root")
})

app.get("/listing", async (req, res) => {
    let samplelistings =new Listing({
        title: "Beautiful Beach House",
        description: "A stunning beach house with ocean views and modern amenities.",
        price: 500,
        location: "noida",
        Country: "india",
    });
    await samplelistings.save();
    res.send("Listing created successfully");
    console.log("Sample listing was saved successfully");
});


app.listen(3000, () => {
    console.log(`Server is running on port ${3000}`);
});